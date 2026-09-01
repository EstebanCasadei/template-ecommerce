import clientConfig from '../../config/clientConfig.js'

export default function CartItem({ product, quantity, onRemove }) {
  const formattedSubtotal = new Intl.NumberFormat(clientConfig.store.locale, {
    style: 'currency',
    currency: clientConfig.store.currency,
  }).format(product.price * quantity)

  return (
    <li className="flex items-center justify-between rounded border p-3">
      <span>
        {product.name} x {quantity}
      </span>
      <span className="flex items-center gap-4">
        {formattedSubtotal}
        <button onClick={() => onRemove(product.id)} className="text-red-500">
          Remove
        </button>
      </span>
    </li>
  )
}
