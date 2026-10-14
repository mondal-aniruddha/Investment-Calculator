/**
 * sipApi.js — API client methods for Systematic Investment Plan & Lumpsum calculations.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * @typedef {Object} SipCalculationPayload
 * @property {number} monthlyInvestment        Monthly SIP amount in INR (>= 100)
 * @property {number} investmentHorizonYears   Investment tenure in years (1 to 50)
 * @property {number} expectedAnnualReturn     Expected annual return % (e.g. 12)
 * @property {number} [annualStepUpPercent]    Optional yearly step-up percentage (0 to 100)
 */

/**
 * @typedef {Object} LumpsumCalculationPayload
 * @property {number} totalInvestment          One-time investment amount in INR
 * @property {number} investmentHorizonYears   Tenure in years
 * @property {number} expectedAnnualReturn     Expected annual return %
 */

/**
 * Computes SIP future value, scenario bands, and wealth creation.
 *
 * @param {SipCalculationPayload} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateSip(payload, options = {}) {
  return request(ENDPOINTS.INVESTING.SIP, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Computes compounded future value for a one-time lumpsum investment.
 *
 * @param {LumpsumCalculationPayload} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateLumpsum(payload, options = {}) {
  return request(ENDPOINTS.INVESTING.LUMPSUM, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}
