import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { validateCustomer, sanitizeCustomer, validateLines } from './validation.js'
import { resolveOrderLines, decrementStock } from './catalog.js'
import { createOrderRecord, updateOrderStatus } from './orders.js'
import { createPayment } from './payment/paymentFactory.js'
import { getProviderConfig } from './config.js'

/**
 * Callable Cloud Function that creates a pending order, reserves stock,
 * and returns the necessary data for the client to complete payment.
 *
 * Request: { customer, lines, provider }
 * Response: { orderId, customer, lines, total, status, payment }
 */
export const createOrder = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { customer, lines, provider = 'cash' } = request.data ?? {}

      const { valid, errors } = validateCustomer(customer)
      if (!valid) {
        throw new HttpsError('invalid-argument', 'Invalid customer data.', errors)
      }

      const linesValidation = validateLines(lines)
      if (!linesValidation.valid) {
        throw new HttpsError('invalid-argument', linesValidation.error)
      }

      const providerConfig = getProviderConfig(provider)
      if (!providerConfig.enabled) {
        throw new HttpsError('failed-precondition', `Payment provider '${provider}' is not configured.`)
      }

      const cleanCustomer = sanitizeCustomer(customer)

      // Resolve authoritative product data and compute total server-side.
      const { orderLines, total } = await resolveOrderLines(lines)

      // Reserve stock before creating the payment.
      // If payment fails, the webhook handler can release it.
      await decrementStock(orderLines)

      // Create the order record with pending status (the shared order
      // lifecycle: pending → paid → shipped → delivered / cancelled).
      // Attach the authenticated user's uid if present so the order shows in
      // their history; guest checkout leaves it out.
      const order = await createOrderRecord({
        customer: cleanCustomer,
        lines: orderLines,
        total,
        status: 'pending',
        uid: request.auth?.uid ?? null,
      })

      // Create the payment intent / preference.
      const payment = await createPayment({
        provider,
        order: { ...order, customer: cleanCustomer },
      })

      // If the gateway immediately reports success (e.g. cash), mark as paid.
      const isPaid = payment.status === 'success'
      if (isPaid) {
        await updateOrderStatus(order.id, { status: 'paid', payment })
      }

      return {
        orderId: order.id,
        customer: cleanCustomer,
        lines: orderLines,
        total,
        status: isPaid ? 'paid' : 'pending',
        payment,
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err
      console.error('createOrder error:', err)
      throw new HttpsError('internal', err.message ?? 'Could not create order.')
    }
  },
)
