/**
 * Unit tests for httpClient.js and endpoints.js — Phase 7.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient, getApiUrl, ApiError } from '../httpClient'
import { ENDPOINTS } from '../endpoints'

describe('endpoints.js', () => {
  it('defines all major domain route constants', () => {
    expect(ENDPOINTS.AUTH.LOGIN).toBe('/api/v1/auth/login')
    expect(ENDPOINTS.INVESTING.SIP).toBe('/api/v1/investing/sip')
    expect(ENDPOINTS.MUTUAL_FUNDS.SIP).toBe('/api/v1/mutual-funds/sip')
    expect(ENDPOINTS.TAX.CALCULATE).toBe('/api/v1/tax/calculate')
    expect(ENDPOINTS.MARKET.METALS).toBe('/api/v1/market/metals')
    expect(ENDPOINTS.LEARN.ARTICLES).toBe('/api/v1/learn/articles')
    expect(ENDPOINTS.GLOSSARY.TERMS).toBe('/api/v1/glossary')
    expect(ENDPOINTS.SCENARIOS.BASE).toBe('/api/v1/scenarios')
  })
})

describe('httpClient.js', () => {
  let mockStore = {}

  beforeEach(() => {
    mockStore = {}
    globalThis.sessionStorage = {
      getItem: vi.fn((k) => mockStore[k] || null),
      setItem: vi.fn((k, v) => {
        mockStore[k] = String(v)
      }),
      removeItem: vi.fn((k) => {
        delete mockStore[k]
      }),
      clear: vi.fn(() => {
        mockStore = {}
      }),
    }
    vi.restoreAllMocks()
  })

  it('getApiUrl prefixes relative paths correctly', () => {
    expect(getApiUrl('/api/v1/test')).toBe('/api/v1/test')
    expect(getApiUrl('https://custom.api.com/v1/test')).toBe('https://custom.api.com/v1/test')
  })

  it('executes a successful GET request and returns JSON payload', async () => {
    const mockData = { status: 'UP' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify(mockData),
    })

    const result = await httpClient.get('/actuator/health')
    expect(result).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith(
      '/actuator/health',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('attaches Authorization header when token is present in sessionStorage', async () => {
    sessionStorage.setItem('infinance-token', 'mock-jwt-token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ id: 1 }),
    })

    await httpClient.get('/api/v1/auth/profile')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/auth/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    )
  })

  it('throws typed ApiError with status and message on 400 bad request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'X-Correlation-ID': 'test-corr-id' }),
      text: async () => JSON.stringify({ code: 'VALIDATION_FAILED', message: 'Invalid payload' }),
    })

    await expect(httpClient.post('/api/v1/test', {})).rejects.toThrow(ApiError)
  })

  it('handles 401 response by removing session token', async () => {
    sessionStorage.setItem('infinance-token', 'expired-token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ message: 'Session expired' }),
    })

    await expect(httpClient.get('/api/v1/auth/profile')).rejects.toThrow(ApiError)
    expect(sessionStorage.getItem('infinance-token')).toBeNull()
  })

  it('detects HTML response and throws API_UNREACHABLE without retrying', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/html; charset=UTF-8' }),
      text: async () => '<!doctype html><html><head><title>InFinance</title></head><body></body></html>',
    })

    const promise = httpClient.get('/api/v1/learn/articles')
    await expect(promise).rejects.toThrow(ApiError)
    await expect(promise).rejects.toMatchObject({
      code: 'API_UNREACHABLE',
      message: "We couldn't reach the InFinance server. Please try again in a few minutes.",
    })
    // Ensure no retries occurred for HTML
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('detects HTML body even without content-type header and does not retry 503 HTML', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers(),
      text: async () => '<html><body>Error</body></html>',
    })

    const promise = httpClient.get('/api/v1/test')
    await expect(promise).rejects.toMatchObject({
      code: 'API_UNREACHABLE',
      status: 503,
    })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('throws INVALID_JSON_RESPONSE for genuinely malformed non-HTML responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => 'bad-json-syntax{',
    })

    const promise = httpClient.get('/api/v1/test')
    await expect(promise).rejects.toMatchObject({
      code: 'INVALID_JSON_RESPONSE',
      message: 'The server returned an unparseable response (200).',
    })
  })
})
