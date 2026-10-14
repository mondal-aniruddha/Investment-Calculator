# Baseline & Repository Audit Report

**Date:** 2026-10-14  
**Branch:** `refactor/clean-architecture`  
**Status:** Baseline Established & Characterization Tests Verified  

---

## 1. Baseline Test Suite Execution

Prior to making any structural or functional modifications, the baseline verification suites were executed.

| Component | Command | Target / Scope | Result | Execution Time / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | `mvn clean verify` | Java 21 / Spring Boot 4 backend (`backend/`) | **PASSED** | 192 classes analyzed, JaCoCo line coverage >= 20% met, all unit & integration tests passed. |
| **Frontend (Root)** | `npm run build` | Root Vite config (delegating to `frontend/`) | **PASSED** | Built in 3.26s. |
| **Frontend (Direct)** | `npm run build` (in `frontend/`) | Vite production bundle (`frontend/dist`) | **PASSED** | Built in 3.92s. 117 modules transformed. |
| **End-to-End Suite** | `npm run test:e2e` | Playwright (18 test cases) | **PASSED** | 18 passed in 30.1s. Covers auth, SIP calculation, onboarding, metal prices, dark mode. |

---

## 2. Dual Frontend Audit & Canonical Decision

### 2.1 Investigation Findings
The repository contained two frontend setups:
1. **Root Frontend:**
   - `package.json` (`"name": "infinance-calculator-ui"`, v1.0.0).
   - `src/` (contains only 8 legacy files: `AccountPage.jsx`, `AuthPage.jsx`, `ProtectedRoute.jsx`, `SkeletonLoader.jsx`, `AuthContext.jsx`, `ToastContext.jsx`, `api.js`, `main.jsx`, `styles.css`).
   - `index.html` (minimal HTML shell with no SEO meta or Google Fonts).
   - `vite.config.js`: Inspecting lines 4–15 reveals:
     ```javascript
     /**
      * Root vite.config.js — delegates to the frontend/ sub-project.
      * Netlify builds directly from the `frontend/` directory (see netlify.toml).
      * ... Setting `root` to `./frontend` tells Vite to use
      * frontend/index.html as the entry point and frontend/src/ as the source.
      */
     ```
     The root Vite configuration was already pointing directly to `./frontend` as its root! The root `src/` directory was completely bypassed during builds.
2. **`frontend/` Subdirectory:**
   - `frontend/package.json` (`"name": "infinance-frontend"`, v2.0.0).
   - `frontend/src/` (43 files: modular feature-based architecture including `assets`, `components`, `context`, `hooks`, `layouts`, `pages`, `services`, `styles`, `utils`).
   - `frontend/index.html` (production-ready SEO metadata, OpenGraph tags, Google Fonts: DM Mono, DM Sans, Playfair Display).
   - Used by `docker/frontend.Dockerfile` and `netlify.toml` (`base = "frontend"`).

### 2.2 Public Assets Diff
- `public/` (root) contained: `icon.svg`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `sw.js`, `_redirects`.
- `frontend/public/` contained: `robots.txt`, `sitemap.xml`, `_redirects`.
- `frontend/index.html` references `/favicon.svg` and `public/icon.svg`.
- **Action Required for Phase 1:** Before deleting the root frontend, ensure `icon.svg`, `manifest.webmanifest`, and `sw.js` are migrated into `frontend/public/` so no assets are lost.

### 2.3 Canonical Decision
- **Canonical:** `frontend/` is the canonical application.
- **Root `src/`:** Legacy v1.0.0 monolith artifact, unreferenced by Vite, Docker, or Netlify. Safe to remove in Phase 1 once e2e tests and configurations are consolidated into `frontend/`.

---

## 3. Dead / Duplicate Code & Static Analysis Audit

### 3.1 Git-Tracked Ephemeral Files
The following files were identified as tracked by Git but are build artifacts or ephemeral databases:
1. `backend/.jqwik-database` (tracked in Git; property testing local database).
2. `frontend/test-results/.last-run.json` (tracked in Git; Playwright test run state).
3. `backend/src/main/resources/META-INF/additional-spring-configuration-metadata.json` (tracked in Git; contains only empty `{}`).
4. `api-collections.zip`: Verified git history; deleted in commit `7831ca317be11fa8837dd6ee067e937105cdf2f2`. Active collection files reside in `postman/` and `bruno/`.

### 3.2 Tiny Stub Classes
- **`com.infinance.taxoptimizer.engine.TaxOptimizerEngine`**:
  - Located at `backend/src/main/java/com/infinance/taxoptimizer/engine/TaxOptimizerEngine.java`.
  - Only 10 lines of code containing a single static method `remaining(BigDecimal current, BigDecimal cap)`.
  - Used in `TaxOptimizerService`.
  - Keep during Phase 0 characterization; evaluate consolidating into tax engine or keeping as a pure calculation utility in Phase 2.

### 3.3 Static Analysis Results

#### Knip (`npx knip`)
- **Unused Files (1):**
  - `src/components/shared/ReminderCard.jsx`
- **Unused Exports (4):**
  - `useScrollRevealAll` in `src/hooks/useScrollReveal.js`
  - `API_BASE_URL` in `src/services/api.js`
  - `formatIndianNumber` in `src/utils/format.js`
  - `formatINRCompact` in `src/utils/format.js`
- **Duplicate Exports (5):**
  - Named + default export redundancy in `DisclaimerBanner.jsx`, `LearnBeforeYouCalculate.jsx`, `MythsAndFaq.jsx`, `SEO.jsx`, `Term.jsx`.

#### Depcheck (`npx depcheck`)
- **Result:** No unused dependencies or missing dependencies found.

#### JSCPD (`npx jscpd frontend/src`)
- **Duplication Rate:** 1.62% (18 clones, 155 duplicated lines out of 9,595 lines).
- **Key Duplication Areas:**
  - Duplicate hook logic: `hooks/useReveal.js` vs `hooks/useScrollReveal.js`.
  - Form field row layouts across calculator pages (`FixedIncomePage.jsx`, `LoanPage.jsx`, `MutualFundPage.jsx`, `SipPage.jsx`).
  - Keyframe and glassmorphism styling in `styles/animations.css` and `styles/home.css`.

---

## 4. Business Logic: SIP / Lumpsum Duplication & Coupling

### 4.1 Investigation Findings
- **Hypothesis:** SIP/lumpsum business logic is duplicated across `investing` and `mutualfund`.
- **Finding:**
  - The core math is **not duplicated**; `MutualFundService` directly imports and calls `com.infinance.investing.engine.SipEngine` and `LumpsumEngine`.
  - However, this introduces **cross-package coupling**:
    ```
    com.infinance.mutualfund.service.MutualFundService
      -> com.infinance.investing.engine.SipEngine
      -> com.infinance.investing.engine.LumpsumEngine
      -> com.infinance.investing.dto.YearlyGrowthDto
    ```
  - Both packages expose independent REST endpoints with different contract response shapes:
    - `POST /api/v1/investing/sip` -> returns `SipCalculationResponse`
    - `POST /api/v1/investing/lumpsum` -> returns `LumpsumCalculationResponse`
    - `POST /api/v1/mutual-funds/sip` -> returns `MutualFundResponse`
    - `POST /api/v1/mutual-funds/lumpsum` -> returns `MutualFundResponse`
- **Resolution Strategy for Phase 2:**
  - Extract the pure mathematical engines into a shared engine module/package or common calculation domain.
  - Maintain 100% backward compatibility of both REST endpoints and response DTO schemas.

---

## 5. Security Configuration Overlap

### 5.1 Investigation Findings
- **Hypothesis:** `SecurityConfig` vs `WebSecurityConfiguration` overlap.
- **Finding:**
  - `com.infinance.common.config.SecurityConfig` is **NOT** a Spring Security configuration. It is a `@ConfigurationProperties(prefix = "infinance.admin")` bean holding admin `username` and `password`.
  - `com.infinance.common.config.WebSecurityConfiguration` is the actual Spring Security `@Configuration` defining `SecurityFilterChain`, `AuthenticationEntryPoint`, `UserDetailsService`, `PasswordEncoder`, and `CacheManager`.
- **Resolution Strategy for Phase 2:**
  - Rename `SecurityConfig` to `AdminProperties` (or `AdminSecurityProperties`) to eliminate misleading naming.
  - Move `CacheManager` out of `WebSecurityConfiguration` into a dedicated `CacheConfiguration`.

---

## 6. Provider Profile Safety: `MetalsDevDataProvider`

- `MetalsDevDataProvider` currently activates via `@ConditionalOnProperty(name = "infinance.metals.provider", havingValue = "metals-dev", matchIfMissing = true)`.
- It connects to an external dev tier provider.
- In Phase 2, guard it with `@Profile("dev")` or configure safe production fallbacks so that production environments never default to unverified or rate-limited dev services.

---

## 7. Characterization (Golden-Value) Tests Added

To provably prevent regression during refactoring, golden-value characterization tests have been introduced:
1. `LumpsumEngineGoldenTest`:
   - Validates ₹1,00,000 at 12% p.a. for 5 years (Corpus: ₹1,76,234.17; Returns: ₹76,234.17).
   - Validates ₹5,00,000 at 10% p.a. for 10 years (Corpus: ₹12,96,871.23; Returns: ₹7,96,871.23).
   - Validates 0% return edge case.
2. `MutualFundEngineGoldenTest`:
   - Validates CAGR for doubling investments (7.18% for 10yr, 14.87% for 5yr, 14.72% for 8yr).
   - Validates SWP corpus decay and withdrawal schedules for ₹10,00,000 corpus at 10% return over 5 years.
   - Validates Newton-Raphson XIRR convergence for irregular cash flows.
3. `TaxOptimizerEngineGoldenTest`:
   - Validates Section 80C and NPS 80CCD(1B) deduction caps, partial usage, zero usage, cap overflow, and null-safety.

All golden tests pass with 0 errors, 0 failures.
