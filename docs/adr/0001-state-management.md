# 1. State Management: React Query for Server State, React Context for Client UI State

Date: 2026-10-14  
Status: **Accepted**  
Deciders: Engineering Team  

---

## Context and Problem Statement

The InFinance application features 12+ complex financial calculators (SIP, Lumpsum, Loan EMI/Prepayment, Tax Old vs New Regime, Tax Optimizer, Retirement Planning, Monte Carlo Simulation, Fixed Income, Mutual Funds, Financial Health Score, Net Worth Tracker, and Goals Planner), live metal prices (Gold, Silver, Platinum), educational content (Learn Hub, Glossary), and user authentication.

Previously:
1. Server requests were performed through ad-hoc `fetch` invocations inside component `useEffect` hooks.
2. Inconsistent loading, retry, and error states were manually duplicated across pages and components.
3. Polling and background caching (e.g. for live metal prices from metals.dev) lacked cache invalidation, leading to redundant network calls or stale prices.
4. Client UI state (such as active theme, ephemeral toast alerts, and authentication tokens) was either coupled to server state or managed inconsistently.

We needed a scalable, lightweight state management architecture that clarifies the boundary between **server state** (data owned by the remote backend API) and **client state** (purely local UI state).

---

## Decision Drivers

- **Clean Architecture & Separation of Concerns:** Server state and client UI state have fundamentally different lifecycles, synchronization rules, and caching requirements.
- **Developer Experience:** Minimizing boilerplate when adding new calculator endpoints or API queries.
- **Robust Error Handling:** Seamless integration with RFC 7807 problem details, correlation IDs, and global error boundaries.
- **Performance & Bandwidth:** In-memory caching, automatic garbage collection, and window-refocus controls for rate-limited external APIs (such as metals.dev).
- **Bundle Size:** Avoiding oversized external state management libraries (e.g. Redux Toolkit) when modern primitives suffice.

---

## Considered Options

1. **Redux Toolkit (RTK) + RTK Query:** Full-blown centralized store with action dispatchers and slices.
2. **Zustand for everything:** Lightweight store pattern for both server data and UI state.
3. **React Context for everything:** Native React Context with `useReducer` for all global state and API responses.
4. **`@tanstack/react-query` v5 for Server State + React Context for Client-Only State (Selected)**.

---

## Decision Outcome

Chosen Option: **`@tanstack/react-query` v5 for Server State + React Context for Client-Only State**.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      InFinance Frontend                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│         Server State          │   │     Client-Only State   │
│   (@tanstack/react-query v5)  │   │     (React Context)     │
├───────────────────────────────┤   ├─────────────────────────┤
│ • Calculator Mutations        │   │ • AuthContext (JWT/user)│
│ • Live Metal Prices (Cache)   │   │ • Theme (Dark/Light)    │
│ • Learn Articles & Glossary   │   │ • Toast notifications   │
│ • Health & Actuator Status    │   │ • Form draft inputs     │
│ • Automatic retries & backoff │   │ • Modal open/close state│
│ • Query invalidation & GC     │   │                         │
└──────────────┬────────────────┘   └─────────────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     Shared HTTP Client        │
│ (Timeout, Abort, Correlation) │
└───────────────────────────────┘
```

### 1. Server State (`@tanstack/react-query`)
- **Queries:** Used for data fetching with declarative caching, automatic deduplication, and refetch control:
  - `useMetalsQuery`: Configured with `staleTime: 5 minutes` and `refetchInterval: 5 minutes` to protect upstream rate limits.
  - Learn Hub articles and Glossary terms.
- **Mutations:** Handled via `useCalculatorMutation`:
  - Wraps React Query's `useMutation` with a resilient fallback mechanism.
  - Automatically extracts and formats field validation errors (`fieldErrors`) and backend tracing IDs (`correlationId`).
  - Directly informs `setApiOnline` to toggle the global API health indicator dot.

### 2. Client-Only State (React Context + Hooks)
Pure client-side state uses lightweight, native React Context:
- **`AuthContext` (`src/context/AuthContext.jsx`):** Manages user authentication token (stored in `sessionStorage`), user identity, and login/logout handlers. Dispatches a custom `infinance:auth-unauthorized` listener for automatic token expiry eviction.
- **`ToastContext` (`src/context/ToastContext.jsx`):** Manages ephemeral toast notifications, status queues, and auto-dismissal timeouts.
- **`useTheme` (`src/shared/hooks/useTheme.js`):** Manages `dark` / `light` theme class toggle on `:root` and persists preferences to `localStorage`.

---

## Pros and Cons of the Chosen Option

### Positive Consequences
- **Zero Global State Bloat:** No actions, reducers, or dispatch ceremony for simple data fetching.
- **Deterministic Cache Management:** Built-in garbage collection (`gcTime`), cache invalidation (`queryClient.invalidateQueries`), and freshness guarantees (`staleTime`).
- **Resilience:** Built-in query retries with exponential backoff on transient network dropouts.
- **Backward Compatibility:** `useCalculatorMutation` maintains identical return semantics to prior hooks, allowing feature hooks (`useSipForm`, `useLoanForm`, etc.) to migrate without touching form UI code.
- **Testability:** Query client easily configured with `retry: false` for Vitest and Playwright test isolation.

### Negative Consequences
- Developers must maintain awareness of the distinction between Server State (Query/Mutation) and Local State (useState/Context).
- Requires configuring a `<QueryClientProvider>` at the root application shell.

---

## Links and References
- [TanStack Query v5 Documentation](https://tanstack.com/query/v5)
- [InFinance Shared API Client](../../frontend/src/shared/api/httpClient.js)
- [InFinance Query Client Configuration](../../frontend/src/shared/lib/queryClient.js)
- [InFinance Calculator Mutation Hook](../../frontend/src/shared/hooks/useCalculatorMutation.js)
