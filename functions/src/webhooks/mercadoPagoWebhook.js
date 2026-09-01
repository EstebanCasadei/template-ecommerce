import { onRequest } from 'firebase-functions/v2/https'
import { handlePaymentWebhook } from '../payment/paymentFactory.js'
import { updateOrderStatus, getOrder } from '../orders.js'
import { incrementStock } from '../catalog.js'

/**
 * HTTP Cloud Function for MercadoPago IPN/webhooks.
 *
 * Configure this URL in the MercadoPago application as your
 * `notification_url` when creating the preference, or in the dashboard.
 */
export const mercadoPagoWebhook = onRequest(
  {
    region: 'us-central1',
    cors: false,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { topic, id } = req.query
      if (!topic || !id || topic !== 'payment') {
        res.status(400).send('Missing or invalid MercadoPago webhook parameters')
        return
      }

      const result = await handlePaymentWebhook({
        provider: 'mercadopago',
        payload: { topic, id },
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
        await incrementStock(order.lines)
        await updateOrderStatus(orderId, {
          status: 'cancelled',
          payment: { providerPaymentId, amount, currency, status },
        })
      }

      res.status(200).send('OK')
    } catch (err) {
      console.error('mercadoPagoWebhook error:', err)
      res.status(400).send(`Webhook error: ${err.message}`)
    }
  },
)
