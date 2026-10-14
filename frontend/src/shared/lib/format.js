/**
 * InFinance formatting utilities — INR and Indian number system.
 * All formatters use the browser-native Intl API with the en-IN locale.
 */

/**
 * Format a number as Indian Rupees (no decimal places).
 * Produces: ₹1,23,456 for 123456
 * @param {number|string} value
 * @returns {string}
 */
export const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/**
 * Format a number as Indian Rupees with a specified number of decimal places.
 * Falls back to '—' for null/undefined/NaN.
 * @param {number|null} value
 * @param {number} fractionDigits
 * @returns {string}
 */
export const formatINRDecimal = (value, fractionDigits = 2) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value))
}

/**
 * Format large INR numbers into Lakhs or Crores.
 * e.g. 10000000 -> ₹1.00 Cr, 500000 -> ₹5.00 Lakh
 * @param {number|string} val
 * @returns {string}
 */
export const formatINRLakh = (val) => {
  const num = Number(val || 0)
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`
  }
  return formatINR(num)
}

/**
 * Format compact INR (e.g. 1.5M, 10K or Cr/Lakh).
 * @param {number|string} value
 * @returns {string}
 */
export const formatCompactINR = (value) => {
  const num = Number(value || 0)
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num)
}

/**
 * Format percentage value.
 * @param {number|string} value
 * @param {number} digits
 * @returns {string}
 */
export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0%'
  return `${Number(value).toFixed(digits)}%`
}

/**
 * Format a Date or ISO string in Indian Standard Time (Asia/Kolkata).
 * Returns a readable date+time string, or the original string on error.
 * @param {string|Date} isoString
 * @returns {string}
 */
export const formatKolkataTime = (isoString) => {
  if (!isoString) return ''
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(isoString))
  } catch {
    return String(isoString)
  }
}

/**
 * Parse an Indian number string (removing commas, currency symbols, spaces).
 * @param {string|number} input
 * @returns {number}
 */
export const parseIndianNumber = (input) => {
  if (typeof input === 'number') return input
  if (!input) return 0
  const clean = String(input).replace(/[₹,\s]/g, '')
  const parsed = parseFloat(clean)
  return isNaN(parsed) ? 0 : parsed
}
