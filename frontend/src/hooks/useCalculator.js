import { useState } from 'react'
import { request } from '../services/api'

/**
 * useCalculator — reusable hook for all calculator pages.
 * Wraps the API request with loading, error, and online-status state.
 *
 * Usage:
 *   const calc = useCalculator(setApiOnline)
 *   calc.run('/api/v1/investing/sip', { method: 'POST', body: JSON.stringify(form) })
 *
 * Returns: { result, error, loading, run }
 */
export function useCalculator(setApiOnline) {
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const run = async (path, options) => {
    setLoading(true)
    setError('')
    try {
      const data = await request(path, options)
      setResult(data)
      setApiOnline?.(true)
      return data
    } catch (e) {
      setApiOnline?.(false)
      setError(e.message || 'Start Spring Boot on http://localhost:8080.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { result, error, loading, run }
}
