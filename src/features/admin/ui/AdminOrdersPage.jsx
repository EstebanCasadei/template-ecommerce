import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../infrastructure/adminOrderRepository.js'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '../../orders/domain/orderStatus.js'
import { formatCurrency } from '../../../shared/format/currency.js'
import Loader from '../../../shared/ui/Loader.jsx'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch((err) => {
        console.error('[AdminOrdersPage] getAllOrders failed:', err)
        const code = err?.code ?? ''
        if (code.includes('permission-denied')) {
          setError('Could not load orders. Make sure this account has the admin custom claim and the latest firestore.rules are deployed.')
        } else if (code.includes('failed-precondition')) {
          setError('Could not load orders. Missing Firestore index or mixed field types. Run `firebase deploy --only firestore` and check the console.')
        } else {
          setError(`Could not load orders: ${err.message ?? 'unknown error'}. Check the console.`)
        }
      })
  }, [])

  const handleStatusChange = async (order, status) => {
    const previous = order.status
    // Optimistic update; revert on failure.
    setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, status } : o)))
    try {
      await updateOrderStatus(order.id, status)
    } catch {
      setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, status: previous } : o)))
      setError('Could not update the order status.')
    }
  }

  if (error && !orders) return <p className="text-red-600">{error}</p>
  if (!orders) return <Loader />
  if (orders.length === 0) return <p className="text-gray-600">No orders yet.</p>

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Orders ({orders.length})</h2>
      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {order.id}
              </button>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(order.total)}</span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] ?? ''}`}
                >
                  {ORDER_STATUS_LABELS[order.status] ?? order.status ?? '—'}
                </span>
                <select
                  value={order.status ?? 'pending'}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className="rounded border p-1 text-sm"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              {order.customer.name} · {order.customer.email} · {order.customer.phone}
            </p>

            {expandedId === order.id && (
              <ul className="mt-3 border-t pt-3 text-sm text-gray-700">
                {order.lines.map((line) => (
                  <li key={line.productId} className="flex justify-between">
                    <span>
                      {line.quantity} × {line.name}
                    </span>
                    <span>{formatCurrency(line.subtotal)}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
