import { db } from './firebase.js'

const MAX_LINES = 10

/**
 * Resolves product data from Firestore and builds order lines.
 * This is the server-side source of truth: prices and stock are never
 * taken from the client.
 */
export async function resolveOrderLines(lines) {
  const productIds = lines.map((line) => line.productId)
  const uniqueIds = [...new Set(productIds)]

  if (uniqueIds.length > MAX_LINES) {
    throw new Error('Too many distinct products in one order.')
  }

  const productRefs = uniqueIds.map((id) => db.collection('products').doc(id))
  const snapshots = await db.getAll(...productRefs)

  const productsById = new Map()
  for (let i = 0; i < uniqueIds.length; i++) {
    const snap = snapshots[i]
    if (!snap.exists) {
      throw new Error(`Product ${uniqueIds[i]} no longer exists.`)
    }
    productsById.set(uniqueIds[i], snap.data())
  }

  const orderLines = []
  let total = 0

  for (const line of lines) {
    const product = productsById.get(line.productId)
    const currentStock = Number(product.stock) || 0
    const unitPrice = Number(product.price) || 0

    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > currentStock) {
      throw new Error(`Not enough stock for ${product.name ?? line.productId}.`)
    }

    const subtotal = unitPrice * line.quantity
    total += subtotal

    orderLines.push({
      productId: line.productId,
      name: product.name ?? '',
      unitPrice,
      quantity: line.quantity,
      subtotal,
    })
  }

  return { orderLines, total }
}

/**
 * Atomically decrements stock for all products in the order.
 * Throws if any product does not have enough stock (race condition).
 */
export async function decrementStock(lines) {
  const updates = {}

  await db.runTransaction(async (transaction) => {
    const refs = lines.map((line) => db.collection('products').doc(line.productId))
    const snapshots = await transaction.getAll(...refs)

    const stocks = new Map()
    for (let i = 0; i < lines.length; i++) {
      const snap = snapshots[i]
      if (!snap.exists) {
        throw new Error(`Product ${lines[i].productId} no longer exists.`)
      }
      const data = snap.data()
      const currentStock = Number(data.stock) || 0
      if (lines[i].quantity > currentStock) {
        throw new Error(`Not enough stock for ${data.name ?? lines[i].productId}.`)
      }
      stocks.set(lines[i].productId, currentStock)
    }

    for (const line of lines) {
      const ref = db.collection('products').doc(line.productId)
      const newStock = stocks.get(line.productId) - line.quantity
      transaction.update(ref, { stock: newStock })
      updates[line.productId] = newStock
    }
  })

  return updates
}

/**
 * Restores stock for a failed/abandoned order.
 */
export async function incrementStock(lines) {
  await db.runTransaction(async (transaction) => {
    const refs = lines.map((line) => db.collection('products').doc(line.productId))
    const snapshots = await transaction.getAll(...refs)

    const stocks = new Map()
    for (let i = 0; i < lines.length; i++) {
      const snap = snapshots[i]
      if (!snap.exists) continue
      const currentStock = Number(snap.data().stock) || 0
      stocks.set(lines[i].productId, currentStock)
    }

    for (const line of lines) {
      if (!stocks.has(line.productId)) continue
      const ref = db.collection('products').doc(line.productId)
      const newStock = stocks.get(line.productId) + line.quantity
      transaction.update(ref, { stock: newStock })
    }
  })
}
