import { Link } from 'react-router-dom'
import { useCart } from '../application/useCart.js'

export default function CartWidget() {
  const { cartCount } = useCart()

  return (
    <Link to="/cart" className="relative rounded bg-white p-2 shadow">
      🛒
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {cartCount}
        </span>
      )}
    </Link>
  )
}
