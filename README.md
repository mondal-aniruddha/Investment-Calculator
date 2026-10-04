# InFinance — Root Workspace

> A monorepo containing the React/Vite frontend and Spring Boot backend for the InFinance personal finance planning app (India · INR).

[![Live Site](https://img.shields.io/badge/Live-infinance--home.netlify.app-brightgreen)](https://infinance-home.netlify.app/)

---

## Repository Layout

```
Investment-Calculator/
├── frontend/               React 19 + Vite 7 app
│   ├── src/
│   │   ├── styles/         index.css · animations.css · components.css
│   │   ├── layouts/        AppShell (sticky nav + footer + orbs)
│   │   ├── components/
│   │   │   ├── ui/         Button, Card, Input, ResultCard, Charts, etc.
│   │   │   └── shared/     LiveMetalPrices, ProtectedRoute, ReminderCard
│   │   ├── pages/          One file per page/route
│   │   ├── hooks/          useCalculator, useTheme, useScrollReveal
│   │   ├── services/       api.js (JWT-aware fetch wrapper)
│   │   ├── utils/          format.js (formatINR, formatINRDecimal, etc.)
│   │   └── context/        AuthContext, ToastContext
│   ├── package.json
│   ├── vite.config.js
│   └── netlify.toml
│
├── backend/                Spring Boot 4.1.1 · Java 21
│   ├── src/main/java/com/infinance/
│   │   ├── investing/      SIP + lumpsum engine
│   │   ├── loan/           EMI, prepayment, BT, floating-rate
│   │   ├── fixedincome/    FD/RD/PPF/EPF/NPS/SSY
│   │   ├── mutualfund/     SWP, CAGR, XIRR
│   │   ├── tax/            Income tax (old + new regime)
│   │   ├── taxoptimizer/   Tax deduction optimizer
│   │   ├── retirement/     Retirement planner
│   │   ├── simulation/     Monte Carlo
│   │   ├── healthscore/    Financial health score
│   │   ├── goals/          Multi-goal planner
│   │   ├── networth/       Net worth tracker
│   │   ├── sensitivity/    Sensitivity analysis
│   │   ├── metals/         Live metal prices (metals.dev)
│   │   ├── reports/        PDF + Excel export
│   │   ├── auth/           JWT auth, user accounts, saved scenarios
│   │   ├── config_engine/  DB-backed assumptions + admin API
│   │   ├── ai/             AI plain-language explanations
│   │   └── common/         Security, CORS, exceptions, money utils
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-dev.yml    (H2 in-memory)
│       ├── application-prod.yml   (MySQL)
│       ├── application-assumptions.yml  (externalized rates)
│       └── db/migration/          Flyway V1–V5
│
├── docs/                   ER diagram, API reference
├── docker-compose.yml      Full-stack local setup
└── README.md               This file
```

---

## Quick Start (Local Development)

### Prerequisites
- Node 20+ and npm 10+
- Java 21 and Maven 3.9+
- Docker Desktop (for the database)

### 1. Start the database

```bash
docker compose up mysql -d
```

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# Backend runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# Health: http://localhost:8080/actuator/health
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
# Vite proxies /api/* and /actuator/* to localhost:8080
```

---

## Docker (Full Stack)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env — set MYSQL_PASSWORD, INFINANCE_JWT_SECRET, INFINANCE_METALS_API_KEY, etc.

docker compose up --build
# Frontend: http://localhost:8081
# Backend:  http://localhost:8080
```

---

## Frontend Environment Variables

Create `frontend/.env.local` (not committed):

```env
# Leave blank for Vite dev proxy; set for production
VITE_API_BASE_URL=https://your-backend.example.com
```

---

## Backend Environment Variables

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` (H2) or `prod` (MySQL) |
| `SPRING_DATASOURCE_URL` | H2 in-memory | MySQL JDBC URL in prod |
| `INFINANCE_JWT_SECRET` | dev placeholder | Must be ≥32 chars in prod |
| `INFINANCE_METALS_API_KEY` | — | metals.dev API key |
| `INFINANCE_AI_ENABLED` | `false` | Enable AI explanations |
| `ANTHROPIC_API_KEY` | — | Anthropic API key (if AI enabled) |
| `APP_CORS_ALLOWED_ORIGINS` | localhost | Comma-separated allowed origins |

---

## Deployment

### Frontend → Netlify

1. Connect the repo in Netlify
2. Set **Base directory**: `frontend`
3. Set **Build command**: `npm run build`
4. Set **Publish directory**: `frontend/dist`
5. Add env var: `BACKEND_URL=https://your-backend.example.com`
6. The `frontend/netlify.toml` handles SPA routing and API proxy rewrites automatically.

### Backend → Render / Railway / Fly.io

Any JVM-compatible host works. Example for Render:

1. New Web Service → select repo
2. Runtime: Docker (uses `docker/backend.Dockerfile`)
3. Set all environment variables from the table above
4. Health check path: `/actuator/health`

---

## API Reference

All endpoints are prefixed with `/api/v1/`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/investing/sip` | SIP with step-up |
| POST | `/investing/lumpsum` | Lumpsum projection |
| POST | `/loans/emi` | EMI / amortisation |
| POST | `/loans/prepayment` | Prepayment impact |
| POST | `/loans/balance-transfer` | BT savings |
| POST | `/fixed-income/calculate` | FD/RD/PPF/EPF/NPS/SSY |
| POST | `/mutual-funds/swp` | SWP projection |
| POST | `/mutual-funds/cagr` | CAGR calculator |
| POST | `/mutual-funds/xirr` | XIRR calculator |
| POST | `/health-score/calculate` | Financial health score |
| POST | `/simulations/monte-carlo` | Monte Carlo simulation |
| POST | `/net-worth/calculate` | Net worth snapshot |
| POST | `/goals/plan` | Multi-goal planner |
| POST | `/tax/calculate` | Income tax (old + new) |
| POST | `/tax/optimizer` | Tax deduction optimizer |
| POST | `/analysis/sensitivity` | Sensitivity analysis |
| POST | `/retirement/plan` | Retirement projector |
| GET  | `/market/metals` | Live metal prices (INR) |
| POST | `/insights/explain` | AI result explanation |
| POST | `/reports/pdf` | PDF report export |
| POST | `/reports/excel` | Excel report export |
| GET  | `/assumptions` | Read configured rates |

Interactive docs at `/swagger-ui.html` when backend is running.

---

## Disclaimer

InFinance is **educational software only**. All projections are illustrative estimates.
This is not investment, tax, legal, or financial advice.
InFinance is not SEBI-registered. Consult a SEBI-registered financial advisor before making decisions.

---

*© 2025 InFinance · India · INR*
