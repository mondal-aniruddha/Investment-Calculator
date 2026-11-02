# InFinance — Personal Finance & Wealth Architecture for India

[![Live Site](https://img.shields.io/badge/Live-infinance--home.netlify.app-brightgreen)](https://infinance-home.netlify.app/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal-informational)](docs/ARCHITECTURE.md)

> A modern, trustworthy personal finance planning platform engineered for India (INR · ₹). Built with clean architecture principles, high-precision deterministic engines, and a responsive modern web experience.

---

## Architecture Overview

```mermaid
graph LR
    subgraph Frontend ["Frontend (React 19 + Vite 7)"]
        UI["UI Slices<br/>(src/features/*)"] --> Hooks["Feature Hooks"]
        Hooks --> State["React Query v5<br/>& React Context"]
        State --> Client["HTTP Client<br/>(Timeout & Retries)"]
    end

    subgraph Backend ["Backend (Spring Boot 4.1.1 + Java 21)"]
        Gateway["REST Controllers<br/>(/api/v1/*)"] --> Services["Application Services"]
        Services --> Engines["Pure Engines<br/>(SipEngine, LoanEngine, etc.)"]
        Services --> Otp["OTP & 2FA Service<br/>(Twilio / Dev Provider)"]
        Services --> Repo["Data Repositories"]
        Repo --> DB[(MySQL 8.4)]
    end

    Client -->|HTTP / JSON| Gateway
```

For an in-depth breakdown of architectural layering, domain design, and data flows, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Repository Layout

```
Investment-Calculator/
├── backend/                       # Spring Boot 4.1.1 + Java 21 Application
│   ├── src/main/java/com/infinance/
│   │   ├── investing/             # SIP and lumpsum calculation engines
│   │   ├── loan/                  # EMI, prepayment, balance transfer, floating rate
│   │   ├── fixedincome/           # FD, RD, PPF, EPF, NPS, SSY calculators
│   │   ├── mutualfund/            # SWP, CAGR, XIRR engines
│   │   ├── tax/                   # Income tax FY 2024–25 (Old vs New Regime)
│   │   ├── taxoptimizer/          # Deduction optimization engine (80C, 80D, etc.)
│   │   ├── retirement/            # Retirement corpus & inflation annuity engine
│   │   ├── simulation/            # Monte Carlo multi-trial market simulator
│   │   ├── sensitivity/           # Multi-variable parameter stress tester
│   │   ├── healthscore/           # 100-point financial health diagnostic
│   │   ├── goals/                 # Multi-goal priority planning engine
│   │   ├── networth/              # Balance sheet asset/liability engine
│   │   ├── metals/                # Live gold, silver & platinum rates
│   │   ├── queries/               # Personal finance queries submission, rate limiting & owner contact
│   │   ├── reports/               # PDF and Excel export services
│   │   ├── auth/                  # JWT auth, user accounts, OTP delivery, 2FA, backup codes
│   │   │   ├── config/            # OtpProperties configuration properties
│   │   │   ├── provider/          # OtpDeliveryProvider (Dev / Twilio REST client)
│   │   │   ├── security/          # OtpRateLimitFilter & LoginRateLimitFilter (Bucket4j)
│   │   │   └── service/           # OtpService (HMAC hashing, SecureRandom, cleanup) & AuthService
│   │   ├── configengine/          # Database-backed macro-economic assumptions
│   │   └── common/                # Security, CORS, RFC 7807 exceptions, math utils
│   └── src/main/resources/
│       ├── application.yml        # Base configuration
│       ├── application-dev.yml    # Development profile
│       ├── application-prod.yml   # Production profile
│       └── db/migration/          # Flyway schema migrations (V1..V9)
│
├── frontend/                      # Canonical Frontend (React 19 + Vite 7)
│   ├── src/
│   │   ├── app/                   # AppShell, ErrorBoundary, global providers
│   │   ├── features/              # Modular domain feature slices
│   │   │   ├── auth/              # Login, register, profile, 2FA management, OtpInput
│   │   │   ├── fixed-income/      # Fixed income forms & hooks
│   │   │   ├── glossary/          # Financial dictionary terms
│   │   │   ├── goals/             # Goals planner
│   │   │   ├── health-score/      # Health score audit
│   │   │   ├── home/              # Landing hero, stats, live rates
│   │   │   ├── learn/             # Learn Hub articles & markdown reader
│   │   │   ├── loans/             # Loan forms & amortization charts
│   │   │   ├── metals/            # Precious metal market widget
│   │   │   ├── mutual-funds/      # SWP, CAGR, XIRR tools
│   │   │   ├── net-worth/         # Net worth calculator
│   │   │   ├── planning/          # Financial planning roadmap
│   │   │   ├── queries/           # Ask a Finance Query page, form & owner contact
│   │   │   ├── retirement/        # Retirement & Monte Carlo forms
│   │   │   ├── sip/               # SIP & lumpsum calculators
│   │   │   └── tax/               # Tax comparison & optimizer
│   │   ├── shared/                # Shared UI, API client, formatters, hooks
│   │   └── styles/                # Design system CSS tokens & animations
│   ├── e2e/                       # Playwright test specs
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── docs/                          # Architecture, API spec, ADRs, cleanup audit
├── deploy/                        # Dockerfiles, docker-compose, Kubernetes manifests
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- **Java 21+** and **Maven 3.9+**
- **Node.js 20+** and **npm 10+**
- **Docker** and **Docker Compose** (optional, for containerized run)

### 2. Running Locally

#### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.
- **Interactive Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Actuator Health:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

#### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server starts on `http://localhost:5173`.

---

## Running with Docker & Kubernetes

### Docker Compose
Run the entire stack (MySQL 8.4, Spring Boot Backend, and Nginx-backed Vite Frontend) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:8081`
- Backend API: `http://localhost:8080`
- MySQL: `localhost:3306`

### Kubernetes
Kubernetes manifests are located under `deploy/k8s/`:
```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/secrets.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/backend-deployment.yaml
kubectl apply -f deploy/k8s/frontend-deployment.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

---

## Environment Variables

### Backend Configuration

| Variable | Default (Dev) | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile (`dev` or `prod`) |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/infinance` | MySQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `infinance` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `infinance` | Database password |
| `INFINANCE_JWT_SECRET` | *(dev fallback)* | Base64-encoded HMAC secret for JWT (required in prod, ≥32 chars) |
| `INFINANCE_OTP_ENABLED` | `true` | Enable OTP phone verification and 2FA |
| `INFINANCE_OTP_PROVIDER` | `dev` | OTP delivery provider (`dev` for mock logging, `twilio` for production) |
| `INFINANCE_OTP_SECRET` | *(dev fallback)* | HMAC-SHA256 secret key for hashing OTPs and backup codes (≥32 chars) |
| `INFINANCE_OTP_CODE_LENGTH` | `6` | Length of numeric OTP verification code |
| `INFINANCE_OTP_TTL_SECONDS` | `300` | Expiration time of OTP challenge in seconds (5 minutes) |
| `INFINANCE_OTP_MAX_ATTEMPTS` | `5` | Maximum failed verification attempts before challenge lockout |
| `INFINANCE_OTP_RESEND_COOLDOWN_SECONDS` | `60` | Cooldown period between resend requests |
| `INFINANCE_OTP_MAX_SENDS_PER_PHONE_PER_HOUR` | `5` | Rate limit cap on OTP dispatches per phone per hour |
| `INFINANCE_OTP_ALLOWED_COUNTRY_CODES` | `+91` | Comma-separated list of permitted E.164 country calling prefixes |
| `INFINANCE_TWILIO_ACCOUNT_SID` | *(empty)* | Twilio Account SID (required when provider=twilio) |
| `INFINANCE_TWILIO_AUTH_TOKEN` | *(empty)* | Twilio Auth Token (required when provider=twilio) |
| `INFINANCE_TWILIO_SMS_FROM` | *(empty)* | Twilio phone number or Messaging Service SID for SMS |
| `INFINANCE_TWILIO_WHATSAPP_FROM` | `+14155238886` | Twilio WhatsApp sender number (prefixed with whatsapp:) |
| `INFINANCE_TWILIO_WHATSAPP_CONTENT_SID` | *(empty)* | Twilio approved WhatsApp Authentication Template ContentSid |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed frontend origins |
| `INFINANCE_METALS_API_KEY` | *(empty)* | Optional API key for live metal rates |
| `INFINANCE_OWNER_NAME` | `Aniruddha Mondal` | Site owner display name |
| `INFINANCE_OWNER_WHATSAPP` | `+91 8013292565` | Direct WhatsApp contact number of owner (used for wa.me links) |
| `INFINANCE_OWNER_EMAIL` | `aniruddha0266@gmail.com` | Direct contact email address of owner |
| `INFINANCE_TEAM_n_*` | *(built-in defaults in yml)* | Team members configuration (index 0 = founder, index 1 = co-founder) |
| `INFINANCE_QUERIES_NOTIFY_ENABLED` | `false` | Enable email notifications on query submission |
| `INFINANCE_QUERIES_RECIPIENT_EMAIL` | `aniruddha0266@gmail.com` | Recipient email address for query notifications |

---

## Twilio & WhatsApp Setup Notes

1. **Twilio REST Messages API:**
   - InFinance integrates with Twilio using Spring's `RestClient` directly without the bulky Twilio SDK.
   - For **SMS dispatches**, configure `INFINANCE_TWILIO_SMS_FROM` with your verified alphanumeric sender ID or Twilio phone number.
   - For **WhatsApp dispatches**, Twilio requires messages initiated outside a 24-hour customer care window to use an approved Meta template. Set `INFINANCE_TWILIO_WHATSAPP_CONTENT_SID` to your approved WhatsApp Authentication Content Template.

2. **Indian DLT Compliance (TRAI):**
   - For transactional SMS delivered to Indian phone numbers (`+91`), TRAI mandates Distributed Ledger Technology (DLT) registration.
   - In production, register your Principal Entity with telecom operators (Jio, Airtel, Vodafone Idea) and obtain an approved Header (Sender ID) and Content Template matching InFinance OTP notifications:
     `Your InFinance verification code is {#var#}. Valid for 5 minutes. Do not share this OTP with anyone.`

---

## Privacy & Data Protection (DPDP Act)

InFinance adheres to Indian Digital Personal Data Protection (DPDP) Act standards:
- **Data Minimization:** Only the user's mobile number in E.164 format (`+91XXXXXXXXXX`) is retained for authentication and account security purposes.
- **Cryptographic Security:** OTP codes and backup recovery codes are **never stored in plaintext**. Only keyed HMAC-SHA256 digests are stored in `otp_challenges` and `user_backup_codes`.
- **Stateless Verification:** Verification challenge IDs are randomly generated UUIDs stored server-side. No challenge artifact is ever signed as a JWT session token.
- **Automated Retention Purge:** An automated Spring `@Scheduled` background task runs every hour to purge expired challenges and delete abandoned unverified accounts older than 24 hours.
- **Account Recovery:** If a user loses access to both their verified phone and their 10 single-use backup recovery codes, account recovery is handled through manual verified owner-assisted identity verification.

---

## Scripts & Testing Reference

### Backend Tests
```bash
cd backend
mvn clean verify         # Full build, static analysis, unit & integration tests
mvn test                 # Run test suite
```

### Frontend Checks & Tests
```bash
cd frontend
npm run lint             # ESLint 9 verification
npm run format:check     # Prettier code style check
npm run format           # Auto-format all frontend source files
npm test                 # Run Vitest unit tests
npm run build            # Production Vite bundle build
npm run test:e2e         # Run Playwright end-to-end integration tests
```

---

## Documentation Index

- [Architecture Reference](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Contributing & Calculator Guide](docs/CONTRIBUTING.md)
- [State Management ADR](docs/adr/0001-state-management.md)
- [Architectural Changes & Non-Breaking Verification](docs/CHANGES.md)
- [Baseline Audit](docs/AUDIT.md)

---

## License

This project is licensed under the MIT License.
