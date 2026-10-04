/**
 * OnboardingPage — 5-step guided wizard.
 * Logic identical to original. Keeps all 5 questions + recommendations.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MoneyField, NumberField, SelectField } from '../components/ui/index'
import { formatINR } from '../utils/format'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    age: 30, income: 75000, obligations: 25000,
    goals: 'retirement', risk: 'moderate',
  })

  const update = (key) => (e) =>
    setAnswers({ ...answers, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })

  const recommendations =
    answers.goals === 'debt'
      ? [['/loan', t('nav.loan', 'Loan & EMI')], ['/planning', t('nav.planning', 'Smart Planning')]]
      : answers.goals === 'education'
      ? [['/sip', t('nav.sip', 'SIP Planner')], ['/fixed', t('nav.fixed', 'Fixed Income')]]
      : [['/sip', t('nav.sip', 'SIP Planner')], ['/planning', t('nav.planning', 'Smart Planning')], ['/mutual', t('nav.mutual', 'Mutual Funds')]]

  const questions = [
    <div key="age">
      <h2>{t('onboarding.age', 'What is your age?')}</h2>
      <NumberField label="Age" value={answers.age} suffix="years" onChange={update('age')} min={18} max={100} />
    </div>,
    <div key="income">
      <h2>{t('onboarding.income', 'Monthly take-home income')}</h2>
      <MoneyField label="Monthly income (₹)" value={answers.income} onChange={update('income')} />
    </div>,
    <div key="obligations">
      <h2>{t('onboarding.obligations', 'Monthly obligations and debt payments')}</h2>
      <MoneyField label="Monthly obligations (₹)" value={answers.obligations} onChange={update('obligations')} />
    </div>,
    <div key="goals">
      <h2>{t('onboarding.goals', 'What are you planning for?')}</h2>
      <SelectField label="Primary goal" value={answers.goals} onChange={update('goals')}>
        <option value="retirement">Retirement</option>
        <option value="education">Child education</option>
        <option value="debt">Debt freedom</option>
        <option value="home">Home purchase</option>
      </SelectField>
    </div>,
    <div key="risk">
      <h2>{t('onboarding.risk', 'How comfortable are you with market ups and downs?')}</h2>
      <SelectField label="Risk tolerance" value={answers.risk} onChange={update('risk')}>
        <option value="conservative">Conservative — I prefer stability</option>
        <option value="moderate">Moderate — balanced approach</option>
        <option value="aggressive">Aggressive — I can handle volatility</option>
      </SelectField>
    </div>,
  ]

  return (
    <section className="onboarding card" aria-label="Onboarding wizard">
      <div className="section-label">GUIDED START</div>
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-1.5px', margin: '8px 0' }}>
        {t('onboarding.title', 'Your five-step money map')}
      </h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
        {t('onboarding.subtitle', 'Answer a few questions to get a useful starting point.')}
      </p>

      {/* Stepper */}
      <div className="stepper" aria-label={`Step ${step + 1} of 5`} role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}
            aria-label={`Step ${i + 1}${i < step ? ' (completed)' : i === step ? ' (current)' : ''}`}
          >
            {i < step ? '✓' : i + 1}
          </span>
        ))}
      </div>

      {step < 5 && (
        <div className="onboarding-question">
          {questions[step]}
          <div className="wizard-actions">
            <button
              className="btn btn-secondary"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              aria-label="Go to previous step"
            >
              ← {t('onboarding.back', 'Back')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              style={{ flex: 1 }}
              aria-label={step === 4 ? 'Finish and see recommendations' : 'Go to next step'}
            >
              <span>{step === 4 ? t('onboarding.finish', 'Build my plan') : t('onboarding.next', 'Next')}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="recommendations" role="region" aria-label="Recommended calculators">
          <h2>{t('onboarding.recommendations', 'Start with these calculators')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 16px' }}>
            Profile: {answers.age} years old · {formatINR(answers.income)}/month · {answers.risk} risk
          </p>
          {recommendations.map(([path, label]) => (
            <button
              key={path}
              className="recommendation"
              onClick={() => navigate(path)}
              aria-label={`Open ${label} calculator`}
            >
              <span>{label}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
          <button
            className="btn btn-secondary"
            onClick={() => setStep(0)}
            style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
          >
            Start over
          </button>
        </div>
      )}
    </section>
  )
}
