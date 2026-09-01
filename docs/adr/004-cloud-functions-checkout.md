# ADR 004: Cloud Functions checkout scaffold for real payments

## Status

Accepted

## Context

The course/demo implementation uses a client-only checkout path:
`CheckoutPage` calls `FirebaseOrderRepository.saveOrder`, which runs a Firestore
transaction to re-read prices, check stock, decrement stock, and write the order.
Firestore Security Rules provide the untrusted-client boundary and were verified to
reject forged prices, forged totals, and overselling.

That design is enough for a course, but it cannot support real money because:

1. Payment authorization cannot be trusted when initiated by the browser.
2. A malicious client can still decrement product `stock` via an authorized update
   without completing payment (stock griefing).
3. Stripe/MercadoPago require a server-side secret to create a Payment Intent or
   preference, and webhooks need a trusted endpoint to confirm payment.

A real client will need a trusted backend. The template should provide a ready-to-deploy
scaffold that the user can enable when they upgrade to the Firebase Blaze plan.

## Decision

1. Add a `functions/` directory with a Cloud Functions v2 scaffold.
2. Implement `createOrder` (callable): validates customer data, resolves product prices
   and stock from Firestore with the Admin SDK, decrements stock in a transaction,
   creates an order, and returns payment data from Stripe or MercadoPago.
3. Implement `stripeWebhook` and `mercadoPagoWebhook` (HTTPS): receive provider
   webhooks, mark the order as `paid`, or release reserved stock on failure.
4. Keep the client-side `FirebaseOrderRepository` path as the default
   (`clientConfig.checkout.mode = 'client'`) so the template continues to work without
   Cloud Functions and without a Blaze plan.
5. Add a `CloudOrderRepository` and switch `CheckoutPage` to use it when
   `clientConfig.checkout.mode = 'function'`.
6. Store provider credentials (Stripe secret keys, MercadoPago access token) in Cloud
   Functions environment variables/secrets, never in the client bundle or repository.
7. Document the migration path in `README.md`, `SECURITY.md`, and `functions/.env.example`.

## Consequences

- The template now has a clear upgrade path from course demo to real production payment
  flow without requiring a full rewrite.
- Provider secrets are isolated in the backend; the frontend only receives a
  `clientSecret` (Stripe) or an `initPoint` (MercadoPago).
- Stock, pricing, and total calculation always happen server-side in the Cloud Function
  path, closing the stock-griefing and forged-price risks.
- The scaffold requires the Firebase Blaze plan and real provider credentials, so it is
  disabled by default.
