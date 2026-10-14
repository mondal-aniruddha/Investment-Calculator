# AI Engineering Rules

## Required behavior

1. Read the existing module, DTOs, configuration, shared utilities, tests, and
   README before changing code.
2. Present a short implementation plan and affected files before substantial
   work.
3. Reuse existing package layout, services, validators, money utilities, error
   format, assumptions DTOs, disclaimers, and localization resources.
4. Keep financial engines pure, stateless, deterministic, and independently
   testable.
5. Use BigDecimal and explicit rounding for money. Never use binary floating
   point for persisted or displayed monetary results.
6. Put uncertain tax rules, rates, effective dates, and limits in configuration;
   identify them as assumptions and flag official-source verification.
7. Add validated request DTOs, OpenAPI documentation, hand-verifiable tests,
   assumptions, disclaimer text, and frontend treatment for each calculator.
8. Surface errors using the repository's structured error response. Do not
   silently return success-shaped fallback data.
9. Update README/API documentation and relevant tests with behavior changes.
10. Run the smallest relevant tests, frontend build, and `git diff --check`.

## Preferred libraries and patterns

- Spring MVC, Bean Validation, Spring Data JPA, Flyway, Spring Security,
  Springdoc, Caffeine, Bucket4j, Micrometer, and existing project utilities.
- React/Vite and react-i18next for UI work.
- jqwik for numeric properties, MockMvc for API contracts, and Playwright for
  critical user flows.
- Existing `FinancialMath`, `MoneyAmount`, assumptions, exception handler, and
  Indian currency formatter must be preferred over duplicate helpers.

## Security and privacy

- Never commit credentials, API keys, production secrets, or real personal
  financial data.
- Require environment-specific JWT, admin, database, and encryption secrets in
  non-development deployments.
- Keep AI payloads free of personal identifiers and make AI explanations
  opt-in.
- Preserve authorization and ownership checks for profiles and scenarios.
- Validate request sizes, rate-limit requests, and retain security headers.
- Do not weaken authentication or disable validation to make tests pass.

## Financial correctness

- State the formula and timing convention in Javadoc or module documentation.
- Keep rates, slabs, exemptions, and effective dates configurable.
- Use actual dates for XIRR and a seedable generator for Monte Carlo.
- Do not claim certainty, guaranteed returns, or individualized advice.
- Include the standard educational disclaimer in calculator responses and UI.

## Avoid

- Duplicating an existing calculation or configuration path.
- Hardcoded financial rules that belong in configuration.
- Broad catches, silent defaults, ignored validation errors, or unbounded
  retries.
- Unrelated refactors, speculative dependencies, or generated build artifacts.
- Changing public response shapes without updating clients and contract tests.
- Destructive git commands or rewriting user changes.
