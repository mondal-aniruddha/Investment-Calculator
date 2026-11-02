/**
 * authApi.test.js — unit tests for authentication and OTP / 2FA API client methods.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authApi from '../authApi'
import * as httpClient from '../../../../shared/api/httpClient'

vi.mock('../../../../shared/api/httpClient', () => ({
  request: vi.fn(),
}))

describe('authApi client methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register calls POST /api/v1/auth/register with payload', async () => {
    httpClient.request.mockResolvedValue({ verificationRequired: true, challengeId: 'c-1' })
    const payload = {
      email: 'user@example.com',
      password: 'Password123!',
      displayName: 'User One',
      phoneE164: '+919876543210',
      channel: 'SMS',
    }
    const res = await authApi.register(payload)
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    expect(res.verificationRequired).toBe(true)
  })

  it('verifyRegistration calls POST /api/v1/auth/register/verify', async () => {
    httpClient.request.mockResolvedValue({ token: 'jwt-1' })
    const res = await authApi.verifyRegistration({ challengeId: 'c-1', code: '123456' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'c-1', code: '123456' }),
    })
    expect(res.token).toBe('jwt-1')
  })

  it('resendOtp calls POST /api/v1/auth/otp/resend', async () => {
    httpClient.request.mockResolvedValue({ resendAvailableAt: '2026-11-02T10:00:00Z' })
    await authApi.resendOtp({ challengeId: 'c-1', channel: 'WHATSAPP' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'c-1', channel: 'WHATSAPP' }),
    })
  })

  it('login calls POST /api/v1/auth/login', async () => {
    httpClient.request.mockResolvedValue({ twoFactorRequired: true, challengeId: 'c-2' })
    const res = await authApi.login({ identifier: 'user@example.com', password: 'Password123!' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'user@example.com', password: 'Password123!' }),
    })
    expect(res.twoFactorRequired).toBe(true)
  })

  it('verifyTwoFactor calls POST /api/v1/auth/2fa/verify with code or backupCode', async () => {
    httpClient.request.mockResolvedValue({ token: 'jwt-2' })
    await authApi.verifyTwoFactor({ challengeId: 'c-2', code: '654321' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'c-2', code: '654321' }),
    })

    await authApi.verifyTwoFactor({ challengeId: 'c-2', backupCode: 'ABCDEF12' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'c-2', backupCode: 'ABCDEF12' }),
    })
  })

  it('getTwoFactorStatus calls GET /api/v1/auth/2fa/status', async () => {
    httpClient.request.mockResolvedValue({ enabled: true, phoneVerified: true })
    const res = await authApi.getTwoFactorStatus()
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/2fa/status')
    expect(res.enabled).toBe(true)
  })

  it('changePhone calls POST /api/v1/auth/phone/change', async () => {
    httpClient.request.mockResolvedValue({ challengeId: 'c-3' })
    await authApi.changePhone({ newPhoneE164: '+919876543210', channel: 'SMS' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/phone/change', {
      method: 'POST',
      body: JSON.stringify({ newPhoneE164: '+919876543210', channel: 'SMS' }),
    })
  })

  it('verifyPhoneChange calls POST /api/v1/auth/phone/change/verify', async () => {
    httpClient.request.mockResolvedValue({ id: 'u-1', phoneVerified: true })
    await authApi.verifyPhoneChange({ challengeId: 'c-3', code: '112233' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/phone/change/verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'c-3', code: '112233' }),
    })
  })

  it('updateProfile does not include phone', async () => {
    httpClient.request.mockResolvedValue({ id: 'u-1', displayName: 'Updated' })
    await authApi.updateProfile({ displayName: 'Updated' })
    expect(httpClient.request).toHaveBeenCalledWith('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName: 'Updated' }),
    })
  })
})
