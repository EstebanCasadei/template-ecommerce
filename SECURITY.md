# Security model

This is a client-only SPA talking directly to Firestore. That architecture has one
unavoidable rule:

> **Nothing that runs in the browser can be trusted.** HTML attributes (`required`,
> `min`, `max`, `disabled`), React state, and even this app's own JavaScript can all be
> edited or bypassed by anyone with DevTools or the Firebase SDK. The only things that
> cannot be bypassed by the client are **Firestore Security Rules** (`firestore.rules`)
> and, if you add one, a trusted backend (Cloud Function / server) using the Admin SDK.

Everything below is organized around that fact.

## What is implemented

### 1. Client-side validation is UX, not a boundary
- `src/shared/validation/validators.js` — length/format/type checks (name, phone, email,
  quantity), used for *inline feedback only*.
- `CheckoutForm` disables submit until valid and shows errors, but this is convenience.
  Deleting `required`/`disabled` in DevTools does **not** let invalid data through,
  because validation is re-run in JavaScript (not HTML) at submit time, and again below.

### 2. Defense in depth: revalidate at the write boundary
- `FirebaseOrderRepository.saveOrder` re-validates customer data and cart line shape
  before touching Firestore, regardless of what the UI already checked.
- It never trusts a client-supplied price or total. It only accepts `productId` +
  `quantity` from the cart; unit price, subtotal and the final total are always
  recomputed from Firestore's `products` data.

### 3. Atomic stock + pricing via a Firestore transaction
- `saveOrder` uses `runTransaction` to read the live product, verify requested quantity
  against current stock, recompute price, and decrement stock — all atomically. This
  prevents two simultaneous buyers from overselling the same unit (a TOCTOU race).

### 4. Firestore Security Rules — the real boundary (`firestore.rules`)
These apply even if an attacker bypasses this app entirely and talks to Firestore
directly from the console:
- **Admins are identified by the `admin: true` custom claim** on their Firebase Auth
  token, granted only by `scripts/set-admin.js` using the Admin SDK and a service
  account. The claim is inside the signed JWT: a client cannot forge it, and there is
  no editable "role" document that a rules bug could turn into privilege escalation.
- `products`: public read; **admin-only create/update/delete** (with server-side shape
  validation: types, length caps, price/stock bounds, http(s)-only image URLs).
  Non-admin `update` is only allowed to decrease the `stock` field (nothing else can
  change — not price, not name).
- `categories`: public read; admin-only writes.
- `orders`: anyone may **create** (guest checkout), always with `status: 'pending'` —
  a client cannot forge a "paid" order. A signed-in buyer may attach **only their own
  `uid`** (`data.uid == request.auth.uid`), and may later read **only their own
  orders**. Admins may read all orders and update **only the `status` field** through
  the fixed lifecycle values; purchased lines and totals are immutable. No client can
  delete an order.
- Every incoming order is validated for shape, types, and length caps, and — critically —
  each line's `unitPrice`/`subtotal` and the order `total` are cross-checked against the
  live `products/{id}.price` and `.stock` using `get()` inside the rule. If someone
  crafts a request with a fake price or an out-of-stock quantity, Firestore rejects the
  write before it's ever created.
- Default-deny: any collection not explicitly listed is fully denied.

Deploy them with the Firebase CLI:

```bash
npm install -g firebase-tools   # once
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules
```

Test them locally before deploying with the [Firestore emulator](https://firebase.google.com/docs/rules/unit-tests):

```bash
firebase emulators:start --only firestore
```

### 5. Input sanitization
- `sanitizeCustomer` trims, collapses whitespace, strips control characters, and caps
  length before anything is written to Firestore.
- React escapes all rendered text by default; this template never uses
  `dangerouslySetInnerHTML`, so stored customer/product data cannot execute as HTML/JS
  when displayed back (XSS).

### 6. Abuse resistance
- The checkout handler ignores a second submit while one is in flight (in addition to
  the disabled `fieldset`), preventing accidental duplicate orders.
- `MAX_LINES` caps the number of distinct products per order (both in the repository and
  in the rules) to bound the cost of validating a single write.

### 7. Secrets
- `.env` (with real Firebase credentials) is git-ignored; `.env.example` documents the
  expected keys. Firebase's client config (`apiKey`, `projectId`, etc.) is **not a
  secret** — it identifies the project, not a credential — so its presence in the bundle
  is expected and not a vulnerability by itself. Rules are what protect the data.
- The service-account key used by `scripts/set-admin.js` **is a real credential** with
  full project access. It is git-ignored (`serviceAccountKey.json`) and must never be
  committed, bundled, or shared.

### 8. Auth and the admin dashboard
- Customer accounts and admins use **Firebase Auth** (email/password). Password policy,
  brute-force throttling, and credential storage are handled by Google's servers.
- The admin role is a **custom claim**, never a database field (see ADR 005). Grant or
  revoke with `node scripts/set-admin.js <email> [--remove]`; the user must re-login
  afterwards.
- The `/admin` dashboard is **lazy-loaded** so its code never ships in the public
  bundle, and gated by `RequireAdmin`. Both are UX only: an attacker who forces the
  admin chunk to load gains nothing, because every privileged read/write is
  independently rejected by `firestore.rules` without the claim on the token.
- A signed-in buyer's order history works the same way: the `/my-orders` query filters
  by `uid`, and the rules reject any broader read — so one customer can never read
  another customer's orders (or a guest order).

## Cloud Functions scaffold (optional, requires Blaze)

The `functions/` directory contains a ready-to-deploy scaffold that solves the two
residual risks above:

- `createOrder` (callable): re-reads `products` with the Admin SDK, validates stock,
  decrements stock in a transaction, creates the order, and creates a Stripe Payment
  Intent or a MercadoPago preference server-side.
- `stripeWebhook` and `mercadoPagoWebhook` (HTTPS): receive provider webhooks, mark
  orders as `paid`, and release stock on payment failure.

To use it, upgrade to the Blaze plan, run `pnpm install` inside `functions/`, set the
secrets documented in `functions/.env.example`, set `clientConfig.checkout.mode =
'function'`, and deploy with `firebase deploy --only functions`.

## Residual risks and what a real production deployment still needs

Being precise about what this template does *not* solve, since a browser-only app
structurally cannot solve them on its own:

1. **Payment authorization must ultimately be verified by a trusted server.**
   `PaymentGateway.process(order)` is a client-side call. For real money, the charge
   should be created and confirmed by a Cloud Function (or other backend) that
   independently re-reads `products`/`orders` with the Admin SDK before charging —
   never trusting the amount the browser reports. The `functions/` scaffold provides
   this; set `clientConfig.checkout.mode = 'function'` after upgrading to Blaze.
2. **Griefing of stock.** The `products` rule allows any client to decrease `stock`
   as long as it strictly decreases. A malicious script could still call `updateDoc`
   directly and drain stock without buying it. The `functions/` scaffold removes this
   by decrementing stock in a server-side transaction.
3. **No rate limiting / bot protection.** Add
   [Firebase App Check](https://firebase.google.com/docs/app-check) in production to
   ensure requests come from your real app, and consider Cloud Functions with per-IP
   throttling for order creation.
4. **Guest checkout is allowed by design.** Orders placed without signing in have no
   `uid` and cannot be viewed by anyone from the client (only admins). If a client
   project requires accounts for all purchases, add `request.auth != null` to the
   `orders` create rule.
5. **Floating-point tolerance.** Price checks in `firestore.rules` allow a ±0.01
   tolerance per line to avoid floating-point comparison failures. For high-value or
   high-line-count carts, consider storing prices as integer cents to remove any
   tolerance window.

## Reporting a vulnerability in this template

This is a course/template project with no dedicated security contact. If you fork it
for a real client, replace this section with your own responsible-disclosure process.
