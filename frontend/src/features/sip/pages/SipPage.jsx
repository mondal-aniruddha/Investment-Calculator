/**
 * SipPage — SIP & Step-Up calculator.
 * Presentational page assembling header, SipForm, ResultCard, and ProjectionChart.
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
import { useSipForm } from '../hooks/useSipForm'
import { SipForm } from '../components/SipForm'

const TIPS = [
  'Starting a SIP early makes a bigger difference than investing a large amount later — time amplifies compounding.',
  'A 10 % annual step-up (increasing SIP by 10% each year) can nearly double your final corpus over 15 years.',
  'Expected return is not guaranteed. Use 10–12% for equity, 6–8% for hybrid, and 5–7% for debt as rough guides.',
]

export default function SipPage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const revealRef = useScrollReveal()
  const { form, errors, update, handleSubmit } = useSipForm(calc.run)

  return (
    <>
      <CalcPageHeader
        label="01 / INVESTING"
        title="SIP & Step-Up Planner"
        subtitle="Model a Systematic Investment Plan with an optional annual step-up. See how regular contributions compound over time."
      />

      <LearnBeforeYouCalculate
        slug="what-is-sip"
        title="New to SIPs?"
        summary="Learn how a ₹500/month SIP can grow into lakhs using rupee cost averaging — 4-min read."
        icon="📈"
      />

      <div ref={revealRef} className="reveal">
        <CalculatorLayout>
          {/* ── Form ── */}
          <SipForm
            form={form}
            update={update}
            handleSubmit={handleSubmit}
            loading={calc.loading}
            error={calc.error}
            formErrors={errors}
          />

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
                points={calc.result.yearlyProjections.map((y) => ({
                  year: y.year,
                  value: y.corpus,
                }))}
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
