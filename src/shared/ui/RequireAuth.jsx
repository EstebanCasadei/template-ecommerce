import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/application/useAuth.js'
import Loader from './Loader.jsx'

/**
 * Route guards. These are UX only: they decide what to render, but every
 * privileged read/write is independently enforced by firestore.rules using
 * the same auth token, so bypassing these components gains an attacker
 * nothing.
 */

export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
