import Stripe from 'stripe'
import { config } from '../config.js'

export function getStripeClient() {
  if (!config.stripe.secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.')
  }
  return new Stripe(config.stripe.secretKey, { apiVersion: '2024-06-20' })
}

export async function createStripePayment({ orderId, total, customer, lines }) {
  const stripe = getStripeClient()

  // Stripe expects amounts in the smallest currency unit (cents).
  const amountInCents = Math.round(total * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd', // Make configurable per client if needed.
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId,
      customerEmail: customer.email,
    },
    description: `Order ${orderId} — ${lines.length} item(s)`,
  })

  return {
    type: 'stripe',
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentIntent.id,
    amount: amountInCents,
    currency: 'usd',
    status: 'pending',
  }
}

export async function handleStripeWebhook({ request, signature }) {
  if (!config.stripe.webhookSecret) {
    throw new Error('Stripe webhook secret is not configured.')
  }

  const stripe = getStripeClient()
  let event
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, signature, config.stripe.webhookSecret)
  } catch (err) {
    throw new Error(`Invalid Stripe signature: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      throw new Error('Stripe webhook missing orderId metadata.')
    }
    return {
      orderId,
      providerPaymentId: paymentIntent.id,
      status: 'paid',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      throw new Error('Stripe webhook missing orderId metadata.')
    }
    return {
      orderId,
      providerPaymentId: paymentIntent.id,
      status: 'failed',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    }
  }

  return null
}
