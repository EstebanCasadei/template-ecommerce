import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductSearch } from '../application/useProductSearch.js'

const MAX_QUERY_LENGTH = 100
const MAX_SUGGESTIONS = 6
const DEBOUNCE_MS = 250

export default function SearchBar() {
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const [term, setTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Debounce so we don't re-query on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedTerm(term), DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [term])

  const { products, loading } = useProductSearch(debouncedTerm)
  const suggestions = products.slice(0, MAX_SUGGESTIONS)
  const showDropdown = isOpen && term.trim().length > 0

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setTerm(e.target.value.slice(0, MAX_QUERY_LENGTH))
    setIsOpen(true)
  }

  const handleSelect = (productId) => {
    setIsOpen(false)
    navigate(`/item/${productId}`)
  }

  const handleSeeAll = () => {
    const trimmed = term.trim()
    if (!trimmed) return
    setIsOpen(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false)
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSeeAll()
    }
  }

  return (
    <div ref={containerRef} role="search" className="relative flex-1 sm:max-w-xs">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Search products…"
        value={term}
        maxLength={MAX_QUERY_LENGTH}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded border p-2 text-sm"
      />

      {showDropdown && (
        <ul
          id="search-suggestions"
          className="absolute z-10 mt-1 w-full rounded border bg-white shadow-lg"
        >
          {loading && <li className="p-2 text-sm text-gray-500">Searching…</li>}

          {!loading && suggestions.length === 0 && (
            <li className="p-2 text-sm text-gray-500">No products found.</li>
          )}

          {!loading &&
            suggestions.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(product.id)}
                  className="flex w-full items-center gap-2 p-2 text-left text-sm hover:bg-gray-100"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <span className="truncate">{product.name}</span>
                </button>
              </li>
            ))}

          {!loading && products.length > 0 && (
            <li className="border-t">
              <button
                type="button"
                onClick={handleSeeAll}
                className="w-full p-2 text-left text-sm font-medium text-blue-600 hover:bg-gray-100"
              >
                See all {products.length} results
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
