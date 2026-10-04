/**
 * AppShell — sticky navbar + floating orbs + footer + page wrapper.
 * Handles: theme toggle, mobile hamburger, language picker, auth menu,
 * API status indicator, and page-level fade transition on route change.
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Nav entries: [path, i18n key, label fallback]
const NAV_ITEMS = [
  ['/sip',       'nav.sip',       'SIP Planner'],
  ['/loan',      'nav.loan',      'Loan & EMI'],
  ['/fixed',     'nav.fixed',     'Fixed Income'],
  ['/mutual',    'nav.mutual',    'Mutual Funds'],
  ['/planning',  'nav.planning',  'Smart Planning'],
  ['/onboarding','nav.onboarding','Onboarding'],
  ['/education', 'nav.education', 'Education'],
]

// ── User account dropdown ─────────────────────────────────────────────────
function UserNavMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t }    = useTranslation()
  const [open, setOpen] = useState(false)
  const toast    = useToast()
  const navigate = useNavigate()
  const ref      = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!isAuthenticated || !user) {
    return (
      <Link to="/login" className="sign-in-nav-btn">
        {t('auth.tabLogin')}
      </Link>
    )
  }

  const initial = (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()

  const handleLogout = () => {
    logout()
    toast.info('Signed out successfully.')
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('auth.userMenu')}
      >
        <span className="user-avatar-badge" aria-hidden="true">{initial}</span>
        <span className="user-name-text">{user.displayName || user.username || user.email}</span>
        <span style={{ fontSize: '10px' }} aria-hidden="true">▼</span>
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <Link
            to="/account"
            className="dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">👤</span>
            <span>{t('nav.account')}</span>
          </Link>
          <div className="dropdown-divider" role="separator" />
          <button
            className="dropdown-item"
            role="menuitem"
            onClick={handleLogout}
            style={{ color: 'var(--error)' }}
          >
            <span aria-hidden="true">🚪</span>
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main AppShell ──────────────────────────────────────────────────────────
export function AppShell({ children, apiOnline }) {
  const { dark, toggle } = useTheme()
  const { t }            = useTranslation()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="app-shell">
      {/* ── Floating gradient orbs ── */}
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Sticky top navbar ── */}
      <header className="topbar">
        <div className="container topbar-inner">
          {/* Brand */}
          <Link className="brand" to="/" aria-label="InFinance home">
            <span className="brand-mark" aria-hidden="true">↗</span>
            <span>in<span>finance</span></span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation">
            <ul className="nav-links">
              {NAV_ITEMS.map(([path, key, fallback]) => (
                <li key={path}>
                  <button
                    className="nav-button"
                    aria-current={isActive(path) ? 'page' : undefined}
                    onClick={() => navigate(path)}
                  >
                    {t(key, fallback)}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/about"
                  aria-current={location.pathname === '/about' ? 'page' : undefined}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Topbar actions */}
          <div className="topbar-actions">
            {/* API status */}
            <div className="api-status" aria-live="polite" aria-label={apiOnline ? t('common.connected') : t('common.offline')}>
              <span className={apiOnline ? 'status-dot online' : 'status-dot'} />
              <span className="sr-only">{apiOnline ? t('common.connected') : t('common.offline')}</span>
            </div>

            {/* Language picker */}
            <label className="language-picker" aria-label={t('common.language')}>
              <span className="sr-only">{t('common.language')}</span>
              <select
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value)
                  localStorage.setItem('infinance-language', e.target.value)
                }}
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
              </select>
            </label>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={dark}
            >
              {dark ? '☀' : '◐'}
            </button>

            {/* Auth menu */}
            <UserNavMenu />

            {/* Mobile hamburger */}
            <button
              className="hamburger"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {NAV_ITEMS.map(([path, key, fallback]) => (
          <button
            key={path}
            aria-current={isActive(path) ? 'page' : undefined}
            onClick={() => navigate(path)}
          >
            {t(key, fallback)}
          </button>
        ))}
        <div className="mobile-menu-divider" />
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
      </nav>

      {/* ── Main content ── */}
      <main className="app-main" id="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <span style={{ fontSize: '18px' }}>↗</span>
                <span>in<span style={{ color: 'var(--accent-muted)' }}>finance</span></span>
              </div>
              <p className="footer-disclaimer">
                {t('common.disclaimer')} All projections are illustrative estimates based on configured assumptions.
                Consult a SEBI-registered financial advisor or Chartered Accountant before making any financial decisions.
                Data sourced from official Ministry of Finance, EPFO, and PFRDA notifications.
              </p>
              <p className="footer-disclaimer" style={{ marginTop: '4px' }}>
                © 2025 InFinance · India · INR · Not SEBI-registered · Not financial advice
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-links-row">
                <Link to="/">Home</Link>
                <Link to="/sip">SIP</Link>
                <Link to="/loan">Loan</Link>
                <Link to="/fixed">Fixed Income</Link>
                <Link to="/planning">Planning</Link>
              </div>
              <div className="footer-links-row">
                <Link to="/education">Education</Link>
                <Link to="/onboarding">Onboarding</Link>
                <Link to="/about">About & Disclaimer</Link>
              </div>
              <p className="footer-copy">
                Built with ♥ for Indian personal finance
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
