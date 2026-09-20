# InFinance Project Memory

## Current state

The repository contains a Spring Boot 4.1.1 / Java 21 backend and React 19 /
Vite frontend for Indian personal-finance planning. The application is
organized by calculator domain and uses `/api/v1` endpoints.

## Important decisions

- Financial engines are pure and stateless; services handle orchestration.
- BigDecimal is used for money and Indian currency formatting is preserved.
- Financial rates, tax slabs, deduction limits, and inflation assumptions are
  externalized in `application-assumptions.yml` or database reference data.
- Responses include assumptions and the educational disclaimer.
- Development uses H2; production uses MySQL and Flyway.
- JWT protects user profile/scenario APIs; admin reference data uses Basic auth.
- Saved scenario payloads use AES-GCM encryption and require
  `INFINANCE_ENCRYPTION_SECRET` outside development.
- The frontend stores the JWT in local storage, attaches it to API requests,
  and supports English, Hindi, and Bengali.
- AI explanations are opt-in, receive calculation results without personal
  identifiers, and are not financial advice.

## Operational commands

```bash
# Backend
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
npm start

# Backend verification and frontend build
mvn -f backend/pom.xml clean verify
npm run build

# Browser tests
npm run test:e2e
```

The backend is normally available on `http://localhost:8080`; the Vite UI is
normally available on `http://localhost:5173`.

## Known assumptions and cautions

- Configured financial rates are illustrative until verified against official
  RBI, India Post, PFRDA, EPFO, SEBI/AMFI, and Income Tax Department sources.
- Development credentials and fallback secrets must never be used in
  production.
- Scheduled refresh is disabled by default and external provider formats must
  be verified before enabling it.
- AI and report features are optional and should not persist personal data.
- Browser JWT storage should be reviewed against the production XSS threat model.

## Recent history

- Phase A added loan, fixed-income, and mutual-fund calculators.
- Phase B added smart planning and simulations.
- Phase C added administration, refresh, AI explanations, and reports.
- Phase D added authentication, localization, onboarding, UX polish, and
  educational content.
- Phase E added engineering hardening, testing, observability, and deployment.
- IDE cleanup removed dead imports/variables, replaced deprecated Bucket4j APIs,
  and passed backend tests, frontend build, and whitespace checks.

## Maintenance protocol

When making a meaningful change, append the date, decision, affected modules,
tests run, and any migration or configuration requirement here. Keep this file
factual and concise so another AI can safely continue the work.
