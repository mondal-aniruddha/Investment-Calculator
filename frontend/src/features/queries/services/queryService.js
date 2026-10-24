import httpClient from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'
import { DEFAULT_OWNER_CONFIG } from '../../../shared/config/owner'

export async function submitFinanceQuery(payload) {
  return httpClient.post(ENDPOINTS.QUERIES.SUBMIT, payload)
}

export async function fetchOwnerContact() {
  try {
    const data = await httpClient.get(ENDPOINTS.CONFIG.OWNER_CONTACT)
    return {
      name: data.name || DEFAULT_OWNER_CONFIG.name,
      phone: data.phone || DEFAULT_OWNER_CONFIG.phone,
      email: data.email || DEFAULT_OWNER_CONFIG.email,
    }
  } catch {
    // Graceful fallback to env / constants
    return DEFAULT_OWNER_CONFIG
  }
}
