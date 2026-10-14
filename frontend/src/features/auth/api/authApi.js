/**
 * authApi.js — API client methods for authentication, profile, and saved scenarios.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * @typedef {Object} RegisterPayload
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} usernameOrEmail
 * @property {string} password
 */

/**
 * Registers a new user account.
 *
 * @param {RegisterPayload} payload
 * @returns {Promise<any>}
 */
export async function register(payload) {
  return request(ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Authenticates user credentials and issues a JWT token.
 *
 * @param {LoginPayload} payload
 * @returns {Promise<any>}
 */
export async function login(payload) {
  return request(ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Retrieves the currently authenticated user's profile.
 *
 * @returns {Promise<any>}
 */
export async function getProfile() {
  return request(ENDPOINTS.AUTH.PROFILE)
}

/**
 * Updates the user's profile details.
 *
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function updateProfile(payload) {
  return request(ENDPOINTS.AUTH.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Permanently deletes the authenticated user's account and all data.
 *
 * @returns {Promise<any>}
 */
export async function deleteAccount() {
  return request(ENDPOINTS.AUTH.ACCOUNT, {
    method: 'DELETE',
  })
}

/**
 * Lists all saved scenarios for the authenticated user.
 *
 * @returns {Promise<any>}
 */
export async function getScenarios() {
  return request(ENDPOINTS.SCENARIOS.BASE)
}

/**
 * Saves a new scenario.
 *
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function saveScenario(payload) {
  return request(ENDPOINTS.SCENARIOS.BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Updates an existing scenario.
 *
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function updateScenario(id, payload) {
  return request(`${ENDPOINTS.SCENARIOS.BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Deletes a saved scenario.
 *
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteScenario(id) {
  return request(`${ENDPOINTS.SCENARIOS.BASE}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Compares two or more owned scenarios.
 *
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function compareScenarios(payload) {
  return request(ENDPOINTS.SCENARIOS.COMPARE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
