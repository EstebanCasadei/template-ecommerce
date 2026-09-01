import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { subscribeToAuth, isAuthAvailable } from '../infrastructure/authService.js'

/**
 * Global auth state: current user and whether they hold the admin claim.
 *
 * `isLoading` is true until Firebase reports the initial auth state, so
 * route guards can show a loader instead of flashing a redirect.
 *
 * Security note: `isAdmin` here only drives UI (menus, route guards). The
 * real enforcement is in firestore.rules, which checks the same claim on
 * the server for every privileged read/write.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, isAdmin: false, isLoading: isAuthAvailable() })

  useEffect(() => {
    const unsubscribe = subscribeToAuth(({ user, isAdmin }) => {
      setState({ user, isAdmin, isLoading: false })
    })
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user: state.user,
      isAdmin: state.isAdmin,
      isLoading: state.isLoading,
      isAuthenticated: state.user !== null,
      authAvailable: isAuthAvailable(),
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
