import { useId } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatINR, formatINRLakh } from '../../../shared/lib/format'
import { useQuickSipEstimator } from '../hooks/useQuickSipEstimator'

export function QuickSipEstimator() {
  const { t } = useTranslation()
  const monthlySliderId = useId()
  const yearsSliderId = useId()
  const rateSliderId = useId()

  const {
    monthly,
    setMonthly,
    years,
    setYears,
    rate,
    setRate,
    animatedMaturity,
    animatedInvested,
    animatedReturns,
  } = useQuickSipEstimator(10000, 10, 12)

  return (
    <div className="teaser-card-box">
      <div className="teaser-inner-grid">
        {/* Left Column: Interactive Sliders */}
        <div className="teaser-controls-col">
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="teaser-pill-tag">
              {t('home.teaser.pill', 'Quick SIP Estimator')}
            </span>
            <h2 id="teaser-heading" className="section-heading-h2" style={{ marginTop: '0.4rem', fontSize: '1.5rem' }}>
              {t('home.teaser.heading', 'Interactive SIP Estimator')}
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
  )
}
