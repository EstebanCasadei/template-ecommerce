import { useEffect, useState } from 'react'
import { useAuth } from '../../features/auth/application/useAuth.js'
import { getOrdersByUser } from '../../features/orders/infrastructure/orderHistoryRepository.js'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '../../features/orders/domain/orderStatus.js'
import { formatCurrency } from '../format/currency.js'
import Loader from '../ui/Loader.jsx'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getOrdersByUser(user.uid)
      .then((result) => !cancelled && setOrders(result))
      .catch((err) => {
        console.error('[MyOrdersPage] getOrdersByUser failed:', err)
        if (!cancelled) setError(`Could not load your orders: ${err.message ?? 'unknown error'}.`)
      })
    return () => {
      cancelled = true
    }
  }, [user.uid])

  if (error) return <p className="py-8 text-center text-red-600">{error}</p>
  if (!orders) return <Loader />
  if (orders.length === 0) {
    return <p className="py-8 text-center text-gray-600">You have no orders yet.</p>
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h2 className="mb-4 text-2xl font-bold">My orders</h2>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-gray-500">{order.id}</span>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] ?? ''}`}
              >
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <ul className="mt-2 text-sm text-gray-700">
              {order.lines.map((line) => (
                <li key={line.productId}>
                  {line.quantity} × {line.name} — {formatCurrency(line.subtotal)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-right font-semibold">{formatCurrency(order.total)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
