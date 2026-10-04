/**
 * MutualFundPage — SWP (Systematic Withdrawal Plan) calculator.
 * API: POST /api/v1/mutual-funds/swp
 * Logic identical to original.
 */
import { useState } from 'react'
import { useCalculator } from '../hooks/useCalculator'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  MoneyField, NumberField, SubmitButton, ErrorBox,
  ProjectionChart, HowItWorks, TipsCard, CalculatorLayout, CalcPageHeader,
} from '../components/ui/index'
import { ResultCard } from '../components/ui/ResultCard'

const initial = {
  initialCorpus: 1000000,
  annualReturn: 10,
  monthlyWithdrawal: 10000,
  tenureYears: 10,
  annualWithdrawalIncrease: 5,
}

const TIPS = [
  'The "safe withdrawal rate" in India is typically 4–5% of corpus per year, adjusted for inflation.',
  'Stepping up withdrawals annually to match inflation (5–6%) keeps your purchasing power steady.',
  'If your monthly withdrawal exceeds returns, the corpus depletes — check that the plan sustains the full tenure.',
]

export default function MutualFundPage({ setApiOnline }) {
  const [form, setForm] = useState(initial)
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()

  const update = (key) => (e) => setForm({ ...form, [key]: Number(e.target.value) })

  const handleSubmit = (e) => {
    e.preventDefault()
    calc.run('/api/v1/mutual-funds/swp', { method: 'POST', body: JSON.stringify(form) })
  }

  return (
    <>
      <CalcPageHeader
        label="04 / FLEXIBILITY"
        title="Mutual Fund Tools — SWP"
        subtitle="Model a Systematic Withdrawal Plan: how long will your corpus last at your chosen monthly withdrawal rate?"
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
            <MoneyField
              label="Starting corpus (₹)"
              value={form.initialCorpus}
              onChange={update('initialCorpus')}
              min={10000}
              required
            />
            <div className="field-row">
              <NumberField
                label="Expected return"
                value={form.annualReturn}
                suffix="% p.a."
                onChange={update('annualReturn')}
                min={1} max={30}
              />
              <MoneyField
                label="Monthly withdrawal (₹)"
                value={form.monthlyWithdrawal}
                onChange={update('monthlyWithdrawal')}
                min={100}
              />
            </div>
            <div className="field-row">
              <NumberField
                label="Tenure"
                value={form.tenureYears}
                suffix="years"
                onChange={update('tenureYears')}
                min={1} max={50}
              />
              <NumberField
                label="Annual withdrawal step-up"
                value={form.annualWithdrawalIncrease}
                suffix="%"
                onChange={update('annualWithdrawalIncrease')}
                min={0} max={30}
              />
            </div>
            <SubmitButton loading={calc.loading} label="Run SWP projection" />
            <ErrorBox text={calc.error} />
          </form>

          <div className="results-column">
            <ResultCard
              result={calc.result}
              primary="remainingCorpus"
              invested="withdrawalTotal"
              returns="annualizedReturn"
              title="Remaining SWP corpus"
              loading={calc.loading}
            />
            <ProjectionChart
              points={calc.result?.projection || []}
              title="Corpus depletion over time"
            />
          </div>
        </CalculatorLayout>
      </div>

      <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-4)' }}>
        <TipsCard tips={TIPS} />
        <HowItWorks text="An SWP grows the corpus monthly at the expected return and withdraws a scheduled amount. The withdrawal can step up annually. Use the separate API endpoints for SIP, lumpsum, CAGR, and XIRR workflows." />
      </div>
    </>
  )
}
