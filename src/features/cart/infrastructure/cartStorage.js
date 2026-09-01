// Bump this suffix if the persisted shape ever changes incompatibly, so old
// (now-invalid) entries are ignored instead of crashing the app.
const STORAGE_KEY = 'template-ecommerce:cart:v1'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
const MAX_CART_LINES = 10
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER

/**
 * localStorage is just as untrusted as any other external input: it can be
 * edited by hand in DevTools, or contain data from a previous version of
 * this app. Every line is re-validated on load, and prices/stock are still
 * always re-verified against Firestore at checkout time
 * (`FirebaseOrderRepository.saveOrder`) — this cache only saves the user
 * from re-building their cart after closing the tab.
 */
export function loadCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.lines)) return []
    if (typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > MAX_AGE_MS) return []

    return parsed.lines.filter(isValidStoredLine).slice(0, MAX_CART_LINES)
  } catch {
    // Corrupted entry, storage disabled (e.g. private browsing), or blocked
    // by browser settings — fail safe with an empty cart rather than crash.
    return []
  }
}

export function saveCart(lines) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines: lines.slice(0, MAX_CART_LINES), savedAt: Date.now() }),
    )
  } catch {
    // Storage full or unavailable: the cart still works in-memory for this
    // session, it just won't survive a reload.
  }
}

function isValidStoredLine(line) {
  const product = line?.product

  // Validate shape, types, and sane numeric ranges. NaN, Infinity and other
  // non-finite values are rejected. Prices/stock are still re-verified from
  // Firestore at checkout; this only prevents a corrupted cache from crashing
  // the UI or rendering absurd values.
  return (
    product &&
    typeof product === 'object' &&
    typeof product.id === 'string' &&
    product.id.length > 0 &&
    product.id.length <= 100 &&
    typeof product.name === 'string' &&
    product.name.length > 0 &&
    product.name.length <= 100 &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    product.price >= 0 &&
    product.price <= MAX_SAFE_INTEGER &&
    typeof product.stock === 'number' &&
    Number.isFinite(product.stock) &&
    Number.isInteger(product.stock) &&
    product.stock >= 0 &&
    product.stock <= MAX_SAFE_INTEGER &&
    typeof product.category === 'string' &&
    product.category.length > 0 &&
    product.category.length <= 50 &&
    (product.image === undefined ||
      (typeof product.image === 'string' && product.image.length <= 1000)) &&
    typeof line.quantity === 'number' &&
    Number.isInteger(line.quantity) &&
    line.quantity >= 1 &&
    line.quantity <= product.stock
  )
}
