import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../features/auth/application/useAuth.js'
import { getOrderById } from '../../features/orders/infrastructure/orderRepository.js'
import { ORDER_STATUSES } from '../../features/orders/domain/orderStatus.js'
import Loader from '../ui/Loader.jsx'

/**
 * Post-payment / post-redirect confirmation page.
 *
 * MercadoPago (and similar redirect-based gateways) send the buyer back to
 * `/order-confirmation?order=<id>&status=<success|failure|pending>`. The page
 * shows a clear message for those query params, and tries to load the order
 * details when the user is signed in (guest orders are not client-readable).
 */
export default function OrderConfirmationPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const statusParam = params.get('status') ?? 'pending'
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      setLoading(false)
      return
    }

    let cancelled = false
    getOrderById(orderId)
      .then((result) => {
        if (!cancelled) setOrder(result)
      })
      .catch(() => {
        // Permission denied or not found: fall back to query-param view.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, orderId])

  const title = {
    success: 'Payment confirmed',
    failure: 'Payment failed',
    pending: 'Payment pending',
  }[statusParam] ?? 'Order confirmation'

  const message = {
    success: 'Thank you! Your order has been received and is being processed.',
    failure: 'We could not confirm your payment. Please try again or contact support.',
    pending: 'Your payment is pending. We will update the order once it is confirmed.',
  }[statusParam] ?? 'Your order status is being confirmed.'

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-4 text-gray-700">{message}</p>
      {orderId && (
        <p className="mt-2 text-sm text-gray-500">Order reference: {orderId}</p>
      )}

      {order && ORDER_STATUSES.includes(order.status) && (
        <p className="mt-2 text-sm font-medium text-purple-700">
          Current status: {order.status}
        </p>
      )}

      <Link
        to="/"
        className="mt-8 inline-block rounded bg-purple-700 px-4 py-2 text-white hover:bg-purple-800"
      >
        Continue shopping
      </Link>
    </div>
  )
}
