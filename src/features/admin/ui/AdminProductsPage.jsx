import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../catalog/infrastructure/FirebaseProductRepository.js'
import { deleteProduct } from '../infrastructure/adminProductRepository.js'
import { formatCurrency } from '../../../shared/format/currency.js'
import Loader from '../../../shared/ui/Loader.jsx'

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => {
        console.error('[AdminProductsPage] getProducts failed:', err)
        setError(`Could not load products: ${err.message ?? 'unknown error'}.`)
      })
  }, [])

  useEffect(load, [load])

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(product.id)
      load()
    } catch (err) {
      console.error('[AdminProductsPage] deleteProduct failed:', err)
      setError(`Could not delete the product: ${err.message ?? 'unknown error'}.`)
    }
  }

  if (error) return <p className="text-red-600">{error}</p>
  if (!products) return <Loader />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products ({products.length})</h2>
        <Link to="/admin/products/new" className="rounded bg-green-600 px-3 py-2 text-sm text-white">
          New product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="py-2 pr-4">{product.name}</td>
                <td className="py-2 pr-4 capitalize">{product.category}</td>
                <td className="py-2 pr-4">{formatCurrency(product.price)}</td>
                <td className={`py-2 pr-4 ${product.stock === 0 ? 'font-semibold text-red-600' : ''}`}>
                  {product.stock}
                </td>
                <td className="py-2 text-right">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="mr-3 text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
