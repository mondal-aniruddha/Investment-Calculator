/**
 * Unit tests for queryClient singleton — Phase 5.
 */
import { describe, it, expect } from 'vitest'
import { queryClient } from '../queryClient'

describe('queryClient — default options', () => {
  it('is a QueryClient instance', () => {
    // Duck-typing check: QueryClient has getQueryCache and getMutationCache
    expect(typeof queryClient.getQueryCache).toBe('function')
    expect(typeof queryClient.getMutationCache).toBe('function')
  })

  it('has 1-minute staleTime for queries', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.queries?.staleTime).toBe(60 * 1000)
  })

  it('has 5-minute gcTime for queries', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.queries?.gcTime).toBe(5 * 60 * 1000)
  })

  it('retries queries once on failure', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.queries?.retry).toBe(1)
  })

  it('does not retry mutations', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.mutations?.retry).toBe(0)
  })
})
