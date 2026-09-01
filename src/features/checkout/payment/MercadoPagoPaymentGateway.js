import { PaymentStatus } from './PaymentGateway.js'

export const mercadoPagoPaymentGateway = {
  async process(order) {
    // TODO: integrate @mercadopago/sdk-react or the brick API
    return {
      status: PaymentStatus.PENDING,
      orderId: order.id,
      detail: 'MercadoPago integration not configured.',
    }
  },
}
