/**
 * MutualFundPage — SWP (Systematic Withdrawal Plan) calculator.
 * Presentational page assembling header, MutualFundForm, ResultCard, and ProjectionChart.
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
import { useMutualFundForm } from '../hooks/useMutualFundForm'
import { MutualFundForm } from '../components/MutualFundForm'

const TIPS = [
  'The "safe withdrawal rate" in India is typically 4–5% of corpus per year, adjusted for inflation.',
  'Stepping up withdrawals annually to match inflation (5–6%) keeps your purchasing power steady.',
  'If your monthly withdrawal exceeds returns, the corpus depletes — check that the plan sustains the full tenure.',
]

export default function MutualFundPage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()
  const { form, update, handleSubmit } = useMutualFundForm(calc.run)

  return (
    <>
      <CalcPageHeader
        label="04 / FLEXIBILITY"
        title="Mutual Fund Tools — SWP"
        subtitle="Model a Systematic Withdrawal Plan: how long will your corpus last at your chosen monthly withdrawal rate?"
      />

      <LearnBeforeYouCalculate
        slug="mutual-funds-basics"
        title="New to Mutual Funds?"
        summary="What’s an NAV, expense ratio, and Direct vs Regular plan? Read the plain-language explainer before running numbers."
        icon="💼"
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          <MutualFundForm
            form={form}
            update={update}
            handleSubmit={handleSubmit}
            loading={calc.loading}
            error={calc.error}
          />

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
