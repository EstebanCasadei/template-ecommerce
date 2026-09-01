// Payment gateway contract
// Every adapter must expose a `process(order)` function that returns a promise.

/**
 * @typedef {{id: string, customer: object, lines: object[], total: number}} Order
 */

export const PaymentStatus = {
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILED: 'failed',
}
