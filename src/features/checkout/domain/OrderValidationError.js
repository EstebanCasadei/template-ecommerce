export class OrderValidationError extends Error {
  constructor(message, code, details) {
    super(message)
    this.name = 'OrderValidationError'
    this.code = code
    this.details = details
  }
}
