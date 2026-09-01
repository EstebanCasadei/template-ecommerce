import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'
import { ORDER_STATUSES } from '../../orders/domain/orderStatus.js'

function requireDb() {
  if (!db) throw new Error('Admin operations require a configured Firebase project.')
  return db
}

function orderTimestamp(a, b) {
  const ta = toMillis(a?.createdAt)
  const tb = toMillis(b?.createdAt)
  return tb - ta
}

function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value === 'number') return value
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

export async function getAllOrders() {
  // Avoid orderBy on `createdAt` so the query works even when older test
  // documents have mixed/missing timestamp types. Sort client-side instead.
  const snapshot = await getDocs(query(collection(requireDb(), 'orders')))
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(orderTimestamp)
}

export function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`)
  }
  return updateDoc(doc(requireDb(), 'orders', id), { status })
}
