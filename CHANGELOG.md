# Changelog

All notable changes to the InFinance Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Task 28**: Comprehensive statutory and market rate verification report at `project-details/rate-verification-2026-09-26.md` cross-referencing all configured rates with authoritative circulars from Income Tax Department, CBDT, Ministry of Finance (DEA), EPFO, PFRDA, RBI, AMFI, and NSE India.
- **Task 28**: New automated test suite `RateVerificationAssertionTest` asserting all loaded `FinancialProperties`, `IncomeTaxEngine` constants, small savings rates, and tax slabs match the official verification register.
- **Task 28**: Flyway migration `V4__align_verified_financial_rates.sql` seeding verified Post Office Recurring Deposit (`rd_rate`), 5-year Time Deposit (`potd_5y_rate`), and Monthly Income Scheme (`pomis_rate`) into `financial_assumptions`.

### Changed
- **Task 28**: Aligned 5-Year Post Office Recurring Deposit (`rd-rate`) from 6.75% to 6.70% p.a. in `application-assumptions.yml` and `FinancialProperties.java` per Ministry of Finance Notification F.No.1/4/2019-NS.
- **Task 28**: Enhanced `TaxOptimizerService` with resilient financial-year lookup supporting both `2024-2025` and `fy-2024-2025` map keys.
- **Task 28**: Added explicit source and last-verified metadata annotations across all sections of `application-assumptions.yml`.
