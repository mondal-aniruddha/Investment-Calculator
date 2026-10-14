import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword, validateSipInput, validateLoanInput } from '../validators'

describe('validators', () => {
  it('validates email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@sub.domain.co.in')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('validates password minimum requirements', () => {
    expect(isValidPassword('password123')).toBe(true)
    expect(isValidPassword('short')).toBe(false)
  })

  it('validates SIP inputs correctly', () => {
    const valid = validateSipInput({
      monthlyInvestment: 5000,
      investmentHorizonYears: 10,
      expectedAnnualReturn: 12,
      annualStepUpPercent: 10,
    })
    expect(valid.isValid).toBe(true)
    expect(valid.errors).toEqual({})

    const invalid = validateSipInput({
      monthlyInvestment: 50, // below 100
      investmentHorizonYears: 60, // above 50
      expectedAnnualReturn: 35, // above 30
      annualStepUpPercent: 60, // above 50
    })
    expect(invalid.isValid).toBe(false)
    expect(invalid.errors.monthlyInvestment).toBeDefined()
    expect(invalid.errors.investmentHorizonYears).toBeDefined()
    expect(invalid.errors.expectedAnnualReturn).toBeDefined()
    expect(invalid.errors.annualStepUpPercent).toBeDefined()
  })

  it('validates Loan inputs correctly', () => {
    const valid = validateLoanInput({
      principal: 1000000,
      tenureYears: 15,
      annualInterestRate: 8.5,
    })
    expect(valid.isValid).toBe(true)

    const invalid = validateLoanInput({
      principal: 500, // below 1000
      tenureYears: 40, // above 30
      annualInterestRate: 0.5, // below 1
    })
    expect(invalid.isValid).toBe(false)
    expect(invalid.errors.principal).toBeDefined()
    expect(invalid.errors.tenureYears).toBeDefined()
    expect(invalid.errors.annualInterestRate).toBeDefined()
  })
})
