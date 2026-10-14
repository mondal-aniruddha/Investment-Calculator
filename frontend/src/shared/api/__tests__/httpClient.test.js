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
})
