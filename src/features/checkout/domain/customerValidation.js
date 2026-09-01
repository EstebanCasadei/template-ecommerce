import { isValidName, isValidPhone, isValidEmail, sanitizeText, LIMITS } from '../../../shared/validation/validators.js'

/**
 * Validates raw customer input. Used both for inline UI feedback and, more
 * importantly, right before persisting an order — the UI check alone must
 * never be trusted (see validators.js header comment).
 */
export function validateCustomer(customer) {
  const errors = {}

  if (!isValidName(customer?.name)) {
    errors.name = 'Enter a name (max 100 characters).'
  }
  if (!isValidPhone(customer?.phone)) {
    errors.phone = 'Enter a valid phone number.'
  }
  if (!isValidEmail(customer?.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Returns a trimmed, length-capped, control-character-free customer object. */
export function sanitizeCustomer(customer) {
  return {
    name: sanitizeText(customer?.name, LIMITS.NAME_MAX_LENGTH),
    phone: sanitizeText(customer?.phone, LIMITS.PHONE_MAX_LENGTH),
    email: sanitizeText(customer?.email, LIMITS.EMAIL_MAX_LENGTH).toLowerCase(),
  }
}
