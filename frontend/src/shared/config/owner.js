/**
 * owner.js — Central source of truth for site team identity and contact details.
 *
 * Reads values from Vite environment variables (VITE_OWNER_* / VITE_TEAM_*) with
 * fallback defaults so the app works on Netlify without any env vars configured.
 * Contact details are also fetched dynamically from:
 *   GET /api/v1/config/owner-contact  (legacy, founder only)
 *   GET /api/v1/config/team           (full team list)
 */

// ── Legacy single-owner config (backward compat) ─────────────────────────────

export const DEFAULT_OWNER_CONFIG = {
  name: import.meta.env.VITE_OWNER_NAME || 'Aniruddha Mondal',
  whatsapp: import.meta.env.VITE_OWNER_WHATSAPP || '+91 8013292565',
  email: import.meta.env.VITE_OWNER_EMAIL || 'aniruddha0266@gmail.com',
  directContactLine: 'Prefer a quick chat? Message me on WhatsApp or email me directly.',
}

// ── Team members — ordered list (founder first) ───────────────────────────────

/**
 * Default team members. These match the backend defaults in TeamProperties.java
 * and application.yml. Override via VITE_TEAM_n_* env vars.
 *
 * IMPORTANT — two placeholders must be replaced by the site owner:
 *   <CO_FOUNDER_ROLE>  → VITE_TEAM_1_ROLE env var (e.g. "Co-founder & Finance Content Lead")
 *   <CO_FOUNDER_BIO>   → VITE_TEAM_1_SHORT_BIO env var (~50 words, no invented credentials)
 */
export const DEFAULT_TEAM = [
  {
    id: 'aniruddha',
    name: import.meta.env.VITE_TEAM_0_NAME || 'Aniruddha Mondal',
    // <FOUNDER_ROLE> — update VITE_TEAM_0_ROLE to override
    role: import.meta.env.VITE_TEAM_0_ROLE || 'Founder & Lead Developer',
    shortBio:
      import.meta.env.VITE_TEAM_0_SHORT_BIO ||
      'Aniruddha is a Kolkata-based Java full-stack engineer with around five years of ' +
        'experience building Spring Boot microservices and React interfaces for ' +
        'financial-services platforms. He built InFinance to make SIP, tax, loan and ' +
        'retirement planning simple, transparent and easy to understand for Indian investors. ' +
        'He is also pursuing a PGDM in Data Science & Business Analytics.',
    whatsapp: import.meta.env.VITE_TEAM_0_WHATSAPP || '+91 8013292565',
    email: import.meta.env.VITE_TEAM_0_EMAIL || 'aniruddha0266@gmail.com',
    initials: import.meta.env.VITE_TEAM_0_INITIALS || 'AM',
  },
  {
    id: 'kuhika',
    name: import.meta.env.VITE_TEAM_1_NAME || 'Kuhika Das',
    // <CO_FOUNDER_ROLE> — set VITE_TEAM_1_ROLE with Kuhika's actual role title
    role: import.meta.env.VITE_TEAM_1_ROLE || 'Co-founder',
    // <CO_FOUNDER_BIO> — set VITE_TEAM_1_SHORT_BIO with Kuhika's actual bio (~50 words)
    shortBio:
      import.meta.env.VITE_TEAM_1_SHORT_BIO ||
      '<CO_FOUNDER_BIO: Replace this placeholder — set the VITE_TEAM_1_SHORT_BIO environment ' +
        'variable with a short biography of ~50 words. Do not invent qualifications or employers.>',
    whatsapp: import.meta.env.VITE_TEAM_1_WHATSAPP || '+91 7667889389',
    email: import.meta.env.VITE_TEAM_1_EMAIL || 'kuhika.das@gmail.com',
    initials: import.meta.env.VITE_TEAM_1_INITIALS || 'KD',
  },
]

// ── WhatsApp helpers ──────────────────────────────────────────────────────────

/**
 * Derive WhatsApp link and display text from a raw number.
 * Single source of truth — never repeat a number in components.
 *
 * @param {string} rawNumber Raw WhatsApp number (e.g. "+91 8013292565" or "918013292565")
 * @param {string} [text]    Optional prefilled message text (will be URL-encoded)
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
