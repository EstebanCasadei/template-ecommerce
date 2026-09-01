import { useContext } from 'react'
import { CartContext } from './cartContext.js'

export function useCart() {
  const value = useContext(CartContext)
  if (!value) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return value
}
