# InFinance Calculator

InFinance Calculator is a Spring Boot REST API for Indian personal-finance planning. It provides calculation engines and explainable responses for SIP and lumpsum investing, retirement planning, and income-tax comparisons.

## Features

- SIP projections with step-up contributions, yearly growth, and pessimistic/expected/optimistic scenarios
- Lumpsum compounding projections
- Retirement corpus planning with inflation-adjusted expenses, accumulation trajectories, and what-if analysis
- Old versus New Indian income-tax regime comparison, including slab breakdowns, deductions, Section 87A rebate, surcharge, and cess
- Configurable financial assumptions such as scheme rates, market benchmarks, and inflation
- H2 for local development and MySQL support for deployed environments
- Flyway database migrations
- OpenAPI documentation and Spring Boot Actuator endpoints

## Technology

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC and Bean Validation
- Spring Data JPA and Hibernate
- H2 / MySQL
- Flyway
- Springdoc OpenAPI
- Maven

## Project layout

```text
backend/
├── src/main/java/com/infinance/
│   ├── investing/       # SIP and lumpsum calculations
│   ├── retirement/      # Retirement planning
│   ├── tax/             # Tax regime and slab calculations
│   ├── config_engine/   # Financial assumptions and configuration
│   └── common/          # Shared DTOs, validation, errors, and money utilities
├── src/main/resources/
│   ├── application*.yml
│   └── db/migration/    # Flyway migrations and seed data
└── src/test/            # Unit and controller tests
```

## Requirements

- JDK 21 or later
- Maven 3.9 or later
- Node.js 20 or later

## Run locally

Start the backend first:

From the repository root:

```bash
cd backend
mvn spring-boot:run
```

The development profile uses an in-memory H2 database and starts the API at `http://localhost:8080`.

In a second terminal, start the React UI:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` and `/actuator` requests to the backend at port `8080`.

To run the test suite:

```bash
mvn clean test
```

To create a production UI bundle:

```bash
npm run build
```

## API documentation

With the application running:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- Actuator health: http://localhost:8080/actuator/health

## API client collections

Ready-to-import local API collections are included for both Postman and Bruno:

- Postman collection: `postman/Investment-Calculator.postman_collection.json`
- Postman environment: `postman/Investment-Calculator-Local.postman_environment.json`
- Bruno collection: `bruno/Investment-Calculator`

Start the backend with the `dev` profile before sending requests:

```bash
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

In Postman, import both JSON files and select the `Investment Calculator - Local` environment. In Bruno, open the `bruno/Investment-Calculator` directory as a collection and select the `Local` environment. Both clients use `http://localhost:8080` by default.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/investing/sip` | Calculate SIP growth and scenarios |
| `POST` | `/api/v1/investing/lumpsum` | Calculate one-time investment growth |
| `POST` | `/api/v1/retirement/plan` | Calculate retirement corpus and savings requirements |
| `POST` | `/api/v1/tax/calculate` | Compare Old and New tax regimes |
| `GET` | `/api/v1/tax/slabs` | Read configured tax slabs |
| `GET` | `/api/v1/config/assumptions` | Read financial assumptions and benchmarks |

Request and response schemas are available in Swagger UI. All calculation endpoints validate request bodies and return structured error responses for invalid input.

## Configuration

The default `dev` profile is configured in `backend/src/main/resources/application.yml` and `application-dev.yml`. Financial assumptions and seeded tax slabs are defined in:

- `backend/src/main/resources/application-assumptions.yml`
- `backend/src/main/resources/db/migration/V1__init_assumptions_and_slabs.sql`

For a deployed environment, provide a MySQL datasource through standard Spring datasource properties and use an appropriate profile. Do not commit credentials or other secrets.

## Disclaimer

This project provides estimates for education and planning. Tax rules, rates, deductions, and investment returns can change. Verify calculations against current official guidance and consult a qualified financial or tax professional before making decisions.
