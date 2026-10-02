import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { request } from '../api'
import { useToast } from './ToastContext'

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
        try { return JSON.parse(stored) } catch { return null }
      }
    }
    return null
  })

  const [loading, setLoading] = useState(true)

  // Fetch current user details on mount if token is present
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
        // If profile fetch fails (e.g. invalid/expired token), clear session
        if (isMounted) {
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
  }, [t, toast])

  const login = useCallback(async ({ email, password }) => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.token) {
      sessionStorage.setItem('infinance-token', res.token)
      setToken(res.token)
    }
    if (res.profile) {
      sessionStorage.setItem('infinance-user', JSON.stringify(res.profile))
      setUser(res.profile)
    }
    return res
  }, [])

  const register = useCallback(async ({ email, password, displayName, phone, username }) => {
    const payload = {
      email,
      password,
      displayName,
      ...(phone ? { phone } : {}),
      ...(username ? { username } : {}),
    }
    const res = await request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.token) {
      sessionStorage.setItem('infinance-token', res.token)
      setToken(res.token)
    }
    if (res.profile) {
      sessionStorage.setItem('infinance-user', JSON.stringify(res.profile))
      setUser(res.profile)
    }
    return res
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
