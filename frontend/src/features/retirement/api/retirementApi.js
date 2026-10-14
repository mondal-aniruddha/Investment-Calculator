/**
 * retirementApi.js — API client methods for inflation-adjusted retirement planning.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * Calculates retirement corpus requirements, inflation trajectories, and monthly SIP gap.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateRetirementPlan(payload, options = {}) {
  return request(ENDPOINTS.RETIREMENT.PLAN, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}
