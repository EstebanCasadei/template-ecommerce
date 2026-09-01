import { useState } from 'react'
import { isValidQuantity } from '../../../shared/validation/validators.js'

const MIN_QUANTITY = 1

export default function ItemCount({ stock, initial = MIN_QUANTITY, onAdd }) {
  const [quantity, setQuantity] = useState(Math.min(initial, stock))

  const isInvalid = !isValidQuantity(quantity, stock)

  const decrease = () => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))
  const increase = () => setQuantity((q) => Math.min(stock, q + 1))

  const handleChange = (e) => {
    const value = Math.trunc(Number(e.target.value))
    if (!Number.isFinite(value)) return
    // Clamp instead of trusting the raw input: the `min`/`max` attributes on
    // the input below are UX hints only, not enforcement.
    setQuantity(Math.min(Math.max(value, MIN_QUANTITY), stock))
  }

  const handleAdd = () => {
    if (!isValidQuantity(quantity, stock)) return
    onAdd(quantity)
  }

  if (stock === 0) {
    return <p className="font-medium text-red-500">Out of stock</p>
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border">
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= MIN_QUANTITY}
          className="px-3 py-1 disabled:opacity-40"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleChange}
          min={MIN_QUANTITY}
          max={stock}
          className="w-14 border-x text-center"
        />
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= stock}
          className="px-3 py-1 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={isInvalid}
        onClick={handleAdd}
        className="rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-40"
      >
        Add to cart
      </button>
    </div>
  )
}
