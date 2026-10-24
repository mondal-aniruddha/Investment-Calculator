CREATE TABLE finance_queries (
    id VARCHAR(36) PRIMARY KEY,
    reference_id VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(32),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message VARCHAR(2500) NOT NULL,
    preferred_contact VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    client_ip_hash VARCHAR(64) NOT NULL
);

CREATE INDEX idx_finance_queries_reference_id ON finance_queries(reference_id);
CREATE INDEX idx_finance_queries_status ON finance_queries(status);
CREATE INDEX idx_finance_queries_created_at ON finance_queries(created_at);
