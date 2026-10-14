/**
 * InFinance — ApiError
 * Standardized typed error thrown by the central HTTP client.
 */
export class ApiError extends Error {
  constructor({
    status = 500,
    code = 'API_ERROR',
    message = 'An unexpected error occurred.',
    fieldErrors = [],
    correlationId = null,
  } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = Array.isArray(fieldErrors) ? fieldErrors : []
    this.correlationId = correlationId
  }

  get isAuthError() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  get isRateLimited() {
    return this.status === 429
  }

  get isServiceUnavailable() {
    return this.status === 503
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500
  }

  get isServerError() {
    return this.status >= 500
  }

  /**
   * Returns a map of field name -> error message.
   * Useful for mapping backend validation errors onto form inputs.
   */
  getFieldErrorsMap() {
    const map = {}
    if (Array.isArray(this.fieldErrors)) {
      this.fieldErrors.forEach((fe) => {
        if (fe && fe.field) {
          map[fe.field] = fe.message || 'Invalid value'
        }
      })
    }
    return map
  }
}
