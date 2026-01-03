-- Migration: Add webhooks and webhook_logs tables for system settings
-- Created: 2026-01-07
-- Purpose: Store and track webhook integrations with delivery logs

CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    event_types LONGTEXT NOT NULL,  -- JSON list of events
    headers LONGTEXT,  -- JSON custom headers
    is_active BOOLEAN DEFAULT TRUE,
    test_payload_sent BOOLEAN DEFAULT FALSE,
    last_triggered DATETIME NULL,
    failure_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (organization_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id VARCHAR(36) PRIMARY KEY,
    webhook_id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,  -- JSON payload sent
    response_status INT NULL,
    response_body LONGTEXT,  -- First 500 chars of response
    delivery_status VARCHAR(50) NOT NULL,  -- "success", "failed", "retrying"
    retry_count INT DEFAULT 0,
    next_retry_at DATETIME NULL,
    error_message LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) DEFAULT 'system',
    updated_by VARCHAR(255) DEFAULT 'system',
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_webhook_id (webhook_id),
    INDEX idx_org_id (organization_id),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_created_at (created_at)
);

-- Add trigger to update webhooks updated_at
DELIMITER $$
CREATE TRIGGER webhooks_updated_at_trigger
BEFORE UPDATE ON webhooks
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Add trigger to update webhook_logs updated_at
DELIMITER $$
CREATE TRIGGER webhook_logs_updated_at_trigger
BEFORE UPDATE ON webhook_logs
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
