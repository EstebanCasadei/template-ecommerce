import clientConfig from '../../config/clientConfig.js'
import ItemCount from './ItemCount.jsx'

export default function ItemDetail({ product, isInCart, onAddToCart }) {
  const formattedPrice = new Intl.NumberFormat(clientConfig.store.locale, {
    style: 'currency',
    currency: clientConfig.store.currency,
  }).format(product.price)

  return (
    <div className="mx-auto grid max-w-4xl gap-6 py-8 sm:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        referrerPolicy="no-referrer"
        className="w-full rounded object-cover"
      />
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="mt-2 text-gray-600">{product.description}</p>
        <p className="mt-4 text-xl font-bold">{formattedPrice}</p>

        <div className="mt-6">
          {isInCart ? (
            <p className="font-medium text-green-600">Added to cart</p>
          ) : (
            <ItemCount stock={product.stock} onAdd={onAddToCart} />
          )}
        </div>
      </div>
    </div>
  )
}
