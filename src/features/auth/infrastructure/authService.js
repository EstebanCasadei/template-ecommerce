import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../../../shared/firebase/firebase.js'

/**
 * Thin wrapper around Firebase Auth so the rest of the app never imports
 * the SDK directly. Swapping the auth provider later only touches this file.
 *
 * All functions throw AUTH_NOT_CONFIGURED when Firebase is not configured
 * (mock/catalog-only mode).
 */

function requireAuth() {
  if (!auth) {
    const error = new Error('Authentication requires a configured Firebase project.')
    error.code = 'AUTH_NOT_CONFIGURED'
    throw error
  }
  return auth
}

export const isAuthAvailable = () => auth !== null

export async function register({ displayName, email, password }) {
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email, password)
  if (displayName) {
    await updateProfile(user, { displayName })
  }
  return user
}

export async function login({ email, password }) {
  const { user } = await signInWithEmailAndPassword(requireAuth(), email, password)
  return user
}

/**
 * Signs in (or signs up) with Google using a popup.
 * Returns the signed-in user; throws AUTH_NOT_CONFIGURED if Firebase is missing.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(requireAuth(), provider)
  return user
}

export function logout() {
  return signOut(requireAuth())
}

/**
 * Subscribes to auth state. The callback receives `{ user, isAdmin }`:
 * the admin flag is read from the ID token's custom claims, which are set
 * server-side (scripts/set-admin.js) and cannot be forged by the client.
 */
export function subscribeToAuth(callback) {
  if (!auth) {
    callback({ user: null, isAdmin: false })
    return () => {}
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, isAdmin: false })
      return
    }
    const token = await user.getIdTokenResult()
    callback({ user, isAdmin: token.claims.admin === true })
  })
}

/** Maps Firebase Auth error codes to user-friendly messages. */
export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'That email is already registered.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/account-exists-with-different-credential':
      'This email already has an account with a different method. Sign in with your password first.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'The popup was blocked. Allow popups for this site.',
    'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled. Enable Google in Firebase Console → Authentication.',
    'auth/unauthorized-domain':
      'This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/network-request-failed':
      'Network error. Check your connection and try again.',
    'auth/internal-error': 'Internal Firebase error. Try again in a moment.',
    AUTH_NOT_CONFIGURED: 'Authentication requires a configured Firebase project.',
  }
  return messages[error?.code] ?? `${error?.code ?? 'Unknown error'}. Check the console for details.`
}
