import { onRequest } from 'firebase-functions/v2/https'
import { handlePaymentWebhook } from '../payment/paymentFactory.js'
import { updateOrderStatus, getOrder } from '../orders.js'
import { incrementStock } from '../catalog.js'

/**
 * HTTP Cloud Function for Stripe webhooks.
 *
 * Configure this URL in the Stripe Dashboard as your endpoint for
 * `payment_intent.succeeded` and `payment_intent.payment_failed` events.
 */
export const stripeWebhook = onRequest(
  {
    region: 'us-central1',
    cors: false,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const signature = req.headers['stripe-signature']
      if (!signature) {
        res.status(400).send('Missing Stripe signature')
        return
      }

      const result = await handlePaymentWebhook({
        provider: 'stripe',
        payload: { request: req, signature },
      })

      if (!result) {
        res.status(200).send('Ignored')
        return
      }

      const { orderId, status, providerPaymentId, amount, currency } = result
      const order = await getOrder(orderId)

      if (!order) {
        res.status(404).send('Order not found')
        return
      }

      if (status === 'paid') {
        await updateOrderStatus(orderId, {
          status: 'paid',
          payment: { providerPaymentId, amount, currency, status },
        })
      } else if (status === 'failed') {
        // Release reserved stock on payment failure.
        await incrementStock(order.lines)
        await updateOrderStatus(orderId, {
          status: 'cancelled',
          payment: { providerPaymentId, amount, currency, status },
        })
      }

      res.status(200).send('OK')
    } catch (err) {
      console.error('stripeWebhook error:', err)
      res.status(400).send(`Webhook error: ${err.message}`)
    }
  },
)
