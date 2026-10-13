/**
 * HomePage — Complete landing page for InFinance.
 * Built with progressive enhancement, sober & restrained animations,
 * token-based design system, full i18n support (EN, HI, BN),
 * WCAG AA contrast, and zero layout shift.
 */
import { useState, useId, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useReveal } from '../hooks/useReveal'
import { LiveMetalPrices } from '../components/shared/LiveMetalPrices'
import '../styles/home.css'

// ── Number formatting helpers ────────────────────────────────────────────────
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val))
}

function formatINRLakh(val) {
  const num = Number(val || 0)
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`
  }
  return formatINR(num)
}

// ── Smooth Count-Up hook (respects prefers-reduced-motion) ────────────────────
function useCountUp(targetVal, duration = 650) {
  const [currentVal, setCurrentVal] = useState(targetVal)
  const prevValRef = useRef(targetVal)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setCurrentVal(targetVal)
      prevValRef.current = targetVal
      return
    }

    const start = prevValRef.current
    const diff = targetVal - start
    if (diff === 0) return

    let startTime = null
    let frameId = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCurrentVal(Math.round(start + diff * easeOut))

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        prevValRef.current = targetVal
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [targetVal, duration])

  return currentVal
}

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Section reveal refs (IntersectionObserver)
  const trustRef = useReveal()
  const calcsRef = useReveal()
  const teaserRef = useReveal()
  const howRef = useReveal()
  const whyRef = useReveal()
  const learnRef = useReveal()
  const disclaimerRef = useReveal()

  // ── Quick SIP Estimator State ──
  const [monthly, setMonthly] = useState(10000)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(12)

  const monthlySliderId = useId()
  const yearsSliderId = useId()
  const rateSliderId = useId()

  // Standard SIP Future Value calculation:
  // M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
  const months = years * 12
  const monthlyRate = rate / 100 / 12
  const totalInvested = monthly * months
  const maturityCorpus =
    monthlyRate > 0
      ? Math.round(monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
      : totalInvested
  const estimatedReturns = Math.max(0, maturityCorpus - totalInvested)

  // Animated count-up values for the teaser results
  const animatedMaturity = useCountUp(maturityCorpus)
  const animatedInvested = useCountUp(totalInvested)
  const animatedReturns = useCountUp(estimatedReturns)

  // Calculator catalog items
  const calculatorsList = [
    {
      id: 'sip',
      path: '/sip',
      title: t('home.calculators.sip.title'),
      desc: t('home.calculators.sip.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      id: 'loan',
      path: '/loan',
      title: t('home.calculators.loan.title'),
      desc: t('home.calculators.loan.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'fixed',
      path: '/fixed',
      title: t('home.calculators.fixed.title'),
      desc: t('home.calculators.fixed.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: 'mutual',
      path: '/mutual',
      title: t('home.calculators.mutual.title'),
      desc: t('home.calculators.mutual.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8l-8 8" />
          <path d="M8 8v8h8" />
        </svg>
      ),
    },
    {
      id: 'tax',
      path: '/planning',
      title: t('home.calculators.tax.title'),
      desc: t('home.calculators.tax.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'retirement',
      path: '/planning',
      title: t('home.calculators.retirement.title'),
      desc: t('home.calculators.retirement.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      id: 'smart',
      path: '/planning',
      title: t('home.calculators.smart.title'),
      desc: t('home.calculators.smart.desc'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>{t('home.seo.title', 'Plan your money with clarity · InFinance')}</title>
        <meta
          name="description"
          content={t('home.seo.description', 'Free, educational personal-finance calculators for India. Calculate SIP, Loan & EMI, PPF, NPS, Tax regimes, SWP, and Retirement in ₹ with transparent math.')}
        />
        <meta property="og:title" content="InFinance — Plan your money with clarity" />
        <meta
          property="og:description"
          content="Free, INR-native educational financial calculators for India. Calculate SIP, Loans, Fixed Income, Tax Regimes, and Retirement."
        />
        <meta property="og:url" content="https://infinance-home.netlify.app/" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── 1. HERO SECTION ────────────────────────────────────────────────── */}
      <section className="home-hero-section" aria-labelledby="hero-title">
        <div className="home-hero-grid">
          {/* Left Column: Headline, Subhead, CTAs */}
          <div className="hero-copy-col">
            <div className="hero-badge-pill">
              <span aria-hidden="true">✦</span> {t('home.hero.eyebrow', 'YOUR MONEY, MADE CLEAR · INDIA · INR')}
            </div>

            <h1 id="hero-title" className="hero-main-h1">
              {t('home.hero.title', 'Plan your money with clarity')}
            </h1>

            <p className="hero-subhead-p">
              {t('home.hero.subtitle', 'Free, INR-native, educational calculators for Indian investments, loans, and long-term decisions. Transparent assumptions, no sales pitches, no login required.')}
            </p>

            <div className="hero-actions-group">
              <button
                type="button"
                className="hero-cta-btn-primary"
                onClick={() => navigate('/sip')}
              >
                <span>{t('home.hero.ctaPrimary', 'Start a SIP plan')}</span>
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="hero-cta-btn-secondary"
                onClick={() => navigate('/learn')}
              >
                <span>{t('home.hero.ctaSecondary', 'Explore the Learn Hub')}</span>
                <span aria-hidden="true">📖</span>
              </button>
            </div>
          </div>

          {/* Right Column: Illustrative SIP Projection Card (Inline SVG) */}
          <div className="hero-illustration-card" aria-label="Illustrative SIP projection card">
            <div className="chart-card-header">
              <span className="chart-card-badge">{t('home.hero.illustration.badge', 'Illustrative example')}</span>
              <h2 className="chart-card-title">{t('home.hero.illustration.title', '15-Year SIP Growth Scenario')}</h2>
            </div>

            {/* SVG Chart with 3 Scenario Bands */}
            <svg
              className="chart-svg-container"
              viewBox="0 0 420 230"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="SIP 15-year growth projection graph showing conservative, expected, and optimistic trajectories"
            >
              <defs>
                <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#71a34b" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#71a34b" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#234b3c" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#234b3c" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="190" x2="390" y2="190" stroke="var(--line)" strokeWidth="1" />
              <line x1="40" y1="140" x2="390" y2="140" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="390" y2="90" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="40" x2="390" y2="40" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Shaded Scenario Bands (Fade in smoothly) */}
              <polygon
                className="svg-fade-band"
                points="40,190 120,175 220,135 320,75 390,30 390,85 320,125 220,165 120,182 40,190"
                fill="url(#optGrad)"
              />
              <polygon
                className="svg-fade-band"
                points="40,190 120,180 220,150 320,105 390,65 390,120 320,150 220,174 120,186 40,190"
                fill="url(#expGrad)"
              />

              {/* Invested Principal Base Line */}
              <line x1="40" y1="190" x2="390" y2="148" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Conservative (8%) Path */}
              <path
                className="svg-fade-band"
                d="M 40 190 Q 200 178 390 120"
                stroke="#e1a378"
                strokeWidth="2"
                strokeDasharray="4 2"
                fill="none"
              />

              {/* Optimistic (15%) Path */}
              <path
                className="svg-fade-band"
                d="M 40 190 Q 230 140 390 30"
                stroke="#71a34b"
                strokeWidth="2"
                fill="none"
              />

              {/* Expected (12%) Main Drawing Line */}
              <path
                className="svg-draw-line"
                d="M 40 190 Q 215 155 390 65"
                stroke="var(--accent)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Data Marker Dots */}
              <circle cx="390" cy="30" r="4" fill="#71a34b" className="svg-fade-band" />
              <circle cx="390" cy="65" r="5" fill="var(--accent)" className="svg-fade-band" />
              <circle cx="390" cy="120" r="4" fill="#e1a378" className="svg-fade-band" />
              <circle cx="390" cy="148" r="3.5" fill="var(--ink-faint)" className="svg-fade-band" />

              {/* Axis Labels */}
              <text x="40" y="208" fill="var(--ink-muted)" fontSize="10" fontFamily="var(--font-mono)">0</text>
              <text x="150" y="208" fill="var(--ink-muted)" fontSize="10" fontFamily="var(--font-mono)">5 yrs</text>
              <text x="265" y="208" fill="var(--ink-muted)" fontSize="10" fontFamily="var(--font-mono)">10 yrs</text>
              <text x="365" y="208" fill="var(--ink-muted)" fontSize="10" fontFamily="var(--font-mono)">15 yrs</text>

              {/* Callout Badges */}
              <g className="svg-fade-label">
                <rect x="270" y="48" width="115" height="22" rx="4" fill="var(--bg-card)" stroke="var(--line)" />
                <text x="278" y="63" fill="var(--ink)" fontSize="10.5" fontWeight="600" fontFamily="var(--font-mono)">
                  Expected: ₹50.5L
                </text>
              </g>
            </svg>

            {/* Legend & Summary */}
            <div className="chart-legend-row">
              <div className="legend-item">
                <span className="legend-dot opt" aria-hidden="true" />
                <span>{t('home.hero.illustration.optimisticLabel', 'Optimistic (15%)')}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot exp" aria-hidden="true" />
                <span><strong>{t('home.hero.illustration.expectedLabel', 'Expected (12%)')}</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot con" aria-hidden="true" />
                <span>{t('home.hero.illustration.pessimisticLabel', 'Conservative (8%)')}</span>
              </div>
              <div className="legend-item" style={{ color: 'var(--ink-faint)' }}>
                <span>{t('home.hero.illustration.investedValue', 'Invested: ₹18.0L')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ─────────────────────────────────────────────────── */}
      <section className="trust-strip-section" ref={trustRef} aria-label="Trust assurances">
        <div className="trust-pills-row">
          <div className="trust-pill">
            <span className="trust-pill-icon" aria-hidden="true">✓</span>
            <span>{t('home.trust.free', 'Free to use')}</span>
          </div>
          <div className="trust-pill">
            <span className="trust-pill-icon" aria-hidden="true">₹</span>
            <span>{t('home.trust.inr', 'INR & Indian number formatting')}</span>
          </div>
          <div className="trust-pill">
            <span className="trust-pill-icon" aria-hidden="true">🌐</span>
            <span>{t('home.trust.languages', 'English · हिन्दी · বাংলা')}</span>
          </div>
          <div className="trust-pill">
            <span className="trust-pill-icon" aria-hidden="true">🛡️</span>
            <span>{t('home.trust.educational', 'Educational, not advice')}</span>
          </div>
        </div>
      </section>

      {/* ── 3. CALCULATOR GRID ────────────────────────────────────────────── */}
      <section id="calculators" className="calculators-section" ref={calcsRef} aria-labelledby="calc-suite-heading">
        <div className="section-title-wrap">
          <span className="section-eyebrow">{t('home.calculators.eyebrow', 'COMPLETE FINANCIAL SUITE')}</span>
          <h2 id="calc-suite-heading" className="section-heading-h2">
            {t('home.calculators.title', 'Financial calculators for India')}
          </h2>
          <p className="section-desc-p">
            {t('home.calculators.subtitle', 'Accurate, explainable math tailored for Indian tax regimes, banking products, and investment instruments.')}
          </p>
        </div>

        <div className="calc-grid-container">
          {calculatorsList.map((c, index) => (
            <Link
              key={c.id}
              to={c.path}
              className={`calc-card-item stagger-${index + 1}`}
              aria-label={`${c.title} — ${c.desc}`}
            >
              <div>
                <div className="calc-icon-bubble">{c.icon}</div>
                <h3 className="calc-card-title">{c.title}</h3>
                <p className="calc-card-desc">{c.desc}</p>
              </div>
              <div className="calc-card-link-cta">
                <span>{t('home.calculators.openCta', 'Open calculator →')}</span>
                <span className="calc-card-arrow" aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. QUICK CALCULATOR TEASER ────────────────────────────────────── */}
      <section className="teaser-section" ref={teaserRef} aria-labelledby="teaser-heading">
        <div className="teaser-card-box">
          <div className="teaser-inner-grid">
            {/* Left Column: Sliders */}
            <div className="teaser-controls-col">
              <div>
                <span className="section-eyebrow">{t('home.teaser.eyebrow', 'QUICK ESTIMATOR')}</span>
                <h2 id="teaser-heading" className="section-heading-h2" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                  {t('home.teaser.title', 'Interactive SIP Estimator')}
                </h2>
                <p className="section-desc-p" style={{ fontSize: '0.92rem' }}>
                  {t('home.teaser.subtitle', 'See how modest monthly investments compound over time before opening full planning options.')}
                </p>
              </div>

              {/* Slider 1: Monthly Investment */}
              <div className="slider-group-wrap">
                <div className="slider-header-row">
                  <label htmlFor={monthlySliderId}>{t('home.teaser.monthlyLabel', 'Monthly investment')}</label>
                  <span className="slider-val-badge">{formatINR(monthly)}</span>
                </div>
                <input
                  id={monthlySliderId}
                  className="range-slider-input"
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  aria-valuemin="1000"
                  aria-valuemax="100000"
                  aria-valuenow={monthly}
                />
              </div>

              {/* Slider 2: Investment Duration */}
              <div className="slider-group-wrap">
                <div className="slider-header-row">
                  <label htmlFor={yearsSliderId}>{t('home.teaser.tenureLabel', 'Time horizon')}</label>
                  <span className="slider-val-badge">{years} {t('home.teaser.tenureUnit', 'years')}</span>
                </div>
                <input
                  id={yearsSliderId}
                  className="range-slider-input"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  aria-valuemin="1"
                  aria-valuemax="30"
                  aria-valuenow={years}
                />
              </div>

              {/* Slider 3: Expected Return */}
              <div className="slider-group-wrap">
                <div className="slider-header-row">
                  <label htmlFor={rateSliderId}>{t('home.teaser.returnLabel', 'Expected annual return')}</label>
                  <span className="slider-val-badge">{rate}%</span>
                </div>
                <input
                  id={rateSliderId}
                  className="range-slider-input"
                  type="range"
                  min="5"
                  max="20"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  aria-valuemin="5"
                  aria-valuemax="20"
                  aria-valuenow={rate}
                />
              </div>
            </div>

            {/* Right Column: Live Computation Results & Assumptions */}
            <div className="teaser-results-col">
              <div className="result-total-block">
                <div className="result-total-label">{t('home.teaser.projectedTotal', 'Projected maturity value')}</div>
                <div className="result-total-amount" aria-live="polite">
                  {formatINR(animatedMaturity)}
                </div>
                <small style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  ({formatINRLakh(animatedMaturity)})
                </small>
              </div>

              <div className="result-metrics-row">
                <div className="result-metric-card">
                  <div className="metric-label">{t('home.teaser.investedAmount', 'Total invested')}</div>
                  <div className="metric-val">{formatINR(animatedInvested)}</div>
                </div>
                <div className="result-metric-card">
                  <div className="metric-label">{t('home.teaser.estimatedReturns', 'Estimated wealth gain')}</div>
                  <div className="metric-val gain">+{formatINR(animatedReturns)}</div>
                </div>
              </div>

              <div className="assumptions-box">
                <strong>{t('home.teaser.assumptionsTitle', 'Assumptions')}:</strong>
                <span>• {t('home.teaser.assumption1', 'Monthly compounding at a constant annual nominal rate.')}</span><br />
                <span>• {t('home.teaser.assumption2', 'Pre-tax projection without deduction for capital gains tax.')}</span><br />
                <span>• {t('home.teaser.assumption3', 'Investments made at the start of each monthly cycle.')}</span>
              </div>

              <Link to="/sip" className="teaser-full-plan-link">
                <span>{t('home.teaser.fullPlanLink', 'See full plan in SIP planner →')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="how-section-wrap" ref={howRef} aria-labelledby="how-heading">
        <div className="section-title-wrap">
          <span className="section-eyebrow">{t('home.howItWorks.eyebrow', 'THE INFINANCE METHOD')}</span>
          <h2 id="how-heading" className="section-heading-h2">
            {t('home.howItWorks.title', 'How it works')}
          </h2>
          <p className="section-desc-p">
            {t('home.howItWorks.subtitle', 'A straightforward, explainable workflow designed to give you clarity without overwhelm.')}
          </p>
        </div>

        <div className="how-steps-grid">
          <div className="how-step-tile stagger-1">
            <span className="step-num-bubble">{t('home.howItWorks.step1.num', '01')}</span>
            <h3>{t('home.howItWorks.step1.title', 'Enter your numbers')}</h3>
            <p>{t('home.howItWorks.step1.desc', 'Input your savings, salary, or loan amounts. Calculations run statelessly in your browser with zero data harvesting.')}</p>
          </div>

          <div className="how-step-tile stagger-2">
            <span className="step-num-bubble">{t('home.howItWorks.step2.num', '02')}</span>
            <h3>{t('home.howItWorks.step2.title', 'See explainable results with scenarios')}</h3>
            <p>{t('home.howItWorks.step2.desc', 'Review mathematical results alongside optimistic, expected, and conservative scenario bands with explicit assumptions.')}</p>
          </div>

          <div className="how-step-tile stagger-3">
            <span className="step-num-bubble">{t('home.howItWorks.step3.num', '03')}</span>
            <h3>{t('home.howItWorks.step3.title', 'Save, compare and export')}</h3>
            <p>{t('home.howItWorks.step3.desc', 'Bookmark scenarios for comparison side-by-side or download clean PDF and Excel summaries for your records.')}</p>
          </div>
        </div>
      </section>

      {/* ── 6. WHY INFINANCE ──────────────────────────────────────────────── */}
      <section className="why-section-wrap" ref={whyRef} aria-labelledby="why-heading">
        <div className="section-title-wrap">
          <span className="section-eyebrow">{t('home.why.eyebrow', 'WHY CHOOSE INFINANCE')}</span>
          <h2 id="why-heading" className="section-heading-h2">
            {t('home.why.title', 'Built with purpose and integrity')}
          </h2>
          <p className="section-desc-p">
            {t('home.why.subtitle', 'We believe personal finance tools should empower citizens with clarity, not sell high-commission products.')}
          </p>
        </div>

        <div className="why-tiles-grid">
          <div className="why-tile-item stagger-1">
            <div className="why-tile-icon" aria-hidden="true">💡</div>
            <div className="why-tile-content">
              <h3>{t('home.why.tile1.title', 'Explainable results')}</h3>
              <p>{t('home.why.tile1.desc', 'Every mathematical formula and benchmark rate is displayed in plain view. No hidden assumptions or black-box predictions.')}</p>
            </div>
          </div>

          <div className="why-tile-item stagger-2">
            <div className="why-tile-icon" aria-hidden="true">⚖️</div>
            <div className="why-tile-content">
              <h3>{t('home.why.tile2.title', 'Scenario comparison')}</h3>
              <p>{t('home.why.tile2.desc', 'Markets do not offer guaranteed straight lines. We test your goals across optimistic, expected, and conservative market phases.')}</p>
            </div>
          </div>

          <div className="why-tile-item stagger-3">
            <div className="why-tile-icon" aria-hidden="true">🌐</div>
            <div className="why-tile-content">
              <h3>{t('home.why.tile3.title', 'Multilingual & accessible')}</h3>
              <p>{t('home.why.tile3.desc', 'Available natively in English, हिन्दी, and বাংলা. Crafted with WCAG AA contrast, keyboard accessibility, and screen-reader semantics.')}</p>
            </div>
          </div>

          <div className="why-tile-item stagger-4">
            <div className="why-tile-icon" aria-hidden="true">🔒</div>
            <div className="why-tile-content">
              <h3>{t('home.why.tile4.title', 'Privacy-minded')}</h3>
              <p>{t('home.why.tile4.desc', 'Calculations run statelessly. Optional registered accounts store saved financial scenarios with end-to-end encryption.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. LIVE METALS REFERENCE PRICES ───────────────────────────────── */}
      <div className="home-metals-wrapper" aria-label="Reference metal prices panel">
        <LiveMetalPrices />
      </div>

      {/* ── 8. LEARN HUB / ROADMAP TEASER ─────────────────────────────────── */}
      <section className="learn-teaser-section" ref={learnRef} aria-labelledby="learn-heading">
        <div className="section-title-wrap">
          <span className="section-eyebrow">{t('home.learnTeaser.eyebrow', 'LEARN BEFORE YOU INVEST')}</span>
          <h2 id="learn-heading" className="section-heading-h2">
            {t('home.learnTeaser.title', 'From our Learn Hub')}
          </h2>
          <p className="section-desc-p">
            {t('home.learnTeaser.subtitle', 'Bite-sized, jargon-free guides to master foundational personal finance concepts.')}
          </p>
        </div>

        <div className="learn-articles-grid">
          <Link to="/learn" className="learn-article-card stagger-1" aria-label={t('home.learnTeaser.article1.title')}>
            <div>
              <span className="article-category-tag">{t('home.learnTeaser.article1.tag', 'INVESTING')}</span>
              <h3 className="article-headline">{t('home.learnTeaser.article1.title', 'SIP vs Lumpsum: Which is right for your investment style?')}</h3>
              <p className="article-summary">{t('home.learnTeaser.article1.desc', 'Understand dollar-cost averaging versus timing market dips in Indian mutual funds.')}</p>
            </div>
            <div className="article-read-link">
              <span>{t('home.learnTeaser.readGuide', 'Read guide →')}</span>
            </div>
          </Link>

          <Link to="/learn" className="learn-article-card stagger-2" aria-label={t('home.learnTeaser.article2.title')}>
            <div>
              <span className="article-category-tag">{t('home.learnTeaser.article2.tag', 'TAX PLANNING')}</span>
              <h3 className="article-headline">{t('home.learnTeaser.article2.title', 'Old vs New Tax Regime: How to decide your break-even point')}</h3>
              <p className="article-summary">{t('home.learnTeaser.article2.desc', 'Compare tax brackets, standard deduction, and Section 80C exemptions to minimize your tax liability.')}</p>
            </div>
            <div className="article-read-link">
              <span>{t('home.learnTeaser.readGuide', 'Read guide →')}</span>
            </div>
          </Link>

          <Link to="/learn" className="learn-article-card stagger-3" aria-label={t('home.learnTeaser.article3.title')}>
            <div>
              <span className="article-category-tag">{t('home.learnTeaser.article3.tag', 'RETIREMENT')}</span>
              <h3 className="article-headline">{t('home.learnTeaser.article3.title', 'How much corpus do you need to retire safely in India?')}</h3>
              <p className="article-summary">{t('home.learnTeaser.article3.desc', 'A realistic formula factoring in medical inflation, life expectancy, and post-retirement withdrawal rates.')}</p>
            </div>
            <div className="article-read-link">
              <span>{t('home.learnTeaser.readGuide', 'Read guide →')}</span>
            </div>
          </Link>
        </div>

        {/* Roadmap Banner CTA */}
        <div className="roadmap-cta-banner">
          <div className="roadmap-cta-text">
            <h3>Follow the 6-Step Beginner Roadmap</h3>
            <p>From your first salary to emergency fund, insurance, first SIP, and tax planning — check off milestones at your own pace.</p>
          </div>
          <Link to="/roadmap" className="roadmap-cta-btn">
            <span>{t('home.learnTeaser.roadmapCta', 'Follow the 6-Step Beginner Roadmap →')}</span>
          </Link>
        </div>
      </section>

      {/* ── 9. DISCLAIMER ─────────────────────────────────────────────────── */}
      <section className="home-disclaimer-box" ref={disclaimerRef} aria-label="Educational Disclaimer">
        <strong>{t('home.disclaimer.title', 'Educational Disclaimer')}: </strong>
        <span>{t('home.disclaimer.text', 'InFinance is an educational platform and is not registered with SEBI as an investment adviser or research analyst. All computations, charts, and simulations are mathematical estimates for learning purposes only. Tax laws, interest rates, and regulations change; verify details with official sources (RBI, Income Tax Dept, EPFO). Consult a certified financial planner or Chartered Accountant before taking financial actions.')}</span>
      </section>
    </>
  )
}
