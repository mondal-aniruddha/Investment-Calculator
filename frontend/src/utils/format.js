/**
 * InFinance formatting utilities — INR and Indian number system.
 * All formatters use the browser-native Intl API with the en-IN locale.
 */

/**
 * Format a number as Indian Rupees (no decimal places).
 * Produces: ₹1,23,456 for 123456
 * @param {number|string} value
 */
export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

/**
 * Format a number as Indian Rupees with a specified number of decimal places.
 * Falls back to '—' for null/undefined/NaN.
 * @param {number|null} value
 * @param {number} fractionDigits
 */
export const formatINRDecimal = (value, fractionDigits = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value))
}

/**
 * Format a Date or ISO string in Indian Standard Time (Asia/Kolkata).
 * Returns a readable date+time string, or the original string on error.
 * @param {string|Date} isoString
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

