/**
 * InFinance — main.jsx
 * App entry point: sets up providers, router, and all page routes.
 * Business logic lives in page components and the Spring Boot backend.
 */
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Styles — import order matters: tokens → animations → components
import './styles/index.css'
import './styles/animations.css'
import './styles/components.css'

// i18n (must be imported early)
import './i18n'

// Providers + layout
import { ToastProvider } from './context/ToastContext'
import { AuthProvider }  from './context/AuthContext'
import { AppShell }      from './layouts/AppShell'

// Shared components
import { ProtectedRoute } from './components/shared/ProtectedRoute'

// Pages
import HomePage         from './pages/HomePage'
import SipPage          from './pages/SipPage'
import LoanPage         from './pages/LoanPage'
import FixedIncomePage  from './pages/FixedIncomePage'
import MutualFundPage   from './pages/MutualFundPage'
import PlanningPage     from './pages/PlanningPage'
import OnboardingPage   from './pages/OnboardingPage'
import EducationPage    from './pages/EducationPage'
import AboutPage        from './pages/AboutPage'
import { AuthPage }     from './pages/AuthPage'
import { AccountPage }  from './pages/AccountPage'

// API URL helper
import { getApiUrl } from './services/api'

// ── Root App component ─────────────────────────────────────────────────────
function App() {
  const [apiOnline, setApiOnline] = useState(false)

  // Poll backend health on mount
  useEffect(() => {
    fetch(getApiUrl('/actuator/health'))
      .then((r) => setApiOnline(r.ok))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppShell apiOnline={apiOnline}>
            <Routes>
              {/* ── Public pages ── */}
              <Route path="/"           element={<HomePage setApiOnline={setApiOnline} />} />
              <Route path="/sip"        element={<SipPage  setApiOnline={setApiOnline} />} />
              <Route path="/loan"       element={<LoanPage setApiOnline={setApiOnline} />} />
              <Route path="/fixed"      element={<FixedIncomePage setApiOnline={setApiOnline} />} />
              <Route path="/mutual"     element={<MutualFundPage  setApiOnline={setApiOnline} />} />
              <Route path="/planning"   element={<PlanningPage    setApiOnline={setApiOnline} />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/education"  element={<EducationPage />} />
              <Route path="/about"      element={<AboutPage />} />
              <Route path="/login"      element={<AuthPage initialMode="login" />} />
              <Route path="/register"   element={<AuthPage initialMode="register" />} />

              {/* ── Protected page ── */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AppShell>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

// ── Mount ──────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
