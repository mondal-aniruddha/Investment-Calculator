import { describe, it, expect } from 'vitest'
import { calculateQuickSip } from '../quickSipCalculator'

describe('calculateQuickSip', () => {
  it('calculates 10k monthly for 10 years at 12% correctly', () => {
    const result = calculateQuickSip(10000, 10, 12)
    expect(result.months).toBe(120)
    expect(result.totalInvested).toBe(1200000)
    // Standard SIP compound result is ~23.23 Lakh
    expect(result.maturityCorpus).toBeGreaterThan(2300000)
    expect(result.maturityCorpus).toBeLessThan(2400000)
    expect(result.estimatedReturns).toBe(result.maturityCorpus - result.totalInvested)
  })

  it('handles 0% return gracefully', () => {
    const result = calculateQuickSip(5000, 5, 0)
    expect(result.totalInvested).toBe(300000)
    expect(result.maturityCorpus).toBe(300000)
    expect(result.estimatedReturns).toBe(0)
  })
})
