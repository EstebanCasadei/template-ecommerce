import { useEffect, useState } from 'react'
import { getCategories } from '../infrastructure/categoryRepository.js'

export function useCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((result) => !cancelled && setCategories(result))
      .catch(() => !cancelled && setCategories([]))
    return () => {
      cancelled = true
    }
  }, [])

  return categories
}
