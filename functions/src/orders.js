import { db } from './firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

export async function createOrderRecord({ customer, lines, total, status = 'pending', payment, uid = null }) {
  const orderRef = db.collection('orders').doc()
  const order = {
    customer,
    lines,
    total,
    status,
    payment: payment ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    ...(uid ? { uid } : {}),
  }

  await orderRef.set(order)

  return {
    id: orderRef.id,
    ...order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function updateOrderStatus(orderId, { status, payment = null }) {
  const update = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (payment) {
    update.payment = payment
  }
  await db.collection('orders').doc(orderId).update(update)
}

export async function getOrder(orderId) {
  const snap = await db.collection('orders').doc(orderId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() }
}
