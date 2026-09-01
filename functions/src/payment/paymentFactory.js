import { createStripePayment, handleStripeWebhook } from './stripeAdapter.js'
import { createMercadoPagoPayment, handleMercadoPagoWebhook } from './mercadoPagoAdapter.js'

export async function createPayment({ provider, order }) {
  if (provider === 'cash') {
    return {
      type: 'cash',
      status: 'success',
      paymentId: null,
      amount: order.total,
      currency: 'USD',
    }
  }

  if (provider === 'stripe') {
    return createStripePayment(order)
  }

  if (provider === 'mercadopago') {
    return createMercadoPagoPayment(order)
  }

  throw new Error(`Unsupported payment provider: ${provider}`)
}

export async function handlePaymentWebhook({ provider, payload }) {
  if (provider === 'stripe') {
    return handleStripeWebhook(payload)
  }

  if (provider === 'mercadopago') {
    return handleMercadoPagoWebhook(payload)
  }

  throw new Error(`Unsupported payment provider for webhook: ${provider}`)
}
