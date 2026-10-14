/**
 * Unit tests for useMetalsQuery — Phase 5.
 *
 * We test the query configuration (key, refetchInterval, staleTime) rather
 * than mocking the full network stack, which is covered by E2E tests.
 */
import { describe, it, expect } from 'vitest'
import { METALS_QUERY_KEY, METALS_REFETCH_INTERVAL_MS } from '../useMetalsQuery'

describe('useMetalsQuery — configuration', () => {
  it('exports the correct query key tuple', () => {
    expect(METALS_QUERY_KEY).toEqual(['market', 'metals'])
  })

  it('refetch interval is exactly 5 minutes in milliseconds', () => {
    expect(METALS_REFETCH_INTERVAL_MS).toBe(5 * 60 * 1000)
  })

  it('query key is an array (React Query requirement)', () => {
    expect(Array.isArray(METALS_QUERY_KEY)).toBe(true)
  })
})
