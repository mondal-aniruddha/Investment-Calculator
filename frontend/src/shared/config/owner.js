/**
 * owner.js — Central source of truth for site owner identity and contact details.
 *
 * Reads values from Vite environment variables (VITE_OWNER_*) with fallback defaults.
 * These details can also be updated dynamically from the backend /api/v1/config/owner-contact endpoint.
 */

export const DEFAULT_OWNER_CONFIG = {
  name: import.meta.env.VITE_OWNER_NAME || 'Aniruddha Mondal',
  whatsapp: import.meta.env.VITE_OWNER_WHATSAPP || '+91 8013292565',
  email: import.meta.env.VITE_OWNER_EMAIL || 'aniruddha0266@gmail.com',
  directContactLine: 'Prefer a quick chat? Message me on WhatsApp or email me directly.',
}

/**
 * Derive WhatsApp link and display text from a raw number.
 * Single source of truth helper function.
 *
 * @param {string} rawNumber Raw WhatsApp number (e.g. "+91 8013292565" or "918013292565")
 * @param {string} [text] Optional prefilled message text (URL-encoded)
 * @returns {{ digits: string, display: string, href: string }}
 */
export function formatWhatsAppContact(rawNumber = DEFAULT_OWNER_CONFIG.whatsapp, text = '') {
  if (!rawNumber) {
    return { digits: '', display: '', href: '' }
  }

  // Extract digits only
  const rawDigits = String(rawNumber).replace(/\D/g, '')
  // Ensure country code: if 10 digits, prepend 91
  const digits = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits

  // Format display text: "+91 80132 92565"
  let display = rawNumber
  if (digits.startsWith('91') && digits.length === 12) {
    display = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  } else if (digits.length === 10) {
    display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }

  // Build wa.me href
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : ''
  const href = digits ? `https://wa.me/${digits}${encodedText}` : ''

  return { digits, display, href }
}

export function formatWhatsAppHref(rawNumber = DEFAULT_OWNER_CONFIG.whatsapp, text = '') {
  return formatWhatsAppContact(rawNumber, text).href
}

export function formatWhatsAppDisplay(rawNumber = DEFAULT_OWNER_CONFIG.whatsapp) {
  return formatWhatsAppContact(rawNumber).display
}

export function formatMailtoHref(email = DEFAULT_OWNER_CONFIG.email, subject = '') {
  if (!email) return ''
  const encodedSubj = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${email.trim()}${encodedSubj}`
}
