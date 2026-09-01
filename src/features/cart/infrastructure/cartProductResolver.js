import { getProductById } from '../../catalog/infrastructure/FirebaseProductRepository.js'
import { isValidQuantity } from '../../../shared/validation/validators.js'

/**
 * Refreshes persisted cart lines against the current catalog.
 *
 * localStorage stores the full product snapshot, so an attacker (or stale
 * cache) can show a fake price in the cart. On app start we re-fetch each
 * product from Firestore (or the mock catalog) and replace the cached data
 * with the authoritative version, discarding products that no longer exist
 * or whose stored quantity exceeds current stock.
 *
 * If a lookup fails because of a network error (offline), the original stored
 * line is kept so the cart is not silently emptied. Product IDs that resolve
 * to `null` (deleted product) are dropped.
 */
export async function revalidateCart(storedLines) {
  const results = await Promise.allSettled(
    storedLines.map(async ({ product, quantity }) => {
      try {
        const fresh = await getProductById(product.id)
        if (fresh && isValidQuantity(quantity, fresh.stock)) {
          return { product: fresh, quantity }
        }
        return null
      } catch {
        // Network / Firestore unavailable: keep the stored line rather than
        // deleting it. It will be revalidated again on the next load.
        return { product, quantity }
      }
    }),
  )

  return results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean)
}
