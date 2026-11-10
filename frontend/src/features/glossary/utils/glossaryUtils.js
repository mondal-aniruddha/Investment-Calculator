/**
 * glossaryUtils.js — Pure helpers for sorting, grouping and filtering glossary terms.
 *
 * Sort order: terms whose first character is a digit come first (A–Z among themselves),
 * then alphabetical terms (A–Z, case-insensitive). This matches the spec where "80C"
 * and "87A" appear before "CAGR", "Emergency Fund", etc.
 */

/**
 * Sorts terms: digit-starting terms first (A–Z), then alpha terms (A–Z), case-insensitive.
 * Returns a new array; does not mutate the input.
 *
 * @param {object[]} terms
 * @returns {object[]}
 */
export function sortTerms(terms) {
  return [...terms].sort((a, b) => {
    const aLower = a.term.toLowerCase()
    const bLower = b.term.toLowerCase()
    const aIsDigit = /^\d/.test(a.term)
    const bIsDigit = /^\d/.test(b.term)
    if (aIsDigit && !bIsDigit) return -1
    if (!aIsDigit && bIsDigit) return 1
    return aLower.localeCompare(bLower)
  })
}

/**
 * Groups a pre-sorted list of terms under letter headings.
 * Digit-starting terms are grouped under '#'.
 * Returns an ordered array of { letter: string, terms: object[] }.
 *
 * @param {object[]} sortedTerms
 * @returns {{ letter: string, terms: object[] }[]}
 */
export function groupTermsByLetter(sortedTerms) {
  const groups = new Map()
  for (const term of sortedTerms) {
    const first = term.term[0]
    const key = /^\d/.test(first) ? '#' : first.toUpperCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(term)
  }
  return Array.from(groups.entries()).map(([letter, terms]) => ({ letter, terms }))
}

/**
 * Extracts the letters from a groups array in order.
 * Only letters that actually exist in the data are returned (jump bar only shows real letters).
 *
 * @param {{ letter: string }[]} groups
 * @returns {string[]}
 */
export function getJumpBarLetters(groups) {
  return groups.map((g) => g.letter)
}

/**
 * Filters terms by selected category and free-text query.
 * Query matches term name, shortDefinition or detailedExplainer (case-insensitive).
 * Returns a new array; does not mutate the input.
 *
 * @param {object[]} terms
 * @param {string} selectedCategory  'ALL' or a specific category name
 * @param {string} query             raw search string (not yet lowercased)
 * @returns {object[]}
 */
export function filterTerms(terms, selectedCategory, query) {
  const q = query.toLowerCase().trim()
  return terms.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory
    const matchQuery =
      !q ||
      item.term.toLowerCase().includes(q) ||
      (item.shortDefinition && item.shortDefinition.toLowerCase().includes(q)) ||
      (item.detailedExplainer && item.detailedExplainer.toLowerCase().includes(q))
    return matchCat && matchQuery
  })
}

