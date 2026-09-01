import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../../catalog/infrastructure/categoryRepository.js'
import {
  createCategory,
  deleteCategory,
  slugifyCategory,
} from '../infrastructure/adminCategoryRepository.js'
import Loader from '../../../shared/ui/Loader.jsx'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error('[AdminCategoriesPage] getCategories failed:', err)
        setError(`Could not load categories: ${err.message ?? 'unknown error'}. Check the console.`)
      })
  }, [])

  useEffect(load, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    if (!slugifyCategory(name)) {
      setError('Enter a category name.')
      return
    }
    try {
      await createCategory(name)
      setName('')
      load()
    } catch {
      setError('Could not create the category. Check your admin permissions.')
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? Products keep their category value.`))
      return
    try {
      await deleteCategory(category.id)
      load()
    } catch {
      setError('Could not delete the category.')
    }
  }

  if (!categories) return <Loader />

  return (
    <div className="max-w-md">
      <h2 className="mb-4 text-lg font-semibold">Categories</h2>
      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          maxLength={50}
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border p-2"
        />
        <button type="submit" className="rounded bg-green-600 px-4 py-2 text-sm text-white">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <span className="font-medium capitalize">{category.name}</span>
              <span className="ml-2 font-mono text-xs text-gray-400">/{category.id}</span>
            </div>
            <button
              onClick={() => handleDelete(category)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
