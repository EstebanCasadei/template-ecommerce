# ADR 002: Payment gateway seam

## Status
Accepted

## Context

The template must be ready for real payment methods, but the course final only needs a working checkout that saves the order. Payment providers differ by client and country.

## Decision

Introduce a `PaymentGateway` interface. The default implementation is `CashPaymentGateway` (always succeeds). Include ready-to-wire adapters for **Stripe** and **MercadoPago**. The chosen gateway is set in `clientConfig.js`.

## Consequences

- A client can switch payment providers by installing the relevant SDK and updating the config.
- The checkout component does not depend on any specific payment SDK.
- The default `CashPaymentGateway` keeps the course demo working without real credentials.
