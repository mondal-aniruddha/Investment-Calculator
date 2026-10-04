/**
 * HomePage — Landing page.
 * Hero section → feature grid → how-it-works → CTA → live metal prices.
 */
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LiveMetalPrices } from '../components/shared/LiveMetalPrices'

const FEATURES = [
  { icon: '📈', title: 'SIP & Step-Up Planner', desc: 'Model your monthly SIP with annual step-ups and risk profiles. See corpus projections year by year.', path: '/sip' },
  { icon: '🏠', title: 'Loan & EMI Suite',        desc: 'Calculate EMI, balance transfer savings, prepayment impact, and floating-rate scenarios.',         path: '/loan' },
  { icon: '🏦', title: 'Fixed Income',             desc: 'FD, RD, PPF, EPF, NPS, SSY, Post Office — all at official rates with post-tax and inflation view.', path: '/fixed' },
  { icon: '💼', title: 'Mutual Fund Tools',        desc: 'Run SWP projections, compute CAGR on any two data points, or calculate XIRR from cash flows.',    path: '/mutual' },
  { icon: '🎯', title: 'Smart Planning',           desc: 'Financial health score, Monte Carlo retirement test, goal planner, tax optimizer, and net worth.', path: '/planning' },
  { icon: '📚', title: 'Education Hub',            desc: 'Searchable glossary of Indian finance terms and explainer articles. No jargon, no advice.',        path: '/education' },
]

const HOW_STEPS = [
  { num: 1, title: 'Enter your assumptions',   body: 'Fill in amount, rate, and horizon. Everything is pre-filled with sensible Indian defaults.' },
  { num: 2, title: 'Calculate instantly',       body: 'The Spring Boot backend runs the formula and returns a detailed projection in milliseconds.' },
  { num: 3, title: 'Interpret with confidence', body: 'View results, export a PDF/Excel report, or get an AI plain-language explanation of the numbers.' },
]

export default function HomePage({ setApiOnline }) {
  const navigate  = useNavigate()
  const heroRef   = useScrollReveal()
  const featRef   = useScrollReveal()
  const howRef    = useScrollReveal()

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-section" ref={heroRef}>
        <div className="reveal">
          <div className="hero-eyebrow">
            <span aria-hidden="true">✦</span> Your money, made clear
          </div>

          <h1 className="hero-title">
            Plan with clarity.<br />
            <em>Grow with intention.</em>
          </h1>

          <p className="hero-subtitle">
            Free, educational finance calculators built for India.
            SIP, EMI, tax, retirement, and more — all in INR, no advice, no sign-up required.
          </p>

          <div className="hero-cta-row">
            <button
              className="hero-cta-primary"
              onClick={() => navigate('/onboarding')}
            >
              Start your money map →
            </button>
            <a href="#features" className="hero-cta-secondary">
              See all calculators ↓
            </a>
          </div>

          <div className="hero-stats" aria-label="App statistics">
            <div className="hero-stat">
              <strong>10+</strong>
              <span>calculators</span>
            </div>
            <div className="hero-stat">
              <strong>INR</strong>
              <span>native currency</span>
            </div>
            <div className="hero-stat">
              <strong>0</strong>
              <span>paid features</span>
            </div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>educational</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live metal prices ─────────────────────────────────────────────── */}
      <LiveMetalPrices />

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section id="features" className="features-section" ref={featRef}>
        <div className="section-heading reveal">
          <span className="section-label">What's inside</span>
          <h2>Everything you need to plan your finances</h2>
          <p>Each calculator is backed by a Spring Boot engine using official Indian rates — no hardcoded guesses.</p>
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
            <span className="section-label">How it works</span>
            <h2>Three steps to a clearer picture</h2>
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
            Not sure where to start?
          </span>
          <h2 style={{ marginBottom: '20px' }}>Take the guided onboarding</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '28px', maxWidth: '480px', marginInline: 'auto' }}>
            Answer 5 questions and get personalised calculator recommendations based on your age, income, and goals.
          </p>
          <button className="hero-cta-primary" onClick={() => navigate('/onboarding')}>
            Start guided setup →
          </button>
        </div>
      </section>
    </>
  )
}
