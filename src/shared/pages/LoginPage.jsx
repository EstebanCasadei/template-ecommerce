import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/application/useAuth.js'
import {
  login,
  signInWithGoogle,
  getAuthErrorMessage,
} from '../../features/auth/infrastructure/authService.js'
import AuthForm from '../../features/auth/ui/AuthForm.jsx'
import GoogleSignInButton from '../../features/auth/ui/GoogleSignInButton.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authAvailable } = useAuth()
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = location.state?.from ?? '/'

  const handleSubmit = async ({ email, password }) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      console.error('[LoginPage] Google sign-in failed:', err)
      setError(getAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authAvailable) {
    return (
      <p className="py-8 text-center text-gray-600">
        Sign-in requires a configured Firebase project. See .env.example.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <h2 className="mb-4 text-2xl font-bold">Sign in</h2>
      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <AuthForm mode="login" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <div className="my-4 flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <GoogleSignInButton onClick={handleGoogleSignIn} isSubmitting={isSubmitting} />
      <p className="mt-4 text-sm text-gray-600">
        No account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
