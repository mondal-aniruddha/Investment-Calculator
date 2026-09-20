# InFinance Calculator Product Requirements

## Product summary

InFinance Calculator is an educational, explainable personal-finance planning
application for people in India. It combines configurable financial assumptions,
calculation APIs, and an accessible React experience so users can compare
choices before making financial decisions.

## Problem

Indian users often need to combine loans, investments, taxes, insurance,
retirement, and competing goals, but existing calculators are isolated,
opaque, or based on assumptions that are difficult to verify. InFinance makes
the formulas, assumptions, scenarios, and limitations visible in one place.

## Target users

- Salaried professionals planning investments, taxes, and retirement.
- Families comparing loans, education, housing, insurance, and emergency funds.
- Students and first-time investors learning finance concepts.
- Financial educators who need transparent examples and reproducible results.
- Developers and administrators maintaining configurable rates and tax rules.

## Product goals

1. Provide accurate, deterministic calculations using explicit assumptions.
2. Explain results in plain language without presenting financial advice.
3. Preserve INR precision and Indian number formatting.
4. Support scenario comparison, saved profiles, and progressive planning.
5. Make local development and production deployment straightforward.

## Feature scope

### Calculation modules

- SIP, step-up SIP, lumpsum, SWP, CAGR, and XIRR.
- Home, car, and personal-loan EMI, prepayment, balance transfer, and
  floating-rate simulations.
- FD, RD, PPF, EPF, NPS, Sukanya Samriddhi, and post-office projections.
- Income-tax regime comparisons and configurable tax slabs.
- Retirement, multi-goal, financial-health, net-worth, tax-saving, Monte Carlo,
  and sensitivity analysis.

### Planning and user experience

- JWT accounts, saved scenarios, side-by-side comparison, and account deletion.
- English, Hindi, and Bengali localization.
- Guided onboarding and calculator recommendations.
- Dark mode, responsive charts, print styles, keyboard navigation, PWA shell
  caching, and calendar reminders.
- Searchable glossary and educational articles.
- Optional AI explanations and combined PDF/Excel reports.

### Operations

- Role-protected reference-data administration and audit trail.
- Configurable scheduled refresh with last-known-value fallback.
- Caffeine caching, request limits, security headers, encrypted scenarios,
  metrics, health probes, CI quality gates, Docker, and Kubernetes assets.

## Non-goals

- Brokerage, banking, payment, or investment execution.
- Guaranteed returns or personalized financial, tax, or legal advice.
- Replacing official tax, RBI, SEBI, AMFI, EPFO, PFRDA, or India Post guidance.

## Success criteria

- Every calculator has validated inputs, documented formulas, assumptions, and
  an educational disclaimer.
- Backend tests, API contract tests, property tests, frontend builds, and
  critical E2E flows pass in CI.
- Users can reproduce a result from the displayed inputs and assumptions.
- Production deployments never rely on development credentials or rate defaults.
