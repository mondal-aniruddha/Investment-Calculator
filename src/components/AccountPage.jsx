import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { request } from '../api'

export function AccountPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const toast = useToast()

  const [scenarios, setScenarios] = useState([])
  const [loadingScenarios, setLoadingScenarios] = useState(false)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setPhone(user.phone || '')
      fetchScenarios()
    }
  }, [user])

  const fetchScenarios = async () => {
    setLoadingScenarios(true)
    try {
      const data = await request('/api/v1/scenarios')
      setScenarios(Array.isArray(data) ? data : [])
    } catch {
      // Scenarios fail silently or empty
    } finally {
      setLoadingScenarios(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await request('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ displayName: displayName.trim(), phone: phone.trim() || null }),
      })
      toast.success('Profile updated successfully.')
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteScenario = async (id) => {
    try {
      await request(`/api/v1/scenarios/${id}`, { method: 'DELETE' })
      setScenarios((prev) => prev.filter((s) => s.id !== id))
      toast.success('Scenario deleted.')
    } catch (err) {
      toast.error(err.message || 'Could not delete scenario.')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account and all saved scenarios?')) {
      return
    }
    try {
      await request('/api/v1/auth/account', { method: 'DELETE' })
      toast.info('Account deleted.')
      logout()
    } catch (err) {
      toast.error(err.message || 'Could not delete account.')
    }
  }

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently'

  return (
    <div className="account-container">
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
              {user?.phone && <span>· Phone: {user.phone}</span>}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="secondary-button" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
          <button className="primary-button logout-button" onClick={logout}>
            {t('auth.logout')}
          </button>
        </div>
      </div>

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
            <label>
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={updating}>
            {updating ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}

      {/* Saved Scenarios section */}
      <section className="saved-scenarios-section">
        <div className="section-header-row">
          <div>
            <div className="section-label">SAVED SCENARIOS</div>
            <h2>Your financial models</h2>
          </div>
          <button className="secondary-button refresh-btn" onClick={fetchScenarios} disabled={loadingScenarios}>
            {loadingScenarios ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingScenarios ? (
          <div className="card loading-skeleton-wrapper" aria-busy="true">
            <div className="skeleton-bone" style={{ width: '100%', height: '5rem', marginBottom: '1rem' }} />
            <div className="skeleton-bone" style={{ width: '100%', height: '5rem' }} />
          </div>
        ) : scenarios.length === 0 ? (
          <div className="card empty-scenarios-card">
            <p>You have not saved any calculation scenarios yet.</p>
            <small>Run any calculator to create and compare projection scenarios.</small>
          </div>
        ) : (
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
        )}
      </section>

      {/* Danger Zone */}
      <div className="card danger-zone-card">
        <div>
          <h3>Delete account</h3>
          <p>Permanently remove your account and all associated saved scenarios. This cannot be undone.</p>
        </div>
        <button className="danger-button" onClick={handleDeleteAccount}>
          Delete account
        </button>
      </div>
    </div>
  )
}
