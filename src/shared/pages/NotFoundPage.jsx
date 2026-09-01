import { Link } from 'react-router-dom'

/**
 * 404 fallback page. The catch-all route in App.jsx renders this for any
 * path that does not match a known route.
 */
export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800">Page not found</h2>
      <p className="mt-4 text-gray-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded bg-purple-700 px-4 py-2 text-white hover:bg-purple-800"
      >
        Back to the store
      </Link>
    </div>
  )
}
