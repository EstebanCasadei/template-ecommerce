import { useState } from 'react'
import { useCart } from '../../features/cart/application/useCart.js'
import { useAuth } from '../../features/auth/application/useAuth.js'
import { saveOrder } from '../../features/checkout/infrastructure/FirebaseOrderRepository.js'
import { createOrder } from '../../features/checkout/infrastructure/CloudOrderRepository.js'
import { getPaymentGateway } from '../../features/checkout/payment/paymentGatewayFactory.js'
import { PaymentStatus } from '../../features/checkout/payment/PaymentGateway.js'
import { OrderValidationError } from '../../features/checkout/domain/OrderValidationError.js'
import clientConfig from '../../features/config/clientConfig.js'
import CheckoutForm from '../../features/checkout/ui/CheckoutForm.jsx'

export default function CheckoutPage() {
  const { lines, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleClientCheckout = async (customer) => {
    // Client-side checkout (current demo/course mode). The order is written
    // directly to Firestore and validated by Security Rules. When signed in,
    // the order is linked to the user so it appears in their history.
    const saved = await saveOrder({ customer, lines, uid: user?.uid ?? null })
    const gateway = getPaymentGateway()
    const payment = await gateway.process(saved)

    if (payment.status === PaymentStatus.FAILED) {
      throw new OrderValidationError(payment.detail || 'Payment was declined.', 'PAYMENT_FAILED')
    }
    if (payment.status !== PaymentStatus.SUCCESS && payment.status !== PaymentStatus.PENDING) {
      throw new OrderValidationError('Unexpected payment result.', 'PAYMENT_ERROR')
    }

    // The Firestore order stays `pending` (an admin marks it paid from the
    // dashboard), but the purchase itself is confirmed for the buyer.
    setOrder({ ...saved, payment, confirmed: true })
    clearCart()
  }

  const handleCloudCheckout = async (customer) => {
    // Cloud Function checkout (production mode with Blaze plan). The server
    // verifies stock/prices, reserves stock, and creates the payment.
    const result = await createOrder({ customer, lines })
    setOrder(result)
    if (result.status === 'paid') {
      clearCart()
    }
  }

  const handleSubmit = async (customer) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      if (clientConfig.checkout.mode === 'function') {
        await handleCloudCheckout(customer)
      } else {
        await handleClientCheckout(customer)
      }
    } catch (err) {
      setError(
        err instanceof OrderValidationError
          ? err.message
          : 'Could not complete the order. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (order) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold">
          {order.confirmed || order.status === 'paid' ? 'Order confirmed' : 'Complete your payment'}
        </h2>
        <p className="mt-2">Order ID: {order.orderId ?? order.id}</p>

        {order.payment?.clientSecret && (
          <p className="mt-4 text-sm text-gray-600">
            Stripe client secret ready. Connect this value to Stripe Elements or
            Stripe Checkout in your production integration.
          </p>
        )}

        {order.payment?.initPoint && (
          <a
            href={order.payment.initPoint}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
          >
            Pay with MercadoPago
          </a>
        )}
      </div>
    )
  }

  if (lines.length === 0) {
    return <p className="py-8 text-center text-gray-600">Your cart is empty.</p>
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h2 className="mb-4 text-2xl font-bold">Checkout</h2>
      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <fieldset disabled={isSubmitting}>
        <CheckoutForm total={cartTotal} onSubmit={handleSubmit} />
      </fieldset>
    </div>
  )
}
