/**
 * Seeds the Firestore project with the sample catalog data.
 *
 * Requirements:
 *   1. Download a service-account key from Firebase Console → Project settings
 *      → Service accounts, save it as ./serviceAccountKey.json (git-ignored)
 *      or set GOOGLE_APPLICATION_CREDENTIALS.
 *   2. pnpm install (firebase-admin is already in devDependencies).
 *
 * Usage:
 *   node scripts/seed.js          # skips documents that already exist
 *   node scripts/seed.js --force  # overwrites existing documents
 */
import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../src/shared/data/sampleData.js'

const [, , flag] = process.argv
const force = flag === '--force'

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './serviceAccountKey.json'
if (!existsSync(keyPath)) {
  console.error(
    `Service account key not found at ${keyPath}.\n` +
      'Download it from Firebase Console → Project settings → Service accounts,\n' +
      'save it as ./serviceAccountKey.json (git-ignored) or set GOOGLE_APPLICATION_CREDENTIALS.',
  )
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
const db = getFirestore()

async function seedCategories() {
  for (const { id, name } of SAMPLE_CATEGORIES) {
    const ref = db.collection('categories').doc(id)
    const snap = await ref.get()

    if (snap.exists && !force) {
      console.log(`Category ${id} already exists. Skipped.`)
      continue
    }

    await ref.set({ name })
    console.log(`${force && snap.exists ? 'Overwrote' : 'Created'} category ${id}: ${name}`)
  }
}

async function seedProducts() {
  for (const product of SAMPLE_PRODUCTS) {
    const ref = db.collection('products').doc(product.id)
    const snap = await ref.get()

    if (snap.exists && !force) {
      console.log(`Product ${product.id} already exists. Skipped.`)
      continue
    }

    await ref.set({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image,
    })
    console.log(`${force && snap.exists ? 'Overwrote' : 'Created'} product ${product.id}: ${product.name}`)
  }
}

async function main() {
  try {
    console.log('Seeding categories...')
    await seedCategories()
    console.log('\nSeeding products...')
    await seedProducts()
    console.log('\nDone.')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

main()
