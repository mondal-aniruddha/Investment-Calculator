/**
 * glossaryFallback.js — Complete offline fallback for all glossary terms.
 *
 * This file is the single source of truth for client-side glossary data.
 * It must stay in sync with every INSERT INTO glossary_terms in the SQL migrations.
 * The Vitest test at data/__tests__/fallbackVsSeed.test.js enforces this automatically.
 *
 * Fields match the backend DTO: id, term, shortDefinition, detailedExplainer, category, relatedUrl.
 */
export const GLOSSARY_FALLBACK = [
  {
    id: 'term-1',
    term: 'SIP',
    shortDefinition:
      'Systematic Investment Plan — automated recurring investing (e.g. monthly) in mutual funds.',
    detailedExplainer:
      'A disciplined method where a fixed amount is debited from your bank account periodically to buy mutual fund units regardless of market highs or lows, averaging purchase cost.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    id: 'term-2',
    term: 'CAGR',
    shortDefinition:
      'Compound Annual Growth Rate — the smoothed annual rate at which an investment grows over multiple years.',
    detailedExplainer:
      'Unlike simple return, CAGR accounts for compounding over multiple years: (Ending Value / Starting Value)^(1/years) - 1.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    id: 'term-3',
    term: 'XIRR',
    shortDefinition:
      'Extended Internal Rate of Return — the exact annualised return for multiple irregular cash inflows and outflows.',
    detailedExplainer:
      'Essential for SIPs and SWPs where investments happen on different dates at different NAV prices. It calculates the actual personal rate of return.',
    category: 'Investing',
    relatedUrl: '/mutual',
  },
  {
    id: 'term-4',
    term: 'NAV',
    shortDefinition:
      'Net Asset Value — the per-unit market price of a mutual fund scheme, updated daily after market close.',
    detailedExplainer:
      'Calculated by dividing the total net assets of the mutual fund scheme by the total number of outstanding units.',
    category: 'Investing',
    relatedUrl: '/mutual',
  },
  {
    id: 'term-5',
    term: 'Expense Ratio',
    shortDefinition:
      'The annual percentage fee charged by an asset management company (AMC) to run a mutual fund scheme.',
    detailedExplainer:
      'Deducted directly from daily NAV. Lower expense ratios (e.g., 0.1% to 0.3% in direct index funds vs 1.5% in regular active funds) compound into massive savings over 15-20 years.',
    category: 'Investing',
    relatedUrl: '/mutual',
  },
  {
    id: 'term-6',
    term: 'LTCG',
    shortDefinition:
      'Long-Term Capital Gains — profit earned from selling capital assets held beyond a prescribed period.',
    detailedExplainer:
      'For listed Indian equities and equity funds, gains exceeding ₹1.25 lakh in a financial year are taxed at 12.5% (effective Union Budget 2024).',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    id: 'term-7',
    term: 'STCG',
    shortDefinition:
      'Short-Term Capital Gains — profit earned from selling assets before the long-term holding period.',
    detailedExplainer:
      'For listed equity shares and equity mutual funds held for under 12 months, STCG is taxed at 20% (effective July 2024).',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    id: 'term-8',
    term: '80C',
    shortDefinition:
      'Section 80C allows tax deductions up to ₹1.5 lakh/year under the Old Tax Regime for specified investments.',
    detailedExplainer:
      'Eligible instruments include EPF, PPF, ELSS mutual funds, life insurance premiums, 5-year tax-saving FDs, and principal repayment on home loans.',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    id: 'term-9',
    term: '80D',
    shortDefinition:
      'Section 80D provides tax deductions for health insurance premiums up to ₹25,000 for self/family and up to ₹50,000 for senior citizen parents.',
    detailedExplainer:
      'Available only under the Old Tax Regime, promoting financial resilience against medical emergencies.',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    id: 'term-10',
    term: '87A',
    shortDefinition:
      'Section 87A rebate provides zero tax liability if taxable income is up to ₹7 lakh in the New Regime (or ₹5 lakh in Old).',
    detailedExplainer:
      'Under the New Regime, if total taxable income after standard deduction does not exceed ₹7,00,000, you pay ₹0 tax due to rebate of up to ₹25,000.',
    category: 'Tax',
    relatedUrl: '/planning',
  },
  {
    id: 'term-11',
    term: 'PPF',
    shortDefinition:
      'Public Provident Fund — a sovereign-guaranteed, 15-year EEE scheme offering 7.1% p.a. tax-free interest.',
    detailedExplainer:
      'Exempt-Exempt-Exempt (EEE) status means the investment deposit, accumulated interest, and maturity amount are all 100% tax-free in India.',
    category: 'Fixed Income',
    relatedUrl: '/fixed',
  },
  {
    id: 'term-12',
    term: 'EPF',
    shortDefinition:
      'Employees Provident Fund — mandatory retirement savings for salaried employees earning 8.25% p.a. interest.',
    detailedExplainer:
      '12% of basic salary + DA is contributed by the employee with a matching contribution from the employer. Enjoys government-backed compound growth.',
    category: 'Fixed Income',
    relatedUrl: '/fixed',
  },
  {
    id: 'term-13',
    term: 'NPS',
    shortDefinition:
      'National Pension System — a low-cost market-linked retirement pension scheme regulated by PFRDA.',
    detailedExplainer:
      'Offers an exclusive additional deduction of up to ₹50,000 under Section 80CCD(1B) beyond the 80C limit in the Old Tax Regime.',
    category: 'Retirement',
    relatedUrl: '/planning',
  },
  {
    id: 'term-14',
    term: 'CIBIL',
    shortDefinition:
      'Credit Information Bureau India Limited — generates a 3-digit score (300 to 900) rating your creditworthiness.',
    detailedExplainer:
      'A score of 750 or higher unlocks faster approvals and lowest interest rates on home loans, car loans, and credit cards.',
    category: 'Credit',
    relatedUrl: '/loan',
  },
  {
    id: 'term-15',
    term: 'Emergency Fund',
    shortDefinition:
      'A liquid cash reserve equal to 3 to 6 months of living expenses kept safe for unforeseen crises.',
    detailedExplainer:
      'Should be stored in high-yield savings accounts or overnight/liquid mutual funds rather than locked in equities or illiquid real estate.',
    category: 'Basics',
    relatedUrl: '/fixed',
  },
  {
    id: 'term-16',
    term: 'Rupee Cost Averaging',
    shortDefinition:
      'The mathematical benefit of buying more fund units when prices are down and fewer when prices are up.',
    detailedExplainer:
      'Automatic in SIPs: by investing the same rupee amount every month, you eliminate the emotional stress of timing market peaks and troughs.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    id: 'term-17',
    term: 'Index Fund',
    shortDefinition:
      'A passively managed mutual fund that mirrors a benchmark market index like the Nifty 50 or Sensex.',
    detailedExplainer:
      'Offers low expense ratios (0.1% - 0.2%) and beats majority of active fund managers over a 10-15 year horizon due to fee drag minimization.',
    category: 'Investing',
    relatedUrl: '/sip',
  },
  {
    id: 'term-18',
    term: 'Term Insurance',
    shortDefinition:
      'Pure risk protection that pays a lump sum death benefit to nominees if the policyholder passes away.',
    detailedExplainer:
      'Unlike endowment plans or ULIPs, term insurance has zero maturity value if you survive, offering high cover (₹1-2 Crore) for low annual premiums (₹10,000-15,000).',
    category: 'Insurance',
    relatedUrl: '/planning',
  },
]

