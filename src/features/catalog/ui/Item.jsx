import { Link } from 'react-router-dom'
import clientConfig from '../../config/clientConfig.js'

export default function Item({ product }) {
  const formattedPrice = new Intl.NumberFormat(clientConfig.store.locale, {
    style: 'currency',
    currency: clientConfig.store.currency,
  }).format(product.price)

  return (
    <Link
      to={`/item/${product.id}`}
      className="flex flex-col overflow-hidden rounded border shadow-sm transition hover:shadow-md"
    >
      <img
        src={product.image}
        alt={product.name}
        referrerPolicy="no-referrer"
        className="h-48 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="mt-1 flex-1 text-sm text-gray-600">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold">{formattedPrice}</span>
          {product.stock === 0 && (
            <span className="text-sm font-medium text-red-500">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  )
}
