# InFinance REST API Specification

> Complete reference for the InFinance REST API (Version 1). All endpoints are versioned under `/api/v1`.

---

## 1. Overview & Interactive Documentation

- **Base URL (Local Development):** `http://localhost:8080`
- **Interactive Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3.1 JSON Specification:**
  - Full API: `http://localhost:8080/v3/api-docs`
  - Public Calculators: `http://localhost:8080/v3/api-docs/public`
  - Administrative Endpoints: `http://localhost:8080/v3/api-docs/admin`

---

## 2. Authentication & Authorization

InFinance supports stateless JWT authentication.
- **Header Format:** `Authorization: Bearer <JWT_TOKEN>`
- Endpoints marked **Public** require no authentication.
- Endpoints marked **Authenticated** require a valid, non-expired Bearer token.
- Endpoints marked **Admin** require a user account with the `ROLE_ADMIN` authority.

---

## 3. Standard Error Format (RFC 7807)

All non-2xx responses return an RFC 7807 Problem Details object with a unique distributed tracing `correlationId`:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Input validation failed for 1 field(s).",
  "instance": "/api/v1/investing/sip/calculate",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "fieldErrors": [
    {
      "field": "monthlyInvestment",
      "message": "Monthly investment must be greater than or equal to 100",
      "rejectedValue": 50
    }
  ]
}
```

The `correlationId` is also mirrored in the HTTP response headers as `X-Correlation-Id`.

---

## 4. Endpoint Matrix

### 4.1 Authentication & User Management (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials and receive a JWT token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile and role |
| `GET` | `/api/v1/auth/saved-scenarios` | Authenticated | List all saved financial calculation scenarios |
| `POST` | `/api/v1/auth/saved-scenarios` | Authenticated | Save a new financial calculation scenario |
| `DELETE` | `/api/v1/auth/saved-scenarios/{id}` | Authenticated | Delete a previously saved scenario |

### 4.2 Investing & Wealth Building (`/api/v1/investing`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/investing/sip/calculate` | Public | Systematic Investment Plan (standard & step-up SIP) |
| `POST` | `/api/v1/investing/lumpsum/calculate` | Public | One-time lumpsum compounding with yearly trajectories |

### 4.3 Loans & Mortgages (`/api/v1/loan`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/loan/emi` | Public | Equated Monthly Installment (EMI) & full amortization schedule |
| `POST` | `/api/v1/loan/prepayment` | Public | Part-prepayment impact (reduce tenure vs. reduce EMI) |
| `POST` | `/api/v1/loan/surplus-compare` | Public | Comparative analysis: Loan prepayment vs. SIP wealth generation |
| `POST` | `/api/v1/loan/balance-transfer` | Public | Loan balance transfer savings calculator (including processing fees) |
| `POST` | `/api/v1/loan/floating-rate` | Public | Stress test floating rate interest hikes on tenure/EMI |

### 4.4 Fixed Income & Small Savings (`/api/v1/fixed-income`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/fixed-income/fd` | Public | Fixed Deposit (cumulative & non-cumulative) |
| `POST` | `/api/v1/fixed-income/rd` | Public | Recurring Deposit maturity and interest computation |
| `POST` | `/api/v1/fixed-income/ppf` | Public | Public Provident Fund (15-year statutory lock-in) |
| `POST` | `/api/v1/fixed-income/epf` | Public | Employee Provident Fund (employee + employer contribution) |
| `POST` | `/api/v1/fixed-income/nps` | Public | National Pension System annuity and lump-sum projection |
| `POST` | `/api/v1/fixed-income/ssy` | Public | Sukanya Samriddhi Yojana calculator for the girl child |

### 4.5 Mutual Funds & Portfolio Metrics (`/api/v1/mutual-funds`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/mutual-funds/swp` | Public | Systematic Withdrawal Plan (SWP) post-retirement cash flows |
| `POST` | `/api/v1/mutual-funds/cagr` | Public | Compound Annual Growth Rate over point-to-point intervals |
| `POST` | `/api/v1/mutual-funds/xirr` | Public | Extended Internal Rate of Return across irregular cash flows |

### 4.6 Income Tax & Tax Optimization (`/api/v1/tax`, `/api/v1/tax-optimizer`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tax/calculate` | Public | Income Tax calculation for FY 2024–25 (Old & New Regimes) |
| `POST` | `/api/v1/tax/compare` | Public | Side-by-side comparison of Old vs. New Regime tax liabilities |
| `POST` | `/api/v1/tax-optimizer/recommend` | Public | Unutilized deduction capacity recommendations (80C, 80D, 80CCD) |

### 4.7 Retirement & Simulations (`/api/v1/retirement`, `/api/v1/simulation`, `/api/v1/sensitivity`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/retirement/calculate` | Public | Retirement corpus requirement, shortfall, and required SIP |
| `POST` | `/api/v1/retirement/what-if` | Public | What-if scenario analysis varying inflation and return rates |
| `POST` | `/api/v1/simulation/monte-carlo` | Public | 1,000+ stochastic trials simulating market volatility |
| `POST` | `/api/v1/sensitivity/analyze` | Public | Multi-variable sensitivity matrix across rates and durations |

### 4.8 Goals, Health Score, Net Worth (`/api/v1/goals`, `/api/v1/health-score`, `/api/v1/net-worth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/goals/plan` | Public | Multi-goal financial timeline prioritization |
| `POST` | `/api/v1/health-score/calculate` | Public | 100-point financial health diagnostic (debt, emergency fund, savings) |
| `POST` | `/api/v1/net-worth/calculate` | Public | Balance sheet asset vs. liability net worth computation |

### 4.9 Market Data & Commodities (`/api/v1/metals`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/metals/rates` | Public | Live Gold (24K, 22K), Silver, and Platinum prices in INR |

### 4.10 Reports & Export (`/api/v1/reports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reports/pdf` | Authenticated | Generate a downloadable PDF financial plan |
| `POST` | `/api/v1/reports/excel` | Authenticated | Export amortization or projection schedules to Excel (.xlsx) |

### 4.11 Learning Content & Glossary (`/api/v1/content`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/content/learn/articles` | Public | Fetch published educational financial articles |
| `GET` | `/api/v1/content/learn/articles/{slug}` | Public | Fetch a specific article by unique slug |
| `GET` | `/api/v1/content/glossary/terms` | Public | Retrieve curated financial glossary definitions |

### 4.12 System & Actuator

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/actuator/health` | Public | System liveness and readiness probe |
| `GET` | `/actuator/info` | Public | Application metadata, build version, and commit hash |
| `GET` | `/actuator/metrics` | Admin | JVM runtime, garbage collection, and HTTP metrics |
