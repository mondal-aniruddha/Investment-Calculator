// InFinance API client — identical logic to the original src/api.js.
// Moved to frontend/src/services/api.js as part of the monorepo restructure.
// No functional changes.

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function getApiUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath
}

/**
 * Authenticated fetch wrapper.
 * - Reads JWT from sessionStorage (migrates from localStorage on first call).
 * - Sets Content-Type: application/json and Authorization: Bearer <token>.
 * - Dispatches a custom 'infinance-session-expired' event on 401.
 * - Throws an Error with .status, .code, and .fieldErrors on non-2xx.
 *
 * @param {string} path  API path, e.g. '/api/v1/investing/sip'
 * @param {RequestInit} options  Fetch options (method, body, etc.)
 */
export async function request(path, options = {}) {
  // Migrate token from localStorage (legacy) to sessionStorage
  let token = sessionStorage.getItem('infinance-token')
  if (!token && typeof localStorage !== 'undefined') {
    const legacyToken = localStorage.getItem('infinance-token')
    if (legacyToken) {
      sessionStorage.setItem('infinance-token', legacyToken)
      localStorage.removeItem('infinance-token')
      token = legacyToken
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = getApiUrl(path)
  const response = await fetch(url, { ...options, headers })

  // Global 401 handling — signal auth context to clear state
  if (response.status === 401) {
    sessionStorage.removeItem('infinance-token')
    sessionStorage.removeItem('infinance-user')
    window.dispatchEvent(new CustomEvent('infinance-session-expired'))
  }

  const text = await response.text()
  let payload = {}
  if (text.trim()) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error(`The backend returned an invalid response (${response.status}).`)
    }
  }

  if (!response.ok) {
    const msg = payload.message || payload.error || `The backend returned ${response.status}.`
    const err = new Error(msg)
    err.status = response.status
    err.code = payload.code
    err.fieldErrors = payload.fieldErrors || []
    throw err
  }

  return payload
}
