-- Migration: Add api_keys table for system settings
-- Created: 2026-01-07
-- Purpose: Store secure API keys for system integrations

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    last_used DATETIME NULL,
    revoked BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (organization_id),
    INDEX idx_created_at (created_at),
    INDEX idx_revoked (revoked)
);

-- Add unique constraint on key_hash to prevent duplicate keys
ALTER TABLE api_keys ADD CONSTRAINT unique_key_hash UNIQUE (key_hash);

-- Optional: Add trigger to update updated_at on modification
DELIMITER $$
CREATE TRIGGER api_keys_updated_at_trigger
BEFORE UPDATE ON api_keys
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
