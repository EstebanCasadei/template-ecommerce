import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'
import { validateCustomer, sanitizeCustomer } from '../domain/customerValidation.js'
import { isValidQuantity } from '../../../shared/validation/validators.js'
import { OrderValidationError } from '../domain/OrderValidationError.js'

const MAX_LINES = 10

/**
 * Persists an order.
 *
 * Security-critical: nothing about price or stock is trusted from the
 * caller. `lines` only contributes `productId` and `quantity`; the unit
 * price and the stock check are always re-derived from Firestore (or, in
 * mock/no-db mode, from the in-memory product), inside a transaction so
 * concurrent purchases can't oversell the same stock.
 *
 * This is still enforced client-side, so a determined attacker could bypass
 * this function entirely and call the Firestore SDK directly — that is why
 * `firestore.rules` re-validates the same invariants (price, stock, shape)
 * on the server. See SECURITY.md.
 */
export async function saveOrder({ customer, lines, uid = null }) {
  const cleanCustomer = sanitizeCustomer(customer)
  const { valid, errors } = validateCustomer(cleanCustomer)
  if (!valid) {
    throw new OrderValidationError('Invalid customer data.', 'INVALID_CUSTOMER', errors)
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    throw new OrderValidationError('The cart is empty.', 'EMPTY_CART')
  }
  if (lines.length > MAX_LINES) {
    throw new OrderValidationError('Too many distinct products in one order.', 'TOO_MANY_LINES')
  }
  for (const line of lines) {
    if (!line?.product?.id || !isValidQuantity(line.quantity)) {
      throw new OrderValidationError('Invalid cart line.', 'INVALID_LINE')
    }
  }

  if (!db) return saveOrderWithoutBackend(cleanCustomer, lines, uid)

  return runTransaction(db, async (transaction) => {
    const orderLines = []
    let total = 0

    for (const { product, quantity } of lines) {
      const productRef = doc(db, 'products', product.id)
      const snapshot = await transaction.get(productRef)

      if (!snapshot.exists()) {
        throw new OrderValidationError(`Product ${product.id} no longer exists.`, 'PRODUCT_NOT_FOUND')
      }

      const authoritative = snapshot.data()
      const currentStock = Number(authoritative.stock) || 0
      const unitPrice = Number(authoritative.price) || 0

      if (!isValidQuantity(quantity, currentStock)) {
        throw new OrderValidationError(
          `Not enough stock for ${authoritative.name ?? product.id}.`,
          'OUT_OF_STOCK',
        )
      }

      const subtotal = unitPrice * quantity
      total += subtotal

      orderLines.push({
        productId: product.id,
        name: authoritative.name ?? '',
        unitPrice,
        quantity,
        subtotal,
      })

      transaction.update(productRef, { stock: currentStock - quantity })
    }

    const orderRef = doc(collection(db, 'orders'))
    const order = {
      customer: cleanCustomer,
      lines: orderLines,
      total,
      status: 'pending',
      createdAt: serverTimestamp(),
      // Linking the order to the signed-in user lets them see it in their
      // order history. Rules verify uid matches the requester's token, so
      // an attacker cannot attach orders to someone else's account.
      ...(uid ? { uid } : {}),
    }
    transaction.set(orderRef, order)

    return { id: orderRef.id, ...order, createdAt: new Date().toISOString() }
  })
}

/** Mock-data fallback used when no Firebase project is configured. */
async function saveOrderWithoutBackend(customer, lines, uid) {
  const orderLines = lines.map(({ product, quantity }) => {
    const currentStock = Number(product.stock) || 0
    if (!isValidQuantity(quantity, currentStock)) {
      throw new OrderValidationError(`Not enough stock for ${product.name}.`, 'OUT_OF_STOCK')
    }
    const unitPrice = Number(product.price) || 0
    return {
      productId: product.id,
      name: product.name,
      unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
    }
  })

  const total = orderLines.reduce((sum, line) => sum + line.subtotal, 0)

  return {
    id: `demo-${Date.now()}`,
    customer,
    lines: orderLines,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...(uid ? { uid } : {}),
  }
}

