import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function AuthPage({ initialMode = 'login' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAuthenticated } = useAuth()
  const toast = useToast()

  const [mode, setMode] = useState(initialMode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Keep mode in sync with props or path
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register')
    } else if (location.pathname === '/login') {
      setMode('login')
    }
  }, [location.pathname])

  // Password strength evaluation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: regPassword.length >= 8,
      hasUpper: /[A-Z]/.test(regPassword),
      hasLower: /[a-z]/.test(regPassword),
      hasDigit: /[0-9]/.test(regPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(regPassword),
    }
  }, [regPassword])

  const strengthScore = useMemo(() => {
    if (!regPassword) return 0
    let score = 0
    if (passwordCriteria.minLength) score += 1
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1
    if (passwordCriteria.hasDigit) score += 1
    if (passwordCriteria.hasSpecial) score += 1
    return score // 0 - 4
  }, [regPassword, passwordCriteria])

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return { text: t('auth.strengthWeak'), color: '#e05353', width: '25%' }
      case 2:
        return { text: t('auth.strengthFair'), color: '#e69500', width: '50%' }
      case 3:
        return { text: t('auth.strengthGood'), color: '#7ea439', width: '75%' }
      case 4:
        return { text: t('auth.strengthStrong'), color: '#2e8b57', width: '100%' }
      default:
        return { text: '', color: 'transparent', width: '0%' }
    }
  }, [strengthScore, t])

  const passwordsMatch = regConfirmPassword === '' || regPassword === regConfirmPassword

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)
    try {
      await login({ email: loginIdentifier.trim(), password: loginPassword })
      toast.success(t('auth.loginSuccess'))
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.')
      toast.error(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(t('auth.passwordMismatch'))
      return
    }

    if (!passwordCriteria.minLength || !passwordCriteria.hasUpper || !passwordCriteria.hasLower || !passwordCriteria.hasDigit) {
      setErrorMessage(t('auth.strengthReq'))
      return
    }

    setSubmitting(true)
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        displayName: regDisplayName.trim(),
        phone: regPhone.trim() || undefined,
        username: regUsername.trim() || undefined,
      })
      toast.success(t('auth.accountCreated'))
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.')
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-split-layout">
      {/* Left Column: Brand & Security Highlights */}
      <div className="auth-brand-panel">
        <div className="auth-brand-header">
          <div className="brand-mark-lg">↗</div>
          <h2>in<span>finance</span></h2>
        </div>
        <p className="auth-brand-tagline">
          {mode === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleRegister')}
        </p>

        <div className="auth-feature-cards">
          <div className="feature-item">
            <span className="feature-icon">🛡</span>
            <div>
              <strong>Bank-grade Security</strong>
              <p>BCrypt salted password hashing with adaptive work factor.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div>
              <strong>Stateless Authentication</strong>
              <p>HMAC-SHA256 JWT tokens with safe sessionStorage lifecycle.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div>
              <strong>Saved Financial Scenarios</strong>
              <p>Confidential scenario storage tied strictly to your user ID.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Card */}
      <div className="auth-form-panel">
        <div className="card auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={mode === 'login'}
              aria-controls="panel-login"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login')
                setErrorMessage('')
                navigate('/login', { replace: true, state: location.state })
              }}
            >
              {t('auth.tabLogin')}
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={mode === 'register'}
              aria-controls="panel-register"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register')
                setErrorMessage('')
                navigate('/register', { replace: true, state: location.state })
              }}
            >
              {t('auth.tabRegister')}
            </button>
          </div>

          {errorMessage && (
            <div className="error-message auth-alert" role="alert" aria-live="polite">
              <span className="alert-icon">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form id="panel-login" role="tabpanel" aria-labelledby="tab-login" onSubmit={handleLoginSubmit} noValidate>
              <h1 className="auth-title">{t('auth.titleLogin')}</h1>
              <p className="auth-subtitle">{t('auth.subtitleLogin')}</p>

              <div className="form-field">
                <label htmlFor="login-identifier">{t('auth.emailOrUsername')}</label>
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  placeholder="name@example.com or username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                />
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="login-password">{t('auth.password')}</label>
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showLoginPassword ? 'Hide 👁' : 'Show 👁'}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                className="primary-button auth-submit-btn"
                type="submit"
                disabled={submitting || !loginIdentifier || !loginPassword}
              >
                {submitting ? t('auth.submitting') : t('auth.submitLogin')} <span>→</span>
              </button>

              <div className="auth-switch-prompt">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode('register')
                    setErrorMessage('')
                    navigate('/register', { replace: true, state: location.state })
                  }}
                >
                  {t('auth.switchRegister')}
                </button>
              </div>
            </form>
          ) : (
            <form id="panel-register" role="tabpanel" aria-labelledby="tab-register" onSubmit={handleRegisterSubmit} noValidate>
              <h1 className="auth-title">{t('auth.titleRegister')}</h1>
              <p className="auth-subtitle">{t('auth.subtitleRegister')}</p>

              <div className="form-field">
                <label htmlFor="reg-email">{t('auth.email')}</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="field-row">
                <div className="form-field">
                  <label htmlFor="reg-username">{t('auth.username')}</label>
                  <input
                    id="reg-username"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. aniruddha"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="reg-display-name">{t('auth.displayName')}</label>
                  <input
                    id="reg-display-name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Full name"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="reg-phone">{t('auth.phone')}</label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="reg-password">{t('auth.password')}</label>
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showRegPassword ? 'Hide 👁' : 'Show 👁'}
                  </button>
                </div>
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />

                {/* Password Strength Meter */}
                {regPassword.length > 0 && (
                  <div className="strength-meter-box" aria-live="polite">
                    <div className="strength-meter-label">
                      <span>{t('auth.strength')}:</span>
                      <strong style={{ color: strengthLabel.color }}>{strengthLabel.text}</strong>
                    </div>
                    <div className="strength-bar-track">
                      <div
                        className="strength-bar-fill"
                        style={{ width: strengthLabel.width, backgroundColor: strengthLabel.color }}
                      />
                    </div>
                    <ul className="strength-criteria-list">
                      <li className={passwordCriteria.minLength ? 'valid' : ''}>
                        {passwordCriteria.minLength ? '✓' : '○'} 8+ characters
                      </li>
                      <li className={passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'valid' : ''}>
                        {passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '○'} Upper & lower case
                      </li>
                      <li className={passwordCriteria.hasDigit ? 'valid' : ''}>
                        {passwordCriteria.hasDigit ? '✓' : '○'} At least 1 number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="reg-confirm-password">{t('auth.confirmPassword')}</label>
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    aria-label={showRegConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showRegConfirmPassword ? 'Hide 👁' : 'Show 👁'}
                  </button>
                </div>
                <input
                  id="reg-confirm-password"
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  aria-invalid={!passwordsMatch}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
                {!passwordsMatch && (
                  <span className="field-inline-error">{t('auth.passwordMismatch')}</span>
                )}
              </div>

              <button
                className="primary-button auth-submit-btn"
                type="submit"
                disabled={submitting || !regEmail || !regPassword || !regDisplayName || !passwordsMatch}
              >
                {submitting ? t('auth.submitting') : t('auth.submitRegister')} <span>→</span>
              </button>

              <div className="auth-switch-prompt">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode('login')
                    setErrorMessage('')
                    navigate('/login', { replace: true, state: location.state })
                  }}
                >
                  {t('auth.switchLogin')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
