/**
 * endpoints.js — Centralized backend API routes for the frontend.
 *
 * All HTTP service functions reference endpoints defined here.
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    PROFILE: '/api/v1/auth/profile',
    ME: '/api/v1/auth/me',
    ACCOUNT: '/api/v1/auth/account',
  },
  SCENARIOS: {
    BASE: '/api/v1/scenarios',
    COMPARE: '/api/v1/scenarios/compare',
  },
  INVESTING: {
    SIP: '/api/v1/investing/sip',
    LUMPSUM: '/api/v1/investing/lumpsum',
  },
  MUTUAL_FUNDS: {
    SIP: '/api/v1/mutual-funds/sip',
    LUMPSUM: '/api/v1/mutual-funds/lumpsum',
    SWP: '/api/v1/mutual-funds/swp',
    CAGR: '/api/v1/mutual-funds/cagr',
    XIRR: '/api/v1/mutual-funds/xirr',
  },
  TAX: {
    CALCULATE: '/api/v1/tax/calculate',
    SLABS: '/api/v1/tax/slabs',
    OPTIMIZER: '/api/v1/tax/optimizer',
  },
  RETIREMENT: {
    PLAN: '/api/v1/retirement/plan',
  },
  LOANS: {
    EMI: '/api/v1/loans/emi',
    PREPAYMENT: '/api/v1/loans/prepayment',
    SURPLUS_COMPARISON: '/api/v1/loans/surplus-comparison',
    BALANCE_TRANSFER: '/api/v1/loans/balance-transfer',
    FLOATING_RATE: '/api/v1/loans/floating-rate',
  },
  FIXED_INCOME: {
    CALCULATE: '/api/v1/fixed-income/calculate',
  },
  GOALS: {
    PLAN: '/api/v1/goals/plan',
  },
  HEALTH_SCORE: {
    CALCULATE: '/api/v1/health-score/calculate',
  },
  NET_WORTH: {
    CALCULATE: '/api/v1/net-worth/calculate',
  },
  SIMULATIONS: {
    MONTE_CARLO: '/api/v1/simulations/monte-carlo',
  },
  ANALYSIS: {
    SENSITIVITY: '/api/v1/analysis/sensitivity',
  },
  MARKET: {
    METALS: '/api/v1/market/metals',
  },
  LEARN: {
    ARTICLES: '/api/v1/learn/articles',
  },
  GLOSSARY: {
    TERMS: '/api/v1/glossary',
  },
  REPORTS: {
    PDF: '/api/v1/reports/pdf',
    EXCEL: '/api/v1/reports/excel',
  },
  CONFIG: {
    ASSUMPTIONS: '/api/v1/config/assumptions',
    REFRESH_STATUS: '/api/v1/config/refresh-status',
    OWNER_CONTACT: '/api/v1/config/owner-contact',
    TEAM: '/api/v1/config/team',
  },
  INSIGHTS: {
    EXPLAIN: '/api/v1/insights/explain',
  },
  QUERIES: {
    SUBMIT: '/api/v1/queries',
    ADMIN_LIST: '/api/v1/admin/queries',
  },
}
