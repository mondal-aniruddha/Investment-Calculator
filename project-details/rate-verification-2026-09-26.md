# Official Financial Rate Verification Report

**Date of Verification:** 2026-09-26  
**Target Financial Year:** 2024–2025  
**Target Assessment Year:** 2025–2026  
**Auditor:** InFinance Engineering Team  
**Verification Scope:** `application-assumptions.yml`, `FinancialProperties.java`, `V1__init_assumptions_and_slabs.sql`, calculation engines, and database reference tables.

---

## 1. Executive Summary

This report documents the verification of all baseline tax slabs, deduction limits, government savings scheme interest rates, market benchmarks, and inflation expectations configured in the InFinance Calculator against official Indian statutory circulars and government releases.

### Summary of Findings
- **Income Tax Module:** All New Regime slabs, revised ₹75,000 standard deduction, Section 87A rebate (₹25,000 up to ₹7,00,000), marginal relief rules, Old Regime slabs, and Chapter VI-A / Section 24(b) deduction caps are **100% verified** against the **Finance (No. 2) Act, 2024** and the **Income Tax Act, 1961**.
- **Small Savings Schemes:** PPF (7.10%), SSY (8.20%), SCSS (8.20%), POTD 5-year (7.50%), POMIS (7.40%), and EPF (8.25%) are **verified** against Ministry of Finance Department of Economic Affairs (DEA) notifications and EPFO Central Board of Trustees announcements.
- **Adjustments Made:**
  - **Post Office Recurring Deposit (5-Year RD):** The configured rate was 6.75% p.a. Authoritative MoF circulars (F.No.1/4/2019-NS) set the 5-year National Savings Recurring Deposit Account at **6.70% p.a.** (compounded quarterly). Configured default in `application-assumptions.yml`, `FinancialProperties`, and DB migration seed is aligned to **6.70%**.
- **Market & Economic Benchmarks:** Benchmarks (Nifty 50 CAGR at 12%, Conservative Equity at 10%, Debt/Hybrid at 7.5%, Gold at 9%, Credit Card APR at 42%, CPI Inflation at 6%) are confirmed as representative, conservative Indian market averages and carry prominent educational disclaimers.

---

## 2. Rate-by-Rate Verification Register

### 2.1 Income Tax Module (AY 2025–26 / FY 2024–25)
**Authoritative Source:** Income Tax Department of India / CBDT / Finance (No. 2) Act, 2024

| Parameter | Repo Location | Repo Value | Authoritative Citation | Confirmed Value | Effective Period | Status |
|---|---|---|---|---|---|---|
| **New Regime Slabs** | `application-assumptions.yml`, `tax_slabs` table | 0–3L: 0%<br>3–7L: 5%<br>7–10L: 10%<br>10–12L: 15%<br>12–15L: 20%<br>>15L: 30% | Section 115BAC(1A) as amended by Finance (No. 2) Act, 2024 | 0–3L: 0%<br>3–7L: 5%<br>7–10L: 10%<br>10–12L: 15%<br>12–15L: 20%<br>>15L: 30% | FY 2024–25 (AY 2025–26) | Verified / Unchanged |
| **New Regime Standard Deduction** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹75,000 | Section 16(ia) amended by Finance (No. 2) Act, 2024 | ₹75,000 | FY 2024–25 onward | Verified / Unchanged |
| **New Regime Sec 87A Rebate** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹25,000 (taxable ≤ ₹7,00,000) + Marginal Relief | Section 87A proviso, Finance Act 2023 / Finance (No. 2) Act 2024 | ₹25,000 (taxable ≤ ₹7,00,000) | FY 2024–25 | Verified / Unchanged |
| **Old Regime Slabs (< 60 yrs)** | `application-assumptions.yml`, `tax_slabs` table | 0–2.5L: 0%<br>2.5–5L: 5%<br>5–10L: 20%<br>>10L: 30% | First Schedule, Part I, Paragraph A, Finance Act | 0–2.5L: 0%<br>2.5–5L: 5%<br>5–10L: 20%<br>>10L: 30% | FY 2024–25 | Verified / Unchanged |
| **Old Regime Senior Exemption (60–80 yrs)** | `IncomeTaxEngine` | ₹3,00,000 | First Schedule, Part I, Paragraph A, Finance Act | ₹3,00,000 | FY 2024–25 | Verified / Unchanged |
| **Old Regime Super Senior Exemption (80+ yrs)** | `IncomeTaxEngine` | ₹5,00,000 | First Schedule, Part I, Paragraph A, Finance Act | ₹5,00,000 | FY 2024–25 | Verified / Unchanged |
| **Old Regime Standard Deduction** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹50,000 | Section 16(ia), Income Tax Act, 1961 | ₹50,000 | Ongoing | Verified / Unchanged |
| **Old Regime Sec 87A Rebate** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹12,500 (taxable ≤ ₹5,00,000) | Section 87A, Income Tax Act, 1961 | ₹12,500 (taxable ≤ ₹5,00,000) | Ongoing | Verified / Unchanged |
| **Section 80C Deduction Limit** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹1,50,000 | Section 80CCE, Income Tax Act, 1961 | ₹1,50,000 | Ongoing | Verified / Unchanged |
| **Section 80CCD(1B) NPS Additional** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹50,000 | Section 80CCD(1B), Income Tax Act, 1961 | ₹50,000 | Ongoing | Verified / Unchanged |
| **Section 24(b) Home Loan Interest** | `application-assumptions.yml`, `IncomeTaxEngine` | ₹2,00,000 | Section 24(b), Income Tax Act, 1961 | ₹2,00,000 | Ongoing | Verified / Unchanged |
| **Section 80D (Self & Family)** | `application-assumptions.yml` | ₹25,000 | Section 80D(2)(a), Income Tax Act, 1961 | ₹25,000 | Ongoing | Verified / Unchanged |
| **Section 80D (Senior Parents)** | `application-assumptions.yml` | ₹50,000 | Section 80D(2)(b), Income Tax Act, 1961 | ₹50,000 | Ongoing | Verified / Unchanged |
| **Health and Education Cess** | `application-assumptions.yml`, `IncomeTaxEngine` | 4.00% | Section 2, Finance Act | 4.00% | Ongoing | Verified / Unchanged |

---

### 2.2 Fixed Income & Government Small Savings Schemes
**Authoritative Sources:** Ministry of Finance (DEA Small Savings Scheme Notifications), EPFO, PFRDA, India Post

| Scheme | Repo Location | Repo Value | Authoritative Citation | Confirmed Value | Effective Period | Status |
|---|---|---|---|---|---|---|
| **Public Provident Fund (PPF)** | `application-assumptions.yml`, `financial_assumptions` | 7.10% p.a.<br>Min: ₹500<br>Max: ₹1,50,000<br>Lock-in: 15 yrs | MoF DEA Quarterly Notifications / Public Provident Fund Scheme, 2019 | 7.10% p.a.<br>Min: ₹500<br>Max: ₹1,50,000<br>Lock-in: 15 yrs | Q1 FY 2020-21 through Q4 FY 2024-25 | Verified / Unchanged |
| **Sukanya Samriddhi Yojana (SSY)** | `application-assumptions.yml`, `financial_assumptions` | 8.20% p.a.<br>Max: ₹1,50,000<br>Entry age: ≤ 10 | MoF Notification F.No.1/4/2019-NS dated Dec 29, 2023 | 8.20% p.a.<br>Max: ₹1,50,000<br>Entry age: ≤ 10 | Q4 FY 2023-24 onward | Verified / Unchanged |
| **Senior Citizen Savings Scheme (SCSS)** | `application-assumptions.yml`, `financial_assumptions` | 8.20% p.a. | MoF Notification F.No.1/4/2019-NS | 8.20% p.a. (payable quarterly) | FY 2023-24 & FY 2024-25 | Verified / Unchanged |
| **Employees' Provident Fund (EPF)** | `application-assumptions.yml`, `financial_assumptions` | 8.25% p.a. | Central Board of Trustees (CBT) EPFO Resolution & MoF Concurrence | 8.25% p.a. | FY 2023-24 & FY 2024-25 | Verified / Unchanged |
| **National Pension System (NPS)** | `application-assumptions.yml`, `financial_assumptions` | 10.50% CAGR | PFRDA 10-15 yr blended return data across Tier-I Auto Choice | 10.50% CAGR | Illustrative Benchmark | Verified (Benchmark) |
| **Post Office Time Deposit (5-yr POTD)** | `application-assumptions.yml` | 7.50% p.a. | MoF DEA Small Savings Schemes Rate Schedule | 7.50% p.a. (compounded quarterly) | Current | Verified / Unchanged |
| **Post Office Monthly Income Scheme (POMIS)** | `application-assumptions.yml` | 7.40% p.a. | MoF DEA Small Savings Schemes Rate Schedule | 7.40% p.a. (monthly payout) | Current | Verified / Unchanged |
| **Post Office 5-Year Recurring Deposit (RD)** | `application-assumptions.yml` | 6.75% p.a. | MoF DEA Notification F.No.1/4/2019-NS | 6.70% p.a. (compounded quarterly) | Q4 FY 2023-24 onward | **CHANGED: Updated from 6.75% to 6.70%** |
| **Bank Fixed Deposit (FD) Benchmark** | `application-assumptions.yml` | 7.00% p.a. | Scheduled Commercial Banks card rates (SBI, HDFC, ICICI 1-3 yr FD card rates) | ~6.80% – 7.10% p.a. | Current | Verified (Benchmark) |
| **Sweep-in FD Rate Benchmark** | `application-assumptions.yml`, `financial_assumptions` | 6.75% p.a. | Scheduled Commercial Banks auto-sweep yield | ~6.50% – 7.00% p.a. | Current | Verified (Benchmark) |
| **Savings Account Rate Benchmark** | `application-assumptions.yml`, `financial_assumptions` | 3.50% p.a. | Scheduled Commercial Banks card rates | 2.70% – 3.50% p.a. | Current | Verified (Benchmark) |

---

### 2.3 Market Benchmarks, Loans & Inflation
**Authoritative Sources:** Reserve Bank of India (RBI), NSE India, AMFI, MoSPI

| Parameter | Repo Location | Repo Value | Authoritative Citation | Confirmed Value | Context | Status |
|---|---|---|---|---|---|---|
| **Nifty 50 Long-Term Equity CAGR** | `application-assumptions.yml`, `financial_assumptions` | 12.00% | NSE India / AMFI historical 15–20 year rolling return of Nifty 50 TRI | 12.00% | Educational benchmark | Verified (Benchmark) |
| **Conservative Equity CAGR** | `application-assumptions.yml` | 10.00% | Large-cap defensive equity benchmark | 10.00% | Educational benchmark | Verified (Benchmark) |
| **Aggressive Equity CAGR** | `application-assumptions.yml` | 14.00% | Mid/Small-cap multi-cycle benchmark | 14.00% | Educational benchmark | Verified (Benchmark) |
| **Debt Hybrid Fund CAGR** | `application-assumptions.yml`, `financial_assumptions` | 7.50% | CRISIL Composite Bond / Conservative Hybrid Index 10-yr CAGR | 7.50% | Educational benchmark | Verified (Benchmark) |
| **Gold CAGR** | `application-assumptions.yml`, `financial_assumptions` | 9.00% | World Gold Council / RBI Sovereign Gold Bond historical IRR | 9.00% | Educational benchmark | Verified (Benchmark) |
| **Credit Card Typical APR** | `application-assumptions.yml`, `financial_assumptions` | 42.00% | Standard Schedule of Charges across Indian credit cards (3.5% monthly) | 42.00% | Industry standard | Verified / Unchanged |
| **Personal Loan Consolidation APR** | `application-assumptions.yml`, `financial_assumptions` | 13.50% | Typical unsecured personal loan rate range in India (11.5%–15%) | 13.50% | Industry median | Verified (Benchmark) |
| **Headline CPI Inflation Default** | `application-assumptions.yml`, `financial_assumptions` | 6.00% | RBI Monetary Policy Framework (target 4% ± 2% tolerance upper band) | 6.00% | Long-term conservative default | Verified (Conservative Default) |
| **Education Inflation Rate** | `application-assumptions.yml`, `financial_assumptions` | 10.00% | ASSOCHAM / NSSO higher education cost growth studies | 10.00% | Educational assumption | Verified (Benchmark) |
| **Healthcare Inflation Rate** | `application-assumptions.yml`, `financial_assumptions` | 12.00% | Willis Towers Watson / Mercer Marsh Global Medical Trends report (India) | 12.00% | Educational assumption | Verified (Benchmark) |

---

## 3. Disclaimers & Regulatory Notices

1. **Non-Guaranteed Projections:** Market benchmarks (Nifty 50, Gold, Debt, NPS CAGR) are historical illustrative estimates and do not guarantee future returns.
2. **Periodic Notification Dependency:** Small savings interest rates are subject to quarterly review and notification by the Ministry of Finance, Government of India.
3. **Statutory Non-Advice Notice:** All calculations are strictly educational tools and do not constitute registered tax, legal, or investment advice. Users must consult a SEBI-registered Investment Adviser or a Chartered Accountant before acting on calculations.
