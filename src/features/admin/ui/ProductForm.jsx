import { useState } from 'react'
import { useCategories } from '../../catalog/application/useCategories.js'
import { validateProduct, normalizeProduct, PRODUCT_LIMITS } from '../domain/productValidation.js'

const EMPTY = { name: '', description: '', price: '', stock: '', category: '', image: '' }

export default function ProductForm({ initialValue, onSubmit, isSubmitting }) {
  const categories = useCategories()
  const [product, setProduct] = useState(initialValue ?? EMPTY)
  const [touched, setTouched] = useState({})

  const { valid, errors } = validateProduct(product)

  const handleChange = (field) => (e) =>
    setProduct((prev) => ({ ...prev, [field]: e.target.value }))

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, description: true, price: true, stock: true, category: true, image: true })
    if (!valid) return
    onSubmit(normalizeProduct(product))
  }

  const fieldClass = (field) =>
    `w-full rounded border p-2 ${touched[field] && errors[field] ? 'border-red-500' : ''}`

  const errorFor = (field) =>
    touched[field] && errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          required
          maxLength={PRODUCT_LIMITS.NAME_MAX}
          value={product.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          className={fieldClass('name')}
        />
        {errorFor('name')}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          rows={3}
          maxLength={PRODUCT_LIMITS.DESCRIPTION_MAX}
          value={product.description}
          onChange={handleChange('description')}
          onBlur={handleBlur('description')}
          className={fieldClass('description')}
        />
        {errorFor('description')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Price</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={product.price}
            onChange={handleChange('price')}
            onBlur={handleBlur('price')}
            className={fieldClass('price')}
          />
          {errorFor('price')}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={product.stock}
            onChange={handleChange('stock')}
            onBlur={handleBlur('stock')}
            className={fieldClass('stock')}
          />
          {errorFor('stock')}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          required
          value={product.category}
          onChange={handleChange('category')}
          onBlur={handleBlur('category')}
          className={fieldClass('category')}
        >
          <option value="">Select a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errorFor('category')}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Image URL</label>
        <input
          type="url"
          maxLength={PRODUCT_LIMITS.IMAGE_MAX}
          placeholder="https://…"
          value={product.image}
          onChange={handleChange('image')}
          onBlur={handleBlur('image')}
          className={fieldClass('image')}
        />
        {errorFor('image')}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-40"
      >
        Save product
      </button>
    </form>
  )
}
