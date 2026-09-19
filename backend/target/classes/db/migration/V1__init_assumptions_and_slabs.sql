-- V1__init_assumptions_and_slabs.sql
-- Baseline financial assumptions and tax slabs schema & seed data

CREATE TABLE financial_assumptions (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    sub_key VARCHAR(64) NOT NULL,
    numerical_value DECIMAL(15, 4) NOT NULL,
    text_value VARCHAR(255),
    financial_year VARCHAR(16) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tax_slabs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    financial_year VARCHAR(16) NOT NULL,
    regime VARCHAR(16) NOT NULL, -- 'OLD' or 'NEW'
    slab_order INT NOT NULL,
    income_from DECIMAL(15, 2) NOT NULL,
    income_to DECIMAL(15, 2), -- NULL for highest slab with no upper limit
    tax_rate_percent DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed financial assumptions for FY 2024-2025
INSERT INTO financial_assumptions (id, category, sub_key, numerical_value, text_value, financial_year, description) VALUES
('RATES_PPF', 'SCHEME', 'ppf_rate', 7.1000, '7.1%', '2024-2025', 'Public Provident Fund interest rate p.a. (EEE)'),
('RATES_SSY', 'SCHEME', 'ssy_rate', 8.2000, '8.2%', '2024-2025', 'Sukanya Samriddhi Yojana interest rate p.a. (EEE)'),
('RATES_SCSS', 'SCHEME', 'scss_rate', 8.2000, '8.2%', '2024-2025', 'Senior Citizens Savings Scheme rate p.a.'),
('RATES_EPF', 'SCHEME', 'epf_rate', 8.2500, '8.25%', '2024-2025', 'Employees Provident Fund interest rate p.a.'),
('RATES_NPS', 'MARKET', 'nps_cagr', 10.5000, '10.5%', '2024-2025', 'National Pension System historical blended return CAGR'),
('RATES_SWEEP_FD', 'BANK', 'sweep_fd_rate', 6.7500, '6.75%', '2024-2025', 'Sweep-in Fixed Deposit approximate yield'),
('RATES_SAVINGS', 'BANK', 'savings_account_rate', 3.5000, '3.5%', '2024-2025', 'Average savings bank interest rate'),
('BENCHMARK_NIFTY', 'MARKET', 'equity_nifty_cagr', 12.0000, '12.0%', '2024-2025', 'Nifty 50 long-term expected equity return CAGR'),
('BENCHMARK_DEBT', 'MARKET', 'debt_hybrid_cagr', 7.5000, '7.5%', '2024-2025', 'Short to medium duration debt mutual fund return'),
('BENCHMARK_GOLD', 'COMMODITY', 'gold_cagr', 9.0000, '9.0%', '2024-2025', 'Sovereign Gold Bond / Gold historical CAGR'),
('BENCHMARK_CC_APR', 'CREDIT', 'credit_card_apr', 42.0000, '42.0%', '2024-2025', 'Typical Indian credit card annual finance charge (3.5%/month)'),
('BENCHMARK_PL_APR', 'CREDIT', 'personal_loan_apr', 13.5000, '13.5%', '2024-2025', 'Benchmark personal loan APR for consolidation'),
('INFLATION_CPI', 'ECONOMY', 'cpi_general_inflation', 6.0000, '6.0%', '2024-2025', 'Long-term CPI headline inflation forecast'),
('INFLATION_EDUCATION', 'ECONOMY', 'education_inflation', 10.0000, '10.0%', '2024-2025', 'Higher education inflation rate in India'),
('INFLATION_HEALTHCARE', 'ECONOMY', 'healthcare_inflation', 12.0000, '12.0%', '2024-2025', 'Medical and healthcare annual inflation rate');

-- Seed New Tax Regime Slabs for FY 2024-2025 (Union Budget 2024 revised)
INSERT INTO tax_slabs (financial_year, regime, slab_order, income_from, income_to, tax_rate_percent) VALUES
('2024-2025', 'NEW', 1, 0.00, 300000.00, 0.00),
('2024-2025', 'NEW', 2, 300000.00, 700000.00, 5.00),
('2024-2025', 'NEW', 3, 700000.00, 1000000.00, 10.00),
('2024-2025', 'NEW', 4, 1000000.00, 1200000.00, 15.00),
('2024-2025', 'NEW', 5, 1200000.00, 1500000.00, 20.00),
('2024-2025', 'NEW', 6, 1500000.00, NULL, 30.00);

-- Seed Old Tax Regime Slabs for FY 2024-2025
INSERT INTO tax_slabs (financial_year, regime, slab_order, income_from, income_to, tax_rate_percent) VALUES
('2024-2025', 'OLD', 1, 0.00, 250000.00, 0.00),
('2024-2025', 'OLD', 2, 250000.00, 500000.00, 5.00),
('2024-2025', 'OLD', 3, 500000.00, 1000000.00, 20.00),
('2024-2025', 'OLD', 4, 1000000.00, NULL, 30.00);
