import { useState } from 'react'

/**
 * Shared email/password form for login and registration.
 * Client-side checks are UX only; Firebase Auth enforces the real policy
 * (password strength, email uniqueness) on the server.
 */
export default function AuthForm({ mode, onSubmit, isSubmitting }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({ displayName: '', email: '', password: '' })

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <input
          required
          maxLength={100}
          placeholder="Name"
          value={form.displayName}
          onChange={handleChange('displayName')}
          className="w-full rounded border p-2"
        />
      )}
      <input
        required
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange('email')}
        className="w-full rounded border p-2"
      />
      <input
        required
        type="password"
        minLength={6}
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        placeholder="Password"
        value={form.password}
        onChange={handleChange('password')}
        className="w-full rounded border p-2"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-40"
      >
        {isRegister ? 'Create account' : 'Sign in'}
      </button>
    </form>
  )
}
