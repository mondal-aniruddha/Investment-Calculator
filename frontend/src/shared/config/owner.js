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

// ── Co-founder default copy ──────────────────────────────────────────────────

export const KUHIKA_DEFAULT_ROLE = 'Co-founder & Process Engineer'

export const KUHIKA_DEFAULT_BIO =
  'Kuhika is a Process Engineer with 4+ years of experience in the Oil & Gas industry, ' +
  'remotely monitoring and supporting plant assets. Specializing in digital twin creation, ' +
  'P&ID digitization, smart plant creation and chemical process modelling, Kuhika works closely ' +
  'with engineering and digital platform teams to provide functional support for Digital Twin ' +
  'initiatives and Industry 4.0 solutions. With a proven record of improving operational efficiency ' +
  'and operational excellence, Kuhika is passionate about using digital technologies and innovative ' +
  'engineering practices to optimize industrial systems and contribute to sustainable energy solutions.'

/**
 * Sanitizes a biography string, guaranteeing that empty values or placeholder
 * strings like "<CO_FOUNDER_BIO...>" fall back to the built-in default text.
 *
 * @param {string} bio Raw biography string
 * @param {string} fallback Default biography
 * @returns {string}
 */
export function sanitizeBio(bio, fallback = '') {
  if (!bio || typeof bio !== 'string') return fallback
  const trimmed = bio.trim()
  if (!trimmed || trimmed.startsWith('<') || trimmed.toLowerCase().includes('placeholder')) {
    return fallback
  }
  return trimmed
}

// ── Team members — ordered list (founder first) ───────────────────────────────

export const DEFAULT_TEAM = [
  {
    id: 'aniruddha',
    name: import.meta.env.VITE_TEAM_0_NAME || 'Aniruddha Mondal',
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
    role: import.meta.env.VITE_TEAM_1_ROLE || KUHIKA_DEFAULT_ROLE,
    shortBio: sanitizeBio(import.meta.env.VITE_TEAM_1_SHORT_BIO, KUHIKA_DEFAULT_BIO),
    whatsapp: import.meta.env.VITE_TEAM_1_WHATSAPP || '+91 7667889389',
    email: import.meta.env.VITE_TEAM_1_EMAIL || 'kuhika.das@gmail.com',
    initials: import.meta.env.VITE_TEAM_1_INITIALS || 'KD',
  },
]

// ── WhatsApp helpers ──────────────────────────────────────────────────────────

/**
 * Derive WhatsApp link and raw digits from a number string.
 * Link uses the official wa.me format. Raw phone numbers are NOT displayed in UI.
 *
 * @param {string} rawNumber Raw WhatsApp number (e.g. "+91 8013292565" or "918013292565")
 * @param {string} [text]    Optional prefilled message text (will be URL-encoded)
 * @returns {{ digits: string, href: string }}
 */
export function formatWhatsAppContact(rawNumber = DEFAULT_OWNER_CONFIG.whatsapp, text = '') {
  if (!rawNumber) {
    return { digits: '', href: '' }
  }

  // Extract digits only
  const rawDigits = String(rawNumber).replace(/\D/g, '')
  // Ensure country code: if 10 digits, prepend 91
  const digits = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits

  // Build wa.me href
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : ''
  const href = digits ? `https://wa.me/${digits}${encodedText}` : ''

  return { digits, href }
}

export function formatWhatsAppHref(rawNumber = DEFAULT_OWNER_CONFIG.whatsapp, text = '') {
  return formatWhatsAppContact(rawNumber, text).href
}

export function formatMailtoHref(email = DEFAULT_OWNER_CONFIG.email, subject = '') {
  if (!email) return ''
  const encodedSubj = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${email.trim()}${encodedSubj}`
}
