import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../../catalog/infrastructure/FirebaseProductRepository.js'
import { createProduct, updateProduct } from '../infrastructure/adminProductRepository.js'
import ProductForm from './ProductForm.jsx'
import Loader from '../../../shared/ui/Loader.jsx'

export default function AdminProductEditPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isNew = !productId
  const [initialValue, setInitialValue] = useState(isNew ? undefined : null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isNew) return
    getProductById(productId)
      .then((product) => {
        if (!product) throw new Error('not found')
        setInitialValue(product)
      })
      .catch(() => setError('Product not found.'))
  }, [productId, isNew])

  const handleSubmit = async (product) => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (isNew) {
        await createProduct(product)
      } else {
        await updateProduct(productId, product)
      }
      navigate('/admin/products')
    } catch {
      setError('Could not save the product. Check your admin permissions.')
      setIsSubmitting(false)
    }
  }

  if (error && initialValue === null) return <p className="text-red-600">{error}</p>
  if (!isNew && initialValue === null) return <Loader />

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">{isNew ? 'New product' : 'Edit product'}</h2>
      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <ProductForm initialValue={initialValue} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
