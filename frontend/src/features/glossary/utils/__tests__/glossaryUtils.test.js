import { describe, it, expect } from 'vitest'
import { sortTerms, groupTermsByLetter, getJumpBarLetters, filterTerms } from '../glossaryUtils'

const SAMPLE = [
  {
    term: 'SIP',
    shortDefinition: 'Systematic Investment Plan.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    term: 'CAGR',
    shortDefinition: 'Compound Annual Growth Rate.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    term: '80C',
    shortDefinition: 'Section 80C deductions.',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    term: '87A',
    shortDefinition: 'Section 87A rebate.',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    term: 'PPF',
    shortDefinition: 'Public Provident Fund.',
    category: 'Fixed Income',
    relatedUrl: '/fixed',
  },
  {
    term: 'Emergency Fund',
    shortDefinition: 'Liquid cash reserve.',
    detailedExplainer: 'Should be stored in high-yield savings accounts or overnight liquid funds.',
    category: 'Basics',
    relatedUrl: '/fixed',
  },
]

describe('sortTerms', () => {
  it('puts digit-starting terms before alpha terms', () => {
    const sorted = sortTerms(SAMPLE)
    expect(/^\d/.test(sorted[0].term)).toBe(true)
    expect(/^\d/.test(sorted[1].term)).toBe(true)
    expect(/^\d/.test(sorted[2].term)).toBe(false)
  })

  it('sorts digit-starting terms A–Z among themselves', () => {
    const sorted = sortTerms(SAMPLE)
    const digitTerms = sorted.filter((t) => /^\d/.test(t.term)).map((t) => t.term)
    expect(digitTerms).toEqual(['80C', '87A'])
  })

  it('sorts alpha terms case-insensitively A–Z', () => {
    const sorted = sortTerms(SAMPLE)
    const alphaTerms = sorted.filter((t) => !/^\d/.test(t.term)).map((t) => t.term)
    expect(alphaTerms).toEqual(['CAGR', 'Emergency Fund', 'PPF', 'SIP'])
  })

  it('does not mutate the original array', () => {
    const original = [...SAMPLE]
    sortTerms(SAMPLE)
    expect(SAMPLE).toEqual(original)
  })
})

describe('groupTermsByLetter', () => {
  it('groups digit-starting terms under "#"', () => {
    const sorted = sortTerms(SAMPLE)
    const groups = groupTermsByLetter(sorted)
    const hashGroup = groups.find((g) => g.letter === '#')
    expect(hashGroup).toBeDefined()
    expect(hashGroup.terms.map((t) => t.term)).toContain('80C')
    expect(hashGroup.terms.map((t) => t.term)).toContain('87A')
  })

  it('groups alpha terms under their first letter (uppercased)', () => {
    const sorted = sortTerms(SAMPLE)
    const groups = groupTermsByLetter(sorted)
    const sGroup = groups.find((g) => g.letter === 'S')
    expect(sGroup).toBeDefined()
    expect(sGroup.terms.map((t) => t.term)).toContain('SIP')
  })

  it('groups "Emergency Fund" under "E"', () => {
    const sorted = sortTerms(SAMPLE)
    const groups = groupTermsByLetter(sorted)
    const eGroup = groups.find((g) => g.letter === 'E')
    expect(eGroup).toBeDefined()
    expect(eGroup.terms.map((t) => t.term)).toContain('Emergency Fund')
  })
})

describe('getJumpBarLetters', () => {
  it('returns only letters that actually have terms', () => {
    const sorted = sortTerms(SAMPLE)
    const groups = groupTermsByLetter(sorted)
    const letters = getJumpBarLetters(groups)
    // '#', 'C', 'E', 'P', 'S' should be present
    expect(letters).toContain('#')
    expect(letters).toContain('C')
    expect(letters).toContain('E')
    expect(letters).toContain('P')
    expect(letters).toContain('S')
    // Letters with no terms must not appear
    expect(letters).not.toContain('A')
    expect(letters).not.toContain('Z')
    expect(letters).not.toContain('M')
  })

  it('places "#" before alphabetical letters', () => {
    const sorted = sortTerms(SAMPLE)
    const groups = groupTermsByLetter(sorted)
    const letters = getJumpBarLetters(groups)
    expect(letters[0]).toBe('#')
  })
})

describe('filterTerms', () => {
  it('returns all terms when category is ALL and query is empty', () => {
    expect(filterTerms(SAMPLE, 'ALL', '')).toHaveLength(SAMPLE.length)
  })

  it('filters by category', () => {
    const result = filterTerms(SAMPLE, 'Tax', '')
    expect(result).toHaveLength(2)
    expect(result.every((t) => t.category === 'Tax')).toBe(true)
  })

  it('filters by search query matching the term name', () => {
    const result = filterTerms(SAMPLE, 'ALL', 'SIP')
    expect(result.some((t) => t.term === 'SIP')).toBe(true)
    expect(result.every((t) => t.term === 'SIP')).toBe(true)
  })

  it('filters by search query matching shortDefinition (case-insensitive)', () => {
    const result = filterTerms(SAMPLE, 'ALL', 'liquid cash')
    expect(result.some((t) => t.term === 'Emergency Fund')).toBe(true)
  })

  it('filters by search query matching detailedExplainer', () => {
    const result = filterTerms(SAMPLE, 'ALL', 'overnight liquid')
    expect(result.some((t) => t.term === 'Emergency Fund')).toBe(true)
  })

  it('combines category and query filters', () => {
    const result = filterTerms(SAMPLE, 'Tax', '80')
    expect(result).toHaveLength(1)
    expect(result[0].term).toBe('80C')
  })

  it('returns empty array when nothing matches', () => {
    const result = filterTerms(SAMPLE, 'ALL', 'xyz_no_match_xyz')
    expect(result).toHaveLength(0)
  })

  it('does not mutate the input array', () => {
    const original = [...SAMPLE]
    filterTerms(SAMPLE, 'Tax', 'fund')
    expect(SAMPLE).toEqual(original)
  })
})

