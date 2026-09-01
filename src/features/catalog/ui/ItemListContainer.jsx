import { useParams } from 'react-router-dom'
import { useProducts } from '../application/useProducts.js'
import ItemList from './ItemList.jsx'
import Loader from '../../../shared/ui/Loader.jsx'

export default function ItemListContainer() {
  const { categoryId } = useParams()
  const { products, loading, error } = useProducts(categoryId)

  if (loading) return <Loader />
  if (error) return <p className="py-8 text-center text-red-500">Could not load products.</p>

  return (
    <div className="py-4">
      <h2 className="mb-4 text-2xl font-bold">
        {categoryId ? categoryId : 'All products'}
      </h2>
      <ItemList products={products} />
    </div>
  )
}
