/**
 * useCalculatorMutation — React Query useMutation wrapper for calculator POST endpoints.
 *
 * Provides the same return shape as the legacy useCalculator hook so that all
 * existing feature hooks (useSipForm, useLoanForm, etc.) and pages work
 * without any modification.
 *
 * Key improvements over the legacy hook:
 *  - Mutation state (loading, error, data) is managed by React Query
 *  - fieldErrors and correlationId are still surfaced the same way
 *  - setApiOnline callback is still supported for the API status banner
 */
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { request, ApiError } from '../api/api'

/**
 * @param {(online: boolean) => void} [setApiOnline]
 * @returns same shape as useCalculator
 */
export function useCalculatorMutation(setApiOnline) {
  const [fieldErrors, setFieldErrors] = useState({})
  const [correlationId, setCorrelationId] = useState(null)

  const mutation = useMutation({
    mutationFn: ({ path, options }) => request(path, options),
    onSuccess: () => {
      setApiOnline?.(true)
      setFieldErrors({})
      setCorrelationId(null)
    },
    onError: (e) => {
      setApiOnline?.(false)
      const cid = e.correlationId || null
      setCorrelationId(cid)

      if (e instanceof ApiError && typeof e.getFieldErrorsMap === 'function') {
        setFieldErrors(e.getFieldErrorsMap())
      } else if (Array.isArray(e.fieldErrors)) {
        const map = {}
        e.fieldErrors.forEach((fe) => {
          if (fe && fe.field) map[fe.field] = fe.message || 'Invalid value'
        })
        setFieldErrors(map)
      } else {
        setFieldErrors({})
      }
    },
  })

  const run = useCallback(
    async (path, options) => {
      try {
        const data = await mutation.mutateAsync({ path, options })
        return data
      } catch {
        return null
      }
    },
    [mutation.mutateAsync] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const reset = useCallback(() => {
    mutation.reset()
    setFieldErrors({})
    setCorrelationId(null)
  }, [mutation.reset]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const errorMessage =
    mutation.error?.message ||
    (mutation.isError ? 'Start Spring Boot on http://localhost:8080.' : '')

  return {
    result: mutation.data ?? null,
    error: errorMessage,
    apiError: mutation.error ?? null,
    fieldErrors,
    correlationId,
    loading: mutation.isPending,
    run,
    reset,
    setFieldError,
    clearFieldError,
  }
}
