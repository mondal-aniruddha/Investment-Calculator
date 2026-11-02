import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import {
  getScenarios,
  updateProfile,
  deleteScenario,
  deleteAccount,
  getTwoFactorStatus,
  enableTwoFactor,
  enableTwoFactorVerify,
  disableTwoFactor,
  regenerateBackupCodes,
  changePhone,
  verifyPhoneChange,
  resendOtp,
} from '../api/authApi'
import { DataState } from '../../../components/shared/DataState'
import OtpInput from '../components/OtpInput'

// ─── Security badge ────────────────────────────────────────────────────────────
function StatusBadge({ verified, labelYes, labelNo }) {
  return (
    <span className={`status-badge ${verified ? 'badge--success' : 'badge--warning'}`}>
      {verified ? `✓ ${labelYes}` : `○ ${labelNo}`}
    </span>
  )
}

// ─── Backup codes display ─────────────────────────────────────────────────────
function BackupCodesDisplay({ codes, onClose }) {
  const { t } = useTranslation()

  const copyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'))
  }

  const download = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'infinance-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="backup-codes-modal" role="dialog" aria-modal="true" aria-label={t('auth.backupCodesTitle')}>
      <h3>{t('auth.backupCodesTitle')}</h3>
      <p className="backup-codes-warning">{t('auth.backupCodesWarning')}</p>
      <ul className="backup-codes-list">
        {codes.map((code, i) => (
          <li key={i}>
            <code>{code}</code>
          </li>
        ))}
      </ul>
      <div className="backup-codes-actions">
        <button type="button" className="secondary-button" onClick={copyAll}>
          {t('auth.backupCodesCopy')}
        </button>
        <button type="button" className="secondary-button" onClick={download}>
          {t('auth.backupCodesDownload')}
        </button>
        <button type="button" className="primary-button" onClick={onClose}>
          {t('common.done') || 'Done'}
        </button>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const toast = useToast()

  // ── Profile ──────────────────────────────────────────────────────────────────
  const [scenarios, setScenarios] = useState([])
  const [loadingScenarios, setLoadingScenarios] = useState(false)
  const [scenariosError, setScenariosError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [updating, setUpdating] = useState(false)

  // ── 2FA status ───────────────────────────────────────────────────────────────
  const [twoFaStatus, setTwoFaStatus] = useState(null) // { enabled, phoneVerified, maskedPhone, backupCodesRemaining }
  const [loadingStatus, setLoadingStatus] = useState(false)

  // ── Active OTP challenge (enable/disable/regen/phone-change) ─────────────────
  // shape: { purpose, challengeId, maskedPhone, channel, resendAvailableAt }
  const [otpChallenge, setOtpChallenge] = useState(null)
  const [otpError, setOtpError] = useState('')
  const [otpSubmitting, setOtpSubmitting] = useState(false)

  // ── Backup codes ─────────────────────────────────────────────────────────────
  const [backupCodes, setBackupCodes] = useState(null) // string[] | null — shown once

  // ── Phone change ─────────────────────────────────────────────────────────────
  const [showPhoneChange, setShowPhoneChange] = useState(false)
  const [newPhoneLocal, setNewPhoneLocal] = useState('')
  const [phoneChannel, setPhoneChannel] = useState('SMS')
  const [phoneChanging, setPhoneChanging] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      fetchScenarios()
      fetchTwoFaStatus()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchScenarios = async () => {
    setLoadingScenarios(true)
    setScenariosError(null)
    try {
      const data = await getScenarios()
      setScenarios(Array.isArray(data) ? data : [])
    } catch (err) {
      setScenariosError(err?.message || 'Could not load saved scenarios.')
    } finally {
      setLoadingScenarios(false)
    }
  }

  const fetchTwoFaStatus = async () => {
    setLoadingStatus(true)
    try {
      const status = await getTwoFactorStatus()
      setTwoFaStatus(status)
    } catch {
      // Non-fatal — security section just won't show details
    } finally {
      setLoadingStatus(false)
    }
  }

  // ── Profile update ───────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      // phone changes are only via /phone/change flow
      await updateProfile({ displayName: displayName.trim() })
      toast.success('Profile updated successfully.')
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  // ── Scenario management ──────────────────────────────────────────────────────
  const handleDeleteScenario = async (id) => {
    try {
      await deleteScenario(id)
      setScenarios((prev) => prev.filter((s) => s.id !== id))
      toast.success('Scenario deleted.')
    } catch (err) {
      toast.error(err.message || 'Could not delete scenario.')
    }
  }

  // ── Account deletion ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete your account and all saved scenarios?'
      )
    ) {
      return
    }
    try {
      await deleteAccount()
      toast.info('Account deleted.')
      logout()
    } catch (err) {
      toast.error(err.message || 'Could not delete account.')
    }
  }

  const handleLogout = () => {
    logout()
    toast.info('Signed out successfully.')
  }

  // ── OTP challenge helpers ─────────────────────────────────────────────────────
  const dismissChallenge = () => {
    setOtpChallenge(null)
    setOtpError('')
  }

  const handleChallengeResend = useCallback(
    async (channel) => {
      const res = await resendOtp({ challengeId: otpChallenge.challengeId, channel })
      setOtpChallenge((prev) => ({ ...prev, resendAvailableAt: res.resendAvailableAt }))
      return res
    },
    [otpChallenge],
  )

  // ── Enable 2FA ────────────────────────────────────────────────────────────────
  const handleEnable2FA = async () => {
    setOtpError('')
    try {
      const res = await enableTwoFactor({ channel: 'SMS' })
      setOtpChallenge({ purpose: 'enable2fa', ...res })
    } catch (err) {
      toast.error(err.message || 'Could not start 2FA enable.')
    }
  }

  const handleEnable2FAVerify = async (code) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      const res = await enableTwoFactorVerify({ challengeId: otpChallenge.challengeId, code })
      setBackupCodes(res.backupCodes)
      dismissChallenge()
      await fetchTwoFaStatus()
      toast.success(t('auth.twoFaEnabled'))
    } catch (err) {
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // ── Disable 2FA ───────────────────────────────────────────────────────────────
  const handleDisable2FA = async () => {
    setOtpError('')
    try {
      // Reuse enable endpoint to get a fresh challenge — backend returns challengeId
      const res = await enableTwoFactor({ channel: 'SMS' })
      setOtpChallenge({ purpose: 'disable2fa', ...res })
    } catch (err) {
      toast.error(err.message || 'Could not start 2FA disable.')
    }
  }

  const [disablePassword, setDisablePassword] = useState('')
  const handleDisable2FAVerify = async (code) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      await disableTwoFactor({
        challengeId: otpChallenge.challengeId,
        password: disablePassword,
        code,
      })
      dismissChallenge()
      setDisablePassword('')
      await fetchTwoFaStatus()
      toast.success(t('auth.twoFaDisabled'))
    } catch (err) {
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // ── Regenerate backup codes ────────────────────────────────────────────────────
  const [regenPassword, setRegenPassword] = useState('')
  const handleRegenStart = async () => {
    setOtpError('')
    try {
      const res = await enableTwoFactor({ channel: 'SMS' })
      setOtpChallenge({ purpose: 'regen', ...res })
    } catch (err) {
      toast.error(err.message || 'Could not start backup code regeneration.')
    }
  }

  const handleRegenVerify = async (code) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      const res = await regenerateBackupCodes({
        challengeId: otpChallenge.challengeId,
        password: regenPassword,
        code,
      })
      setBackupCodes(res.backupCodes)
      dismissChallenge()
      setRegenPassword('')
      await fetchTwoFaStatus()
      toast.success(t('auth.backupCodesTitle'))
    } catch (err) {
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // ── Phone change ──────────────────────────────────────────────────────────────
  const handlePhoneChangeStart = async (e) => {
    e.preventDefault()
    if (!newPhoneLocal.trim()) return
    setPhoneChanging(true)
    try {
      const res = await changePhone({
        newPhoneE164: `+91${newPhoneLocal.trim()}`,
        channel: phoneChannel,
      })
      setOtpChallenge({ purpose: 'phoneChange', ...res })
      setShowPhoneChange(false)
    } catch (err) {
      toast.error(err.message || 'Could not start phone change.')
    } finally {
      setPhoneChanging(false)
    }
  }

  const handlePhoneChangeVerify = async (code) => {
    setOtpError('')
    setOtpSubmitting(true)
    try {
      await verifyPhoneChange({ challengeId: otpChallenge.challengeId, code })
      dismissChallenge()
      setNewPhoneLocal('')
      await fetchTwoFaStatus()
      toast.success(t('auth.changePhone'))
    } catch (err) {
      setOtpError(err.message || t('errors.generic'))
    } finally {
      setOtpSubmitting(false)
    }
  }

  // Dispatch OTP verify to the right handler based on active purpose
  const handleOtpSubmit = (code) => {
    if (!otpChallenge) return
    switch (otpChallenge.purpose) {
      case 'enable2fa':
        return handleEnable2FAVerify(code)
      case 'disable2fa':
        return handleDisable2FAVerify(code)
      case 'regen':
        return handleRegenVerify(code)
      case 'phoneChange':
        return handlePhoneChangeVerify(code)
      default:
        break
    }
  }

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently'

  // ── Render OTP challenge overlay ──────────────────────────────────────────────
  if (otpChallenge) {
    const needsPasswordInput =
      otpChallenge.purpose === 'disable2fa' || otpChallenge.purpose === 'regen'

    return (
      <div className="account-container">
        <div className="card auth-card">
          {needsPasswordInput && (
            <div className="form-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="confirm-password-field">{t('auth.password')}</label>
              <input
                id="confirm-password-field"
                type="password"
                autoComplete="current-password"
                value={
                  otpChallenge.purpose === 'disable2fa' ? disablePassword : regenPassword
                }
                onChange={(e) =>
                  otpChallenge.purpose === 'disable2fa'
                    ? setDisablePassword(e.target.value)
                    : setRegenPassword(e.target.value)
                }
                placeholder="Current password"
              />
            </div>
          )}
          <OtpInput
            challengeId={otpChallenge.challengeId}
            maskedPhone={otpChallenge.maskedPhone}
            channel={otpChallenge.channel}
            resendAvailableAt={otpChallenge.resendAvailableAt}
            showBackupCodeOption={false}
            isLoading={otpSubmitting}
            error={otpError}
            onSubmit={handleOtpSubmit}
            onResend={handleChallengeResend}
            onBack={dismissChallenge}
          />
        </div>
      </div>
    )
  }

  // ── Backup codes overlay ──────────────────────────────────────────────────────
  if (backupCodes) {
    return (
      <div className="account-container">
        <BackupCodesDisplay codes={backupCodes} onClose={() => setBackupCodes(null)} />
      </div>
    )
  }

  // ─── Main account page ────────────────────────────────────────────────────────
  return (
    <div className="account-container">
      {/* ── Profile header ── */}
      <div className="card profile-header-card">
        <div className="profile-identity">
          <div className="profile-avatar">
            {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div className="profile-name-row">
              <h2>{user?.displayName || 'User'}</h2>
              {user?.username && <span className="username-badge">@{user.username}</span>}
            </div>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              <span>Member since: {formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="secondary-button" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
          <button className="primary-button logout-button" onClick={handleLogout}>
            {t('auth.logout')}
          </button>
        </div>
      </div>

      {/* ── Profile edit (display name only) ── */}
      {editing && (
        <form className="card profile-edit-card" onSubmit={handleUpdateProfile}>
          <h3>Update your details</h3>
          <div className="field-row">
            <label>
              Display name
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={updating}>
            {updating ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}

      {/* ── Security section ── */}
      <section className="card security-section">
        <h3>{t('auth.security')}</h3>

        {loadingStatus ? (
          <p>Loading security status…</p>
        ) : twoFaStatus ? (
          <div className="security-grid">
            {/* Phone verification status */}
            <div className="security-row">
              <div>
                <strong>{t('auth.verifyPhone')}</strong>
                <div>
                  <StatusBadge
                    verified={twoFaStatus.phoneVerified}
                    labelYes={t('auth.phoneVerified')}
                    labelNo={t('auth.phoneUnverified')}
                  />
                  {twoFaStatus.maskedPhone && (
                    <span className="masked-phone"> {twoFaStatus.maskedPhone}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowPhoneChange(true)}
              >
                {t('auth.changePhone')}
              </button>
            </div>

            {/* 2FA status */}
            <div className="security-row">
              <div>
                <strong>{t('auth.twoFaEnabled')}</strong>
                <div>
                  <StatusBadge
                    verified={twoFaStatus.enabled}
                    labelYes={t('auth.twoFaEnabled')}
                    labelNo={t('auth.twoFaDisabled')}
                  />
                </div>
                {twoFaStatus.enabled && (
                  <div className="backup-codes-remaining">
                    {t('auth.backupCodesTitle')}: {twoFaStatus.backupCodesRemaining} remaining
                  </div>
                )}
              </div>
              <div className="security-2fa-actions">
                {twoFaStatus.enabled ? (
                  <>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={handleDisable2FA}
                      disabled={!twoFaStatus.phoneVerified}
                    >
                      {t('auth.twoFaToggleDisable')}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleRegenStart}
                      disabled={!twoFaStatus.phoneVerified}
                    >
                      {t('auth.backupCodesRegenerate')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleEnable2FA}
                    disabled={!twoFaStatus.phoneVerified}
                    title={
                      !twoFaStatus.phoneVerified ? 'Verify your phone number first' : undefined
                    }
                  >
                    {t('auth.twoFaToggleEnable')}
                  </button>
                )}
              </div>
            </div>

            {!twoFaStatus.phoneVerified && (
              <p className="security-hint">{t('auth.phoneUnverified')} — {t('auth.changePhone')}</p>
            )}
          </div>
        ) : (
          <p>Security status unavailable.</p>
        )}

        {/* Phone change form */}
        {showPhoneChange && (
          <form className="phone-change-form" onSubmit={handlePhoneChangeStart}>
            <h4>{t('auth.changePhoneTitle')}</h4>
            <div className="phone-input-row">
              <span className="phone-country-code">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                required
                placeholder="9876543210"
                maxLength={10}
                value={newPhoneLocal}
                onChange={(e) => setNewPhoneLocal(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <fieldset className="channel-fieldset">
              <legend>{t('auth.channelLabel')}</legend>
              <label className="channel-option">
                <input
                  type="radio"
                  name="phoneChannel"
                  value="SMS"
                  checked={phoneChannel === 'SMS'}
                  onChange={() => setPhoneChannel('SMS')}
                />
                {t('auth.channelSms')}
              </label>
              <label className="channel-option">
                <input
                  type="radio"
                  name="phoneChannel"
                  value="WHATSAPP"
                  checked={phoneChannel === 'WHATSAPP'}
                  onChange={() => setPhoneChannel('WHATSAPP')}
                />
                {t('auth.channelWhatsapp')}
              </label>
            </fieldset>
            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={phoneChanging}>
                {phoneChanging ? t('auth.submitting') : t('auth.verifyPhone')}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowPhoneChange(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Saved Scenarios section ── */}
      <section className="saved-scenarios-section">
        <div className="section-header-row">
          <div>
            <div className="section-label">SAVED SCENARIOS</div>
            <h2>Your financial models</h2>
          </div>
          <button
            className="secondary-button refresh-btn"
            onClick={fetchScenarios}
            disabled={loadingScenarios}
          >
            {loadingScenarios ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <DataState
          loading={loadingScenarios}
          error={scenariosError}
          empty={scenarios.length === 0}
          onRetry={fetchScenarios}
          skeletonCount={2}
          skeletonType="card"
          emptyMessage="You have not saved any calculation scenarios yet."
          emptySubtitle="Run any calculator to create and compare projection scenarios."
        >
          <div className="scenarios-grid">
            {scenarios.map((sc) => (
              <div key={sc.id} className="card scenario-item-card">
                <div className="scenario-item-header">
                  <div>
                    <span className="scenario-type-badge">{sc.scenarioType}</span>
                    <h3>{sc.name}</h3>
                  </div>
                  <button
                    className="delete-scenario-btn"
                    onClick={() => handleDeleteScenario(sc.id)}
                    aria-label={`Delete ${sc.name}`}
                  >
                    🗑
                  </button>
                </div>
                <div className="scenario-meta">
                  <span>Saved: {new Date(sc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </DataState>
      </section>

      {/* ── Danger Zone ── */}
      <div className="card danger-zone-card">
        <div>
          <h3>Delete account</h3>
          <p>
            Permanently remove your account and all associated saved scenarios. This cannot be
            undone.
          </p>
        </div>
        <button className="danger-button" onClick={handleDeleteAccount}>
          Delete account
        </button>
      </div>
    </div>
  )
}

export default AccountPage
