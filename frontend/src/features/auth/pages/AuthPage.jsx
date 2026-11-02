import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { evaluatePasswordCriteria, calculatePasswordStrengthScore } from '../utils/passwordStrength'
import OtpInput from '../components/OtpInput'

// E.164 regex for India (+91) — matches backend validation
const PHONE_E164_REGEX = /^\+91[6-9]\d{9}$/

export function AuthPage({ initialMode = 'login' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAuthenticated, verifyRegistration, verifyTwoFactor, resendOtp } =
    useAuth()
  const toast = useToast()

  const [mode, setMode] = useState(initialMode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // OTP challenge state — never stored to sessionStorage/localStorage
  // shape: { mode: 'register'|'login', challengeId, maskedPhone, channel, resendAvailableAt }
  const [otpStep, setOtpStep] = useState(null)
  const [otpError, setOtpError] = useState('')
  const [otpSubmitting, setOtpSubmitting] = useState(false)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regPhoneLocal, setRegPhoneLocal] = useState('') // 10 digits without country code
  const [regChannel, setRegChannel] = useState('SMS')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  // Derive the full E.164 phone from local input
  const regPhoneE164 = regPhoneLocal.trim() ? `+91${regPhoneLocal.trim()}` : ''
  const phoneValid = !regPhoneLocal.trim() || PHONE_E164_REGEX.test(regPhoneE164)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Keep mode in sync with path
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register')
    } else if (location.pathname === '/login') {
      setMode('login')
    }
  }, [location.pathname])

  // Password strength evaluation
  const passwordCriteria = useMemo(() => {
    return evaluatePasswordCriteria(regPassword)
  }, [regPassword])

  const strengthScore = useMemo(() => {
    return calculatePasswordStrengthScore(regPassword)
  }, [regPassword])

  const strengthLabel = useMemo(() => {
    if (!regPassword) return { text: '', color: 'transparent', width: '0%' }
    switch (strengthScore) {
      case 0:
      case 1:
        return {
          text: t('auth.strengthWeak'),
          color: 'var(--strength-weak, #b83a3a)',
          width: '25%',
        }
      case 2:
        return {
          text: t('auth.strengthFair'),
          color: 'var(--strength-fair, #b85d18)',
          width: '50%',
        }
      case 3:
        return {
          text: t('auth.strengthGood'),
          color: 'var(--strength-good, #2e7d32)',
          width: '75%',
        }
      case 4:
        return {
          text: t('auth.strengthStrong'),
          color: 'var(--strength-strong, #1b5e20)',
          width: '100%',
        }
      default:
        return {
          text: t('auth.strengthWeak'),
          color: 'var(--strength-weak, #b83a3a)',
          width: '25%',
        }
    }
  }, [regPassword, strengthScore, t])

  const passwordsMatch = regConfirmPassword === '' || regPassword === regConfirmPassword

  // ─── Login submit ────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)
    try {
      const res = await login({ identifier: loginIdentifier.trim(), password: loginPassword })
      if (res.twoFactorRequired) {
        // Enter OTP step — do NOT navigate yet
        setOtpStep({
          mode: 'login',
          challengeId: res.challengeId,
          maskedPhone: res.maskedPhone,
          channel: res.channel || 'SMS',
          resendAvailableAt: res.resendAvailableAt,
          backupCodesAvailable: res.backupCodesAvailable,
        })
      } else {
        toast.success(t('auth.loginSuccess'))
        const destination = location.state?.from?.pathname || '/'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.')
      toast.error(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Register submit ─────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(t('auth.passwordMismatch'))
      return
    }

    if (
      !passwordCriteria.minLength ||
      !passwordCriteria.hasUpper ||
      !passwordCriteria.hasLower ||
      !passwordCriteria.hasDigit
    ) {
      setErrorMessage(t('auth.strengthReq'))
      return
    }

    if (!regPhoneLocal.trim()) {
      setErrorMessage(t('auth.phoneRequired'))
      return
    }

    if (!phoneValid) {
      setErrorMessage(t('auth.phoneE164Hint'))
      return
    }

    setSubmitting(true)
    try {
      const res = await register({
        email: regEmail.trim(),
        password: regPassword,
        displayName: regDisplayName.trim(),
        phoneE164: regPhoneE164,
        channel: regChannel,
        username: regUsername.trim() || undefined,
      })

      if (res.verificationRequired) {
        // Enter OTP step — do NOT navigate yet
        setOtpStep({
          mode: 'register',
          challengeId: res.challengeId,
          maskedPhone: res.maskedPhone,
          channel: res.channel || regChannel,
          resendAvailableAt: res.resendAvailableAt,
        })
      } else {
        // Unexpected legacy path
        toast.success(t('auth.accountCreated'))
        const destination = location.state?.from?.pathname || '/'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.')
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── OTP submit (registration verify) ───────────────────────────────────────
  const handleOtpSubmit = async (code) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      if (otpStep.mode === 'register') {
        await verifyRegistration(otpStep.challengeId, code)
        toast.success(t('auth.accountCreated'))
        const destination = location.state?.from?.pathname || '/'
        navigate(destination, { replace: true })
      } else {
        await verifyTwoFactor(otpStep.challengeId, { code })
        toast.success(t('auth.loginSuccess'))
        const destination = location.state?.from?.pathname || '/'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      // Never treat OTP failure as session loss (backend returns 422, not 401)
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // ─── Backup code submit (2FA login only) ────────────────────────────────────
  const handleBackupCode = async (backupCode) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      await verifyTwoFactor(otpStep.challengeId, { backupCode })
      toast.success(t('auth.loginSuccess'))
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (err) {
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // ─── OTP resend ──────────────────────────────────────────────────────────────
  const handleResend = async (channel) => {
    const res = await resendOtp(otpStep.challengeId, channel)
    setOtpStep((prev) => ({ ...prev, resendAvailableAt: res.resendAvailableAt }))
    return res
  }

  // ─── OTP step back ───────────────────────────────────────────────────────────
  const handleOtpBack = () => {
    setOtpStep(null)
    setOtpError('')
  }

  // ─── Render OTP step ─────────────────────────────────────────────────────────
  if (otpStep) {
    return (
      <div className="auth-split-layout">
        <div className="auth-brand-panel">
          <div className="auth-brand-header">
            <div className="brand-mark-lg">↗</div>
            <h2>
              in<span>finance</span>
            </h2>
          </div>
          <p className="auth-brand-tagline">{t('auth.otpStep')}</p>
          <div className="auth-feature-cards">
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <div>
                <strong>{t('auth.verifyPhone')}</strong>
                <p>
                  {t('auth.otpSentTo', { channel: otpStep.channel, phone: otpStep.maskedPhone })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="card auth-card">
            <OtpInput
              challengeId={otpStep.challengeId}
              maskedPhone={otpStep.maskedPhone}
              channel={otpStep.channel}
              resendAvailableAt={otpStep.resendAvailableAt}
              showBackupCodeOption={otpStep.mode === 'login' && otpStep.backupCodesAvailable}
              isLoading={otpSubmitting}
              error={otpError}
              onSubmit={handleOtpSubmit}
              onResend={handleResend}
              onBackupCode={handleBackupCode}
              onBack={handleOtpBack}
            />
          </div>
        </div>
      </div>
    )
  }

  // ─── Render main auth form ───────────────────────────────────────────────────
  return (
    <div className="auth-split-layout">
      {/* Left Column: Brand & Security Highlights */}
      <div className="auth-brand-panel">
        <div className="auth-brand-header">
          <div className="brand-mark-lg">↗</div>
          <h2>
            in<span>finance</span>
          </h2>
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
            <Link
              id="tab-login"
              role="tab"
              to="/login"
              aria-selected={mode === 'login'}
              aria-controls="panel-login"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login')
                setErrorMessage('')
              }}
            >
              {t('auth.tabLogin')}
            </Link>
            <Link
              id="tab-register"
              role="tab"
              to="/register"
              aria-selected={mode === 'register'}
              aria-controls="panel-register"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register')
                setErrorMessage('')
              }}
            >
              {t('auth.tabRegister')}
            </Link>
          </div>

          {errorMessage && (
            <div className="error-message auth-alert" role="alert" aria-live="polite">
              <span className="alert-icon">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form
              id="panel-login"
              role="tabpanel"
              aria-labelledby="tab-login"
              onSubmit={handleLoginSubmit}
              noValidate
            >
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
                <Link
                  to="/register"
                  className="text-button"
                  onClick={() => {
                    setMode('register')
                    setErrorMessage('')
                  }}
                >
                  {t('auth.switchRegister')}
                </Link>
              </div>
            </form>
          ) : (
            <form
              id="panel-register"
              role="tabpanel"
              aria-labelledby="tab-register"
              onSubmit={handleRegisterSubmit}
              noValidate
            >
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

              {/* Phone input — required, India only (+91) */}
              <div className="form-field">
                <label htmlFor="reg-phone">
                  {t('auth.phoneLabel')} <span className="required-mark">*</span>
                </label>
                <div className="phone-input-row">
                  <span className="phone-country-code">+91</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={regPhoneLocal}
                    onChange={(e) => setRegPhoneLocal(e.target.value.replace(/\D/g, ''))}
                    aria-describedby="phone-hint"
                    aria-invalid={regPhoneLocal.trim() !== '' && !phoneValid}
                  />
                </div>
                <span id="phone-hint" className="field-hint">
                  {t('auth.phoneE164Hint')}
                </span>
                {regPhoneLocal.trim() !== '' && !phoneValid && (
                  <span className="field-inline-error">{t('auth.phoneE164Hint')}</span>
                )}
              </div>

              {/* OTP Channel selection */}
              <div className="form-field">
                <fieldset className="channel-fieldset">
                  <legend>{t('auth.channelLabel')}</legend>
                  <label className="channel-option">
                    <input
                      type="radio"
                      name="channel"
                      value="SMS"
                      checked={regChannel === 'SMS'}
                      onChange={() => setRegChannel('SMS')}
                    />
                    {t('auth.channelSms')}
                  </label>
                  <label className="channel-option">
                    <input
                      type="radio"
                      name="channel"
                      value="WHATSAPP"
                      checked={regChannel === 'WHATSAPP'}
                      onChange={() => setRegChannel('WHATSAPP')}
                    />
                    {t('auth.channelWhatsapp')}
                  </label>
                </fieldset>
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
                      <li
                        className={
                          passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'valid' : ''
                        }
                      >
                        {passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '○'} Upper &
                        lower case
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
                    aria-label={
                      showRegConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')
                    }
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
                disabled={
                  submitting ||
                  !regEmail ||
                  !regPassword ||
                  !regDisplayName ||
                  !passwordsMatch ||
                  !regPhoneLocal.trim() ||
                  !phoneValid
                }
              >
                {submitting ? t('auth.submitting') : t('auth.submitRegister')} <span>→</span>
              </button>

              <div className="auth-switch-prompt">
                <Link
                  to="/login"
                  className="text-button"
                  onClick={() => {
                    setMode('login')
                    setErrorMessage('')
                  }}
                >
                  {t('auth.switchLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
