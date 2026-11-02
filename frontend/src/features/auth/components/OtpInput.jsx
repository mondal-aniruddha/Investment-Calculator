/**
 * OtpInput — Reusable OTP entry component for signup verification and 2FA login.
 *
 * Features:
 * - 6 individual digit boxes with paste support
 * - Live countdown to resend availability
 * - Channel switcher (SMS ↔ WhatsApp)
 * - Backup code toggle (for 2FA flows)
 * - Masked destination display
 * - aria-live error region
 * - Never stores challengeId in localStorage/sessionStorage
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const OTP_LENGTH = 6

/**
 * @param {Object} props
 * @param {string}   props.challengeId
 * @param {string}   props.maskedPhone
 * @param {string}   props.channel           - 'SMS' | 'WHATSAPP'
 * @param {string}   props.resendAvailableAt - ISO timestamp
 * @param {boolean}  [props.showBackupCodeOption] - show "use backup code" toggle
 * @param {boolean}  [props.isLoading]
 * @param {string}   [props.error]
 * @param {Function} props.onSubmit          - (code: string) => void
 * @param {Function} props.onResend          - (channel: string) => Promise<{ resendAvailableAt }>
 * @param {Function} [props.onBackupCode]    - (backupCode: string) => void
 * @param {Function} [props.onBack]          - () => void  (goes back to previous step)
 */
export default function OtpInput({
  challengeId,
  maskedPhone,
  channel,
  resendAvailableAt,
  showBackupCodeOption = false,
  isLoading = false,
  error,
  onSubmit,
  onResend,
  onBackupCode,
  onBack,
}) {
  const { t } = useTranslation()

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [useBackup, setUseBackup] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const [resendAt, setResendAt] = useState(() =>
    resendAvailableAt ? new Date(resendAvailableAt) : null,
  )
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [activeChannel, setActiveChannel] = useState(channel || 'SMS')
  const [resending, setResending] = useState(false)

  const inputRefs = useRef([])

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      if (!resendAt) {
        setSecondsLeft(0)
        return
      }
      const diff = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [resendAt])

  // Re-sync when parent updates resendAvailableAt prop
  useEffect(() => {
    setResendAt(resendAvailableAt ? new Date(resendAvailableAt) : null)
  }, [resendAvailableAt])

  // ─── Focus first box on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!useBackup) inputRefs.current[0]?.focus()
  }, [useBackup])

  // ─── Digit change ────────────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    // Auto-submit when all filled
    if (clean && next.every(Boolean)) {
      onSubmit(next.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'Enter' && digits.every(Boolean)) {
      onSubmit(digits.join(''))
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => {
      next[i] = ch
    })
    setDigits(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
    if (pasted.length === OTP_LENGTH) {
      onSubmit(pasted)
    }
  }

  // ─── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = useCallback(
    async (newChannel) => {
      if (secondsLeft > 0 || resending) return
      setResending(true)
      try {
        const res = await onResend(newChannel || activeChannel)
        if (res?.resendAvailableAt) {
          setResendAt(new Date(res.resendAvailableAt))
        }
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      } finally {
        setResending(false)
      }
    },
    [secondsLeft, resending, activeChannel, onResend],
  )

  const switchChannel = useCallback(
    async (ch) => {
      setActiveChannel(ch)
      await handleResend(ch)
    },
    [handleResend],
  )

  // ─── Backup code submit ──────────────────────────────────────────────────────
  const handleBackupSubmit = (e) => {
    e.preventDefault()
    if (backupCode.trim()) onBackupCode?.(backupCode.trim())
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  const canResend = secondsLeft === 0 && !resending
  const otherChannel = activeChannel === 'SMS' ? 'WHATSAPP' : 'SMS'

  return (
    <div className="otp-input-wrapper" data-testid="otp-input">
      {/* ── Header ── */}
      <h2 className="otp-title">
        {useBackup ? t('auth.otpUseBackupCode') : t('auth.otpTitle')}
      </h2>

      {!useBackup && (
        <p className="otp-subtitle">
          {t('auth.otpSentTo', {
            channel: activeChannel === 'SMS' ? t('auth.channelSms') : t('auth.channelWhatsapp'),
            phone: maskedPhone,
          })}
        </p>
      )}

      {/* ── Error region (aria-live) ── */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="otp-error"
          data-testid="otp-error"
        >
          {error}
        </div>
      )}

      {useBackup ? (
        /* ── Backup code form ── */
        <form onSubmit={handleBackupSubmit} className="otp-backup-form">
          <label htmlFor="backup-code" className="otp-backup-label">
            {t('auth.backupCodeLabel')}
          </label>
          <input
            id="backup-code"
            type="text"
            autoComplete="one-time-code"
            spellCheck={false}
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value)}
            placeholder="XXXXXXXXXXXXXXXX"
            className="otp-backup-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!backupCode.trim() || isLoading}
            className="otp-submit-btn"
          >
            {isLoading ? t('auth.submitting') : t('auth.otpEnterCode')}
          </button>
        </form>
      ) : (
        /* ── Digit boxes ── */
        <div
          className="otp-boxes"
          onPaste={handlePaste}
          role="group"
          aria-label={t('auth.otpTitle')}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`otp-digit${digit ? ' otp-digit--filled' : ''}`}
              aria-label={`${t('auth.otpTitle')} digit ${i + 1}`}
              disabled={isLoading}
            />
          ))}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="otp-actions">
        {/* Resend / countdown */}
        {!useBackup && (
          <div className="otp-resend-row">
            {secondsLeft > 0 ? (
              <span className="otp-resend-timer">
                {t('auth.otpResendIn', { seconds: secondsLeft })}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleResend()}
                disabled={!canResend || isLoading}
                className="otp-resend-btn"
              >
                {resending ? t('auth.submitting') : t('auth.otpResend')}
              </button>
            )}

            {/* Channel switcher */}
            <button
              type="button"
              onClick={() => switchChannel(otherChannel)}
              disabled={!canResend || isLoading}
              className="otp-channel-switch-btn"
            >
              {otherChannel === 'WHATSAPP'
                ? t('auth.switchToWhatsapp')
                : t('auth.switchToSms')}
            </button>
          </div>
        )}

        {/* Backup code toggle */}
        {showBackupCodeOption && (
          <button
            type="button"
            onClick={() => setUseBackup((v) => !v)}
            className="otp-backup-toggle-btn"
          >
            {useBackup ? t('auth.otpTitle') : t('auth.otpUseBackupCode')}
          </button>
        )}

        {/* Back button */}
        {onBack && (
          <button type="button" onClick={onBack} className="otp-back-btn">
            {t('auth.otpWrongNumber')}
          </button>
        )}
      </div>
    </div>
  )
}

