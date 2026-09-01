/**
 * Server-side configuration for the Cloud Function checkout.
 *
 * Secrets and provider keys should be configured in Cloud Functions
 * environment variables (firebase functions:secrets:set) or via
 * `functions.config()` / `params` in production.
 *
 * For local emulator development, set them in a `.env` file inside
 * the `functions/` directory or pass them with `firebase emulators:start`.
 */

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  mercadoPago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  },
  providers: {
    // Which providers are configured. Cash is always "configured".
    stripe: !!process.env.STRIPE_SECRET_KEY,
    mercadoPago: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
  },
}

export function getProviderConfig(provider) {
  if (provider === 'cash') return { enabled: true, requiresGateway: false }
  if (provider === 'stripe') return { enabled: config.providers.stripe, requiresGateway: true }
  if (provider === 'mercadopago') return { enabled: config.providers.mercadoPago, requiresGateway: true }
  return { enabled: false, requiresGateway: false }
}

export { requireEnv }
