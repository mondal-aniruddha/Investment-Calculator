import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'
import './styles.css'

const formatINR = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Number(value || 0))

async function request(path, options = {}) {
  const token = localStorage.getItem('infinance-token')
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    ...options,
  })
  const text = await response.text()
  let payload = {}
  if (text.trim()) {
    try { payload = JSON.parse(text) } catch { throw new Error(`The backend returned an invalid response (${response.status}).`) }
  }
  if (!response.ok) throw new Error(payload.message || payload.error || `The backend returned ${response.status}.`)
  return payload
}

const initialSip = { monthlyInvestment: 10000, investmentHorizonYears: 10, expectedAnnualReturn: 12, annualStepUpPercent: 10, riskProfile: 'MODERATE' }
const initialLoan = { principal: 2500000, tenureYears: 20, annualInterestRate: 8.5 }
const initialFixed = { scheme: 'FD', contribution: 100000, tenureYears: 5, annualRate: '', taxRate: 20, inflationRate: 6 }
const initialSwp = { initialCorpus: 1000000, annualReturn: 10, monthlyWithdrawal: 10000, tenureYears: 10, annualWithdrawalIncrease: 5 }

function App() {
  const [page, setPage] = useState('sip')
  const [apiOnline, setApiOnline] = useState(false)
  const [dark, setDark] = useState(localStorage.getItem('infinance-theme') === 'dark')
  const { t } = useTranslation()
  useEffect(() => { fetch('/actuator/health').then((r) => setApiOnline(r.ok)).catch(() => setApiOnline(false)); if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {}) }, [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('infinance-theme', dark ? 'dark' : 'light') }, [dark])
  const pages = [
    ['sip', t('nav.sip')], ['loan', t('nav.loan')], ['fixed', t('nav.fixed')], ['mutual', t('nav.mutual')], ['planning', t('nav.planning')], ['onboarding', t('nav.onboarding')], ['education', t('nav.education')], ['account', t('nav.account')],
  ]
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/"><span className="brand-mark">↗</span><span>in<span>finance</span></span></a>
      <nav aria-label="Main navigation">{pages.map(([id, label]) => <button aria-current={page === id ? 'page' : undefined} className={page === id ? 'nav-button active' : 'nav-button'} key={id} onClick={() => setPage(id)}>{label}</button>)}</nav>
      <div className="topbar-actions"><label className="language-picker" aria-label={t('common.language')}><span className="sr-only">{t('common.language')}</span><select value={i18n.language} onChange={(e) => { i18n.changeLanguage(e.target.value); localStorage.setItem('infinance-language', e.target.value) }}><option value="en">EN</option><option value="hi">हिंदी</option><option value="bn">বাংলা</option></select></label><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label={t('common.theme')}>{dark ? '☀' : '◐'}</button><div className="api-status"><span className={apiOnline ? 'status-dot online' : 'status-dot'} />{apiOnline ? t('common.connected') : t('common.offline')}</div></div>
    </header>
    <main>
      <section className="hero compact-hero"><div className="eyebrow"><span>✦</span> {t('hero.eyebrow')}</div><h1>{t('hero.title')}<br /><em>{t('hero.title2')}</em></h1><p>{t('hero.subtitle')}</p></section>
      {page === 'sip' && <SipPage setApiOnline={setApiOnline} />}
      {page === 'loan' && <LoanPage setApiOnline={setApiOnline} />}
      {page === 'fixed' && <FixedIncomePage setApiOnline={setApiOnline} />}
      {page === 'mutual' && <MutualFundPage setApiOnline={setApiOnline} />}
      {page === 'planning' && <PlanningPage setApiOnline={setApiOnline} />}
      {page === 'onboarding' && <OnboardingPage onNavigate={setPage} />}
      {page === 'education' && <EducationPage />}
      {page === 'account' && <AccountPage />}
    </main>
    <footer><span>© 2025 inFinance</span><span>{t('common.disclaimer')}</span><span>India · INR</span></footer>
  </div>
}

function useCalculator(setApiOnline) {
  const [result, setResult] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const run = async (path, options) => {
    setLoading(true); setError('')
    try { const data = await request(path, options); setResult(data); setApiOnline(true); return data }
    catch (e) { setApiOnline(false); setError(e.message || 'Start Spring Boot on http://localhost:8080.'); return null }
    finally { setLoading(false) }
  }
  return { result, error, loading, run }
}

function SipPage({ setApiOnline }) {
  const [form, setForm] = useState(initialSip); const calc = useCalculator(setApiOnline)
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  return <CalculatorLayout title="Plan your SIP" label="01 / INVESTING">
    <form className="card calculator-card" onSubmit={(e) => { e.preventDefault(); calc.run('/api/v1/investing/sip', { method: 'POST', body: JSON.stringify(form) }) }}>
      <MoneyField label="Monthly investment" value={form.monthlyInvestment} onChange={update('monthlyInvestment')} />
      <div className="field-row"><NumberField label="Time horizon" value={form.investmentHorizonYears} suffix="years" onChange={update('investmentHorizonYears')} /><NumberField label="Expected return" value={form.expectedAnnualReturn} suffix="% p.a." onChange={update('expectedAnnualReturn')} /></div>
      <NumberField label="Annual step-up" value={form.annualStepUpPercent} suffix="%" onChange={update('annualStepUpPercent')} />
      <label>Risk profile <select value={form.riskProfile} onChange={update('riskProfile')}><option>LOW</option><option>MODERATE</option><option>AGGRESSIVE</option></select></label>
      <SubmitButton loading={calc.loading} />{calc.error && <ErrorBox text={calc.error} />}
    </form>
    <ResultCard result={calc.result} primary="maturityCorpus" invested="totalInvested" returns="estimatedReturns" title="Projected SIP corpus" />
    <HowItWorks text="A SIP invests the selected amount monthly. The step-up option increases that contribution once per year. The backend compounds each instalment at the configured annual return and returns scenario and yearly projections." />
  </CalculatorLayout>
}

function LoanPage({ setApiOnline }) {
  const [form, setForm] = useState(initialLoan); const calc = useCalculator(setApiOnline)
  const update = (key) => (e) => setForm({ ...form, [key]: Number(e.target.value) })
  return <CalculatorLayout title="Loan & EMI suite" label="02 / BORROWING">
    <form className="card calculator-card" onSubmit={(e) => { e.preventDefault(); calc.run('/api/v1/loans/emi', { method: 'POST', body: JSON.stringify(form) }) }}>
      <MoneyField label="Loan principal" value={form.principal} onChange={update('principal')} /><div className="field-row"><NumberField label="Tenure" value={form.tenureYears} suffix="years" onChange={update('tenureYears')} /><NumberField label="Interest rate" value={form.annualInterestRate} suffix="% p.a." onChange={update('annualInterestRate')} /></div>
      <SubmitButton loading={calc.loading} />{calc.error && <ErrorBox text={calc.error} />}
    </form>
    <ResultCard result={calc.result} primary="emi" invested="totalPayment" returns="totalInterest" title="Monthly EMI" />
    {calc.result?.schedule && <ProjectionChart points={calc.result.schedule.filter((_, i) => i % 12 === 11).map((p) => ({ year: p.month / 12, value: p.principalBalance }))} />}
    <HowItWorks text="EMI is calculated using the standard reducing-balance formula. Each payment first services monthly interest and then reduces principal. The schedule shows the remaining balance over time." />
  </CalculatorLayout>
}

function FixedIncomePage({ setApiOnline }) {
  const [form, setForm] = useState(initialFixed); const calc = useCalculator(setApiOnline)
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  return <CalculatorLayout title="Fixed-income calculators" label="03 / STABILITY">
    <form className="card calculator-card" onSubmit={(e) => { e.preventDefault(); const body = { ...form, annualRate: form.annualRate === '' ? null : Number(form.annualRate) }; calc.run('/api/v1/fixed-income/calculate', { method: 'POST', body: JSON.stringify(body) }) }}>
      <label>Scheme <select value={form.scheme} onChange={update('scheme')}>{['FD', 'RD', 'PPF', 'EPF', 'NPS', 'SSY', 'POST_OFFICE'].map((s) => <option key={s}>{s}</option>)}</select></label>
      <MoneyField label={form.scheme === 'RD' ? 'Monthly contribution' : 'Contribution'} value={form.contribution} onChange={update('contribution')} /><div className="field-row"><NumberField label="Tenure" value={form.tenureYears} suffix="years" onChange={update('tenureYears')} /><NumberField label="Tax rate" value={form.taxRate} suffix="%" onChange={update('taxRate')} /></div>
      <NumberField label="Override annual rate (optional)" value={form.annualRate} suffix="%" onChange={update('annualRate')} /><SubmitButton loading={calc.loading} />{calc.error && <ErrorBox text={calc.error} />}
    </form>
    <ResultCard result={calc.result} primary="maturityValue" invested="totalContribution" returns="interestEarned" title="Maturity value" /><HowItWorks text="Scheme rates are read from externalized application assumptions. The result also shows a post-tax value and inflation-adjusted purchasing power. Verify current official rates before making a decision." />
  </CalculatorLayout>
}

function MutualFundPage({ setApiOnline }) {
  const [form, setForm] = useState(initialSwp); const calc = useCalculator(setApiOnline)
  const update = (key) => (e) => setForm({ ...form, [key]: Number(e.target.value) })
  return <CalculatorLayout title="Mutual fund tools" label="04 / FLEXIBILITY">
    <form className="card calculator-card" onSubmit={(e) => { e.preventDefault(); calc.run('/api/v1/mutual-funds/swp', { method: 'POST', body: JSON.stringify(form) }) }}>
      <MoneyField label="Starting corpus" value={form.initialCorpus} onChange={update('initialCorpus')} /><div className="field-row"><NumberField label="Expected return" value={form.annualReturn} suffix="% p.a." onChange={update('annualReturn')} /><NumberField label="Monthly withdrawal" value={form.monthlyWithdrawal} suffix="₹" onChange={update('monthlyWithdrawal')} /></div><div className="field-row"><NumberField label="Tenure" value={form.tenureYears} suffix="years" onChange={update('tenureYears')} /><NumberField label="Withdrawal step-up" value={form.annualWithdrawalIncrease} suffix="%" onChange={update('annualWithdrawalIncrease')} /></div>
      <SubmitButton loading={calc.loading} />{calc.error && <ErrorBox text={calc.error} />}
    </form>
    <ResultCard result={calc.result} primary="remainingCorpus" invested="withdrawalTotal" returns="annualizedReturn" title="Remaining SWP corpus" /><ProjectionChart points={calc.result?.projection || []} /><HowItWorks text="An SWP grows the corpus monthly at the expected return and withdraws a scheduled amount. The withdrawal can step up annually. Use the separate API endpoints for SIP, lumpsum, CAGR, and XIRR workflows." />
  </CalculatorLayout>
}

function PlanningPage({ setApiOnline }) {
  const calc = useCalculator(setApiOnline)
  const [health, setHealth] = useState({ savingsRatePercent: 20, emergencyFundMonths: 4, debtToIncomePercent: 30, insuranceCoveragePercent: 60, creditUtilizationPercent: 25, retirementReadinessPercent: 45 })
  const [monte, setMonte] = useState({ initialCorpus: 500000, monthlyContribution: 25000, years: 15, expectedAnnualReturn: 10, annualVolatility: 12, inflationRate: 6, targetCorpus: 10000000, runs: 1000, seed: 42 })
  const [networth, setNetworth] = useState({ assets: '[{"category":"Equity","amount":500000}]', liabilities: '[{"category":"Loan","amount":200000}]', history: '[{"date":"2025-01-01","netWorth":300000}]' })
  const update = (setter, key) => (e) => setter((current) => ({ ...current, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const run = (path, body) => calc.run(path, { method: 'POST', body: JSON.stringify(body) })
  return <section className="planning-grid">
    <div className="card calculator-card"><div className="section-label">05 / SMART PLANNING</div><h2>Financial health score</h2>
      {Object.entries(health).map(([key, value]) => <NumberField key={key} label={key.replace(/([A-Z])/g, ' $1')} value={value} suffix={key === 'emergencyFundMonths' ? 'months' : '%'} onChange={update(setHealth, key)} />)}
      <button className="primary-button" onClick={() => run('/api/v1/health-score/calculate', health)}>Calculate score →</button>
      {calc.result?.score !== undefined && <div className="planning-result"><strong>{calc.result.score}/100</strong><span>{calc.result.band}</span><p>{calc.result.topImprovements?.join(' ')}</p></div>}
    </div>
    <div className="card calculator-card"><div className="section-label">06 / SIMULATION</div><h2>Monte Carlo retirement test</h2>
      <div className="field-row"><NumberField label="Monthly contribution" value={monte.monthlyContribution} suffix="₹" onChange={update(setMonte, 'monthlyContribution')} /><NumberField label="Years" value={monte.years} suffix="years" onChange={update(setMonte, 'years')} /></div>
      <div className="field-row"><NumberField label="Return" value={monte.expectedAnnualReturn} suffix="%" onChange={update(setMonte, 'expectedAnnualReturn')} /><NumberField label="Volatility" value={monte.annualVolatility} suffix="%" onChange={update(setMonte, 'annualVolatility')} /></div>
      <NumberField label="Target corpus" value={monte.targetCorpus} suffix="₹" onChange={update(setMonte, 'targetCorpus')} /><button className="primary-button" onClick={() => run('/api/v1/simulations/monte-carlo', monte)}>Run simulation →</button>
      {calc.result?.successProbabilityPercent !== undefined && <div className="planning-result"><strong>{calc.result.successProbabilityPercent}%</strong><span>probability of success</span><p>10th: {formatINR(calc.result.percentile10)} · Median: {formatINR(calc.result.percentile50)} · 90th: {formatINR(calc.result.percentile90)}</p></div>}
    </div>
    <div className="card calculator-card"><div className="section-label">07 / NET WORTH</div><h2>Track assets and liabilities</h2>
      <label>Assets JSON<textarea value={networth.assets} onChange={(e) => setNetworth({ ...networth, assets: e.target.value })} /></label><label>Liabilities JSON<textarea value={networth.liabilities} onChange={(e) => setNetworth({ ...networth, liabilities: e.target.value })} /></label><label>History JSON<textarea value={networth.history} onChange={(e) => setNetworth({ ...networth, history: e.target.value })} /></label>
      <button className="primary-button" onClick={() => { try { run('/api/v1/net-worth/calculate', { assets: JSON.parse(networth.assets), liabilities: JSON.parse(networth.liabilities), history: JSON.parse(networth.history) }) } catch { setNetworth({ ...networth }) } }}>Calculate net worth →</button>
      {calc.result?.netWorth !== undefined && <div className="planning-result"><strong>{formatINR(calc.result.netWorth)}</strong><span>current net worth</span><p>Assets {formatINR(calc.result.totalAssets)} · Liabilities {formatINR(calc.result.totalLiabilities)}</p></div>}
    </div>
    <div className="card calculator-card"><div className="section-label">08 / GOALS</div><h2>Fund multiple goals</h2>
      <label>Goals JSON<textarea defaultValue='[{"name":"Home","targetAmount":3000000,"monthsUntilGoal":120,"priority":1,"expectedAnnualReturn":10,"currentSavings":500000}]' id="goals-json" /></label><NumberField label="Available monthly savings" value={25000} suffix="₹" onChange={() => {}} />
      <button className="primary-button" onClick={() => { try { run('/api/v1/goals/plan', { goals: JSON.parse(document.getElementById('goals-json').value), availableMonthlySavings: 25000 }) } catch { setHealth({ ...health }) } }}>Plan goals →</button>
      {calc.result?.totalRequiredMonthlyInvestment !== undefined && <div className="planning-result"><strong>{formatINR(calc.result.totalRequiredMonthlyInvestment)}</strong><span>required monthly</span><p>{calc.result.exceedsAvailableSavings ? 'Savings shortfall detected.' : 'Goals fit the available savings.'}</p></div>}
    </div>
    <div className="card calculator-card"><div className="section-label">09 / TAX</div><h2>Tax-saving optimizer</h2>
      <MoneyField label="Gross annual salary" value={1500000} onChange={() => {}} /><div className="field-row"><NumberField label="80C used" value={50000} suffix="₹" onChange={() => {}} /><NumberField label="NPS used" value={0} suffix="₹" onChange={() => {}} /></div>
      <button className="primary-button" onClick={() => run('/api/v1/tax/optimizer', { grossSalary: 1500000, section80C: 50000, section80DMedicalInsurance: 0, section80CCD1BNps: 0 })}>Optimise deductions →</button>
      {calc.result?.estimatedAdditionalOldRegimeTaxSaved !== undefined && <div className="planning-result"><strong>{formatINR(calc.result.estimatedAdditionalOldRegimeTaxSaved)}</strong><span>estimated additional saving</span></div>}
    </div>
    <div className="card calculator-card"><div className="section-label">10 / WHAT-IF</div><h2>Sensitivity analysis</h2>
      <div className="field-row"><NumberField label="Monthly investment" value={25000} suffix="₹" onChange={() => {}} /><NumberField label="Years" value={15} suffix="years" onChange={() => {}} /></div><div className="field-row"><NumberField label="Return" value={12} suffix="%" onChange={() => {}} /><NumberField label="Inflation" value={6} suffix="%" onChange={() => {}} /></div>
      <button className="primary-button" onClick={() => run('/api/v1/analysis/sensitivity', { monthlyInvestment: 25000, years: 15, expectedReturn: 12, inflationRate: 6 })}>Compare scenarios →</button>
      {calc.result?.scenarios && <ProjectionChart points={calc.result.scenarios.map((s, i) => ({ year: `${s.variable}-${s.direction}`, value: s.corpus }))} />}
    </div>
    <HowItWorks text="Smart planning combines goal affordability, health signals, net-worth snapshots, configured tax limits, deterministic Monte Carlo ranges, and sensitivity analysis. These are planning aids, not predictions or advice." />
    <ReminderCard />
    {calc.error && <ErrorBox text={calc.error} />}
  </section>
}

function ReminderCard() {
  const [date, setDate] = useState('')
  const download = () => {
    if (!date) return
    const stamp = date.replaceAll('-', '') + 'T090000'
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${stamp}\nSUMMARY:Review SIP and tax-saving plan\nDESCRIPTION:Educational reminder from InFinance. Verify current official rules and rates.\nEND:VEVENT\nEND:VCALENDAR`
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); link.download = 'infinance-reminder.ics'; link.click()
  }
  return <div className="card reminder-card"><div className="section-label">REMINDERS</div><h2>Review your plan</h2><p>Export a calendar reminder for a SIP or tax-planning review.</p><div className="field-row"><label>Reminder date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><button className="primary-button" onClick={download}>Export calendar <span>→</span></button></div></div>
}

function OnboardingPage({ onNavigate }) {
  const { t } = useTranslation(); const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ age: 30, income: 75000, obligations: 25000, goals: 'retirement', risk: 'moderate' })
  const update = (key) => (e) => setAnswers({ ...answers, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  const recommendations = answers.goals === 'debt' ? [['loan', t('nav.loan')], ['planning', t('nav.planning')]] : answers.goals === 'education' ? [['sip', t('nav.sip')], ['fixed', t('nav.fixed')]] : [['sip', t('nav.sip')], ['planning', t('nav.planning')], ['mutual', t('nav.mutual')]]
  const questions = [
    <><h2>{t('onboarding.age')}</h2><NumberField label="Age" value={answers.age} suffix="years" onChange={update('age')} /></>,
    <><h2>{t('onboarding.income')}</h2><MoneyField label="Income" value={answers.income} onChange={update('income')} /></>,
    <><h2>{t('onboarding.obligations')}</h2><MoneyField label="Obligations" value={answers.obligations} onChange={update('obligations')} /></>,
    <><h2>{t('onboarding.goals')}</h2><select aria-label={t('onboarding.goals')} value={answers.goals} onChange={update('goals')}><option value="retirement">Retirement</option><option value="education">Child education</option><option value="debt">Debt freedom</option><option value="home">Home purchase</option></select></>,
    <><h2>{t('onboarding.risk')}</h2><select aria-label={t('onboarding.risk')} value={answers.risk} onChange={update('risk')}><option value="conservative">Conservative</option><option value="moderate">Moderate</option><option value="aggressive">Aggressive</option></select></>,
  ]
  return <section className="onboarding card"><div className="section-label">GUIDED START</div><h1 className="section-title">{t('onboarding.title')}</h1><p>{t('onboarding.subtitle')}</p><div className="stepper" aria-label={`Step ${step + 1} of 5`}>{[0, 1, 2, 3, 4].map((item) => <span className={item <= step ? 'step active' : 'step'} key={item}>{item + 1}</span>)}</div>{step < 5 ? <div className="onboarding-question">{questions[step]}<div className="wizard-actions"><button className="secondary-button" disabled={step === 0} onClick={() => setStep(step - 1)}>{t('onboarding.back')}</button><button className="primary-button" onClick={() => setStep(step + 1)}>{step === 4 ? t('onboarding.finish') : t('onboarding.next')} <span>→</span></button></div></div> : null}{step === 5 && <div className="recommendations"><h2>{t('onboarding.recommendations')}</h2>{recommendations.map(([id, label]) => <button className="recommendation" key={id} onClick={() => onNavigate(id)}>{label} →</button>)}<p>Profile: {answers.age} years · {formatINR(answers.income)} monthly income · {answers.risk} risk</p></div>}</section>
}

const glossary = [
  ['XIRR', 'Annualized return for cash flows that happen on different dates.'],
  ['LTCG', 'Long-term capital gains from selling an asset after the applicable holding period.'],
  ['80C', 'A configured Indian income-tax deduction category covering eligible investments and payments.'],
  ['CIBIL', 'A credit score and report used by lenders to assess repayment history and credit behaviour.'],
  ['SIP', 'A systematic investment plan that invests a fixed amount at regular intervals.'],
  ['CAGR', 'Compound annual growth rate over a period, assuming a single starting and ending value.'],
]
function EducationPage() {
  const { t } = useTranslation(); const [query, setQuery] = useState(''); const [tab, setTab] = useState('glossary')
  const filtered = glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="education-hub"><div className="card hub-header"><div className="section-label">LEARN</div><h1 className="section-title">{t('education.title')}</h1><p>{t('education.disclaimer')}</p><input aria-label={t('education.search')} placeholder={t('education.search')} value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="hub-tabs"><button className={tab === 'glossary' ? 'active' : ''} onClick={() => setTab('glossary')}>{t('education.glossary')}</button><button className={tab === 'articles' ? 'active' : ''} onClick={() => setTab('articles')}>{t('education.articles')}</button></div>{tab === 'glossary' ? <div className="glossary-grid">{filtered.map(([term, definition]) => <article className="card glossary-card" key={term}><h2>{term}</h2><p>{definition}</p><small>Use the term in the relevant calculator and inspect its assumptions.</small></article>)}{!filtered.length && <p>No matching terms.</p>}</div> : <div className="article-grid"><article className="card glossary-card"><h2>How to read a projected return</h2><p>Separate contributions, estimated growth, taxes, and inflation-adjusted purchasing power. A projection is a scenario, not a promise.</p></article><article className="card glossary-card"><h2>Debt before investing</h2><p>Compare the guaranteed cost of high-interest debt with uncertain market returns and keep an emergency buffer before increasing risk.</p></article></div>}</section>
}

function AccountPage() {
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ email: '', password: '', displayName: '' }); const [message, setMessage] = useState('')
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const submit = async (event) => {
    event.preventDefault(); setMessage('')
    try {
      const response = await request(`/api/v1/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) })
      if (response.token) localStorage.setItem('infinance-token', response.token)
      setMessage(mode === 'login' ? 'Signed in. Your saved scenarios are now available through the API.' : 'Account created. You can now sign in.')
    } catch (error) { setMessage(error.message) }
  }
  return <section className="account-page card"><div className="section-label">SAVED PROFILES</div><h1 className="section-title">{mode === 'login' ? 'Welcome back' : 'Create your profile'}</h1><form onSubmit={submit}>{mode === 'register' && <label>Display name<input type="text" value={form.displayName} onChange={update('displayName')} required /></label>}<label>Email<input type="email" value={form.email} onChange={update('email')} required /></label><label>Password<input type="password" value={form.password} onChange={update('password')} minLength="8" required /></label><button className="primary-button" type="submit">{mode === 'login' ? 'Sign in' : 'Register'} <span>→</span></button></form><button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Need an account?' : 'Already registered?'}</button>{message && <p className="account-message">{message}</p>}<small>Use the JWT returned by the backend for saved scenarios. Do not reuse passwords from other services.</small></section>
}

function CalculatorLayout({ title, label, children }) { return <section className="calculator-layout">{children[0]}<div className="results-column"><div className="card result-card"><div className="section-label">{label}</div><h2>{title}</h2><p>Enter assumptions to see an illustrative projection.</p></div>{children.slice(1)}</div></section> }
function ResultCard({ result, primary, invested, returns, title }) {
  const [insight, setInsight] = useState(null); const [busy, setBusy] = useState(false)
  const explain = async () => {
    setBusy(true)
    try { const response = await request('/api/v1/insights/explain', { method: 'POST', body: JSON.stringify({ calculationResult: result }) }); setInsight(response.explanation || response.status) }
    catch (error) { setInsight(error.message) } finally { setBusy(false) }
  }
  const download = async (format) => {
    const response = await fetch(`/api/v1/reports/${format}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportTitle: title, calculatorResults: { result }, assumptions: result?.assumptions || {} }) })
    if (!response.ok) { setInsight(`Report export failed (${response.status}).`); return }
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `infinance-${format}`; link.click(); URL.revokeObjectURL(url)
  }
  return <div className="card result-card"><div className="section-label">YOUR ESTIMATE</div><h2>{result ? formatINR(result[primary]) : 'Run the calculator'}</h2><p>{title}</p><div className="metric-grid"><div><span>Invested / paid</span><strong>{formatINR(result?.[invested])}</strong></div><div><span>Returns / interest</span><strong className="green">{formatINR(result?.[returns])}</strong></div><div><span>Assumptions</span><strong>{result?.assumptions?.financialYear || 'Configured'}</strong></div></div>{result && <div className="result-actions"><button onClick={explain} disabled={busy}>{busy ? 'Explaining...' : 'Explain my results'}</button><button onClick={() => download('pdf')}>PDF</button><button onClick={() => download('excel')}>Excel</button></div>}{insight && <p className="insight-text">{insight}</p>}</div>
}
function ProjectionChart({ points = [] }) { const max = Math.max(...points.map((p) => Number(p.value || p.principalBalance || 0)), 1); return <div className="card chart projection-chart">{points.length ? points.map((p) => <div className="bar-wrap" key={p.year || p.month}><div className="bar" style={{ height: `${Math.max(8, Number(p.value || p.principalBalance || 0) / max * 100)}%` }} title={formatINR(p.value || p.principalBalance)} /><span>{p.year || p.month}</span></div>) : <span>Run the calculator to see the chart.</span>}</div> }
function HowItWorks({ text }) { return <div className="card how-it-works"><div className="section-label">HOW IT WORKS</div><p>{text}</p><small>For education only. Not investment, tax, legal, or financial advice.</small></div> }
function MoneyField({ label, value, onChange }) { return <label>{label}<div className="input-with-prefix"><span>₹</span><input type="number" min="0" value={value} onChange={onChange} /></div></label> }
function NumberField({ label, value, suffix, onChange }) { return <label>{label}<div className="input-with-suffix"><input type="number" min="0" step="0.1" value={value} onChange={onChange} /><span>{suffix}</span></div></label> }
function SubmitButton({ loading }) { return <button className="primary-button" disabled={loading} type="submit">{loading ? 'Calculating...' : 'Calculate'} <span>→</span></button> }
function ErrorBox({ text }) { return <div className="error-message">{text}</div> }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
