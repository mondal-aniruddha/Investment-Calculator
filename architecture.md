# InFinance Calculator Architecture

## System flow

```text
React/Vite browser
  -> REST/JSON requests under /api/v1
  -> Spring MVC controllers
  -> validated DTOs and service orchestration
  -> stateless BigDecimal calculation engines
  -> configurable assumptions / repositories / external integrations
  -> response DTO with results, assumptions, and disclaimer
```

Authenticated profile and scenario requests pass through JWT security. Admin
reference-data requests use role-protected HTTP Basic authentication. The
frontend attaches the JWT to protected calls and renders charts and educational
explanations from API responses.

## Technology stack

- Java 21, Spring Boot 4.1.1, Spring Web MVC, Bean Validation.
- Spring Data JPA, Hibernate, H2 for development, MySQL for deployment.
- Flyway migrations and Springdoc OpenAPI.
- Spring Security, JJWT, AES-GCM scenario encryption.
- Caffeine cache, Bucket4j rate limiting, Micrometer Actuator metrics.
- Maven, jqwik, MockMvc, JaCoCo, OWASP Dependency-Check.
- React 19, Vite, react-i18next, CSS, browser charts and PWA shell.
- Playwright for critical browser flows.
- Docker Compose and Kubernetes/Kustomize for deployment.

## Repository layout

```text
backend/src/main/java/com/infinance/
  auth/             JWT accounts and saved scenarios
  common/           configuration, errors, money, security, web filters
  config_engine/    assumptions, tax configuration, audit, refresh
  investing/        SIP and lumpsum
  loan/             EMI and loan comparisons
  fixedincome/      fixed-income schemes
  mutualfund/       SIP, SWP, CAGR, XIRR
  retirement/       retirement projections
  goals/            multi-goal planning
  healthscore/      financial health scoring
  networth/         asset/liability aggregation
  tax/              income-tax calculations
  taxoptimizer/     deduction optimization
  simulation/       deterministic Monte Carlo
  sensitivity/      what-if analysis
  ai/               optional explanation integration
  reports/          PDF and Excel exports

backend/src/main/resources/
  application*.yml       environment configuration
  db/migration/          Flyway schema and seed migrations

backend/src/test/         engine, service, controller, property, contract tests
src/                      React application and localization
public/                   PWA manifest, icon, service worker
e2e/                      Playwright critical flows
docker/, k8s/, deploy/    deployment assets and secret templates
```

## Design principles

Each module follows DTO -> controller -> service -> pure engine. Engines do not
depend on Spring, use BigDecimal for money, and expose formulas through
Javadoc. Configuration is externalized rather than embedded in calculation
logic. Shared validation, error responses, assumptions, formatting, and
disclaimers are reused across modules.

## Runtime environments

The `dev` profile uses H2 and port 8080. The `prod` profile uses MySQL,
environment-provided secrets, Flyway migrations, and container deployment.
The Vite dev server runs on port 5173 and proxies API and Actuator requests to
the backend. Docker Compose exposes the UI on port 8081 and the API on 8080.
