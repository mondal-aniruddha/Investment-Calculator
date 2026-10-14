/**
 * FixedIncomePage — FD / RD / PPF / EPF / NPS / SSY / Post Office calculator.
 * Presentational page assembling header, FixedIncomeForm, and ResultCard.
 */
import { useCalculator } from '../../../shared/hooks/useCalculator'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import {
  HowItWorks, TipsCard, CalculatorLayout, CalcPageHeader, ResultCard
} from '../../../shared/components/ui/index'
import { LearnBeforeYouCalculate } from '../../../components/shared/LearnBeforeYouCalculate'
import { useFixedIncomeForm } from '../hooks/useFixedIncomeForm'
import { FixedIncomeForm } from '../components/FixedIncomeForm'

const TIPS = [
  'PPF (7.1% p.a.) offers tax-free returns and qualifies for 80C deduction — ideal for conservative long-term savings.',
  'EPF (8.25% p.a.) beats most fixed deposits on an after-tax basis because employer contributions are exempt from tax.',
  'FD interest above ₹40,000 per year (₹50,000 for seniors) attracts TDS at 10%; always factor in the post-tax yield.',
]

export default function FixedIncomePage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()
  const { form, update, handleSubmit } = useFixedIncomeForm(calc.run)

  return (
    <>
      <CalcPageHeader
        label="03 / STABILITY"
        title="Fixed-Income Calculators"
        subtitle="Compare FD, RD, PPF, EPF, NPS, SSY, and Post Office schemes at their official rates with post-tax and inflation-adjusted results."
      />

      <LearnBeforeYouCalculate
        slug="fd-vs-debt-funds"
        title="FD vs Debt Funds — which is better?"
        summary="Government-backed FDs feel safe but debt mutual funds can beat them post-tax. Know the real difference before you lock money in."
        icon="🏦"
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <FixedIncomeForm
            form={form}
            update={update}
            handleSubmit={handleSubmit}
            loading={calc.loading}
            error={calc.error}
          />

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
