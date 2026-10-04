# Changelog

All notable changes to the InFinance Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Metals / Netlify**: New `MetalsDevDataProvider` adapter targeting [metals.dev](https://metals.dev) `/v1/metal/authority?authority=mcx` (MCX reference authority). Returns Gold (MCX 99.5%), indicative 22K Gold, and Silver in INR/g and INR/10 g. Selectable via `INFINANCE_METALS_PROVIDER=metals-dev` (default).
- **Metals / Netlify**: `MetalsDevDataProviderTest` — unit tests covering normalize, missing rates, API key guard, and HTTP mock round-trips via `MockRestServiceServer`.
- **Netlify**: `netlify.toml` now includes two reverse-proxy redirect rules (`/api/*` and `/actuator/*` → `:BACKEND_URL/…`) so browser requests from the Netlify-hosted UI are forwarded to the deployed Spring Boot backend. Set `BACKEND_URL` in Netlify Site configuration → Environment variables before deploying.
- **Docs**: New "Netlify deployment" section in `README.md` explaining the `BACKEND_URL` requirement and step-by-step setup.

### Changed
- **Metals**: `MetalsProperties` defaults switched from `metals-api.com` to `metals.dev` (`baseUrl`, `providerLabel`, `planTier`, `disclaimer`, `provider`, `authority`). Env var bindings (`INFINANCE_METALS_*`) are unchanged.
- **Metals**: `application-assumptions.yml` metals block updated with `metals.dev` defaults and new `authority` property (`INFINANCE_METALS_AUTHORITY=mcx`).
- **Ops**: `docker-compose.yml`, `deploy/env/.env.example`, and `k8s/secret.example.yaml` updated with `INFINANCE_METALS_PROVIDER`, `INFINANCE_METALS_BASE_URL`, and `INFINANCE_METALS_AUTHORITY`.

- **Task 28**: New automated test suite `RateVerificationAssertionTest` asserting all loaded `FinancialProperties`, `IncomeTaxEngine` constants, small savings rates, and tax slabs match the official verification register.
- **Task 28**: Flyway migration `V4__align_verified_financial_rates.sql` seeding verified Post Office Recurring Deposit (`rd_rate`), 5-year Time Deposit (`potd_5y_rate`), and Monthly Income Scheme (`pomis_rate`) into `financial_assumptions`.

### Changed
- **Task 28**: Aligned 5-Year Post Office Recurring Deposit (`rd-rate`) from 6.75% to 6.70% p.a. in `application-assumptions.yml` and `FinancialProperties.java` per Ministry of Finance Notification F.No.1/4/2019-NS.
- **Task 28**: Enhanced `TaxOptimizerService` with resilient financial-year lookup supporting both `2024-2025` and `fy-2024-2025` map keys.
- **Task 28**: Added explicit source and last-verified metadata annotations across all sections of `application-assumptions.yml`.
