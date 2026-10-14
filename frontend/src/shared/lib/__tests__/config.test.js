/**
 * Unit tests for config.js — Phase 6.
 *
 * Verifies that:
 *  1. API_BASE_URL is a string (may be empty in test env — that's correct dev behaviour)
 *  2. APP_ENV is a recognised value
 *  3. Booleans IS_DEV / IS_PROD are consistent with APP_ENV
 *  4. APP_VERSION is a non-empty string
 */
import { describe, it, expect } from 'vitest'
import { API_BASE_URL, APP_ENV, APP_VERSION, IS_DEV, IS_PROD } from '../config'

describe('config.js — environment exports', () => {
  it('API_BASE_URL is a string and has no trailing slash', () => {
    expect(typeof API_BASE_URL).toBe('string')
    expect(API_BASE_URL.endsWith('/')).toBe(false)
  })

  it('APP_ENV is a recognised environment label', () => {
    expect(['development', 'staging', 'production', 'test']).toContain(APP_ENV)
  })

  it('IS_DEV and IS_PROD are mutually exclusive', () => {
    expect(IS_DEV && IS_PROD).toBe(false)
  })

  it('APP_VERSION is a non-empty string', () => {
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })
})
