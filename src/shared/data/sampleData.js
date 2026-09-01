/**
 * Shared sample catalog data used by:
 * - the local mock-data fallback (no Firebase configured)
 * - the admin seed script (`scripts/seed.js`)
 *
 * Keeping this in one place avoids drift between the fallback catalog and the
 * seeded Firestore documents.
 */

export const SAMPLE_CATEGORIES = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'home', name: 'Home' },
]

export const SAMPLE_PRODUCTS = [
  {
    id: 'p1',
    name: 'Wireless Headphones',
    description: 'Noise cancelling over-ear headphones with 30h battery life.',
    price: 120,
    stock: 20,
    category: 'electronics',
    image: 'https://picsum.photos/seed/p1/400/400',
  },
  {
    id: 'p2',
    name: 'Cotton T-Shirt',
    description: 'Soft cotton t-shirt available in multiple sizes.',
    price: 25,
    stock: 50,
    category: 'clothing',
    image: 'https://picsum.photos/seed/p2/400/400',
  },
  {
    id: 'p3',
    name: 'Smartwatch',
    description: 'Fitness tracking smartwatch with heart-rate monitor.',
    price: 199,
    stock: 8,
    category: 'electronics',
    image: 'https://picsum.photos/seed/p3/400/400',
  },
  {
    id: 'p4',
    name: 'Table Lamp',
    description: 'Warm LED table lamp with adjustable brightness.',
    price: 45,
    stock: 0,
    category: 'home',
    image: 'https://picsum.photos/seed/p4/400/400',
  },
  {
    id: 'p5',
    name: 'Denim Jacket',
    description: 'Classic denim jacket, unisex fit.',
    price: 89,
    stock: 15,
    category: 'clothing',
    image: 'https://picsum.photos/seed/p5/400/400',
  },
  {
    id: 'p6',
    name: 'Bluetooth Speaker',
    description: 'Portable speaker with 12h battery and water resistance.',
    price: 65,
    stock: 30,
    category: 'electronics',
    image: 'https://picsum.photos/seed/p6/400/400',
  },
]
