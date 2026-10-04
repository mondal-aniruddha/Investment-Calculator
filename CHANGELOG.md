# Changelog

All notable changes to the InFinance Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2025-10-04

### Added (Frontend — major restructure)
- **Monorepo**: New `frontend/` directory containing all React/Vite source. Root `src/` is preserved unchanged for reference; the new `frontend/` is the canonical build target.
- **Design system**: Three-file modular CSS system (`index.css`, `animations.css`, `components.css`) replacing the 1084-line monolithic `styles.css`. Soft gradient mesh background, CSS custom properties (dark + light), full typography scale using DM Sans + DM Mono + Playfair Display.
- **Floating orbs**: Three slow, blurred radial-gradient orbs with `floatA/B/C` keyframe animations. All animations gated on `prefers-reduced-motion`. Dark-mode palette variants included.
- **Scroll reveal**: `useScrollReveal` hook using IntersectionObserver. `.reveal` / `.reveal-stagger` CSS classes. Instantly revealed on `prefers-reduced-motion: reduce`.
- **Sticky navbar**: Glassy backdrop-filter navbar with brand logo, desktop nav, hamburger mobile drawer, language picker, theme toggle, auth dropdown, and live API status dot.
- **Footer**: Branded footer with disclaimer, legal note, and sitemap links.
- **HomePage** (`/`): New landing page — hero section with animated CTA, statistics bar, live metal prices widget, feature grid (6 cards with hover-lift), how-it-works, and onboarding CTA.
- **AboutPage** (`/about`): New page with full legal disclaimer, official data source citations, technology stack, and known limitations.
- **CalcPageHeader**: Consistent header for each calculator with eyebrow label, h1, and subtitle.
- **TipsCard** and **HowItWorks**: Educational sidebar components below each calculator.
- **useTheme** hook: dark/light mode with `localStorage` persistence and `:root.dark` class toggling.
- **Shared components**: `MoneyField`, `NumberField`, `SelectField`, `SubmitButton`, `ActionButton`, `ErrorBox`, `EmptyState`, `SkeletonResult`, `MetalSkeletonCard`, `ProjectionChart`, `CalculatorLayout`.
- **ResultCard**: Extracted into its own file with loading/empty states and accessible aria labels.
- **Docker infrastructure**: `docker/frontend.Dockerfile` (Node 20 Alpine + Nginx 1.27 Alpine multi-stage), `docker/nginx.conf` (SPA routing, gzip, long-term cache headers, security headers).
- **Root `docker-compose.yml`**: Full-stack compose with MySQL 8.4, Spring Boot backend, and Vite frontend using healthchecks and dependency ordering.
- **Root README**: Comprehensive documentation with directory layout, quick-start, Docker setup, env-var reference, API table, and deployment guide.

### Changed
- `netlify.toml` (root): `base = "frontend"`, `publish = "frontend/dist"`.
- `frontend/netlify.toml`: Canonical Netlify config for the new `frontend/` build target.

### No-change
- **All backend code**: Zero functional changes. All API contracts, calculation engines, DB migrations, auth, and configuration are untouched.
- **All API call shapes**: Every `POST`/`GET` path, request body, and response field is identical.

---

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
