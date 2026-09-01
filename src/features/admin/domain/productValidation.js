/**
 * Admin-side product validation. UX only — firestore.rules re-validates the
 * same shape server-side before any write is accepted.
 */
export const PRODUCT_LIMITS = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 1000,
  IMAGE_MAX: 500,
  PRICE_MAX: 1000000,
  STOCK_MAX: 1000000,
}

export function validateProduct(product) {
  const errors = {}

  if (!product.name?.trim()) {
    errors.name = 'Name is required.'
  } else if (product.name.trim().length > PRODUCT_LIMITS.NAME_MAX) {
    errors.name = `Name must be at most ${PRODUCT_LIMITS.NAME_MAX} characters.`
  }

  if (product.description?.length > PRODUCT_LIMITS.DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${PRODUCT_LIMITS.DESCRIPTION_MAX} characters.`
  }

  const price = Number(product.price)
  if (!Number.isFinite(price) || price <= 0 || price > PRODUCT_LIMITS.PRICE_MAX) {
    errors.price = 'Enter a price greater than 0.'
  }

  const stock = Number(product.stock)
  if (!Number.isInteger(stock) || stock < 0 || stock > PRODUCT_LIMITS.STOCK_MAX) {
    errors.stock = 'Enter a stock of 0 or more (whole number).'
  }

  if (!product.category?.trim()) {
    errors.category = 'Category is required.'
  }

  if (product.image && !/^https?:\/\//.test(product.image)) {
    errors.image = 'Image must be an http(s) URL.'
  } else if (product.image?.length > PRODUCT_LIMITS.IMAGE_MAX) {
    errors.image = `Image URL must be at most ${PRODUCT_LIMITS.IMAGE_MAX} characters.`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function normalizeProduct(product) {
  return {
    name: product.name.trim(),
    description: product.description?.trim() ?? '',
    price: Number(product.price),
    stock: Number(product.stock),
    category: product.category.trim(),
    image: product.image?.trim() ?? '',
  }
}
