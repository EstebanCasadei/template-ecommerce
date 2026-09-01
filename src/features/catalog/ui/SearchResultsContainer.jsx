import { useSearchParams } from 'react-router-dom'
import { useProductSearch } from '../application/useProductSearch.js'
import ItemList from './ItemList.jsx'
import Loader from '../../../shared/ui/Loader.jsx'

const MAX_QUERY_LENGTH = 100

export default function SearchResultsContainer() {
  const [searchParams] = useSearchParams()
  const term = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)
  const { products, loading, error } = useProductSearch(term)

  if (loading) return <Loader />
  if (error) return <p className="py-8 text-center text-red-500">Could not search products.</p>

  return (
    <div className="py-4">
      <h2 className="mb-4 text-2xl font-bold">
        {term ? `Results for "${term}"` : 'Search'}
      </h2>
      <ItemList products={products} />
    </div>
  )
}
