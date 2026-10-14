/**
 * mutualFundApi.js — API client methods for Mutual Funds calculations (SIP, SWP, CAGR, XIRR).
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * Calculates mutual-fund SIP or step-up projection.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateMutualFundSip(payload, options = {}) {
  return request(ENDPOINTS.MUTUAL_FUNDS.SIP, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Calculates mutual-fund lumpsum growth.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateMutualFundLumpsum(payload, options = {}) {
  return request(ENDPOINTS.MUTUAL_FUNDS.LUMPSUM, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Calculates systematic withdrawal plan (SWP) sustainability.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateSwp(payload, options = {}) {
  return request(ENDPOINTS.MUTUAL_FUNDS.SWP, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Calculates Compounded Annual Growth Rate (CAGR).
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateCagr(payload, options = {}) {
  return request(ENDPOINTS.MUTUAL_FUNDS.CAGR, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Calculates Extended Internal Rate of Return (XIRR) for irregular cash flows.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateXirr(payload, options = {}) {
  return request(ENDPOINTS.MUTUAL_FUNDS.XIRR, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}
