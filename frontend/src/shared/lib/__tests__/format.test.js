import { describe, it, expect } from 'vitest'
import {
  formatINR,
  formatINRDecimal,
  formatINRLakh,
  formatPercent,
  parseIndianNumber,
} from '../format'

describe('format utilities', () => {
  it('formats basic numbers in INR without decimal', () => {
    const formatted = formatINR(100000)
    // Should contain ₹ and 1,00,000 (en-IN grouping)
    expect(formatted).toContain('1,00,000')
    expect(formatted).toContain('₹')
  })

  it('handles null, undefined, or invalid inputs safely in formatINR', () => {
    expect(formatINR(null)).toBe('₹0')
    expect(formatINR(undefined)).toBe('₹0')
    expect(formatINR('invalid')).toBe('₹0')
  })

  it('formats decimal INR', () => {
    const formatted = formatINRDecimal(1234.56, 2)
    expect(formatted).toContain('1,234.56')
  })

  it('formats large values in Lakhs and Crores', () => {
    expect(formatINRLakh(10000000)).toBe('₹1.00 Cr')
    expect(formatINRLakh(500000)).toBe('₹5.00 Lakh')
  })

  it('formats percentage correctly', () => {
    expect(formatPercent(12.5)).toBe('12.5%')
    expect(formatPercent(0)).toBe('0.0%')
    expect(formatPercent(null)).toBe('0%')
  })

  it('parses Indian numbers from strings', () => {
    expect(parseIndianNumber('₹1,23,456')).toBe(123456)
    expect(parseIndianNumber(' 5,00,000 ')).toBe(500000)
    expect(parseIndianNumber(45000)).toBe(45000)
    expect(parseIndianNumber('')).toBe(0)
  })
})
