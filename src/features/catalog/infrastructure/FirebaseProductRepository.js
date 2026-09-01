import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'
import { SAMPLE_PRODUCTS } from '../../../shared/data/sampleData.js'

export async function getProducts(category) {
  if (!db) {
    return category
      ? SAMPLE_PRODUCTS.filter((p) => p.category === category)
      : SAMPLE_PRODUCTS
  }

  const productsRef = collection(db, 'products')
  const q = category ? query(productsRef, where('category', '==', category)) : productsRef
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getProductById(id) {
  if (!db) return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null

  const snap = await getDoc(doc(db, 'products', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * Case-insensitive search over name/description.
 *
 * Firestore has no native full-text search, so this fetches the catalog and
 * filters client-side — fine for a template-sized catalog. For a large
 * production catalog, replace this with a dedicated search service (e.g.
 * Algolia, Typesense) without changing the call site.
 */
export async function searchProducts(term) {
  const MAX_QUERY_LENGTH = 100
  const normalized = term.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH)
  if (!normalized) return []

  const products = await getProducts()
  return products.filter(
    (product) =>
      product.name?.toLowerCase().includes(normalized) ||
      product.description?.toLowerCase().includes(normalized),
  )
}
