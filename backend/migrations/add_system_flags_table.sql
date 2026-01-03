-- Migration: Add system_flags table for centralized system configuration
-- Created: 2026-01-07
-- Purpose: Store all system-wide flags, settings, and configuration for each organization

CREATE TABLE IF NOT EXISTS system_flags (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL UNIQUE,
    -- Feature Flags
    ai_enabled BOOLEAN DEFAULT TRUE,
    advanced_analytics_enabled BOOLEAN DEFAULT TRUE,
    employee_self_service_enabled BOOLEAN DEFAULT TRUE,
    -- Maintenance Flags
    maintenance_mode BOOLEAN DEFAULT FALSE,
    read_only_mode BOOLEAN DEFAULT FALSE,
    -- Cache & Performance
    cache_enabled BOOLEAN DEFAULT TRUE,
    cache_ttl INT DEFAULT 3600,
    -- Database
    db_optimization_last_run DATETIME NULL,
    db_optimization_enabled BOOLEAN DEFAULT TRUE,
    -- Logging
    debug_logging_enabled BOOLEAN DEFAULT FALSE,
    log_retention_days INT DEFAULT 30,
    -- API Rate Limiting
    rate_limit_enabled BOOLEAN DEFAULT TRUE,
    rate_limit_requests_per_minute INT DEFAULT 60,
    -- Webhooks
    webhooks_enabled BOOLEAN DEFAULT TRUE,
    webhooks_retry_enabled BOOLEAN DEFAULT TRUE,
    webhooks_max_retries INT DEFAULT 3,
    -- Custom JSON flags for extensibility
    custom_flags LONGTEXT,
    -- Audit fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    -- Relationships
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (organization_id),
    INDEX idx_maintenance_mode (maintenance_mode),
    INDEX idx_cache_enabled (cache_enabled)
);

-- Add trigger to update updated_at
DELIMITER $$
CREATE TRIGGER system_flags_updated_at_trigger
BEFORE UPDATE ON system_flags
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
