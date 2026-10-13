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
