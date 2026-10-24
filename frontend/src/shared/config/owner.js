/**
 * owner.js — Central source of truth for site owner identity and contact details.
 *
 * Reads values from Vite environment variables (VITE_OWNER_*) with fallback defaults.
 * These details can also be updated dynamically from the backend /api/v1/config/owner-contact endpoint.
 */

export const DEFAULT_OWNER_CONFIG = {
  name: import.meta.env.VITE_OWNER_NAME || 'Aniruddha Mondal',
  phone: import.meta.env.VITE_OWNER_PHONE || '+91 98765 43210',
  email: import.meta.env.VITE_OWNER_EMAIL || 'aniruddha.mondal@example.com',
  directContactLine: 'Prefer to talk? Call or message me directly.',
}

export function formatTelHref(phone) {
  if (!phone) return ''
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function formatMailtoHref(email, subject = '') {
  if (!email) return ''
  const encodedSubj = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${email.trim()}${encodedSubj}`
}
