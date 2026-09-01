import { useParams } from 'react-router-dom'
import { useProduct } from '../application/useProduct.js'
import { useCart } from '../../cart/application/useCart.js'
import ItemDetail from './ItemDetail.jsx'
import Loader from '../../../shared/ui/Loader.jsx'

export default function ItemDetailContainer() {
  const { itemId } = useParams()
  const { product, loading, error } = useProduct(itemId)
  const { addToCart, isInCart } = useCart()

  if (loading) return <Loader />
  if (error) return <p className="py-8 text-center text-red-500">Could not load product.</p>
  if (!product) return <p className="py-8 text-center text-gray-600">Product not found.</p>

  return (
    <ItemDetail
      product={product}
      isInCart={isInCart(product.id)}
      onAddToCart={(quantity) => addToCart(product, quantity)}
    />
  )
}
