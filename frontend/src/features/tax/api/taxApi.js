/**
 * taxApi.js — API client methods for Indian Income Tax & deductions optimizer.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * @typedef {Object} TaxCalculationPayload
 * @property {number} grossAnnualIncome
 * @property {string} [financialYear]
 * @property {number} [section80C]
 * @property {number} [section80D]
 * @property {number} [nps80CCD1B]
 * @property {number} [homeLoanInterest]
 */

/**
 * Calculates and compares tax under Old and New regimes.
 *
 * @param {TaxCalculationPayload} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateTax(payload, options = {}) {
  return request(ENDPOINTS.TAX.CALCULATE, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Fetches configured progressive tax slabs for a given financial year.
 *
 * @param {string} [fy] Financial year, e.g. '2024-2025'
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function getTaxSlabs(fy, options = {}) {
  const query = fy ? `?fy=${encodeURIComponent(fy)}` : ''
  return request(`${ENDPOINTS.TAX.SLABS}${query}`, options)
}

/**
 * Evaluates remaining deductions under Sec 80C, 80D, 80CCD(1B).
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateTaxOptimizer(payload, options = {}) {
  return request(ENDPOINTS.TAX.OPTIMIZER, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}
