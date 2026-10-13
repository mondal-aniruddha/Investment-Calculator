import { request } from './api'

let cachedTerms = null
let fetchPromise = null

// Offline fallback terms in case backend is offline
const FALLBACK_GLOSSARY = [
  { term: 'SIP', shortDefinition: 'Systematic Investment Plan — automated recurring investing (e.g. monthly) in mutual funds.', category: 'Investing', relatedUrl: '/sip' },
  { term: 'CAGR', shortDefinition: 'Compound Annual Growth Rate — the smoothed annual rate at which an investment grows over multiple years.', category: 'Investing', relatedUrl: '/sip' },
  { term: 'XIRR', shortDefinition: 'Extended Internal Rate of Return — the exact annualised return for multiple irregular cash inflows and outflows.', category: 'Investing', relatedUrl: '/mutual' },
  { term: 'NAV', shortDefinition: 'Net Asset Value — the per-unit market price of a mutual fund scheme, updated daily after market close.', category: 'Investing', relatedUrl: '/mutual' },
  { term: 'Expense Ratio', shortDefinition: 'The annual percentage fee charged by an asset management company (AMC) to run a mutual fund scheme.', category: 'Investing', relatedUrl: '/mutual' },
  { term: 'LTCG', shortDefinition: 'Long-Term Capital Gains — profit earned from selling capital assets held beyond a prescribed period.', category: 'Tax', relatedUrl: '/planning' },
  { term: 'STCG', shortDefinition: 'Short-Term Capital Gains — profit earned from selling assets before the long-term holding period.', category: 'Tax', relatedUrl: '/planning' },
  { term: '80C', shortDefinition: 'Section 80C allows tax deductions up to ₹1.5 lakh/year under the Old Tax Regime for specified investments.', category: 'Tax', relatedUrl: '/planning' },
  { term: '80D', shortDefinition: 'Section 80D provides tax deductions for health insurance premiums up to ₹25,000 (self) and ₹50,000 (parents).', category: 'Tax', relatedUrl: '/planning' },
  { term: '87A', shortDefinition: 'Section 87A rebate provides zero tax liability if taxable income is up to ₹7 lakh in the New Regime.', category: 'Tax', relatedUrl: '/planning' },
  { term: 'PPF', shortDefinition: 'Public Provident Fund — a sovereign-guaranteed, 15-year EEE scheme offering 7.1% p.a. tax-free interest.', category: 'Fixed Income', relatedUrl: '/fixed' },
  { term: 'EPF', shortDefinition: 'Employees Provident Fund — mandatory retirement savings for salaried employees earning 8.25% p.a. interest.', category: 'Fixed Income', relatedUrl: '/fixed' },
  { term: 'NPS', shortDefinition: 'National Pension System — a low-cost market-linked retirement pension scheme regulated by PFRDA.', category: 'Retirement', relatedUrl: '/planning' },
  { term: 'CIBIL', shortDefinition: 'Credit Information Bureau India Limited — generates a 3-digit score (300 to 900) rating your creditworthiness.', category: 'Credit', relatedUrl: '/loan' },
  { term: 'Emergency Fund', shortDefinition: 'A liquid cash reserve equal to 3 to 6 months of living expenses kept safe for unforeseen crises.', category: 'Basics', relatedUrl: '/fixed' },
  { term: 'Rupee Cost Averaging', shortDefinition: 'The mathematical benefit of buying more fund units when prices are down and fewer when prices are up.', category: 'Investing', relatedUrl: '/sip' },
  { term: 'Index Fund', shortDefinition: 'A passively managed mutual fund that mirrors a benchmark market index like the Nifty 50 or Sensex.', category: 'Investing', relatedUrl: '/sip' },
  { term: 'Term Insurance', shortDefinition: 'Pure risk protection that pays a lump sum death benefit to nominees if the policyholder passes away.', category: 'Insurance', relatedUrl: '/planning' }
]

export async function fetchGlossaryTerms() {
  if (cachedTerms) return cachedTerms
  if (fetchPromise) return fetchPromise

  fetchPromise = request('/api/v1/glossary')
    .then((data) => {
      cachedTerms = Array.isArray(data) && data.length > 0 ? data : FALLBACK_GLOSSARY
      return cachedTerms
    })
    .catch((err) => {
      console.warn('Backend glossary unavailable, falling back to local dictionary:', err.message)
      cachedTerms = FALLBACK_GLOSSARY
      return cachedTerms
    })
    .finally(() => {
      fetchPromise = null
    })

  return fetchPromise
}

export function getCachedTerm(termName) {
  if (!cachedTerms) return null
  const clean = termName.toLowerCase().trim()
  return cachedTerms.find((t) => t.term.toLowerCase() === clean) || null
}
