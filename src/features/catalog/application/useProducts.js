import { useEffect, useState } from 'react'
import { getProducts } from '../infrastructure/FirebaseProductRepository.js'

export function useProducts(category) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    getProducts(category)
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
  }, [category])

  return { products, loading, error }
}
