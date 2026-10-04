/**
 * SipPage — SIP & Step-Up calculator.
 * API: POST /api/v1/investing/sip
 * Logic identical to original; restructured with new design components.
 */
import { useState } from 'react'
import { useCalculator } from '../hooks/useCalculator'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  MoneyField, NumberField, SelectField, SubmitButton, ErrorBox,
  ProjectionChart, HowItWorks, TipsCard, CalculatorLayout, CalcPageHeader,
} from '../components/ui/index'
import { ResultCard } from '../components/ui/ResultCard'

const initial = {
  monthlyInvestment: 10000,
  investmentHorizonYears: 10,
  expectedAnnualReturn: 12,
  annualStepUpPercent: 10,
  riskProfile: 'MODERATE',
}

const TIPS = [
  'Starting a SIP early makes a bigger difference than investing a large amount later — time amplifies compounding.',
  'A 10 % annual step-up (increasing SIP by 10% each year) can nearly double your final corpus over 15 years.',
  'Expected return is not guaranteed. Use 10–12% for equity, 6–8% for hybrid, and 5–7% for debt as rough guides.',
]

export default function SipPage({ setApiOnline }) {
  const [form, setForm] = useState(initial)
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()

  const update = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    calc.run('/api/v1/investing/sip', { method: 'POST', body: JSON.stringify(form) })
  }

  return (
    <>
      <CalcPageHeader
        label="01 / INVESTING"
        title="SIP & Step-Up Planner"
        subtitle="Model a Systematic Investment Plan with an optional annual step-up. See how regular contributions compound over time."
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          {/* ── Form ── */}
          <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
            <MoneyField
              label="Monthly investment (₹)"
              value={form.monthlyInvestment}
              onChange={update('monthlyInvestment')}
              min={100}
              required
            />
            <div className="field-row">
              <NumberField
                label="Time horizon"
                value={form.investmentHorizonYears}
                suffix="years"
                onChange={update('investmentHorizonYears')}
                min={1} max={50}
              />
              <NumberField
                label="Expected return"
                value={form.expectedAnnualReturn}
                suffix="% p.a."
                onChange={update('expectedAnnualReturn')}
                min={1} max={30}
              />
            </div>
            <NumberField
              label="Annual step-up"
              value={form.annualStepUpPercent}
              suffix="%"
              onChange={update('annualStepUpPercent')}
              min={0} max={50}
            />
            <SelectField label="Risk profile" value={form.riskProfile} onChange={update('riskProfile')}>
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </SelectField>
            <SubmitButton loading={calc.loading} label="Calculate SIP corpus" />
            <ErrorBox text={calc.error} />
          </form>

          {/* ── Results column ── */}
          <div className="results-column">
            <ResultCard
              result={calc.result}
              primary="maturityCorpus"
              invested="totalInvested"
              returns="estimatedReturns"
              title="Projected SIP corpus"
              loading={calc.loading}
            />
            {calc.result?.yearlyProjections && (
              <ProjectionChart
                points={calc.result.yearlyProjections.map((y) => ({ year: y.year, value: y.corpus }))}
                title="Yearly SIP growth"
              />
            )}
          </div>
        </CalculatorLayout>
      </div>

      <div className="results-column" style={{ marginTop: 'var(--space-4)' }}>
        <TipsCard tips={TIPS} />
        <HowItWorks text="A SIP invests the selected amount monthly. The step-up option increases that contribution once per year. The backend compounds each instalment at the configured annual return and returns scenario and yearly projections." />
      </div>
    </>
  )
}
