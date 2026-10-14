# Contributing to InFinance

> Developer guide and workflow for contributing to InFinance.

---

## 1. Development Principles & Code Style

- **Strict Clean Architecture:** Financial mathematics must be isolated in pure domain engines. Never import `org.springframework.*` into calculation engines.
- **Financial Precision:** Never use floating-point types (`float`, `double`) for monetary balances or returns. Always use `java.math.BigDecimal` with explicit scale and rounding modes.
- **Conventional Commits:** All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat(scope): add new feature`
  - `fix(scope): resolve bug`
  - `refactor(scope): internal restructuring without changing behavior`
  - `docs(scope): documentation update`
  - `test(scope): add or improve test suites`
- **Linting & Formatting:**
  - Frontend: `npm run lint` (ESLint 9) and `npm run format:check` (Prettier).
  - Backend: Consistent 4-space indentation governed by the root `.editorconfig`.

---

## 2. Local Environment Setup

### 2.1 Backend (Java 21 + Spring Boot 4)
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
By default, the backend boots with the `dev` profile at `http://localhost:8080`.
OpenAPI documentation is instantly accessible at `http://localhost:8080/swagger-ui.html`.

### 2.2 Frontend (React 19 + Vite 7)
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server boots at `http://localhost:5173`.

---

## 3. Step-by-Step Guide: Adding a New Financial Calculator

Follow this exact pattern when adding a new financial calculator to ensure architectural consistency:

### Step 1: Pure Calculation Engine (Backend)
1. In `backend/src/main/java/com/infinance/<domain>/engine/`, create a stateless class:
   ```java
   package com.infinance.<domain>.engine;

   import java.math.BigDecimal;
   import java.math.RoundingMode;

   /**
    * Pure stateless calculation engine for <Domain>.
    * Formula: FV = ...
    */
   public final class <Domain>Engine {
       private <Domain>Engine() {}

       public record CalculationResult(
           BigDecimal totalInvested,
           BigDecimal maturityAmount
       ) {}

       public static CalculationResult calculate(BigDecimal amount, int tenureYears, BigDecimal rate) {
           // Pure BigDecimal math
       }
   }
   ```
2. Write unit tests in `src/test/java/com/infinance/<domain>/engine/<Domain>EngineTest.java` verifying boundary conditions and known Indian benchmark values.

### Step 2: DTOs & Validation (Backend)
Define request and response records in `com.infinance.<domain>.dto`:
```java
public record <Domain>Request(
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "100.00", message = "Amount must be at least ₹100")
    BigDecimal amount,

    @Min(value = 1, message = "Tenure must be at least 1 year")
    @Max(value = 50, message = "Tenure cannot exceed 50 years")
    int tenureYears
) {}
```

### Step 3: Application Service & Assumptions
Create `<Domain>Service.java` to inject `AssumptionService` and enrich results with macro-economic assumptions.

### Step 4: Route Constants & REST Controller
1. Register route constants in `com.infinance.common.constants.ApiConstants`:
   ```java
   public static final String <DOMAIN>_BASE = API_V1 + "/<domain>";
   public static final String <DOMAIN>_CALCULATE = <DOMAIN>_BASE + "/calculate";
   ```
2. Create `<Domain>Controller.java`:
   - Annotate with `@Tag(name = "...", description = "...")`.
   - Add `@Operation` on endpoints describing the calculation.
   - Reference route constants: `@PostMapping(ApiConstants.<DOMAIN>_CALCULATE)`.

### Step 5: Frontend Feature Slice
1. Create a dedicated feature folder under `frontend/src/features/<domain>/`:
   ```
   frontend/src/features/<domain>/
   ├── api/<domain>Api.js
   ├── hooks/use<Domain>Form.js
   ├── components/<Domain>Form.jsx
   └── pages/<Domain>Page.jsx
   ```
2. **API Client (`api/<domain>Api.js`):**
   ```javascript
   import { post } from '../../../shared/api/httpClient'
   import { ENDPOINTS } from '../../../shared/api/endpoints'

   /**
    * @param {Object} payload
    * @returns {Promise<Object>}
    */
   export async function calculate<Domain>(payload) {
     return post(ENDPOINTS.<DOMAIN>_CALCULATE, payload)
   }
   ```
3. **Form Hook (`hooks/use<Domain>Form.js`):**
   Utilize `useCalculatorMutation` to automatically track loading, validation errors, and correlation IDs.
4. **Form UI (`components/<Domain>Form.jsx`):**
   Use standardized UI primitives from `src/shared/components/ui/` (`MoneyField`, `NumberField`, `ProjectionChart`, `ResultCard`, `SubmitButton`).

### Step 6: End-to-End & Integration Testing
1. Add a Playwright integration test in `frontend/e2e/<domain>.spec.js`.
2. Run full test suite:
   ```bash
   cd frontend
   npm run lint
   npm run format:check
   npm test
   npm run build
   npm run test:e2e
   ```
