// Generic, dependency-free validators.
//
// IMPORTANT: these run in the browser. They exist to give the user fast
// feedback, but they are NOT a security boundary — anyone can bypass them by
// editing the DOM or calling the app's functions directly from DevTools.
// The real boundary is server-side: Firestore Security Rules (see
// `firestore.rules`) and the recomputation done in
// `FirebaseOrderRepository.saveOrder`. Always revalidate at the point where
// data is persisted, never trust that a value "already passed validation".

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+()\d\s-]{6,20}$/

const NAME_MAX_LENGTH = 100
const PHONE_MAX_LENGTH = 30
const EMAIL_MAX_LENGTH = 200

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/** Trims, collapses inner whitespace and strips control characters. */
export function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return ''
  const cleaned = value
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
  return maxLength ? cleaned.slice(0, maxLength) : cleaned
}

export function isValidName(value) {
  return isNonEmptyString(value) && value.trim().length <= NAME_MAX_LENGTH
}

export function isValidPhone(value) {
  return (
    isNonEmptyString(value) &&
    value.trim().length <= PHONE_MAX_LENGTH &&
    PHONE_PATTERN.test(value.trim())
  )
}

export function isValidEmail(value) {
  return (
    isNonEmptyString(value) &&
    value.trim().length <= EMAIL_MAX_LENGTH &&
    EMAIL_PATTERN.test(value.trim())
  )
}

/** Positive integer, optionally capped by an available stock. */
export function isValidQuantity(value, stock = Infinity) {
  return Number.isInteger(value) && value >= 1 && value <= stock
}

export const LIMITS = {
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
}
