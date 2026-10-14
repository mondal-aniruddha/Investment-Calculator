import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import HomePage from '../features/home/pages/HomePage'
import SipPage from '../features/sip/pages/SipPage'
import LoanPage from '../features/loans/pages/LoanPage'
import FixedIncomePage from '../features/fixed-income/pages/FixedIncomePage'
import MutualFundPage from '../features/mutual-funds/pages/MutualFundPage'
import PlanningPage from '../features/planning/pages/PlanningPage'
import OnboardingPage from '../pages/OnboardingPage'
import AboutPage from '../pages/AboutPage'
import LearnHubPage from '../features/learn/pages/LearnHubPage'
import ArticleDetailPage from '../features/learn/pages/ArticleDetailPage'
import GlossaryPage from '../features/glossary/pages/GlossaryPage'
import RoadmapPage from '../pages/RoadmapPage'
import PrivacyPage from '../pages/PrivacyPage'
import { AuthPage } from '../features/auth/pages/AuthPage'
import { AccountPage } from '../features/auth/pages/AccountPage'

import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'

export function AppRoutes({ setApiOnline }) {
  return (
    <Routes>
      {/* ── Public pages ── */}
      <Route path="/" element={<HomePage setApiOnline={setApiOnline} />} />
      <Route path="/learn" element={<LearnHubPage />} />
      <Route path="/learn/:slug" element={<ArticleDetailPage />} />
      <Route path="/glossary" element={<GlossaryPage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Calculators & Planning */}
      <Route path="/sip" element={<SipPage setApiOnline={setApiOnline} />} />
      <Route path="/loan" element={<LoanPage setApiOnline={setApiOnline} />} />
      <Route path="/fixed" element={<FixedIncomePage setApiOnline={setApiOnline} />} />
      <Route path="/mutual" element={<MutualFundPage setApiOnline={setApiOnline} />} />
      <Route path="/planning" element={<PlanningPage setApiOnline={setApiOnline} />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />

      {/* SEO clean URL aliases */}
      <Route path="/calculators/sip-calculator" element={<Navigate to="/sip" replace />} />
      <Route path="/calculators/loan-emi" element={<Navigate to="/loan" replace />} />
      <Route path="/calculators/tax-regime" element={<Navigate to="/planning" replace />} />

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
  )
}
