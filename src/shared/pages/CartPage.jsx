import { Link } from 'react-router-dom'
import { useCart } from '../../features/cart/application/useCart.js'
import clientConfig from '../../features/config/clientConfig.js'
import CartItem from '../../features/cart/ui/CartItem.jsx'

export default function CartPage() {
  const { lines, cartTotal, removeFromCart, clearCart } = useCart()

  if (lines.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Go to catalog
        </Link>
      </div>
    )
  }

  const formattedTotal = new Intl.NumberFormat(clientConfig.store.locale, {
    style: 'currency',
    currency: clientConfig.store.currency,
  }).format(cartTotal)

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h2 className="mb-4 text-2xl font-bold">Cart</h2>
      <ul className="space-y-4">
        {lines.map(({ product, quantity }) => (
          <CartItem
            key={product.id}
            product={product}
            quantity={quantity}
            onRemove={removeFromCart}
          />
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <strong>Total: {formattedTotal}</strong>
        <div className="space-x-2">
          <button onClick={clearCart} className="text-red-500">
            Clear
          </button>
          <Link to="/checkout" className="rounded bg-blue-600 px-4 py-2 text-white">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
