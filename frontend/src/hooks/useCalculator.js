import { useState, useCallback } from 'react'
import { request, ApiError } from '../services/api'

/**
 * useCalculator — Reusable calculation hook for all calculator pages.
 * Wraps API requests with loading, error, validation field-errors, and online status.
 *
 * Usage:
 *   const { result, error, fieldErrors, loading, run, reset } = useCalculator(setApiOnline)
 *   await run('/api/v1/investing/sip', { method: 'POST', body: JSON.stringify(form) })
 *
 * @param {(online: boolean) => void} [setApiOnline]
 */
export function useCalculator(setApiOnline) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [correlationId, setCorrelationId] = useState(null)
  const [loading, setLoading] = useState(false)

  const reset = useCallback(() => {
    setResult(null)
    setError('')
    setApiError(null)
    setFieldErrors({})
    setCorrelationId(null)
  }, [])

  const setFieldError = useCallback((field, message) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const run = async (path, options) => {
    setLoading(true)
    setError('')
    setApiError(null)
    setFieldErrors({})
    setCorrelationId(null)

    try {
      const data = await request(path, options)
      setResult(data)
      setApiOnline?.(true)
      return data
    } catch (e) {
      setApiOnline?.(false)
      setApiError(e)

      const cid = e.correlationId || null
      setCorrelationId(cid)

      // Map backend field errors to field error map
      if (e instanceof ApiError && typeof e.getFieldErrorsMap === 'function') {
        setFieldErrors(e.getFieldErrorsMap())
      } else if (Array.isArray(e.fieldErrors)) {
        const map = {}
        e.fieldErrors.forEach((fe) => {
          if (fe && fe.field) map[fe.field] = fe.message || 'Invalid value'
        })
        setFieldErrors(map)
      }

      const msg = e.message || 'Start Spring Boot on http://localhost:8080.'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    result,
    error,
    apiError,
    fieldErrors,
    correlationId,
    loading,
    run,
    reset,
    setFieldError,
    clearFieldError,
  }
}

export default useCalculator
