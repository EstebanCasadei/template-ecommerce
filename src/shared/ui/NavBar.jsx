import { Link, useNavigate } from 'react-router-dom'
import clientConfig from '../../features/config/clientConfig.js'
import CartWidget from '../../features/cart/ui/CartWidget.jsx'
import SearchBar from '../../features/catalog/ui/SearchBar.jsx'
import { useCategories } from '../../features/catalog/application/useCategories.js'
import { useAuth } from '../../features/auth/application/useAuth.js'
import { logout } from '../../features/auth/infrastructure/authService.js'

export default function NavBar() {
  const categories = useCategories()
  const { user, isAdmin, isAuthenticated, authAvailable } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="flex flex-col gap-3 bg-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="text-xl font-bold">
        {clientConfig.store.name}
      </Link>
      <ul className="flex flex-wrap gap-4 text-sm font-medium">
        <li>
          <Link to="/" className="hover:underline">
            All
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link to={`/category/${category.id}`} className="capitalize hover:underline">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <SearchBar />
      <div className="flex items-center gap-4 text-sm">
        {isAdmin && (
          <Link to="/admin" className="font-medium text-purple-700 hover:underline">
            Admin
          </Link>
        )}
        {isAuthenticated ? (
          <>
            <Link to="/my-orders" className="hover:underline">
              {user.displayName || 'My orders'}
            </Link>
            <button onClick={handleLogout} className="text-gray-600 hover:underline">
              Sign out
            </button>
          </>
        ) : (
          authAvailable && (
            <Link to="/login" className="hover:underline">
              Sign in
            </Link>
          )
        )}
        <CartWidget />
      </div>
    </nav>
  )
}
