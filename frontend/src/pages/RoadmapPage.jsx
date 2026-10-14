import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/shared/SEO'
import { MythsAndFaq } from '../components/shared/MythsAndFaq'
import { Term } from '../components/shared/Term'
import { useScrollReveal } from '../hooks/useScrollReveal'

const ROADMAP_STEPS = [
  {
    id: 'step-budget',
    number: '01',
    title: 'Master Your Cash Flow (50/30/20 Budget)',
    short: 'Before you can invest, you need to know where your money goes every month.',
    detail: 'Allocate 50% of your take-home pay to essential needs (rent, groceries, bills), 30% to lifestyle desires (dining out, hobbies, subscriptions), and automatically set aside at least 20% for savings and future investments.',
    actionLabel: 'Calculate Your Budget & Plan',
    actionPath: '/onboarding',
    termKey: 'Emergency Fund',
    termContext: 'Rule of thumb: Pay yourself first on salary day.'
  },
  {
    id: 'step-emergency',
    number: '02',
    title: 'Build a 3–6 Month Emergency Fund',
    short: 'Your financial seatbelt to prevent taking high-interest loans in a crisis.',
    detail: 'Calculate 3 to 6 months of mandatory living expenses (rent, food, EMIs). Store this cash strictly in liquid mutual funds or sweep-in fixed deposits with 24/7 instant access. Never risk this money in stocks or locked schemes.',
    actionLabel: 'Calculate Emergency FD / Liquid Return',
    actionPath: '/fixed',
    termKey: 'Emergency Fund',
    termContext: 'Liquidity and safety are the top priorities, not high returns.'
  },
  {
    id: 'step-insurance',
    number: '03',
    title: 'Secure Health & Pure Term Insurance',
    short: 'Protect yourself and your family before risking a single rupee in the market.',
    detail: 'Do not rely solely on employer insurance. Get an independent personal health cover (Base ₹5L + Super Top-up ₹20L). If anyone depends on your income, buy a pure Term Insurance policy covering 10–15x your annual salary. Avoid endowment and ULIP traps.',
    actionLabel: 'Review Protection & Health Needs',
    actionPath: '/planning',
    termKey: 'Term Insurance',
    termContext: 'Term insurance gives ₹1 Crore cover for under ₹1,000/month.'
  },
  {
    id: 'step-sip',
    number: '04',
    title: 'Start an Automated ₹500–₹5,000 Monthly SIP',
    short: 'Harness the power of rupee cost averaging in India\'s growing economy.',
    detail: 'Set up an automated monthly debit in a low-cost Direct Nifty 50 Index Fund right after payday. You do not need to time market crashes. Over 10–20 years, compound growth turns regular monthly contributions into substantial wealth.',
    actionLabel: 'Simulate Your SIP Growth',
    actionPath: '/sip',
    termKey: 'SIP',
    termContext: 'Invest early: Arjun at 22 beats Rohan at 30 with less total money.'
  },
  {
    id: 'step-tax',
    number: '05',
    title: 'Optimize Your Taxes (Old vs New Regime)',
    short: 'Stop losing hard-earned salary to unnecessary tax deductions.',
    detail: 'Evaluate whether the New Regime (zero tax up to ₹7.75 Lakhs with standard deduction) or Old Regime (with Section 80C, 80D, HRA, home loan deductions) saves you more money. Invest in tax-saving ELSS or PPF only if the Old Regime beats the New.',
    actionLabel: 'Run Old vs New Tax Comparison',
    actionPath: '/planning',
    termKey: '80C',
    termContext: 'With the New Regime default, verify before locking funds in 80C.'
  },
  {
    id: 'step-retirement',
    number: '06',
    title: 'Retirement Kitty & Long-Term Freedom',
    short: 'Put compounding on autopilot with Step-Up SIP and NPS.',
    detail: 'As your salary increases annually, increase your SIP by 10% (Step-Up SIP). Open an NPS Tier 1 account for extra retirement compounding. Let time and compounding build your long-term independence.',
    actionLabel: 'Plan Retirement & Multi-Goal Corpus',
    actionPath: '/planning',
    termKey: 'NPS',
    termContext: 'Step-up SIPs can more than double your final corpus.'
  }
]

const STORAGE_KEY = 'infinance-roadmap-progress'

export default function RoadmapPage() {
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const revealRef = useScrollReveal()

  const toggleStep = (stepId) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage quota exceeded or disabled
      }
      return next
    })
  }

  const completedCount = Object.values(completedSteps).filter(Boolean).length
  const totalCount = ROADMAP_STEPS.length
  const percentComplete = Math.round((completedCount / totalCount) * 100)

  const handleReset = () => {
    if (window.confirm('Reset all completed steps in your roadmap?')) {
      setCompletedSteps({})
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <div className="roadmap-page page-container" ref={revealRef}>
      <SEO
        title="Beginner Money Roadmap — Step-by-Step Financial Journey for Young Indians"
        description="Follow this visual 6-step path to master your money in India: Budget, Emergency Fund, Insurance, SIP, Tax Saving, and Retirement. Track your progress login-free."
      />

      {/* Hero Header */}
      <div className="card hub-header reveal">
        <div className="section-label">STEP-BY-STEP PATHWAY · 18–30 FIRST JOB</div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', margin: '8px 0' }}>
          Your Beginner Money Roadmap
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', maxWidth: '640px', lineHeight: 1.6 }}>
          You don’t have to figure out everything at once. Complete these six milestones in sequence to build an unshakeable financial foundation.
        </p>

        {/* Progress Card */}
        <div className="roadmap-progress-widget card" style={{ marginTop: '24px', padding: '20px', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>
              Your Progress: {completedCount} of {totalCount} Milestones Done ({percentComplete}%)
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-text"
                style={{ fontSize: '12px', color: 'var(--ink-faint)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Reset Progress
              </button>
            )}
          </div>
          <div className="progress-bar-track" role="progressbar" aria-valuenow={percentComplete} aria-valuemin="0" aria-valuemax="100">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentComplete}%`, transition: 'width 0.4s ease' }}
            />
          </div>
          {percentComplete === 100 && (
            <div className="celebration-badge" style={{ marginTop: '12px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>
              🎉 Incredible job! You have set up all core pillars of financial independence!
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Steps */}
      <div className="roadmap-timeline">
        {ROADMAP_STEPS.map((step, idx) => {
          const isDone = !!completedSteps[step.id]
          return (
            <div key={step.id} className={`roadmap-step-card card ${isDone ? 'step-completed' : ''}`}>
              <div className="step-card-header">
                <div className="step-badge-col">
                  <span className="step-number-tag">STEP {step.number}</span>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleStep(step.id)}
                      aria-label={`Mark Step ${step.number} as completed`}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-label-text">
                      {isDone ? 'Completed ✓' : 'Mark as Done'}
                    </span>
                  </label>
                </div>
              </div>

              <h2 className="step-card-title">{step.title}</h2>
              <p className="step-card-short">{step.short}</p>
              <p className="step-card-detail">{step.detail}</p>

              <div className="step-card-context-box">
                <span className="context-icon" aria-hidden="true">💡</span>
                <span>
                  <strong>Tip:</strong> {step.termContext} (Explore <Term term={step.termKey} />)
                </span>
              </div>

              <div className="step-card-footer">
                <Link to={step.actionPath} className="btn btn-primary btn-sm">
                  ⚡ {step.actionLabel} ↗
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Accordion: Myths & FAQs */}
      <div style={{ marginTop: '48px' }}>
        <MythsAndFaq />
      </div>
    </div>
  )
}
