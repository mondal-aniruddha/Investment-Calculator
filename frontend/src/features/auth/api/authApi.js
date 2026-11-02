/**
 * authApi.js — API client methods for authentication, profile, OTP, 2FA, and saved scenarios.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * @typedef {Object} RegisterPayload
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} phoneE164 - E.164 format, e.g. +919876543210
 * @property {string} channel - 'SMS' | 'WHATSAPP'
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} identifier - email or username
 * @property {string} password
 */

/**
 * Registers a new user account. Returns a verification challenge (no token yet).
 *
 * @param {RegisterPayload} payload
 * @returns {Promise<any>} { verificationRequired, challengeId, maskedPhone, channel, resendAvailableAt, expiresAt }
 */
export async function register(payload) {
  return request(ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Verifies the signup OTP and activates the account. Returns full AuthResponse (token + profile).
 *
 * @param {{ challengeId: string, code: string }} payload
 * @returns {Promise<any>}
 */
export async function verifyRegistration(payload) {
  return request(ENDPOINTS.AUTH.REGISTER_VERIFY, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Resends an OTP for any challenge (signup or 2FA login). Optionally switches channel.
 *
 * @param {{ challengeId: string, channel?: string }} payload
 * @returns {Promise<any>} { resendAvailableAt, expiresAt }
 */
export async function resendOtp(payload) {
  return request(ENDPOINTS.AUTH.OTP_RESEND, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Authenticates user credentials.
 * - If 2FA enabled: returns { twoFactorRequired, challengeId, maskedPhone, channel, resendAvailableAt, backupCodesAvailable } (no token).
 * - Otherwise: returns full AuthResponse (token + profile).
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
 * Verifies the 2FA OTP or backup code after a successful password step.
 *
 * @param {{ challengeId: string, code?: string, backupCode?: string }} payload
 * @returns {Promise<any>} Full AuthResponse (token + profile)
 */
export async function verifyTwoFactor(payload) {
  return request(ENDPOINTS.AUTH.TWO_FACTOR_VERIFY, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Gets the current 2FA status for the authenticated user.
 *
 * @returns {Promise<{ enabled: boolean, phoneVerified: boolean, maskedPhone: string, backupCodesRemaining: number }>}
 */
export async function getTwoFactorStatus() {
  return request(ENDPOINTS.AUTH.TWO_FACTOR_STATUS)
}

/**
 * Initiates the 2FA enable flow. Returns a challenge to verify phone ownership.
 *
 * @param {{ channel: string }} payload
 * @returns {Promise<any>} { challengeId, maskedPhone, channel, resendAvailableAt }
 */
export async function enableTwoFactor(payload) {
  return request(ENDPOINTS.AUTH.TWO_FACTOR_ENABLE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Completes the 2FA enable flow by verifying the OTP. Returns backup codes (shown once).
 *
 * @param {{ challengeId: string, code: string }} payload
 * @returns {Promise<{ backupCodes: string[] }>}
 */
export async function enableTwoFactorVerify(payload) {
  return request(ENDPOINTS.AUTH.TWO_FACTOR_ENABLE_VERIFY, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Disables 2FA. Requires current password and a fresh OTP.
 *
 * @param {{ challengeId: string, password: string, code: string }} payload
 * @returns {Promise<any>}
 */
export async function disableTwoFactor(payload) {
  return request(ENDPOINTS.AUTH.TWO_FACTOR_DISABLE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Regenerates backup codes. Requires current password and a fresh OTP.
 *
 * @param {{ challengeId: string, password: string, code: string }} payload
 * @returns {Promise<{ backupCodes: string[] }>}
 */
export async function regenerateBackupCodes(payload) {
  return request(ENDPOINTS.AUTH.BACKUP_CODES_REGENERATE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Initiates a phone number change. Sends OTP to the new number.
 *
 * @param {{ newPhoneE164: string, channel: string }} payload
 * @returns {Promise<any>} { challengeId, maskedPhone, channel, resendAvailableAt }
 */
export async function changePhone(payload) {
  return request(ENDPOINTS.AUTH.PHONE_CHANGE, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Verifies OTP sent to the new phone to complete the phone change.
 *
 * @param {{ challengeId: string, code: string }} payload
 * @returns {Promise<any>}
 */
export async function verifyPhoneChange(payload) {
  return request(ENDPOINTS.AUTH.PHONE_CHANGE_VERIFY, {
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
 * Updates the user's profile details (displayName only; phone changes must go through /phone/change).
 *
 * @param {{ displayName: string }} payload
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
