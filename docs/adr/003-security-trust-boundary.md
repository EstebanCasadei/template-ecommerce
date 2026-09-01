# ADR 003: Security trust boundary in a backend-less SPA

## Status
Accepted

## Context

The app is a pure front-end SPA talking directly to Firestore, with no custom backend
(per the course scope). Anything running in the user's browser — HTML attributes,
React state, this app's own JavaScript — can be edited or bypassed with DevTools or by
calling the Firebase SDK directly. A naive implementation that only validates in React
(e.g. relying on the `required` HTML attribute) has no real security: an attacker can
submit empty customer data, forge a `total`, or exceed available stock.

There is no application server available to act as the authoritative source of truth.
The only server-side enforcement point available in this architecture is Firestore
Security Rules, evaluated by Firestore itself on every read/write, which cannot be
bypassed by the client.

## Decision

1. Treat all client-side validation (`validators.js`, `CheckoutForm`) as UX only, never
   as the security boundary.
2. Revalidate everything again in `FirebaseOrderRepository.saveOrder`, the function that
   actually performs the write, and never trust a client-supplied price or total —
   always recompute them from Firestore's authoritative `products` data.
3. Use a Firestore transaction to atomically check stock, recompute pricing, and
   decrement stock, closing the race condition between checking stock and writing the
   order.
4. Push the same invariants (price consistency, stock limits, required fields, string
   length caps) into `firestore.rules`, since that is the only layer that cannot be
   bypassed by an attacker who skips this app's JavaScript entirely.
5. Deny `read`/`update`/`delete` on `orders` for all clients, and deny `create`/`delete`
   and most `update`s on `products`, only allowing a narrowly-scoped stock decrease.

## Consequences

- Genuine security now lives in `firestore.rules`, not in React. Any change to the
  order/product data shape must be mirrored in both `saveOrder` and `firestore.rules`,
  or writes will start failing (fail-closed, which is intentional).
- Price validation in Firestore Rules caps cart size at `MAX_LINES = 10` line
  items per order. This stays within the rules language's limit of 10 document
  `get()` calls per single-document write and the 10 local-variable binding limit.
- Real payment authorization and stock griefing still require a trusted backend (Cloud
  Function) before going to production with real money. A full scaffold is provided in
  `functions/` and can be enabled by setting `clientConfig.checkout.mode = 'function'`,
  but it requires the Blaze plan, so it is not the default for the course demo.
