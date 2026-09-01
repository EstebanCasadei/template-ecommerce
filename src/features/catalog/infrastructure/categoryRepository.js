import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'
import clientConfig from '../../config/clientConfig.js'

/**
 * Public category reads. Categories live in the `categories` collection
 * (managed from the admin dashboard); when Firebase is not configured, or
 * the collection is still empty, `clientConfig.catalog.categories` is used
 * as the fallback so the template keeps working out of the box.
 */
export async function getCategories() {
  const fallback = clientConfig.catalog.categories.map((slug) => ({ id: slug, name: slug }))
  if (!db) return fallback

  // Sort client-side to avoid Firestore orderBy issues when some documents
  // have missing or mixed `name` field types.
  const snapshot = await getDocs(query(collection(db, 'categories')))
  if (snapshot.empty) return fallback
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}
