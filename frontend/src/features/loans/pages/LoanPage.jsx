/**
 * LoanPage — EMI & loan suite calculator.
 * Presentational page assembling header, LoanForm, ResultCard, and ProjectionChart.
 */
import { useCalculator } from '../../../shared/hooks/useCalculator'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import {
  ProjectionChart,
  HowItWorks,
  TipsCard,
  CalculatorLayout,
  CalcPageHeader,
  ResultCard,
} from '../../../shared/components/ui/index'
import { LearnBeforeYouCalculate } from '../../../components/shared/LearnBeforeYouCalculate'
import { useLoanForm } from '../hooks/useLoanForm'
import { LoanForm } from '../components/LoanForm'

const TIPS = [
  'For a home loan, a 1% lower interest rate on ₹50L over 20 years saves approximately ₹6–7 lakh in total interest.',
  'Making one extra EMI per year (13 instead of 12) can cut a 20-year loan term by 3–4 years.',
  'Compare the effective annual rate (EAR) when banks quote monthly reducing rates — the annualised figure is higher.',
]

export default function LoanPage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()
  const { form, errors, update, handleSubmit } = useLoanForm(calc.run)

  return (
    <>
      <CalcPageHeader
        label="02 / BORROWING"
        title="Loan & EMI Suite"
        subtitle="Calculate your monthly EMI on the reducing-balance method and visualise how your principal shrinks over the loan tenure."
      />

      <LearnBeforeYouCalculate
        slug="cibil-score-explained"
        title="Know your CIBIL score?"
        summary="Your CIBIL score affects the interest rate you get. A 750+ score can save lakhs — learn how to protect yours."
        icon="📊"
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <LoanForm
            form={form}
            update={update}
            handleSubmit={handleSubmit}
            loading={calc.loading}
            error={calc.error}
            formErrors={errors}
          />

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
                points={calc.result.schedule
                  .filter((_, i) => i % 12 === 11)
                  .map((p) => ({ year: Math.ceil(p.month / 12), value: p.principalBalance }))}
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
