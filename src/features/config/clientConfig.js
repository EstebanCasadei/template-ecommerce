/**
 * Client configuration.
 *
 * To create a store for a new client, fork this repository and edit only this
 * file. Every other implementation reads from this single source of truth.
 */
import { SAMPLE_CATEGORIES } from '../../shared/data/sampleData.js'

const clientConfig = {
  store: {
    name: 'Tienda Demo',
    logo: '/logo.svg',
    currency: 'USD',
    locale: 'en-US',
    taxRate: 0,
  },

  catalog: {
    pageSize: 12,
    categories: SAMPLE_CATEGORIES.map((c) => c.id),
  },

  payment: {
    // options: 'cash' | 'stripe' | 'mercadopago'
    provider: 'cash',
  },

  checkout: {
    // 'client' = save order directly from the browser (current course/demo mode).
    // 'function' = call the Cloud Function (requires Blaze plan) for server-side
    // payment creation and stock reservation.
    mode: 'client',
  },

  firebase: {
    // Read from environment variables (see .env.example). Leave them empty to keep using local mock data instead of Firestore.
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  },
}

export default clientConfig
