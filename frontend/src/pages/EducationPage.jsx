/**
 * EducationPage — financial glossary + explainer articles.
 * Logic identical to original with search, tabs, and card grid.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollReveal } from '../hooks/useScrollReveal'

const GLOSSARY = [
  { term: 'SIP',   def: 'A Systematic Investment Plan invests a fixed amount at regular intervals (monthly). Compounding works best when contributions are consistent over long horizons.' },
  { term: 'XIRR',  def: 'Annualised return for irregular cash flows on different dates. More accurate than CAGR when investments are not made in a single lump sum.' },
  { term: 'CAGR',  def: 'Compound Annual Growth Rate — the rate at which an investment grows from a single starting value to its ending value over a period of years.' },
  { term: 'LTCG',  def: 'Long-Term Capital Gains from selling an asset after the applicable holding period (e.g., 12 months for listed equity, 24 months for real estate).' },
  { term: '80C',   def: 'An Indian income-tax deduction up to ₹1.5 lakh per year covering EPF, PPF, ELSS, life insurance premiums, principal repayment of home loan, and more.' },
  { term: 'CIBIL', def: 'A credit score (300–900) issued by TransUnion CIBIL. Lenders use it to assess repayment history. A score above 750 typically gets the best loan rates.' },
  { term: 'EMI',   def: 'Equated Monthly Instalment — a fixed monthly payment covering both principal and interest on a loan under the reducing-balance method.' },
  { term: 'SWP',   def: 'Systematic Withdrawal Plan — withdrawing a fixed amount from a mutual fund each month. The remaining corpus continues to grow at the fund\'s return rate.' },
  { term: 'PPF',   def: 'Public Provident Fund — a government-backed savings scheme with a 15-year lock-in, 7.1% p.a. interest (compounded annually), and tax-free returns.' },
  { term: 'EPF',   def: 'Employee Provident Fund — a mandatory employer-employee contribution scheme (currently 8.25% p.a. interest) for retirement savings.' },
  { term: 'NPS',   def: 'National Pension System — a market-linked retirement scheme regulated by PFRDA. An additional ₹50,000 deduction is available under Section 80CCD(1B).' },
  { term: 'TDS',   def: 'Tax Deducted at Source — tax deducted by the payer before remitting income. For FD interest above ₹40,000 p.a., TDS is deducted at 10%.' },
]

const ARTICLES = [
  {
    title: 'How to read a projected return',
    body: 'Separate contributions, estimated growth, taxes, and inflation-adjusted purchasing power. A projection is a scenario, not a promise. Use conservative return assumptions (8–10% for equity) and always check how the corpus changes under lower returns.',
  },
  {
    title: 'Debt before investing',
    body: 'Compare the guaranteed cost of high-interest debt with uncertain market returns. A personal loan at 14% is a guaranteed 14% saving if prepaid early. Keep an emergency buffer (3–6 months of expenses) before increasing market risk.',
  },
  {
    title: 'Old vs new tax regime (India)',
    body: 'The new regime (FY 2024-25 onwards) is the default and offers lower slab rates with no deductions. The old regime allows 80C (₹1.5L), HRA, home loan interest, and NPS deductions. Run both scenarios in the tax optimizer — the better choice depends on your deductions.',
  },
  {
    title: 'Why step-up SIP works',
    body: 'Increasing your SIP by 10% per year (matching salary growth) can double your corpus versus a flat SIP over 15 years. The extra contributions in later years, when the corpus is larger, have a disproportionate compounding effect.',
  },
]

export default function EducationPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [tab, setTab]     = useState('glossary')
  const revealRef         = useScrollReveal()

  const filtered = GLOSSARY.filter(({ term, def }) =>
    `${term} ${def}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="education-hub" ref={revealRef}>
      {/* ── Header card ── */}
      <div className="card hub-header reveal">
        <div className="section-label">LEARN</div>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-1.5px', margin: '6px 0' }}>
          {t('education.title', 'Financial education hub')}
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '14px', margin: '0 0 16px' }}>
          {t('education.disclaimer', 'General education, not personalised advice.')}
        </p>
        <input
          type="search"
          aria-label={t('education.search', 'Search glossary and articles')}
          placeholder={t('education.search', 'Search terms or topics…')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="hub-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'glossary'}
          className={tab === 'glossary' ? 'active' : ''}
          onClick={() => setTab('glossary')}
        >
          {t('education.glossary', 'Glossary')} ({filtered.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'articles'}
          className={tab === 'articles' ? 'active' : ''}
          onClick={() => setTab('articles')}
        >
          {t('education.articles', 'Explainers')} ({ARTICLES.length})
        </button>
      </div>

      {/* ── Content ── */}
      {tab === 'glossary' ? (
        <div className="glossary-grid" role="tabpanel">
          {filtered.length > 0 ? (
            filtered.map(({ term, def }) => (
              <article key={term} className="card glossary-card hover-lift">
                <h2>{term}</h2>
                <p>{def}</p>
                <small>Use the term in the relevant calculator to see its effect.</small>
              </article>
            ))
          ) : (
            <p style={{ color: 'var(--ink-muted)', gridColumn: '1/-1', padding: '24px 0' }}>
              No matching terms for "{query}".
            </p>
          )}
        </div>
      ) : (
        <div className="article-grid" role="tabpanel">
          {ARTICLES.map(({ title, body }) => (
            <article key={title} className="card glossary-card hover-lift">
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
