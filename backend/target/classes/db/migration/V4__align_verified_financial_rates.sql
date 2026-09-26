-- V4__align_verified_financial_rates.sql
-- Rate verification alignment per project-details/rate-verification-2026-09-26.md
-- Seeds Post Office Recurring Deposit (RD), 5-yr Time Deposit (POTD), and Monthly Income Scheme (POMIS)

INSERT INTO financial_assumptions (id, category, sub_key, numerical_value, text_value, financial_year, description) VALUES
('RATES_RD', 'SCHEME', 'rd_rate', 6.7000, '6.7%', '2024-2025', 'Post Office 5-year Recurring Deposit interest rate p.a. (MoF notified)'),
('RATES_POTD_5Y', 'SCHEME', 'potd_5y_rate', 7.5000, '7.5%', '2024-2025', 'Post Office 5-year Time Deposit interest rate p.a. (quarterly compounding)'),
('RATES_POMIS', 'SCHEME', 'pomis_rate', 7.4000, '7.4%', '2024-2025', 'Post Office Monthly Income Scheme interest rate p.a. (monthly payout)');
