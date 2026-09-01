import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

/**
 * Helper to manually verify Firestore Security Rules from the browser console.
 *
 * Only exposed in development. In production this file is never loaded.
 *
 * Usage:
 * 1. Configure .env with a real Firebase project and create at least one
 *    product in Firestore (via Firebase Console).
 * 2. Run `pnpm run dev` and open the browser console.
 * 3. Call `window.testSecurityRules()`.
 * 4. Enter an existing product ID when prompted.
 */
async function testSecurityRules() {
  if (!db) {
    console.error('Firebase is not configured. Check your .env file.')
    return
  }

  const productId = window.prompt('Enter an existing product ID in Firestore:', 'p1')
  if (!productId) return

  const productSnap = await getDoc(doc(db, 'products', productId))
  if (!productSnap.exists()) {
    console.error(`Product ${productId} does not exist. Create it in Firebase Console first.`)
    return
  }

  const product = { id: productSnap.id, ...productSnap.data() }
  const now = Date.now()

  const line = {
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: 1,
    subtotal: product.price,
  }

  const orderBase = {
    customer: { name: 'Test', phone: '+1234567890', email: 'test@test.com' },
    lines: [line],
    total: product.price,
    status: 'pending',
    createdAt: serverTimestamp(),
  }

  async function run(name, promise, shouldSucceed) {
    try {
      await promise
      if (shouldSucceed) console.log(`✅ ${name}: allowed (correct)`)
      else console.error(`❌ ${name}: should have been rejected`)
    } catch (err) {
      if (!shouldSucceed) console.log(`✅ ${name}: rejected (correct) — ${err.code}`)
      else console.error(`❌ ${name}: should have been allowed — ${err.code}: ${err.message}`)
    }
  }

  console.log('Running Firestore Security Rules checks...\n')

  await run(
    '1. create valid order',
    setDoc(doc(db, 'orders', `test-valid-${now}`), orderBase),
    true,
  )
  await run(
    '2. reject fake total',
    setDoc(doc(db, 'orders', `test-bad-total-${now}`), { ...orderBase, total: 999 }),
    false,
  )
  await run(
    '3. reject fake unitPrice',
    setDoc(doc(db, 'orders', `test-bad-price-${now}`), {
      ...orderBase,
      lines: [{ ...line, unitPrice: 1, subtotal: 1 }],
      total: 1,
    }),
    false,
  )
  await run(
    '4. reject quantity > stock',
    setDoc(doc(db, 'orders', `test-bad-qty-${now}`), {
      ...orderBase,
      lines: [
        {
          ...line,
          quantity: product.stock + 100,
          subtotal: product.price * (product.stock + 100),
        },
      ],
      total: product.price * (product.stock + 100),
    }),
    false,
  )
  await run(
    '5. reject reading an order',
    getDoc(doc(db, 'orders', `test-valid-${now}`)),
    false,
  )
  await run(
    '6. reject updating an order',
    updateDoc(doc(db, 'orders', `test-valid-${now}`), { total: 0 }),
    false,
  )
  await run(
    '7. reject deleting an order',
    deleteDoc(doc(db, 'orders', `test-valid-${now}`)),
    false,
  )
  await run('8. allow reading a product', getDoc(doc(db, 'products', productId)), true)
  await run(
    '9. reject changing product price (as non-admin)',
    updateDoc(doc(db, 'products', productId), { price: 999 }),
    false,
  )
  await run(
    '10. reject increasing product stock (as non-admin)',
    updateDoc(doc(db, 'products', productId), { stock: product.stock + 100 }),
    false,
  )
  await run(
    '11. reject forging an order status other than pending',
    setDoc(doc(db, 'orders', `test-bad-status-${now}`), { ...orderBase, status: 'paid' }),
    false,
  )
  await run(
    '12. reject creating a category (as non-admin)',
    setDoc(doc(db, 'categories', `test-cat-${now}`), { name: 'Hacked' }),
    false,
  )

  console.log('\nDone. Check Firebase Console to confirm orders/products state.')
}

if (import.meta.env.DEV) {
  window.testSecurityRules = testSecurityRules
  console.log('Security rule test helper loaded. Run window.testSecurityRules() to verify rules.')
}
