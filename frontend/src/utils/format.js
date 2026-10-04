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
 * Format a number with Indian digit grouping (no currency symbol).
 * Example: 1234567 → "12,34,567"
 * @param {number|string} value
 */
export const formatIndianNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

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

/**
 * Compact format: abbreviate large numbers (₹12.3L, ₹1.2Cr).
 * For display in summary rows and chart labels.
 * @param {number} value
 */
export const formatINRCompact = (value) => {
  const n = Number(value || 0)
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return formatINR(n)
}
