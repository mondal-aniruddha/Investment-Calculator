/**
 * HomePage — Landing page.
 * Hero section → feature grid → how-it-works → CTA → live metal prices.
 */
import { useNavigate, Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LiveMetalPrices } from '../components/shared/LiveMetalPrices'
import { SEO } from '../components/shared/SEO'
import { Term } from '../components/shared/Term'

const FEATURES = [
  { icon: '📖', title: 'Learn Hub', desc: '15 jargon-free starter guides on SIP, PPF, NPS, CIBIL, Tax Regimes, and Insurance in ₹.', path: '/learn' },
  { icon: '🗺️', title: 'Beginner Roadmap', desc: 'Visual 6-step checklist from your first salary to retirement with interactive progress tracking.', path: '/roadmap' },
  { icon: '📈', title: 'SIP & Step-Up Planner', desc: 'Model your monthly SIP with annual step-ups and risk profiles. See corpus projections year by year.', path: '/sip' },
  { icon: '⚖️', title: 'Tax & Smart Planning', desc: 'Old vs New Tax Regime comparator, Section 80C optimizer, and retirement corpus modeling.', path: '/planning' },
  { icon: '🏠', title: 'Loan & EMI Suite', desc: 'Calculate EMI, balance transfer savings, prepayment impact, and floating-rate scenarios.', path: '/loan' },
  { icon: '🏦', title: 'Fixed Income', desc: 'FD, RD, PPF, EPF, NPS, SSY — all at official government rates with post-tax and inflation view.', path: '/fixed' },
  { icon: '💼', title: 'Mutual Fund Tools', desc: 'Run SWP projections, compute CAGR on any two data points, or calculate XIRR from cash flows.', path: '/mutual' },
  { icon: '📚', title: 'Jargon Glossary', desc: 'Hover over any financial acronym for a friendly one-line definition, or browse the dictionary.', path: '/glossary' },
]

const HOW_STEPS = [
  { num: 1, title: 'Learn the core concept', body: 'Read a 4-minute jargon-free guide with real Indian examples in ₹ (no confusing Wall Street jargon).' },
  { num: 2, title: 'Calculate with your numbers', body: 'Test your own salary, savings, or EMI. Calculations run statelessly in milliseconds without saving your data.' },
  { num: 3, title: 'Take action with confidence', body: 'Understand your next steps, avoid common traps, and build wealth with clear, disciplined habits.' },
]

export default function HomePage({ setApiOnline }) {
  const navigate  = useNavigate()
  const heroRef   = useScrollReveal()
  const featRef   = useScrollReveal()
  const howRef    = useScrollReveal()

  return (
    <>
      <SEO
        title="Plan with Clarity · Grow with Intention"
        description="Trustworthy, beginner-friendly financial learning destination and calculators for young Indians (18–30). SIP, Old vs New Tax, Loans, Emergency Fund, and PPF."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'InFinance',
          url: 'https://infinance-home.netlify.app',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'All',
          description: 'Free Indian personal finance calculators and learning hub.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR'
          }
        }}
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-section" ref={heroRef}>
        <div className="reveal">
          <div className="hero-eyebrow">
            <span aria-hidden="true">✦</span> MADE FOR YOUNG INDIANS (18–30) · NEW TO MONEY
          </div>

          <h1 className="hero-title">
            Plan with clarity.<br />
            <em>Grow with intention.</em>
          </h1>

          <p className="hero-subtitle">
            A trustworthy, beginner-friendly learning destination and calculator suite for India.
            Learn <Term term="SIP" />, master your <Term term="CIBIL" /> score, compare Old vs New Tax, and calculate <Term term="CAGR" /> — completely free, login-free, and stateless.
          </p>

          <div className="hero-cta-row">
            <button
              className="hero-cta-primary"
              onClick={() => navigate('/roadmap')}
            >
              Start Beginner Roadmap →
            </button>
            <button
              className="hero-cta-secondary"
              onClick={() => navigate('/learn')}
            >
              Explore Learn Hub 📖
            </button>
          </div>

          <div className="hero-stats" aria-label="App statistics">
            <div className="hero-stat">
              <strong>15</strong>
              <span>starter guides</span>
            </div>
            <div className="hero-stat">
              <strong>INR (₹)</strong>
              <span>native currency</span>
            </div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>stateless &amp; private</span>
            </div>
            <div className="hero-stat">
              <strong>0</strong>
              <span>signup needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live metal prices ─────────────────────────────────────────────── */}
      <LiveMetalPrices />

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section id="features" className="features-section" ref={featRef}>
        <div className="section-heading reveal">
          <span className="section-label">LEARN &amp; CALCULATE</span>
          <h2>Your personal finance toolkit</h2>
          <p>Every tool is backed by official Indian rates (RBI, Income Tax Dept, EPFO) — no biased sales pitches or product promotions.</p>
        </div>

        <div className="features-grid reveal-stagger">
          {FEATURES.map(({ icon, title, desc, path }) => (
            <a
              key={path}
              className="card feature-card hover-lift"
              href={path}
              onClick={(e) => { e.preventDefault(); navigate(path) }}
              aria-label={`Open ${title}`}
            >
              <div className="feature-icon" aria-hidden="true">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="feature-card-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="how-section" ref={howRef}>
        <div style={{ padding: '0 clamp(24px,6vw,80px)' }}>
          <div className="section-heading reveal">
            <span className="section-label">THE INFINANCE WAY</span>
            <h2>Three steps to financial confidence</h2>
          </div>
          <div className="how-steps reveal-stagger">
            {HOW_STEPS.map(({ num, title, body }) => (
              <div key={num} className="how-step">
                <div className="how-step-num" aria-hidden="true">{num}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: 'clamp(40px,6vw,80px) 0' }}>
        <div className="reveal">
          <span className="section-label" style={{ display: 'block', marginBottom: '12px' }}>
            NEW JOB? FIRST SALARY?
          </span>
          <h2 style={{ marginBottom: '16px' }}>Take the 6-Step Beginner Roadmap</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '28px', maxWidth: '520px', marginInline: 'auto' }}>
            Track your financial foundation step-by-step: 50/30/20 budget, emergency fund, insurance, first SIP, and tax planning.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="hero-cta-primary" onClick={() => navigate('/roadmap')}>
              Open Beginner Roadmap →
            </button>
            <button className="hero-cta-secondary" onClick={() => navigate('/onboarding')}>
              Take 5-Question Survey
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
