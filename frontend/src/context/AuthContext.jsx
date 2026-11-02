// AuthContext — authentication state, login, register, OTP verification, and 2FA flows.
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { request } from '../services/api'
import { useToast } from './ToastContext'
import {
  register as apiRegister,
  verifyRegistration as apiVerifyRegistration,
  login as apiLogin,
  verifyTwoFactor as apiVerifyTwoFactor,
  resendOtp as apiResendOtp,
} from '../features/auth/api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { t } = useTranslation()
  const toast = useToast()

  const [token, setToken] = useState(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('infinance-token') || null
    }
    return null
  })

  const [user, setUser] = useState(() => {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('infinance-user')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return null
        }
      }
    }
    return null
  })

  const [loading, setLoading] = useState(true)

  // Validate token and hydrate user profile on mount
  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      const currentToken = sessionStorage.getItem('infinance-token')
      if (!currentToken) {
        if (isMounted) setLoading(false)
        return
      }
      try {
        const profile = await request('/api/v1/auth/me')
        if (isMounted) {
          setUser(profile)
          sessionStorage.setItem('infinance-user', JSON.stringify(profile))
        }
      } catch (err) {
        if (isMounted && err?.status === 401) {
          sessionStorage.removeItem('infinance-token')
          sessionStorage.removeItem('infinance-user')
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const handleExpired = () => {
      setToken(null)
      setUser(null)
      toast.error(t('auth.sessionExpired'))
    }

    window.addEventListener('infinance-session-expired', handleExpired)
    return () => {
      isMounted = false
      window.removeEventListener('infinance-session-expired', handleExpired)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Shared: store token + profile to sessionStorage and update state.
   * Only called when res contains a real session token (not a challenge).
   */
  const completeAuth = useCallback((res) => {
    if (res.token) {
      sessionStorage.setItem('infinance-token', res.token)
      setToken(res.token)
    }
    if (res.profile) {
      sessionStorage.setItem('infinance-user', JSON.stringify(res.profile))
      setUser(res.profile)
    }
  }, [])

  /**
   * Register a new account.
   * - If verificationRequired=true → returns challenge object (no token stored yet).
   * - Otherwise → stores token and returns res (legacy path; not expected in current flow).
   */
  const register = useCallback(
    async ({ email, password, displayName, phoneE164, channel, username }) => {
      const payload = {
        email,
        password,
        displayName,
        phoneE164,
        channel: channel || 'SMS',
        ...(username ? { username } : {}),
      }
      const res = await apiRegister(payload)
      if (!res.verificationRequired) {
        // Legacy / unexpected path — complete auth immediately
        completeAuth(res)
      }
      return res
    },
    [completeAuth],
  )

  /**
   * Verify signup OTP. On success, activates account and stores session.
   *
   * @param {string} challengeId
   * @param {string} code
   * @returns {Promise<any>}
   */
  const verifyRegistration = useCallback(
    async (challengeId, code) => {
      const res = await apiVerifyRegistration({ challengeId, code })
      completeAuth(res)
      return res
    },
    [completeAuth],
  )

  /**
   * Authenticate with email/username + password.
   * - If twoFactorRequired=true → returns challenge object (no token stored yet).
   * - Otherwise → stores token and returns res.
   */
  const login = useCallback(
    async ({ identifier, password }) => {
      const res = await apiLogin({ identifier, password })
      if (!res.twoFactorRequired) {
        completeAuth(res)
      }
      return res
    },
    [completeAuth],
  )

  /**
   * Verify 2FA OTP or backup code after a successful password step.
   *
   * @param {string} challengeId
   * @param {{ code?: string, backupCode?: string }} opts
   * @returns {Promise<any>}
   */
  const verifyTwoFactor = useCallback(
    async (challengeId, { code, backupCode } = {}) => {
      const res = await apiVerifyTwoFactor({ challengeId, code, backupCode })
      completeAuth(res)
      return res
    },
    [completeAuth],
  )

  /**
   * Resend OTP for an active challenge. Optionally switch channel.
   *
   * @param {string} challengeId
   * @param {string} [channel]
   * @returns {Promise<{ resendAvailableAt: string, expiresAt: string }>}
   */
  const resendOtp = useCallback(async (challengeId, channel) => {
    return apiResendOtp({ challengeId, ...(channel ? { channel } : {}) })
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('infinance-token')
    sessionStorage.removeItem('infinance-user')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    verifyRegistration,
    verifyTwoFactor,
    resendOtp,
    completeAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
