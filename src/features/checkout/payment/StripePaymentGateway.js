import { PaymentStatus } from './PaymentGateway.js'

export const stripePaymentGateway = {
  async process(order) {
    // TODO: integrate @stripe/stripe-js
    // Example: open Stripe Checkout with the order and return the result.
    return {
      status: PaymentStatus.PENDING,
      orderId: order.id,
      detail: 'Stripe integration not configured.',
    }
  },
}
