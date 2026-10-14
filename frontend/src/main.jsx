/**
 * InFinance — main.jsx
 * App entry point: sets up providers, router, and all page routes.
 * Business logic lives in page components and the Spring Boot backend.
 */
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

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
import { ErrorBoundary }  from './components/shared/ErrorBoundary'

// Pages
import HomePage          from './pages/HomePage'
import SipPage           from './pages/SipPage'
import LoanPage          from './pages/LoanPage'
import FixedIncomePage   from './pages/FixedIncomePage'
import MutualFundPage    from './pages/MutualFundPage'
import PlanningPage      from './pages/PlanningPage'
import OnboardingPage    from './pages/OnboardingPage'
import EducationPage     from './pages/EducationPage'
import AboutPage         from './pages/AboutPage'
import LearnHubPage      from './pages/LearnHubPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import GlossaryPage      from './pages/GlossaryPage'
import RoadmapPage       from './pages/RoadmapPage'
import PrivacyPage       from './pages/PrivacyPage'
import { AuthPage }      from './pages/AuthPage'
import { AccountPage }   from './pages/AccountPage'

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
    <ErrorBoundary level="root">
      <HelmetProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <AppShell apiOnline={apiOnline}>
                <ErrorBoundary level="route">
                  <Routes>
                    {/* ── Public pages ── */}
                    <Route path="/"               element={<HomePage setApiOnline={setApiOnline} />} />
                    <Route path="/learn"          element={<LearnHubPage />} />
                    <Route path="/learn/:slug"    element={<ArticleDetailPage />} />
                    <Route path="/glossary"       element={<GlossaryPage />} />
                    <Route path="/roadmap"        element={<RoadmapPage />} />
                    <Route path="/privacy"        element={<PrivacyPage />} />

                    {/* Calculators & Planning */}
                    <Route path="/sip"            element={<SipPage  setApiOnline={setApiOnline} />} />
                    <Route path="/loan"           element={<LoanPage setApiOnline={setApiOnline} />} />
                    <Route path="/fixed"          element={<FixedIncomePage setApiOnline={setApiOnline} />} />
                    <Route path="/mutual"         element={<MutualFundPage  setApiOnline={setApiOnline} />} />
                    <Route path="/planning"       element={<PlanningPage    setApiOnline={setApiOnline} />} />
                    <Route path="/onboarding"     element={<OnboardingPage />} />
                    <Route path="/about"          element={<AboutPage />} />
                    <Route path="/login"          element={<AuthPage initialMode="login" />} />
                    <Route path="/register"       element={<AuthPage initialMode="register" />} />

                    {/* SEO clean URL aliases */}
                    <Route path="/calculators/sip-calculator" element={<Navigate to="/sip" replace />} />
                    <Route path="/calculators/loan-emi"       element={<Navigate to="/loan" replace />} />
                    <Route path="/calculators/tax-regime"     element={<Navigate to="/planning" replace />} />

                    {/* Legacy redirects */}
                    <Route path="/education" element={<Navigate to="/glossary" replace />} />

                    {/* ── Protected page ── */}
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </AppShell>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

// ── Mount ──────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
