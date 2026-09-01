import { useState } from 'react'
import clientConfig from '../../config/clientConfig.js'
import { validateCustomer } from '../domain/customerValidation.js'
import { LIMITS } from '../../../shared/validation/validators.js'

const initialCustomer = { name: '', phone: '', email: '' }

export default function CheckoutForm({ total, onSubmit }) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [touched, setTouched] = useState({})

  // Validation is re-run on every render from current state, never trusted
  // from a previous check. The HTML `required`/`maxLength` attributes below
  // are progressive-enhancement only: real enforcement happens here and,
  // critically, again in the repository layer before anything is persisted.
  const { valid, errors } = validateCustomer(customer)

  const handleChange = (field) => (e) =>
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }))

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, email: true })
    if (!valid) return
    onSubmit(customer)
  }

  const formattedTotal = new Intl.NumberFormat(clientConfig.store.locale, {
    style: 'currency',
    currency: clientConfig.store.currency,
  }).format(total)

  const fieldClass = (field) =>
    `w-full rounded border p-2 ${touched[field] && errors[field] ? 'border-red-500' : ''}`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <input
          required
          maxLength={LIMITS.NAME_MAX_LENGTH}
          placeholder="Name"
          value={customer.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          className={fieldClass('name')}
        />
        {touched.name && errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <input
          required
          maxLength={LIMITS.PHONE_MAX_LENGTH}
          placeholder="Phone"
          value={customer.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          className={fieldClass('phone')}
        />
        {touched.phone && errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <input
          required
          type="email"
          maxLength={LIMITS.EMAIL_MAX_LENGTH}
          placeholder="Email"
          value={customer.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          className={fieldClass('email')}
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span>Total:</span>
        <strong>{formattedTotal}</strong>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-40"
      >
        Place order
      </button>
    </form>
  )
}
