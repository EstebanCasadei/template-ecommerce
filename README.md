# E-commerce Template

A reusable, configurable e-commerce front-end built with React, Vite, Tailwind CSS and
Firebase/Firestore. Originally built as a final project for a React course, structured so it
can be forked and adapted for real clients.

## Stack

- React 19 + Vite (JavaScript, no TypeScript)
- React Router DOM for SPA navigation
- React Context for cart state (exposed through the `useCart()` hook)
- Tailwind CSS for styling
- Firebase / Firestore for products and orders (falls back to local mock data if not configured)

## Getting started

```bash
pnpm install
pnpm run dev
```

Other scripts:

```bash
pnpm run build    # production build
pnpm run preview  # preview the production build
pnpm run lint      # ESLint
```

## Project structure

```
src/
├── features/
│   ├── catalog/       # products: domain, data fetching, UI (ItemList, Item, ItemDetail, ItemCount)
│   ├── cart/           # cart state (CartContext/useCart), CartWidget, CartItem
│   ├── checkout/       # order persistence, payment gateways, CheckoutForm
│   └── config/         # clientConfig.js — the only file a fork needs to edit
├── shared/
│   ├── firebase/       # Firebase app/Firestore initialization
│   ├── ui/              # NavBar, Loader, generic UI
│   └── pages/           # route-level pages (Cart, Checkout)
```

Each feature keeps its domain/data logic separate from its presentation components
(container vs. presentational components), so UI stays simple and logic stays testable.

## Firebase / Firestore

Copy `.env.example` to `.env` and fill in the client's Firebase project settings:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If any of these are left empty, the app automatically falls back to local mock product data
(`src/features/catalog/infrastructure/FirebaseProductRepository.js`) and generates fake
order ids, so the template stays runnable without a real backend.

Firestore is expected to have:

- A `products` collection: each document is a product (`name`, `description`, `price`,
  `stock`, `category`, `image`).
- An `orders` collection: written automatically when a checkout is completed
  (`customer`, `lines`, `total`, `createdAt`).

## Payment gateways

Checkout goes through a `PaymentGateway` seam
(`src/features/checkout/payment/PaymentGateway.js`). Available adapters:

- `CashPaymentGateway` (default): always succeeds, no external dependency.
- `StripePaymentGateway`: stub ready for `@stripe/stripe-js` integration.
- `MercadoPagoPaymentGateway`: stub ready for the MercadoPago SDK/bricks integration.

Select the active gateway in `clientConfig.js` (`payment.provider`: `'cash'`, `'stripe'` or
`'mercadopago'`). Swapping providers does not require touching the checkout UI.

## Accounts and admin dashboard

The template ships with Firebase Auth (email/password and Google sign-in) and an
admin dashboard at `/admin` for managing **products** (full CRUD), **orders** (view
+ status lifecycle: pending → paid → shipped → delivered / cancelled), and
**categories**.

- Buyers can shop as guests, or create an account to get their purchases linked to
  them and visible under `/my-orders`.
- The dashboard is lazy-loaded: its code is a separate chunk that never ships to
  regular visitors.
- Admin access is granted through a **custom claim** on the auth token — not a
  database field — so it cannot be self-assigned from the browser.

To create your first admin:

1. Enable **Email/Password** and **Google** sign-in in Firebase Console →
   Authentication → Sign-in method.
2. Add your production domain and `localhost` to the **Authorized domains** list
   in Firebase Console → Authentication → Settings (required for Google sign-in).
3. Register the account normally from `/register`, or sign in with Google and then
   grant it admin with the same script (using the Google account email).
4. Download a service-account key (Project settings → Service accounts) and save it
   as `serviceAccountKey.json` in the repo root (it is git-ignored).
5. Run:

```bash
node scripts/set-admin.js admin@yourstore.com
```

6. Sign out and back in — the "Admin" link appears in the navbar.

Revoke with `node scripts/set-admin.js admin@yourstore.com --remove`.

Categories created in the dashboard live in the `categories` collection and replace
the hardcoded list in `clientConfig.catalog.categories` (which remains the fallback
when Firebase is not configured). Deploy `firestore.indexes.json` along with the
rules so the order-history query works:

```bash
firebase deploy --only firestore
```

## Seeding sample catalog data

The repo includes a Node script that writes the demo categories and products to
Firestore. This is useful for the first run or after deleting the dev database.

```bash
pnpm run seed
```

Add `--force` to overwrite existing documents:

```bash
pnpm run seed:force
```

The script uses the same `serviceAccountKey.json` as `set-admin.js` and writes
with the Admin SDK, so it bypasses Security Rules and works even before you
configure auth or deploy rules.

## Using this as a template for a new client

This repo is meant to be **forked per client**. To adapt it:

1. Fork/copy the repository.
2. Edit `src/features/config/clientConfig.js` only:
   - `store`: name, logo, currency, locale, tax rate.
   - `catalog`: categories and page size.
   - `payment`: which gateway to use.
   - `firebase`: leave as-is (it reads from environment variables).
3. Set up `.env` with the new client's Firebase project.
4. Adjust Tailwind theme tokens in `tailwind.config.js` if the client needs different colors
   or fonts.

No other file should need to change for a straightforward rebrand.

## Security

Client-side validation (HTML attributes, React state) can always be bypassed with
DevTools — it is UX, not a security boundary. The real boundary in this template is
**Firestore Security Rules** (`firestore.rules`) plus server-side-style revalidation
inside `FirebaseOrderRepository.saveOrder` (price/stock are always recomputed from
Firestore, never trusted from the browser).

Deploy the rules before going live:

```bash
npm install -g firebase-tools
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules
```

See [`SECURITY.md`](./SECURITY.md) for the full model, what's covered, and the residual
risks that require a trusted backend (e.g. real payment authorization) — read it before
forking this template for a real client.

## Cloud Functions for real payments

The template includes a Cloud Functions scaffold under `functions/` for the trusted
backend path. It already handles:

- Verifying product prices and stock from Firestore.
- Decrementing stock atomically.
- Creating Stripe Payment Intents or MercadoPago preferences.
- Receiving webhooks to mark orders as `paid`.

To use it:

1. Upgrade the Firebase project to the Blaze plan.
2. Run `pnpm install` inside `functions/`.
3. Configure secrets (see `functions/.env.example`):
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
   - `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_WEBHOOK_SECRET`
4. Set `clientConfig.checkout.mode = 'function'`.
5. Deploy: `firebase deploy --only functions`
6. Set the webhook URLs in Stripe/MercadoPago dashboards.

By default `clientConfig.checkout.mode = 'client'`, so the project keeps working on the
course/demo path without Cloud Functions.

Before accepting real money, harden the webhook handlers: verify Stripe signatures
with `STRIPE_WEBHOOK_SECRET`, add MercadoPago webhook source validation, implement
idempotency (prevent duplicate processing), and test the full payment lifecycle in the
emulator and in a staging environment.

## Domain model and decisions

See `CONTEXT.md` for the glossary (Product, Cart, Order, etc.) and `docs/adr/` for the
architecture decisions behind this structure.
