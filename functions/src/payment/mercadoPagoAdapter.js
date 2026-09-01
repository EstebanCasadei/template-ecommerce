import { MercadoPagoConfig, Preference } from 'mercadopago'
import { config } from '../config.js'

function getClient() {
  if (!config.mercadoPago.accessToken) {
    throw new Error('MercadoPago is not configured. Set MERCADOPAGO_ACCESS_TOKEN.')
  }
  return new MercadoPagoConfig({
    accessToken: config.mercadoPago.accessToken,
    options: { timeout: 5000 },
  })
}

export async function createMercadoPagoPayment({ orderId, total, customer, lines }) {
  const client = getClient()
  const preference = new Preference(client)

  const items = lines.map((line) => ({
    id: line.productId,
    title: line.name,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    currency_id: 'USD', // Make configurable if needed.
  }))

  const result = await preference.create({
    body: {
      items,
      payer: {
        name: customer.name,
        email: customer.email,
        phone: { number: customer.phone },
      },
      external_reference: orderId,
      notification_url: `${process.env.MERCADOPAGO_WEBHOOK_URL}`,
      back_urls: {
        success: `${process.env.STORE_URL}/order-confirmation?order=${orderId}&status=success`,
        failure: `${process.env.STORE_URL}/order-confirmation?order=${orderId}&status=failure`,
        pending: `${process.env.STORE_URL}/order-confirmation?order=${orderId}&status=pending`,
      },
      auto_return: 'approved',
    },
  })

  return {
    type: 'mercadopago',
    preferenceId: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
    paymentId: null,
    amount: total,
    currency: 'USD',
    status: 'pending',
  }
}

export async function handleMercadoPagoWebhook({ id }) {
  // MercadoPago IPN sends `topic` and `id` query params (e.g. `payment`/`merchant_order`).
  // To avoid coupling to the SDK, we fetch the payment directly by ID.
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${config.mercadoPago.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`MercadoPago payment fetch failed: ${response.status}`)
  }

  const payment = await response.json()
  const orderId = payment.external_reference
  if (!orderId) {
    throw new Error('MercadoPago payment missing external_reference.')
  }

  const status = payment.status === 'approved' ? 'paid' : payment.status === 'rejected' ? 'failed' : 'pending'

  return {
    orderId,
    providerPaymentId: String(payment.id),
    status,
    amount: payment.transaction_amount,
    currency: payment.currency_id,
  }
}
