import { useEffect, useState } from 'react'
import { searchProducts } from '../infrastructure/FirebaseProductRepository.js'

export function useProductSearch(term) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (!term?.trim()) {
      setProducts([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    searchProducts(term)
      .then((data) => {
        if (isMounted) setProducts(data)
      })
      .catch((err) => {
        if (isMounted) setError(err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [term])

  return { products, loading, error }
}
