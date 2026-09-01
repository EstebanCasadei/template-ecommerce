import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { getApp, getApps, initializeApp } from 'firebase/app'
import clientConfig from '../../config/clientConfig.js'

/**
 * Calls the Cloud Function `createOrder` to create an order and a payment
 * intent/preference from a trusted backend.
 *
 * This is the production-safe path: the server (not the browser) reads product
 * prices, checks stock, decrements inventory, and creates the payment with the
 * payment provider.
 *
 * To use it, set `clientConfig.checkout.mode = 'function'` after deploying
 * Cloud Functions on the Blaze plan.
 */
export async function createOrder({ customer, lines }) {
  const firebaseConfig = clientConfig.firebase
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Cloud Function checkout requires Firebase to be configured in .env')
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  const functions = getFunctions(app)

  // Allow local development against the Functions emulator.
  if (import.meta.env.DEV && import.meta.env.VITE_FUNCTIONS_EMULATOR) {
    const [host, port] = import.meta.env.VITE_FUNCTIONS_EMULATOR.split(':')
    connectFunctionsEmulator(functions, host, Number(port))
  }

  const createOrderFn = httpsCallable(functions, 'createOrder')
  const { data } = await createOrderFn({
    customer,
    lines,
    provider: clientConfig.payment.provider,
  })

  return data
}
