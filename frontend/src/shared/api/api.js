import { ApiError } from './ApiError'
import { API_BASE_URL } from '../config/env'

export { ApiError }

const DEFAULT_TIMEOUT_MS = 15000
const MAX_GET_RETRIES = 2

export function getApiUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Authenticated and resilient fetch wrapper.
 * - Centralizes JWT auth header attachment.
 * - Supports request timeouts via AbortController.
 * - Retries idempotent GET requests on network failures / 503 responses.
 * - Dispatches 'infinance-session-expired' event and clears session on 401.
 * - Formats 429/503 friendly messages.
 * - Throws a typed ApiError with status, code, message, fieldErrors, correlationId.
 *
 * @param {string} path  API path, e.g. '/api/v1/investing/sip'
 * @param {RequestInit & { timeoutMs?: number; skipRetry?: boolean }} options
 * @returns {Promise<any>}
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

  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    skipRetry = false,
    signal: userSignal,
    headers: customHeaders = {},
    ...fetchOptions
  } = options

  const method = (fetchOptions.method || 'GET').toUpperCase()
  const isIdempotentGet = method === 'GET'
  const maxAttempts = isIdempotentGet && !skipRetry ? 1 + MAX_GET_RETRIES : 1

  const url = getApiUrl(path)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  }

  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    let timeoutId = null

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        controller.abort(new Error(`Request timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }

    const onUserAbort = () => controller.abort(userSignal?.reason)
    if (userSignal) {
      if (userSignal.aborted) {
        controller.abort(userSignal.reason)
      } else {
        userSignal.addEventListener('abort', onUserAbort, { once: true })
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        signal: controller.signal,
      })

      if (timeoutId) clearTimeout(timeoutId)
      if (userSignal) userSignal.removeEventListener('abort', onUserAbort)

      const correlationId = response.headers.get('X-Correlation-ID')

      // Global 401 handling — signal auth context to clear state
      if (response.status === 401) {
        sessionStorage.removeItem('infinance-token')
        sessionStorage.removeItem('infinance-user')
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('infinance-token')
          localStorage.removeItem('infinance-user')
        }
        window.dispatchEvent(new CustomEvent('infinance-session-expired'))
      }

      // If status is 503 and we have retry attempts remaining for GET
      if (response.status === 503 && isIdempotentGet && attempt < maxAttempts) {
        await wait(300 * Math.pow(2, attempt - 1))
        continue
      }

      const text = await response.text()
      let payload = {}
      if (text.trim()) {
        try {
          payload = JSON.parse(text)
        } catch {
          throw new ApiError({
            status: response.status,
            code: 'INVALID_JSON_RESPONSE',
            message: `The server returned an unparseable response (${response.status}).`,
            correlationId,
          })
        }
      }

      if (!response.ok) {
        let friendlyMessage = payload.message || payload.error
        if (response.status === 429) {
          friendlyMessage = friendlyMessage || 'Too many requests. Please wait a moment and try again.'
        } else if (response.status === 503) {
          friendlyMessage = friendlyMessage || 'Service is temporarily unavailable. Please try again shortly.'
        } else if (response.status === 401) {
          friendlyMessage = friendlyMessage || 'Your session has expired. Please sign in again.'
        } else if (response.status === 403) {
          friendlyMessage = friendlyMessage || 'You do not have permission to perform this action.'
        } else if (!friendlyMessage) {
          friendlyMessage = `Server returned error (${response.status}).`
        }

        throw new ApiError({
          status: response.status,
          code: payload.code || (response.status === 429 ? 'RATE_LIMIT_EXCEEDED' : `HTTP_${response.status}`),
          message: friendlyMessage,
          fieldErrors: payload.fieldErrors || [],
          correlationId: payload.correlationId || correlationId,
        })
      }

      return payload
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId)
      if (userSignal) userSignal.removeEventListener('abort', onUserAbort)

      if (err instanceof ApiError) {
        throw err
      }

      if (userSignal?.aborted) {
        throw new ApiError({
          status: 0,
          code: 'REQUEST_ABORTED',
          message: 'Request was cancelled.',
        })
      }

      const isTimeout = err?.name === 'AbortError' || err?.message?.includes('timed out')
      lastError = new ApiError({
        status: isTimeout ? 408 : 0,
        code: isTimeout ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'Request timed out. Please check your connection and try again.'
          : 'Unable to reach the server. Please check your network connection.',
      })

      if (isIdempotentGet && attempt < maxAttempts) {
        await wait(300 * Math.pow(2, attempt - 1))
        continue
      }

      throw lastError
    }
  }

  throw lastError
}

export default {
  request,
  getApiUrl,
  ApiError,
}
