import { cashPaymentGateway } from './CashPaymentGateway.js'
import { stripePaymentGateway } from './StripePaymentGateway.js'
import { mercadoPagoPaymentGateway } from './MercadoPagoPaymentGateway.js'
import clientConfig from '../../config/clientConfig.js'

const gateways = {
  cash: cashPaymentGateway,
  stripe: stripePaymentGateway,
  mercadopago: mercadoPagoPaymentGateway,
}

export function getPaymentGateway(type = clientConfig.payment.provider) {
  return gateways[type] ?? cashPaymentGateway
}
