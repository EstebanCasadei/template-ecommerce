import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'

function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value === 'number') return value
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Orders placed by the signed-in user. The `where uid ==` filter is not just
 * convenience: firestore.rules only allows reading orders whose `uid` matches
 * the requester, so any broader query is rejected by the server.
 */
export async function getOrdersByUser(uid) {
  if (!db || !uid) return []

  const q = query(collection(db, 'orders'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
}
