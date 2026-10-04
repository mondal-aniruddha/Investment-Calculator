/**
 * PlanningPage — Smart planning hub.
 * Combines: Financial health score, Monte Carlo, Net worth, Goals,
 *           Tax optimizer, Sensitivity analysis.
 * All API calls are identical to the original PlanningPage.
 */
import { useState } from 'react'
import { useCalculator } from '../hooks/useCalculator'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  MoneyField, NumberField, ActionButton, ErrorBox,
  ProjectionChart, HowItWorks, CalcPageHeader,
} from '../components/ui/index'
import { formatINR } from '../utils/format'

// ── Reusable planning result panel ──────────────────────────────────────
function PlanResult({ children }) {
  return <div className="planning-result">{children}</div>
}

// ── Individual planning card ─────────────────────────────────────────────
function PlanCard({ label, title, children }) {
  return (
    <div className="card calculator-card">
      <div className="section-label">{label}</div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function PlanningPage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()

  // Health score state
  const [health, setHealth] = useState({
    savingsRatePercent: 20, emergencyFundMonths: 4, debtToIncomePercent: 30,
    insuranceCoveragePercent: 60, creditUtilizationPercent: 25, retirementReadinessPercent: 45,
  })

  // Monte Carlo state
  const [monte, setMonte] = useState({
    initialCorpus: 500000, monthlyContribution: 25000, years: 15,
    expectedAnnualReturn: 10, annualVolatility: 12, inflationRate: 6,
    targetCorpus: 10000000, runs: 1000, seed: 42,
  })

  // Net worth state
  const [networth, setNetworth] = useState({
    assets: '[{"category":"Equity","amount":500000}]',
    liabilities: '[{"category":"Loan","amount":200000}]',
    history: '[{"date":"2025-01-01","netWorth":300000}]',
  })

  const updateH = (key) => (e) =>
    setHealth((p) => ({ ...p, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const updateM = (key) => (e) =>
    setMonte((p)  => ({ ...p, [key]: Number(e.target.value) }))

  const run = (path, body) => calc.run(path, { method: 'POST', body: JSON.stringify(body) })

  const runNetWorth = () => {
    try {
      run('/api/v1/net-worth/calculate', {
        assets: JSON.parse(networth.assets),
        liabilities: JSON.parse(networth.liabilities),
        history: JSON.parse(networth.history),
      })
    } catch { /* invalid JSON — no-op */ }
  }

  const runGoals = () => {
    try {
      const el = document.getElementById('goals-json')
      run('/api/v1/goals/plan', {
        goals: JSON.parse(el.value),
        availableMonthlySavings: 25000,
      })
    } catch { /* invalid JSON — no-op */ }
  }

  return (
    <>
      <CalcPageHeader
        label="05 / SMART PLANNING"
        title="Smart Planning Hub"
        subtitle="Six planning tools in one place: health score, Monte Carlo simulation, net worth tracker, goal planner, tax optimizer, and sensitivity analysis."
      />

      <div ref={revealRef} className="reveal">
        <div className="planning-grid">

          {/* ── Health score ── */}
          <PlanCard label="HEALTH SCORE" title="Financial health score">
            {Object.entries(health).map(([key, value]) => (
              <NumberField
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                value={value}
                suffix={key === 'emergencyFundMonths' ? 'months' : '%'}
                onChange={updateH(key)}
                min={0} max={100}
              />
            ))}
            <ActionButton loading={calc.loading} onClick={() => run('/api/v1/health-score/calculate', health)} loadingLabel="Calculating…">
              Calculate score
            </ActionButton>
            {calc.result?.score !== undefined && (
              <PlanResult>
                <strong>{calc.result.score}/100</strong>
                <span>{calc.result.band}</span>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{calc.result.topImprovements?.join(' · ')}</p>
              </PlanResult>
            )}
          </PlanCard>

          {/* ── Monte Carlo ── */}
          <PlanCard label="SIMULATION" title="Monte Carlo retirement test">
            <div className="field-row">
              <NumberField label="Monthly contribution" value={monte.monthlyContribution} suffix="₹" onChange={updateM('monthlyContribution')} min={0} />
              <NumberField label="Years" value={monte.years} suffix="years" onChange={updateM('years')} min={1} max={50} />
            </div>
            <div className="field-row">
              <NumberField label="Expected return" value={monte.expectedAnnualReturn} suffix="%" onChange={updateM('expectedAnnualReturn')} min={1} />
              <NumberField label="Volatility (σ)" value={monte.annualVolatility} suffix="%" onChange={updateM('annualVolatility')} min={0} />
            </div>
            <NumberField label="Target corpus" value={monte.targetCorpus} suffix="₹" onChange={updateM('targetCorpus')} min={0} />
            <ActionButton loading={calc.loading} onClick={() => run('/api/v1/simulations/monte-carlo', monte)} loadingLabel="Running…">
              Run simulation
            </ActionButton>
            {calc.result?.successProbabilityPercent !== undefined && (
              <PlanResult>
                <strong>{calc.result.successProbabilityPercent}%</strong>
                <span>probability of reaching target</span>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  10th: {formatINR(calc.result.percentile10)} · Median: {formatINR(calc.result.percentile50)} · 90th: {formatINR(calc.result.percentile90)}
                </p>
              </PlanResult>
            )}
          </PlanCard>

          {/* ── Net worth ── */}
          <PlanCard label="NET WORTH" title="Track assets and liabilities">
            <label>Assets (JSON)
              <textarea
                value={networth.assets}
                onChange={(e) => setNetworth({ ...networth, assets: e.target.value })}
                rows={3}
              />
            </label>
            <label>Liabilities (JSON)
              <textarea
                value={networth.liabilities}
                onChange={(e) => setNetworth({ ...networth, liabilities: e.target.value })}
                rows={3}
              />
            </label>
            <label>History (JSON)
              <textarea
                value={networth.history}
                onChange={(e) => setNetworth({ ...networth, history: e.target.value })}
                rows={2}
              />
            </label>
            <ActionButton loading={calc.loading} onClick={runNetWorth} loadingLabel="Calculating…">
              Calculate net worth
            </ActionButton>
            {calc.result?.netWorth !== undefined && (
              <PlanResult>
                <strong>{formatINR(calc.result.netWorth)}</strong>
                <span>current net worth</span>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Assets {formatINR(calc.result.totalAssets)} · Liabilities {formatINR(calc.result.totalLiabilities)}
                </p>
              </PlanResult>
            )}
          </PlanCard>

          {/* ── Goals ── */}
          <PlanCard label="GOALS" title="Fund multiple goals">
            <label>Goals (JSON)
              <textarea
                id="goals-json"
                defaultValue='[{"name":"Home","targetAmount":3000000,"monthsUntilGoal":120,"priority":1,"expectedAnnualReturn":10,"currentSavings":500000}]'
                rows={4}
              />
            </label>
            <NumberField label="Available monthly savings" value={25000} suffix="₹" onChange={() => {}} />
            <ActionButton loading={calc.loading} onClick={runGoals} loadingLabel="Planning…">
              Plan goals
            </ActionButton>
            {calc.result?.totalRequiredMonthlyInvestment !== undefined && (
              <PlanResult>
                <strong>{formatINR(calc.result.totalRequiredMonthlyInvestment)}</strong>
                <span>required monthly</span>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  {calc.result.exceedsAvailableSavings ? '⚠ Savings shortfall detected.' : '✓ Goals fit the available savings.'}
                </p>
              </PlanResult>
            )}
          </PlanCard>

          {/* ── Tax optimizer ── */}
          <PlanCard label="TAX" title="Tax-saving optimizer">
            <MoneyField label="Gross annual salary (₹)" value={1500000} onChange={() => {}} />
            <div className="field-row">
              <NumberField label="80C used" value={50000} suffix="₹" onChange={() => {}} />
              <NumberField label="NPS used" value={0} suffix="₹" onChange={() => {}} />
            </div>
            <ActionButton
              loading={calc.loading}
              onClick={() => run('/api/v1/tax/optimizer', { grossSalary: 1500000, section80C: 50000, section80DMedicalInsurance: 0, section80CCD1BNps: 0 })}
              loadingLabel="Optimising…"
            >
              Optimise deductions
            </ActionButton>
            {calc.result?.estimatedAdditionalOldRegimeTaxSaved !== undefined && (
              <PlanResult>
                <strong>{formatINR(calc.result.estimatedAdditionalOldRegimeTaxSaved)}</strong>
                <span>estimated additional tax saved (old regime)</span>
              </PlanResult>
            )}
          </PlanCard>

          {/* ── Sensitivity ── */}
          <PlanCard label="WHAT-IF" title="Sensitivity analysis">
            <div className="field-row">
              <NumberField label="Monthly investment" value={25000} suffix="₹" onChange={() => {}} />
              <NumberField label="Years" value={15} suffix="years" onChange={() => {}} />
            </div>
            <div className="field-row">
              <NumberField label="Expected return" value={12} suffix="%" onChange={() => {}} />
              <NumberField label="Inflation rate" value={6} suffix="%" onChange={() => {}} />
            </div>
            <ActionButton
              loading={calc.loading}
              onClick={() => run('/api/v1/analysis/sensitivity', { monthlyInvestment: 25000, years: 15, expectedReturn: 12, inflationRate: 6 })}
              loadingLabel="Comparing…"
            >
              Compare scenarios
            </ActionButton>
            {calc.result?.scenarios && (
              <ProjectionChart
                points={calc.result.scenarios.map((s) => ({ year: `${s.variable}-${s.direction}`, value: s.corpus }))}
                title="Sensitivity scenarios"
              />
            )}
          </PlanCard>

          {/* ── Disclaimer ── */}
          <div style={{ gridColumn: '1 / -1' }}>
            <HowItWorks text="Smart planning combines goal affordability, health signals, net-worth snapshots, configured tax limits, deterministic Monte Carlo ranges, and sensitivity analysis. These are planning aids, not predictions or advice." />
            {calc.error && <ErrorBox text={calc.error} />}
          </div>

        </div>
      </div>
    </>
  )
}
