/**
 * PlanningPage — Smart planning hub.
 * Combines: Financial health score, Monte Carlo, Net worth, Goals,
 *           Tax optimizer, Sensitivity analysis.
 * All API calls and response processing remain identical to the original.
 */
import { useCalculator } from '../../../shared/hooks/useCalculator'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import {
  MoneyField, NumberField, ActionButton, ErrorBox,
  ProjectionChart, HowItWorks, CalcPageHeader,
} from '../../../shared/components/ui/index'
import { formatINR } from '../../../shared/lib/format'
import { LearnBeforeYouCalculate } from '../../../components/shared/LearnBeforeYouCalculate'

import { useHealthScoreForm } from '../../health-score/hooks/useHealthScoreForm'
import { useMonteCarloForm } from '../../retirement/hooks/useMonteCarloForm'
import { useNetWorthForm } from '../../net-worth/hooks/useNetWorthForm'
import { useGoalsForm } from '../../goals/hooks/useGoalsForm'
import { useTaxOptimizerForm } from '../../tax/hooks/useTaxOptimizerForm'

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

  const run = (path, body) => calc.run(path, { method: 'POST', body: JSON.stringify(body) })

  // Feature hooks
  const health = useHealthScoreForm(run)
  const monte = useMonteCarloForm(run)
  const networth = useNetWorthForm(run, calc.setFieldError)
  const goals = useGoalsForm(run, calc.setFieldError)
  const tax = useTaxOptimizerForm(run)

  const runSensitivity = () => {
    run('/api/v1/analysis/sensitivity', {
      monthlyInvestment: 25000,
      years: 15,
      expectedReturn: 12,
      inflationRate: 6,
    })
  }

  return (
    <>
      <CalcPageHeader
        label="05 / SMART PLANNING"
        title="Smart Planning Hub"
        subtitle="Six planning tools in one place: health score, Monte Carlo simulation, net worth tracker, goal planner, tax optimizer, and sensitivity analysis."
      />

      <LearnBeforeYouCalculate
        slug="old-vs-new-tax-regime"
        title="Old vs New Tax Regime — which saves you more?"
        summary="Most people choose the wrong regime and pay thousands extra in tax. Read the 5-min guide before you run the comparison."
        icon="⚖️"
      />

      <div ref={revealRef} className="reveal">
        <div className="planning-grid">

          {/* ── Health score ── */}
          <PlanCard label="HEALTH SCORE" title="Financial health score">
            {Object.entries(health.form).map(([key, value]) => (
              <NumberField
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                value={value}
                suffix={key === 'emergencyFundMonths' ? 'months' : '%'}
                onChange={health.update(key)}
                min={0} max={100}
              />
            ))}
            <ActionButton loading={calc.loading} onClick={health.handleSubmit} loadingLabel="Calculating…">
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
              <NumberField label="Monthly contribution" value={monte.form.monthlyContribution} suffix="₹" onChange={monte.update('monthlyContribution')} min={0} />
              <NumberField label="Years" value={monte.form.years} suffix="years" onChange={monte.update('years')} min={1} max={50} />
            </div>
            <div className="field-row">
              <NumberField label="Expected return" value={monte.form.expectedAnnualReturn} suffix="%" onChange={monte.update('expectedAnnualReturn')} min={1} />
              <NumberField label="Volatility (σ)" value={monte.form.annualVolatility} suffix="%" onChange={monte.update('annualVolatility')} min={0} />
            </div>
            <NumberField label="Target corpus" value={monte.form.targetCorpus} suffix="₹" onChange={monte.update('targetCorpus')} min={0} />
            <ActionButton loading={calc.loading} onClick={monte.handleSubmit} loadingLabel="Running…">
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
                value={networth.form.assets}
                onChange={networth.update('assets')}
                rows={3}
              />
            </label>
            <label>Liabilities (JSON)
              <textarea
                value={networth.form.liabilities}
                onChange={networth.update('liabilities')}
                rows={3}
              />
            </label>
            <label>History (JSON)
              <textarea
                value={networth.form.history}
                onChange={networth.update('history')}
                rows={2}
              />
            </label>
            <ActionButton loading={calc.loading} onClick={networth.handleSubmit} loadingLabel="Calculating…">
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
                value={goals.goalsJson}
                onChange={(e) => goals.setGoalsJson(e.target.value)}
                rows={4}
              />
            </label>
            <NumberField
              label="Available monthly savings"
              value={goals.availableMonthlySavings}
              suffix="₹"
              onChange={(e) => goals.setAvailableMonthlySavings(Number(e.target.value))}
            />
            <ActionButton loading={calc.loading} onClick={goals.handleSubmit} loadingLabel="Planning…">
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
            <MoneyField
              label="Gross annual salary (₹)"
              value={tax.form.grossSalary}
              onChange={tax.update('grossSalary')}
            />
            <div className="field-row">
              <NumberField label="80C used" value={tax.form.section80C} suffix="₹" onChange={tax.update('section80C')} />
              <NumberField label="NPS used" value={tax.form.section80CCD1BNps} suffix="₹" onChange={tax.update('section80CCD1BNps')} />
            </div>
            <ActionButton
              loading={calc.loading}
              onClick={tax.handleSubmit}
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
              onClick={runSensitivity}
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
