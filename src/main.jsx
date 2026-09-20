import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const initialForm = {
  monthlyInvestment: 10000,
  investmentHorizonYears: 10,
  expectedAnnualReturn: 12,
  annualStepUpPercent: 10,
  riskProfile: 'MODERATE',
}

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    fetch('/actuator/health')
      .then((response) => setApiOnline(response.ok))
      .catch(() => setApiOnline(false))
  }, [])

  const update = (field) => (event) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const calculate = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/investing/sip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Please check your inputs and try again.')
      }
      setResult(payload)
      setApiOnline(true)
    } catch (requestError) {
      setError(requestError.message || 'The calculator could not reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  const chartPoints = useMemo(() => {
    if (!result?.yearlyBreakdown?.length) return []
    const values = result.yearlyBreakdown.map((point) => Number(point.corpusExpected || point.corpus || 0))
    const max = Math.max(...values, 1)
    return values.map((value, index) => ({
      year: index + 1,
      height: Math.max(8, (value / max) * 100),
      value,
    }))
  }, [result])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">↗</span>
          <span>in<span>finance</span></span>
        </a>
        <nav>
          <a className="active" href="#calculator">Calculator</a>
          <a href="#how-it-works">How it works</a>
          <a href="#insights">Insights</a>
        </nav>
        <div className="api-status">
          <span className={apiOnline ? 'status-dot online' : 'status-dot'} />
          {apiOnline ? 'API connected' : 'API offline'}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><span>✦</span> YOUR MONEY, MADE CLEAR</div>
          <h1>Build your future<br /><em>with intention.</em></h1>
          <p>Simple, thoughtful tools for the decisions that shape your financial life.</p>
          <div className="hero-stats">
            <div><strong>₹2.3 Cr</strong><span>Avg. projected corpus</span></div>
            <div><strong>12.0%</strong><span>Illustrative annual return</span></div>
            <div><strong>10 yrs</strong><span>Time to let money grow</span></div>
          </div>
        </section>

        <section className="calculator-layout" id="calculator">
          <form className="card calculator-card" onSubmit={calculate}>
            <div className="card-heading">
              <div>
                <div className="section-label">01 / START HERE</div>
                <h2>Plan your SIP</h2>
              </div>
              <span className="icon-badge">◒</span>
            </div>

            <label>
              Monthly investment
              <div className="input-with-prefix"><span>₹</span><input type="number" min="100" step="100" value={form.monthlyInvestment} onChange={update('monthlyInvestment')} /></div>
            </label>

            <div className="field-row">
              <label>Time horizon <div className="input-with-suffix"><input type="number" min="1" max="50" value={form.investmentHorizonYears} onChange={update('investmentHorizonYears')} /><span>years</span></div></label>
              <label>Expected return <div className="input-with-suffix"><input type="number" min="0" max="30" step="0.5" value={form.expectedAnnualReturn} onChange={update('expectedAnnualReturn')} /><span>% p.a.</span></div></label>
            </div>

            <label>
              Annual step-up
              <div className="range-value"><input type="range" min="0" max="30" step="1" value={form.annualStepUpPercent} onChange={update('annualStepUpPercent')} /><strong>{form.annualStepUpPercent}%</strong></div>
              <small>Increase your monthly investment each year as your income grows.</small>
            </label>

            <label>
              Risk profile
              <div className="segmented">
                {['LOW', 'MODERATE', 'AGGRESSIVE'].map((risk) => <button type="button" className={form.riskProfile === risk ? 'selected' : ''} key={risk} onClick={() => setForm((current) => ({ ...current, riskProfile: risk }))}>{risk[0] + risk.slice(1).toLowerCase()}</button>)}
              </div>
            </label>

            {error && <div className="error-message">{error}</div>}
            <button className="primary-button" disabled={loading} type="submit">{loading ? 'Calculating...' : 'Calculate my future'} <span>→</span></button>
            <p className="form-note">Illustrative projections, not financial advice.</p>
          </form>

          <div className="results-column">
            <div className="card result-card">
              <div className="result-topline"><div><div className="section-label">YOUR ESTIMATE</div><h2>{result ? formatINR(result.maturityCorpus) : '₹23,23,391'}</h2><p>Projected maturity corpus</p></div><div className="growth-pill">↗ {result ? `${form.expectedAnnualReturn}% p.a.` : '12% p.a.'}</div></div>
              <div className="metric-grid">
                <div><span>You invest</span><strong>{formatINR(result?.totalInvested || 1200000)}</strong></div>
                <div><span>Returns earned</span><strong className="green">{formatINR(result?.estimatedReturns || 1123391)}</strong></div>
                <div><span>Time horizon</span><strong>{form.investmentHorizonYears} years</strong></div>
              </div>
              <div className="chart">
                {chartPoints.length ? chartPoints.map((point) => <div className="bar-wrap" key={point.year}><div className="bar" style={{ height: `${point.height}%` }} title={formatINR(point.value)} /><span>{point.year}</span></div>) : <><div className="placeholder-chart"><span>Run the calculator to see your growth story</span></div></>}
              </div>
              <div className="chart-legend"><span><i className="legend-dot invested" /> Invested</span><span><i className="legend-dot growth" /> Growth</span></div>
            </div>

            <div className="scenario-row">
              <Scenario title="Conservative" value={result?.pessimisticScenario?.maturityCorpus} fallback="₹18.2 L" tone="blue" />
              <Scenario title="Expected" value={result?.expectedScenario?.maturityCorpus} fallback="₹23.2 L" tone="green" />
              <Scenario title="Optimistic" value={result?.optimisticScenario?.maturityCorpus} fallback="₹29.8 L" tone="orange" />
            </div>
          </div>
        </section>

        <section className="insight-strip" id="insights">
          <span className="insight-icon">✦</span>
          <div><strong>A little more today can mean a lot more tomorrow.</strong><p>A 10% annual step-up could help you build significantly more wealth without a big change to your starting investment.</p></div>
          <a href="#calculator">Try a step-up →</a>
        </section>
      </main>
      <footer><span>© 2025 inFinance</span><span>Made for more confident money decisions.</span><span>India · INR</span></footer>
    </div>
  )
}

function Scenario({ title, value, fallback, tone }) {
  return <div className="scenario-card"><span className={`scenario-line ${tone}`} /><div><span>{title}</span><strong>{value ? formatINR(value) : fallback}</strong></div><span className="scenario-arrow">↗</span></div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
