import { describe, it, expect } from 'vitest'
import { evaluatePasswordCriteria, calculatePasswordStrengthScore } from '../passwordStrength'

describe('passwordStrength', () => {
  it('evaluates password criteria', () => {
    const res = evaluatePasswordCriteria('Aa1!aaaa')
    expect(res.minLength).toBe(true)
    expect(res.hasUpper).toBe(true)
    expect(res.hasLower).toBe(true)
    expect(res.hasDigit).toBe(true)
    expect(res.hasSpecial).toBe(true)
  })

  it('calculates score based on complexity', () => {
    expect(calculatePasswordStrengthScore('')).toBe(0)
    expect(calculatePasswordStrengthScore('password')).toBe(1) // only minLength
    expect(calculatePasswordStrengthScore('Password')).toBe(2) // minLength + upper/lower
    expect(calculatePasswordStrengthScore('Password123')).toBe(3) // minLength + upper/lower + digit
    expect(calculatePasswordStrengthScore('Password123!')).toBe(4) // minLength + upper/lower + digit + special
  })
})
