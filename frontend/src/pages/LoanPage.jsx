/**
 * LoanPage — EMI & loan suite calculator.
 * API: POST /api/v1/loans/emi
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

const initial = { principal: 2500000, tenureYears: 20, annualInterestRate: 8.5 }

const TIPS = [
  'For a home loan, a 1% lower interest rate on ₹50L over 20 years saves approximately ₹6–7 lakh in total interest.',
  'Making one extra EMI per year (13 instead of 12) can cut a 20-year loan term by 3–4 years.',
  'Compare the effective annual rate (EAR) when banks quote monthly reducing rates — the annualised figure is higher.',
]

export default function LoanPage({ setApiOnline }) {
  const [form, setForm] = useState(initial)
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()

  const update = (key) => (e) => setForm({ ...form, [key]: Number(e.target.value) })

  const handleSubmit = (e) => {
    e.preventDefault()
    calc.run('/api/v1/loans/emi', { method: 'POST', body: JSON.stringify(form) })
  }

  return (
    <>
      <CalcPageHeader
        label="02 / BORROWING"
        title="Loan & EMI Suite"
        subtitle="Calculate your monthly EMI on the reducing-balance method and visualise how your principal shrinks over the loan tenure."
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
            <MoneyField
              label="Loan principal (₹)"
              value={form.principal}
              onChange={update('principal')}
              min={1000}
              required
            />
            <div className="field-row">
              <NumberField
                label="Tenure"
                value={form.tenureYears}
                suffix="years"
                onChange={update('tenureYears')}
                min={1} max={30}
              />
              <NumberField
                label="Interest rate"
                value={form.annualInterestRate}
                suffix="% p.a."
                onChange={update('annualInterestRate')}
                min={1} max={30} step={0.05}
              />
            </div>
            <SubmitButton loading={calc.loading} label="Calculate EMI" />
            <ErrorBox text={calc.error} />
          </form>

          <div className="results-column">
            <ResultCard
              result={calc.result}
              primary="emi"
              invested="totalPayment"
              returns="totalInterest"
              title="Monthly EMI"
              loading={calc.loading}
            />
            {calc.result?.schedule && (
              <ProjectionChart
                points={
                  calc.result.schedule
                    .filter((_, i) => i % 12 === 11)
                    .map((p) => ({ year: Math.ceil(p.month / 12), value: p.principalBalance }))
                }
                title="Remaining balance over time"
              />
            )}
          </div>
        </CalculatorLayout>
      </div>

      <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-4)' }}>
        <TipsCard tips={TIPS} />
        <HowItWorks text="EMI is calculated using the standard reducing-balance formula. Each payment first services monthly interest on the outstanding balance and then reduces the principal. The amortisation schedule shows the remaining balance at the end of each month." />
      </div>
    </>
  )
}
