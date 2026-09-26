# InFinance Calculator

InFinance Calculator is a Spring Boot REST API for Indian personal-finance planning. It provides calculation engines and explainable responses for SIP and lumpsum investing, retirement planning, and income-tax comparisons.

## Features

- SIP projections with step-up contributions, yearly growth, and pessimistic/expected/optimistic scenarios
- Lumpsum compounding projections
- Retirement corpus planning with inflation-adjusted expenses, accumulation trajectories, and what-if analysis
- Old versus New Indian income-tax regime comparison, including slab breakdowns, deductions, Section 87A rebate, surcharge, and cess
- Configurable financial assumptions such as scheme rates, market benchmarks, and inflation
- H2 for local development and MySQL support for deployed environments
- Flyway database migrations
- OpenAPI documentation and Spring Boot Actuator endpoints

## Technology

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC and Bean Validation
- Spring Data JPA and Hibernate
- H2 / MySQL
- Flyway
- Springdoc OpenAPI
- Maven

## Project layout

```text
backend/
├── src/main/java/com/infinance/
│   ├── investing/       # SIP and lumpsum calculations
│   ├── retirement/      # Retirement planning
│   ├── tax/             # Tax regime and slab calculations
│   ├── config_engine/   # Financial assumptions and configuration
│   └── common/          # Shared DTOs, validation, errors, and money utilities
├── src/main/resources/
│   ├── application*.yml
│   └── db/migration/    # Flyway migrations and seed data
└── src/test/            # Unit and controller tests
```

## Requirements

- JDK 21 or later
- Maven 3.9 or later
- Node.js 20 or later

## Run locally

Start the backend first:

From the repository root:

```bash
cd backend
mvn spring-boot:run
```

The development profile uses an in-memory H2 database and starts the API at `http://localhost:8080`.

In a second terminal, start the React UI:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` and `/actuator` requests to the backend at port `8080`.

To run the test suite:

```bash
cd backend
mvn clean verify
cd ..
npm run build
```

`mvn verify` runs the unit tests, jqwik property-based tests, MockMvc API
contract tests, and JaCoCo coverage gate. The gate is evaluated during CI and
fails the build when backend line coverage falls below 20%.

The API enables bounded Caffeine caching for reference data, gzip response
compression, per-client request limiting, a 1 MB request-body limit, security
headers, correlation IDs (`X-Correlation-ID`), Micrometer request counters, and
liveness/readiness health probes. Saved scenario payloads are encrypted with
AES-GCM; set `INFINANCE_ENCRYPTION_SECRET` to a strong environment-specific
secret in every non-development deployment. OWASP Dependency-Check runs during
`mvn verify` and requires an NVD API key to access the current vulnerability
feed. Add an `NVD_API_KEY` repository Actions secret (request a key from the
NVD website) before running backend CI. For local verification, export
`NVD_API_KEY` and run `mvn clean verify -DnvdApiKey="$NVD_API_KEY"`.

To run the browser-level critical-flow tests locally:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

The Playwright tests mock the calculator API responses, so they do not require
the backend, a database, or any external service. CI runs the same tests
against the production Vite preview server.

To create a production UI bundle:

```bash
npm run build
```

## Container deployment (Phase E5)

The repository includes reproducible images for the Spring Boot API and Vite UI:

- `docker/backend.Dockerfile` builds with Maven and runs on a Java 21 JRE.
- `docker/frontend.Dockerfile` builds the Vite bundle and serves it with nginx.
- `docker/nginx.conf` serves SPA routes and reverse-proxies `/api` and `/actuator`
  to the backend service.

For local development with a persistent MySQL container, copy the environment
template and start the stack:

```bash
Copy-Item deploy/env/.env.example .env
# Edit .env and replace the example passwords/secrets.
docker compose up --build
```

The UI is available at `http://localhost:8081`, the API at
`http://localhost:8080`, and MySQL is only reachable inside the Compose network.
Stop the stack with `docker compose down`; add `-v` when intentionally removing
the local database volume.

Kubernetes manifests are in `k8s/`. Before applying them, replace the example
image names and host in `k8s/backend.yaml`, `k8s/frontend.yaml`, and
`k8s/ingress.yaml`, then create a real secret (do not commit credentials):

```bash
kubectl create namespace infinance
kubectl -n infinance create secret generic infinance-secrets \
  --from-literal=SPRING_DATASOURCE_USERNAME="$MYSQL_USER" \
  --from-literal=SPRING_DATASOURCE_PASSWORD="$MYSQL_PASSWORD" \
  --from-literal=MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
  --from-literal=INFINANCE_JWT_SECRET="$INFINANCE_JWT_SECRET" \
  --from-literal=INFINANCE_ADMIN_USERNAME="$INFINANCE_ADMIN_USERNAME" \
  --from-literal=INFINANCE_ADMIN_PASSWORD="$INFINANCE_ADMIN_PASSWORD"
kubectl apply -k k8s/
```

`k8s/secret.example.yaml` documents the required keys and is safe to customize
locally, but should not be applied with placeholder values. The production
Spring profile (`application-prod.yml`) expects a MySQL datasource and keeps
Hibernate schema validation enabled; Flyway owns schema changes.

## API documentation

With the application running:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- Actuator health: http://localhost:8080/actuator/health

## API client collections

Ready-to-import local API collections are included for both Postman and Bruno:

- Postman collection: `postman/Investment-Calculator.postman_collection.json`
- Postman environment: `postman/Investment-Calculator-Local.postman_environment.json`
- Bruno collection: `bruno/Investment-Calculator`

Start the backend with the `dev` profile before sending requests:

```bash
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

In Postman, import both JSON files and select the `Investment Calculator - Local` environment. In Bruno, open the `bruno/Investment-Calculator` directory as a collection and select the `Local` environment. Both clients use `http://localhost:8080` by default.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/investing/sip` | Calculate SIP growth and scenarios |
| `POST` | `/api/v1/investing/lumpsum` | Calculate one-time investment growth |
| `POST` | `/api/v1/retirement/plan` | Calculate retirement corpus and savings requirements |
| `POST` | `/api/v1/tax/calculate` | Compare Old and New tax regimes |
| `GET` | `/api/v1/tax/slabs` | Read configured tax slabs |
| `GET` | `/api/v1/config/assumptions` | Read financial assumptions and benchmarks |
| `POST` | `/api/v1/loans/emi` | Calculate EMI and amortization |
| `POST` | `/api/v1/loans/prepayment` | Estimate part-payment impact |
| `POST` | `/api/v1/loans/surplus-comparison` | Compare part-payment with surplus SIP investing |
| `POST` | `/api/v1/loans/balance-transfer` | Estimate balance-transfer savings |
| `POST` | `/api/v1/loans/floating-rate` | Simulate a floating-rate change |
| `POST` | `/api/v1/fixed-income/calculate` | Project FD, RD, PPF, EPF, NPS, SSY, and post-office schemes |
| `POST` | `/api/v1/mutual-funds/sip` | Calculate SIP and step-up SIP |
| `POST` | `/api/v1/mutual-funds/lumpsum` | Calculate mutual-fund lumpsum growth |
| `POST` | `/api/v1/mutual-funds/swp` | Calculate systematic withdrawals |
| `POST` | `/api/v1/mutual-funds/cagr` | Calculate CAGR |
| `POST` | `/api/v1/mutual-funds/xirr` | Calculate XIRR for dated cash flows |
| `POST` | `/api/v1/goals/plan` | Allocate required monthly savings across multiple goals |
| `POST` | `/api/v1/health-score/calculate` | Calculate a weighted financial health score |
| `POST` | `/api/v1/net-worth/calculate` | Aggregate assets, liabilities, allocation, and history |
| `POST` | `/api/v1/tax/optimizer` | Recommend remaining configured deductions |
| `POST` | `/api/v1/simulations/monte-carlo` | Run seedable retirement/goal simulations |
| `POST` | `/api/v1/analysis/sensitivity` | Compare return and contribution what-if scenarios |
| `GET` | `/api/v1/config/refresh-status` | View scheduled reference-data refresh status |
| `POST` | `/api/v1/insights/explain` | Get an optional AI explanation of calculator results |
| `POST` | `/api/v1/reports/pdf` | Download a combined PDF report |
| `POST` | `/api/v1/reports/excel` | Download a combined Excel report |
| `POST` | `/api/v1/auth/register` | Register a saved-profile account |
| `POST` | `/api/v1/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/v1/scenarios` | List saved scenarios for the authenticated user |
| `POST` | `/api/v1/scenarios` | Save a calculator scenario |
| `POST` | `/api/v1/scenarios/compare` | Compare owned scenarios side by side |

Request and response schemas are available in Swagger UI. All calculation endpoints validate request bodies and return structured error responses for invalid input.

The Phase A calculators expose assumptions in every projection response. Scheme rates in `application-assumptions.yml` are illustrative configuration values and must be verified against current official RBI, India Post, PFRDA, EPFO, SEBI/AMFI, and Income Tax Department sources before production use.

### Phase C administration and integrations

Reference-data administration uses HTTP Basic authentication with the `ADMIN` role. Set
`INFINANCE_ADMIN_USERNAME` and `INFINANCE_ADMIN_PASSWORD` before starting the backend, then use
`/api/v1/admin/assumptions` and `/api/v1/admin/tax-slabs` for CRUD operations. Changes are written to
`assumption_audit` and evict in-memory caches. The development default is `admin` / `change-me`; override
it outside local development.

Scheduled refresh is disabled by default. Set `INFINANCE_REFRESH_ENABLED=true` and provide the AMFI,
repo-rate, and CPI source URLs. Failed requests retain the last successful timestamp and report a fallback
state through `/api/v1/config/refresh-status`.

AI explanations are opt-in. Set `INFINANCE_AI_ENABLED=true` and `ANTHROPIC_API_KEY`; only the calculator
result map is sent and every response includes the educational disclaimer. PDF and Excel reports accept
calculator results and assumptions supplied by the client and do not persist them.

### Phase D user experience

Authentication uses stateless JWTs. Configure `INFINANCE_JWT_SECRET` and
`INFINANCE_JWT_EXPIRATION_MINUTES`; account deletion cascades through saved scenarios. Send the returned
token as `Authorization: Bearer <token>` for profile and scenario endpoints.

The UI includes English, Hindi, and Bengali resource bundles, a five-step onboarding wizard, dark mode,
print styles, keyboard-friendly controls, screen-reader labels, a service-worker shell cache, and an
educational glossary. Calculator inputs and outputs continue to use Indian number formatting. The browser
can export reminder dates through the standard calendar/download surfaces; reminders are intentionally
client-side until an email provider is configured.

## Configuration

The default `dev` profile is configured in `backend/src/main/resources/application.yml` and `application-dev.yml`. Financial assumptions and seeded tax slabs are defined in:

- `backend/src/main/resources/application-assumptions.yml`
- `backend/src/main/resources/db/migration/V1__init_assumptions_and_slabs.sql`

For a deployed environment, provide a MySQL datasource through standard Spring datasource properties and use an appropriate profile. Do not commit credentials or other secrets.

## Disclaimer

This project provides estimates for education and planning. Tax rules, rates, deductions, and investment returns can change. Verify calculations against current official guidance and consult a qualified financial or tax professional before making decisions.
