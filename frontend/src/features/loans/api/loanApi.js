/**
 * loanApi.js — API client methods for Loan EMI, prepayment, and balance transfer calculations.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * Calculates loan EMI and amortization schedule.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateEmi(payload, options = {}) {
  return request(ENDPOINTS.LOANS.EMI, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Calculates prepayment / part-payment savings and tenure reduction.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculatePrepayment(payload, options = {}) {
  return request(ENDPOINTS.LOANS.PREPAYMENT, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Compares loan prepayment against investing surplus in an equity SIP.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function comparePrepaymentVsSip(payload, options = {}) {
  return request(ENDPOINTS.LOANS.SURPLUS_COMPARISON, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}

/**
 * Estimates savings from a home loan balance transfer after fees.
 *
 * @param {Object} payload
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function calculateBalanceTransfer(payload, options = {}) {
  return request(ENDPOINTS.LOANS.BALANCE_TRANSFER, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  })
}
