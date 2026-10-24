# Changelog

All notable changes to the InFinance Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1] — 2026-10-24

### Meet the Founders & Multi-Contact Consultation Module

#### Added
- **Meet the Founders Section:** Added founder and co-founder profiles to `/ask-query` displaying roles, short biographies, initials avatars, and direct contact options.
- **Team Configuration API (`GET /api/v1/config/team`):** Dynamic team member endpoint serving ordered team lists with full support for environment variable configuration (`INFINANCE_TEAM_n_*` and `VITE_TEAM_n_*`).
- **Co-founder Contact Integration:** Included Kuhika Das (Co-founder) across Ask a Query page cards, query success state, and footer contact block.
- **WhatsApp Direct Action:** Integrated direct `https://wa.me/` WhatsApp chat links with pre-filled query messages, replacing legacy `tel:` call links.
- **Assigned Founder Selection:** Added optional consultation routing selector (`assignedTo`) allowing users to direct queries to either founder or both.
- **Multilingual Support (EN/HI/BN):** Complete English, Hindi, and Bengali localization for the Meet the Founders section and team profiles.
- **Unit, Integration & E2E Tests:** Added Spring Boot MockMvc test suite for `GET /api/v1/config/team` and expanded Playwright E2E tests for the founders section.

---

## [2.2.0] — 2026-10-24

### Ask a Finance Query & Direct Consultation Module

#### Added
- **Ask a Finance Query Page (`/ask-query`):** Interactive, accessible consultation query submission form featuring live character counters, client validation, honeypot bot trap, category selector, preferred contact method, and consent acknowledgement.
- **Site Owner Direct Contact:** Configurable direct contact callouts ("Prefer to talk? Call or message me directly.") displaying site owner identity (`Aniruddha Mondal`), with click-to-call `tel:` and click-to-email `mailto:` links across the form header, success state, and footer.
- **Backend Queries Module (`com.infinance.queries`):**
  - `POST /api/v1/queries`: Public query submission endpoint with XSS sanitization, IP hashing (SHA-256 with monthly rotating salt), and unique human-readable tracking reference IDs (`FQ-YYYY-XXXXXX`).
  - `GET /api/v1/config/owner-contact`: Public endpoint serving configured site owner name, phone, email, and working hours.
  - `GET /api/v1/admin/queries` & `PATCH /api/v1/admin/queries/{id}/status`: Admin-secured management endpoints (HTTP Basic / JWT Admin).
  - Optional query notification service via Spring Mail (`QueryNotificationService`), enabled via `infinance.queries.notify-enabled=true`.
- **Database Schema Migration:** Added Flyway migration `V7__finance_queries.sql` creating the `finance_queries` table with optimized indexes on `reference_id`, `status`, and `created_at`.
- **Security & Protection:** Added `QueryRateLimitFilter` enforcing per-IP rate limits (5 queries per hour per IP) returning standard RFC 7807 429 Problem Details with `Retry-After` header.
- **Multilingual Support (i18n):** Complete English (en), Hindi (hi), and Bengali (bn) translations for the query form, confirmation, error states, and navigation links.
- **API Tooling:** Postman collection ("Finance Queries") and Bruno `.bru` requests for public submission, owner contact, and admin query management.
- **End-to-End & Unit Tests:** MockMvc controller tests (`FinanceQueryControllerTest`), service unit tests (`FinanceQueryServiceTest`), and Playwright e2e test suite (`e2e/queries.spec.js`).

#### Changed
- **Home Page Navigation & Discoverability:** Added primary hero CTA button and "Need Personalized Guidance?" consultation feature card linking directly to `/ask-query`.
- **App Navigation:** Added "Ask a Query" navigation links to top desktop navbar, mobile drawer, and footer links.

---

## [2.1.0] — 2026-10-14

### Clean Architecture Refactoring & Modernization (Phases 0–8)

#### Added
- **Golden Characterization Tests:** Added `LumpsumEngineGoldenTest`, `MutualFundEngineGoldenTest`, and `TaxOptimizerEngineGoldenTest` locking in financial calculation precision.
- **RFC 7807 Global Exception Handling:** Uniform problem details with distributed `correlationId` tracking on all error responses (`GlobalExceptionHandler`).
- **OpenAPI 3.1 & Swagger Documentation:** Grouped OpenAPI specs (`public`, `admin`) and centralized route constants in `ApiConstants.java`.
- **Frontend Server State Management:** Added `@tanstack/react-query` v5 with dedicated query client and `useCalculatorMutation` hook.
- **Standardized Frontend API Client:** Added `httpClient.js` supporting AbortController, request timeouts, typed `ApiError`, and automated retry on transient failures.
- **Production Safety Validator:** Added `ProductionConfigurationValidator` in Spring Boot (`prod` profile) to fail-fast if insecure default secrets or DB credentials are detected.
- **Code Quality & Linting:** Configured ESLint 9 flat config (`eslint.config.js`), Prettier (`.prettierrc`), `.editorconfig`, and CI automated checks.
- **Architectural Documentation:** Added `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/CONTRIBUTING.md`, `docs/CHANGES.md`, and `docs/adr/0001-state-management.md`.

#### Changed
- **Repository Consolidation:** Completely deleted legacy root frontend monolith, consolidating all UI, Vite 7 configs, and Playwright tests into `frontend/`.
- **Package Modernization:** Renamed `com.infinance.config_engine` to standard idiomatic `com.infinance.configengine`.
- **Security Decoupling:** Extracted `SecurityProperties` and `CorsProperties` into independent `@ConfigurationProperties` beans.
- **Frontend Domain Slices:** Reorganized frontend into modular feature slices under `src/features/*`.
- **Configuration Centralization:** Centralized frontend environment variable access into `src/shared/config/env.js`.
- **Spring Profile Defaults:** Changed active profile property from hardcoded `spring.profiles.active: dev` to standard `spring.profiles.default: dev`.

#### Preserved & Guaranteed
- **0 breaking public API contract changes:** All existing `/api/v1/*` endpoints, JSON inputs, and responses remain identical.
- **0 changes to financial calculations:** All financial formulas and outputs remain exact.
- **0 edits to applied Flyway database migrations:** Migrations V1 through V6 intact.

---

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

## [1.1.0] — 2026-10-13

### Added — Learning Destination (InFinance v1.1)

> Goal: Transform InFinance from a set of calculators into a trustworthy, beginner-friendly learning destination for young Indians (18–30, first job, new to money).

#### Learn Hub (`/learn`)
- Article listing page with category filter pills (Basics, Investing, Tax, Credit, Insurance, Retirement), real-time search, reading-time badges, and "related calculator" CTA on every card.
- **15 starter articles** seeded in Markdown (400–700 words each, plain language, Indian ₹ examples):
  SIP, Mutual Funds Basics, PPF & Small Savings, NPS, ELSS & Tax Saving, Emergency Fund, CIBIL Score,
  Old vs New Tax Regime, Inflation, Power of Compounding, Term Insurance, FD vs Debt Funds,
  Beginner Investing, Index Funds, and Budgeting.
- Shimmer skeleton loading state; graceful "no results" empty state; backend-offline error banner.

#### Article Detail Page (`/learn/:slug`)
- Full Markdown rendering via `marked` with GFM support.
- Related Calculator highlight banner (shown when `relatedCalculatorPath` is set).
- Breadcrumb navigation, reading time, last-updated timestamp in IST.
- Schema.org `Article` JSON-LD structured data for SEO.
- Compact educational disclaimer (inline, non-preachy).
- Official sources & references box.

#### Financial Glossary (`/glossary`)
- 18 seed terms with category filter (Investing, Tax, Fixed Income, Credit, Insurance, Basics, Retirement).
- Search across term, short definition, and detailed explainer.
- `Related Tool` link button on each card.
- **Offline fallback**: glossary shows local dictionary if backend is unavailable.

#### Inline `<Term>` Tooltip Component
- Hover/tap on any financial acronym (SIP, CAGR, CIBIL, etc.) across any page to see a one-line definition in a floating tooltip.
- Fetches from the glossary API, falls back to cached local dictionary.
- "Glossary ↗" link inside tooltip for deep exploration.
- Used throughout HomePage, RoadmapPage, and article pages.

#### Beginner Money Roadmap (`/roadmap`)
- Six-step interactive checklist: Budget → Emergency Fund → Insurance → SIP → Tax → Retirement.
- Progress tracked in `localStorage` (login-free, private).
- Progress bar with celebration message on 100%.
- Context tip + inline `<Term>` tooltip on each step.
- Myths & FAQ accordion (10 items) at the bottom.

#### SEO & Discovery
- `robots.txt` and `sitemap.xml` added to `frontend/public/`.
- `<SEO>` component (react-helmet-async) on every new page: title, meta description, OG tags, JSON-LD.
- `/education` redirects to `/glossary` for backward compatibility.

#### "Learn Before You Calculate" Contextual Banners
- Subtle in-context teaser banner at the top of each calculator page, linking to the most relevant Learn Hub article:
  - SipPage → `what-is-sip`
  - LoanPage → `cibil-score-explained`
  - FixedIncomePage → `fd-vs-debt-funds`
  - MutualFundPage → `mutual-funds-basics`
  - PlanningPage → `old-vs-new-tax-regime`

#### Backend
- New `learn` package: `LearnArticleEntity`, `LearnArticleRepository` (JPQL search by category + query), `LearnArticleService`, `LearnArticleController` (`GET /api/v1/learn/articles`, `GET /api/v1/learn/articles/{slug}`).
- New `glossary` package: `GlossaryTermEntity`, `GlossaryTermRepository`, `GlossaryService`, `GlossaryController` (`GET /api/v1/glossary`).
- Flyway **V6** migration: `learn_articles` + `glossary_terms` tables, all indexes, and complete seed data.
- Integration test stubs for both controllers.
- CORS and security config updated to expose new public endpoints.

#### Frontend — new files
| File | Purpose |
|------|---------|
| `pages/LearnHubPage.jsx` | Article listing |
| `pages/ArticleDetailPage.jsx` | Full article view |
| `pages/GlossaryPage.jsx` | Glossary browser |
| `pages/RoadmapPage.jsx` | 6-step interactive roadmap |
| `pages/PrivacyPage.jsx` | Privacy policy |
| `components/shared/Term.jsx` | Inline tooltip component |
| `components/shared/DisclaimerBanner.jsx` | Compact & full disclaimer |
| `components/shared/MythsAndFaq.jsx` | Accordion FAQ component |
| `components/shared/SEO.jsx` | react-helmet-async wrapper |
| `components/shared/LearnBeforeYouCalculate.jsx` | Calculator contextual banner |
| `services/learnService.js` | Fetch articles from backend |
| `services/glossaryService.js` | Fetch glossary + offline fallback |

#### Styles
- `components.css` extended with: `hub-header`, `hub-search-wrapper/input`, `hub-footer-cta`, `skeleton-card/line`, `empty-state-card`, `error-banner`, `hover-lift`, `learn-before-calc-banner` (`.lbc-*`).

### Changed
- **HomePage**: Hero CTAs now lead with Roadmap and Learn Hub; feature grid updated to include all 8 tools; "How it works" copy updated.
- **AppShell**: Navbar updated with Learn Hub and Roadmap first; footer links include Glossary, Roadmap, Learn Hub.
- **All calculator pages**: Import and render `<LearnBeforeYouCalculate>` banner above each calculator.
- **`/education`**: Redirected to `/glossary` (old page preserved but not linked).

### No breaking changes
- All existing API routes, request/response shapes, and DB tables are unchanged.
- All existing calculator pages continue to work identically.

---

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
