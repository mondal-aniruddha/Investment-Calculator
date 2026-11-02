-- V9: Phone verification, SMS/WhatsApp OTP challenges, two-factor authentication, and auth audit events

ALTER TABLE app_users ADD COLUMN phone_e164 VARCHAR(16);
ALTER TABLE app_users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE app_users ADD COLUMN phone_verified_at TIMESTAMP NULL;
ALTER TABLE app_users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE app_users ADD COLUMN status VARCHAR(24) DEFAULT 'ACTIVE' NOT NULL;
CREATE UNIQUE INDEX idx_app_users_phone_e164 ON app_users(phone_e164);

CREATE TABLE otp_challenges (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    channel VARCHAR(16) NOT NULL,
    destination_e164 VARCHAR(16) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0 NOT NULL,
    send_count INT DEFAULT 1 NOT NULL,
    last_sent_at TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_otp_challenges_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_otp_challenges_user ON otp_challenges(user_id);
CREATE INDEX idx_otp_challenges_expires ON otp_challenges(expires_at);

CREATE TABLE user_backup_codes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_backup_codes_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_backup_codes_user ON user_backup_codes(user_id);

CREATE TABLE auth_audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    event_type VARCHAR(50) NOT NULL,
    destination_masked VARCHAR(32) NULL,
    details VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_auth_audit_events_user ON auth_audit_events(user_id);
CREATE INDEX idx_auth_audit_events_created ON auth_audit_events(created_at);

