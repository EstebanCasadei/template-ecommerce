import clientConfig from '../../features/config/clientConfig.js'

const formatter = new Intl.NumberFormat(clientConfig.store.locale, {
  style: 'currency',
  currency: clientConfig.store.currency,
})

export function formatCurrency(amount) {
  return formatter.format(Number(amount) || 0)
}
