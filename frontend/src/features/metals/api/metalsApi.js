/**
 * metalsApi.js — API client methods for live indicative precious metal reference prices.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * Fetches live indicative market reference prices for Gold, Silver, Platinum, and Palladium.
 *
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function getMetalPrices(options = {}) {
  return request(ENDPOINTS.MARKET.METALS, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  })
}
