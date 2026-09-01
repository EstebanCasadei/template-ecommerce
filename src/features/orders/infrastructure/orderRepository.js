import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'

/**
 * Fetches a single order by ID. This only succeeds for:
 * - the signed-in user who owns the order (uid match),
 * - an admin (custom claim), or
 * - a public/guest order if the rules are later relaxed.
 *
 * Guest orders have no `uid` and are intentionally not readable from the
 * client, so callers should fall back to a generic confirmation message.
 */
export async function getOrderById(id) {
  if (!db || !id) return null

  const snap = await getDoc(doc(db, 'orders', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}
