import { PaymentStatus } from './PaymentGateway.js'

export const cashPaymentGateway = {
  async process(order) {
    return {
      status: PaymentStatus.SUCCESS,
      orderId: order.id,
      detail: 'Paid in cash on delivery',
    }
  },
}
