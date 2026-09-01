/**
 * Order lifecycle. `pending` → `paid` → `shipped` → `delivered`, or
 * `cancelled` at any point before shipping. Mirrored in firestore.rules:
 * clients create orders as `pending`; only admins may change status.
 */
export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
