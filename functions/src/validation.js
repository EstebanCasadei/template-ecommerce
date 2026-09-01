const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+()\d\s-]{6,20}$/

const NAME_MAX_LENGTH = 100
const PHONE_MAX_LENGTH = 30
const EMAIL_MAX_LENGTH = 200
const MAX_LINES = 10

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
}

export function isValidName(value) {
  return isNonEmptyString(value) && value.trim().length <= NAME_MAX_LENGTH
}

export function isValidPhone(value) {
  const trimmed = value?.trim?.()
  return (
    isNonEmptyString(value) &&
    trimmed.length <= PHONE_MAX_LENGTH &&
    PHONE_PATTERN.test(trimmed)
  )
}

export function isValidEmail(value) {
  const trimmed = value?.trim?.()
  return (
    isNonEmptyString(value) &&
    trimmed.length <= EMAIL_MAX_LENGTH &&
    EMAIL_PATTERN.test(trimmed)
  )
}

export function isValidQuantity(value, stock = Infinity) {
  return Number.isInteger(value) && value >= 1 && value <= stock
}

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

export function sanitizeCustomer(customer) {
  return {
    name: sanitizeText(customer?.name, NAME_MAX_LENGTH),
    phone: sanitizeText(customer?.phone, PHONE_MAX_LENGTH),
    email: sanitizeText(customer?.email, EMAIL_MAX_LENGTH).toLowerCase(),
  }
}

export function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { valid: false, error: 'The cart is empty.' }
  }
  if (lines.length > MAX_LINES) {
    return { valid: false, error: 'Too many distinct products in one order.' }
  }
  for (const line of lines) {
    if (!line?.productId || typeof line.productId !== 'string' || !isValidQuantity(line.quantity)) {
      return { valid: false, error: 'Invalid cart line.' }
    }
  }
  return { valid: true }
}
