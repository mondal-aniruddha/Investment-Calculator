import httpClient from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'
import { DEFAULT_OWNER_CONFIG, DEFAULT_TEAM } from '../../../shared/config/owner'

export async function submitFinanceQuery(payload) {
  return httpClient.post(ENDPOINTS.QUERIES.SUBMIT, payload)
}

/** Fetch the founder's contact from the legacy single-owner endpoint. */
export async function fetchOwnerContact() {
  try {
    const data = await httpClient.get(ENDPOINTS.CONFIG.OWNER_CONTACT)
    return {
      name: data.name || DEFAULT_OWNER_CONFIG.name,
      whatsapp: data.whatsapp || DEFAULT_OWNER_CONFIG.whatsapp,
      email: data.email || DEFAULT_OWNER_CONFIG.email,
    }
  } catch {
    // Graceful fallback to env / constants
    return DEFAULT_OWNER_CONFIG
  }
}

/**
 * Fetch the full ordered team list from GET /api/v1/config/team.
 * Falls back to DEFAULT_TEAM when the backend is unreachable (e.g. Netlify static preview).
 *
 * @returns {Promise<Array<{id,name,role,shortBio,whatsapp,email,initials}>>}
 */
export async function fetchTeam() {
  try {
    const data = await httpClient.get(ENDPOINTS.CONFIG.TEAM)
    if (Array.isArray(data) && data.length > 0) {
      return data.map((m, i) => ({
        id: m.id || DEFAULT_TEAM[i]?.id || `member-${i}`,
        name: m.name || DEFAULT_TEAM[i]?.name || '',
        role: m.role || DEFAULT_TEAM[i]?.role || '',
        shortBio: m.shortBio || DEFAULT_TEAM[i]?.shortBio || '',
        whatsapp: m.whatsapp || DEFAULT_TEAM[i]?.whatsapp || '',
        email: m.email || DEFAULT_TEAM[i]?.email || '',
        initials: m.initials || DEFAULT_TEAM[i]?.initials || '',
      }))
    }
    return DEFAULT_TEAM
  } catch {
    return DEFAULT_TEAM
  }
}
