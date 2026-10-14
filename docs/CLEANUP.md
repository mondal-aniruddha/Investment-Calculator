# Code Cleanup and Removals Log

This document records dead, unused, or obsolete code and artifacts removed during the refactor, with evidence and reference counts.

---

## 1. Phase 1 Removals: Repository Layout & Legacy Frontends

| Removed Path / Item | Type | Evidence & Justification | References |
| :--- | :--- | :--- | :--- |
| `src/` (root) | Legacy Frontend Code | Monolith v1.0.0 frontend containing 8 obsolete files (`AccountPage.jsx`, `AuthPage.jsx`, `ProtectedRoute.jsx`, `SkeletonLoader.jsx`, `AuthContext.jsx`, `ToastContext.jsx`, `api.js`, `main.jsx`, `styles.css`). Root `vite.config.js` and Netlify pointed directly to `frontend/`. | 0 active references |
| `public/` (root) | Duplicate Assets | Root assets duplicated in `frontend/public/`. Unique assets (`icon.svg`, `manifest.webmanifest`, `sw.js`) were merged into `frontend/public/`. | 0 active references |
| `index.html` (root) | Root HTML shell | Root Vite configuration built from `frontend/index.html`. | 0 active references |
| `backend/.jqwik-database` | Git-Tracked Cache | Ephemeral local property-testing database tracked in Git by mistake. Added to `.gitignore`. | 0 active references |
| `frontend/test-results/.last-run.json` | Test Run State | Playwright test run state cache file tracked in Git by mistake. Added to `.gitignore`. | 0 active references |
| `backend/src/main/resources/META-INF/additional-spring-configuration-metadata.json` | Empty Metadata | Empty `{}` placeholder. Added to `.gitignore`. | 0 active references |
| `api-collections.zip` | Redundant Archive | Active collection files are version-controlled in `tools/api-clients/postman/` and `tools/api-clients/bruno/`. | 0 active references |

---

## 2. Phase 2 Removals: Backend Dead Code & Redundant Naming

| Removed Path / Item | Type | Evidence & Justification | References |
| :--- | :--- | :--- | :--- |
| `com.infinance.config_engine` | Package Naming | Non-standard underscore package naming. Replaced by `com.infinance.configengine`. | All updated to `configengine` |
| `com.infinance.common.config.SecurityConfig` | Ambiguous Class | Class was not a Spring Security configuration; it was `@ConfigurationProperties("infinance.admin")`. Replaced by `AdminProperties`. | All updated to `AdminProperties` |
| `CacheManager` in `WebSecurityConfiguration` | Misplaced Bean | Moved to dedicated `CacheConfiguration` bean for separation of concerns. | Preserved, relocated |

---

## 3. Phase 3 Removals: Frontend Dead Code & Unused Exports

| Removed Path / Item | Type | Evidence & Justification | References |
| :--- | :--- | :--- | :--- |
| `frontend/src/components/shared/ReminderCard.jsx` | Unused Component | Standalone reminder card component never imported or rendered by any route or component. Knip static analysis verified 0 references. | 0 references |
| `useScrollRevealAll` export from `useScrollReveal.js` | Dead Export | Only `useScrollReveal` is imported across the 9 consumer pages. `useScrollRevealAll` had 0 imports. | 0 references |
| `API_BASE_URL` export from `src/services/api.js` | Dead Export | Internal constant not imported outside `api.js`. `api.js` exports `api` as default. | 0 references |
| `formatIndianNumber`, `formatINRCompact` in `src/utils/format.js` | Dead Exports | Replaced / superseded by `formatINR` and `formatNumber`. 0 references in any JSX or JS file. | 0 references |
| Named + default export redundancy in `DisclaimerBanner`, `LearnBeforeYouCalculate`, `MythsAndFaq`, `SEO`, `Term` | Redundant Exports | Components were exporting both `export const Foo` and `export default Foo`. Standardized on default exports. | Cleaned up |
