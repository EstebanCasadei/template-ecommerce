import { useMemo, useState, useCallback, useEffect } from 'react'
import { isValidQuantity } from '../../../shared/validation/validators.js'
import { loadCart, saveCart } from '../infrastructure/cartStorage.js'
import { revalidateCart } from '../infrastructure/cartProductResolver.js'
import { CartContext } from './cartContext.js'

export function CartProvider({ children }) {
  // Lazy initializer: `loadCart()` only runs once, on mount, not on every
  // render. This restores the cart the user had before closing the tab.
  const [lines, setLines] = useState(() => loadCart())

  // Revalidate the persisted cart against the authoritative catalog. This
  // replaces any cached product data (including a manipulated price) with the
  // live Firestore/mock version. Network failures keep the stored lines.
  // This runs only on mount, so it intentionally uses the initial loaded
  // value and is not re-triggered when `lines` changes later.
  useEffect(() => {
    let isMounted = true
    revalidateCart(lines).then((revalidated) => {
      if (isMounted) setLines(revalidated)
    })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist whenever the cart changes. Cheap and infrequent (a handful of
  // add/remove clicks), so no debouncing is needed.
  useEffect(() => {
    saveCart(lines)
  }, [lines])

  // This is the real guard against adding invalid or out-of-stock
  // quantities: it runs regardless of what the calling UI did or didn't
  // enforce (e.g. a disabled button attribute removed via DevTools).
  const addToCart = useCallback((product, quantity) => {
    if (!product || !isValidQuantity(quantity, product.stock)) return

    // Store a shallow copy so a mutated product reference cannot corrupt the
    // cart, and so existing lines get refreshed with the latest product data
    // (e.g. updated stock/price) when the same item is added again.
    const safeProduct = { ...product }

    setLines((prev) => {
      const index = prev.findIndex((line) => line.product.id === safeProduct.id)
      if (index === -1) {
        return [...prev, { product: safeProduct, quantity }]
      }
      const next = [...prev]
      const newQty = Math.min(next[index].quantity + quantity, safeProduct.stock)
      next[index] = { product: safeProduct, quantity: newQty }
      return next
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setLines((prev) => prev.filter((line) => line.product.id !== productId))
  }, [])

  // The persistence effect above also runs on this change, so it writes the
  // now-empty cart to storage — no separate storage-clearing call needed.
  const clearCart = useCallback(() => setLines([]), [])

  const isInCart = useCallback(
    (productId) => lines.some((line) => line.product.id === productId),
    [lines],
  )

  const cartCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  )

  const cartTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [lines],
  )

  const value = useMemo(
    () => ({
      lines,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      cartCount,
      cartTotal,
    }),
    [lines, addToCart, removeFromCart, clearCart, isInCart, cartCount, cartTotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
