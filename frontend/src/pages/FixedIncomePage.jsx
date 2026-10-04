/**
 * FixedIncomePage — FD / RD / PPF / EPF / NPS / SSY / Post Office calculator.
 * API: POST /api/v1/fixed-income/calculate
 * Logic identical to original.
 */
import { useState } from 'react'
import { useCalculator } from '../hooks/useCalculator'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  MoneyField, NumberField, SelectField, SubmitButton, ErrorBox,
  HowItWorks, TipsCard, CalculatorLayout, CalcPageHeader,
} from '../components/ui/index'
import { ResultCard } from '../components/ui/ResultCard'

const initial = {
  scheme: 'FD',
  contribution: 100000,
  tenureYears: 5,
  annualRate: '',
  taxRate: 20,
  inflationRate: 6,
}

const SCHEME_LABELS = {
  FD: 'Fixed Deposit (FD)',
  RD: 'Recurring Deposit (RD)',
  PPF: 'Public Provident Fund (PPF)',
  EPF: 'Employee Provident Fund (EPF)',
  NPS: 'National Pension System (NPS)',
  SSY: 'Sukanya Samriddhi Yojana (SSY)',
  POST_OFFICE: 'Post Office Time Deposit',
}

const TIPS = [
  'PPF (7.1% p.a.) offers tax-free returns and qualifies for 80C deduction — ideal for conservative long-term savings.',
  'EPF (8.25% p.a.) beats most fixed deposits on an after-tax basis because employer contributions are exempt from tax.',
  'FD interest above ₹40,000 per year (₹50,000 for seniors) attracts TDS at 10%; always factor in the post-tax yield.',
]

export default function FixedIncomePage({ setApiOnline }) {
  const [form, setForm] = useState(initial)
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()

  const update = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = { ...form, annualRate: form.annualRate === '' ? null : Number(form.annualRate) }
    calc.run('/api/v1/fixed-income/calculate', { method: 'POST', body: JSON.stringify(body) })
  }

  return (
    <>
      <CalcPageHeader
        label="03 / STABILITY"
        title="Fixed-Income Calculators"
        subtitle="Compare FD, RD, PPF, EPF, NPS, SSY, and Post Office schemes at their official rates with post-tax and inflation-adjusted results."
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
            <SelectField label="Scheme" value={form.scheme} onChange={update('scheme')}>
              {Object.entries(SCHEME_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </SelectField>

            <MoneyField
              label={form.scheme === 'RD' ? 'Monthly contribution (₹)' : 'Contribution (₹)'}
              value={form.contribution}
              onChange={update('contribution')}
              min={100}
              required
            />

            <div className="field-row">
              <NumberField
                label="Tenure"
                value={form.tenureYears}
                suffix="years"
                onChange={update('tenureYears')}
                min={1} max={50}
              />
              <NumberField
                label="Your tax rate"
                value={form.taxRate}
                suffix="%"
                onChange={update('taxRate')}
                min={0} max={42}
              />
            </div>

            <NumberField
              label="Override rate (leave blank for official rate)"
              value={form.annualRate}
              suffix="% p.a."
              onChange={update('annualRate')}
              min={0} max={30}
            />

            <NumberField
              label="Assumed inflation rate"
              value={form.inflationRate}
              suffix="%"
              onChange={update('inflationRate')}
              min={0} max={20}
            />

            <SubmitButton loading={calc.loading} label="Calculate maturity value" />
            <ErrorBox text={calc.error} />
          </form>

          <div className="results-column">
            <ResultCard
              result={calc.result}
              primary="maturityValue"
              invested="totalContribution"
              returns="interestEarned"
              title="Maturity value"
              loading={calc.loading}
            />
          </div>
        </CalculatorLayout>
      </div>

      <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-4)' }}>
        <TipsCard tips={TIPS} />
        <HowItWorks text="Scheme rates are read from the externalized configuration (official Ministry of Finance / EPFO / PFRDA rates). The result also shows a post-tax value and inflation-adjusted purchasing power. Verify current official rates before making a decision." />
      </div>
    </>
  )
}
