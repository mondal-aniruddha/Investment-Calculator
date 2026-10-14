/**
 * Pure helper for password criteria, score, and strength calculation.
 */
export function evaluatePasswordCriteria(password = '') {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }
}

export function calculatePasswordStrengthScore(password = '') {
  if (!password) return 0
  const criteria = evaluatePasswordCriteria(password)
  let score = 0
  if (criteria.minLength) score += 1
  if (criteria.hasUpper && criteria.hasLower) score += 1
  if (criteria.hasDigit) score += 1
  if (criteria.hasSpecial) score += 1
  return score
}
