/**
 * Shared input validators and data sanitizers.
 */

/**
 * Validates whether an email string matches standard email formatting.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validates password strength (minimum 8 characters).
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 8
}

/**
 * Validates whether a value is a positive finite number (> 0).
 * @param {number|string} val
 * @returns {boolean}
 */
export const isPositiveNumber = (val) => {
  const num = Number(val)
  return !isNaN(num) && num > 0
}

/**
 * Validates whether a number falls within an inclusive [min, max] range.
 * @param {number|string} val
 * @param {number} [min]
 * @param {number} [max]
 * @returns {boolean}
 */
export const isInRange = (val, min, max) => {
  const num = Number(val)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

export const validateSipInput = ({
  monthlyInvestment,
  investmentHorizonYears,
  expectedAnnualReturn,
  annualStepUpPercent,
}) => {
  const errors = {}
  if (!isInRange(monthlyInvestment, 100))
    errors.monthlyInvestment = 'Monthly investment must be at least ₹100'
  if (!isInRange(investmentHorizonYears, 1, 50))
    errors.investmentHorizonYears = 'Horizon must be between 1 and 50 years'
  if (!isInRange(expectedAnnualReturn, 1, 30))
    errors.expectedAnnualReturn = 'Return rate must be between 1% and 30%'
  if (annualStepUpPercent !== undefined && !isInRange(annualStepUpPercent, 0, 50)) {
    errors.annualStepUpPercent = 'Step-up rate must be between 0% and 50%'
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateLoanInput = ({ principal, tenureYears, annualInterestRate }) => {
  const errors = {}
  if (!isInRange(principal, 1000)) errors.principal = 'Loan principal must be at least ₹1,000'
  if (!isInRange(tenureYears, 1, 30)) errors.tenureYears = 'Tenure must be between 1 and 30 years'
  if (!isInRange(annualInterestRate, 1, 30))
    errors.annualInterestRate = 'Interest rate must be between 1% and 30%'
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
