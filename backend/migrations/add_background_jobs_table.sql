-- Migration: Add background_jobs table for async operation tracking
-- Created: 2026-01-07
-- Purpose: Track long-running operations (cache flush, DB optimization, etc.)

CREATE TABLE IF NOT EXISTS background_jobs (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    
    -- Job Information
    job_type VARCHAR(100) NOT NULL,  -- "cache_flush", "db_optimize", "log_rotate", etc.
    status VARCHAR(50) DEFAULT 'queued',  -- "queued", "processing", "completed", "failed", "cancelled"
    priority INT DEFAULT 0,  -- 0=low, 1=normal, 2=high, 3=critical
    
    -- Job Payload & Results
    payload LONGTEXT,  -- JSON input parameters
    result LONGTEXT,   -- JSON result data
    error_message LONGTEXT,
    
    -- Timing
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    
    -- Retry Logic
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at DATETIME NULL,
    
    -- Audit & Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) DEFAULT 'system',
    updated_by VARCHAR(255) DEFAULT 'system',
    
    -- Relationships & Indexes
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (organization_id),
    INDEX idx_job_type (job_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_org_status (organization_id, status)  -- Useful for polling
);

-- Add trigger to update updated_at
DELIMITER $$
CREATE TRIGGER background_jobs_updated_at_trigger
BEFORE UPDATE ON background_jobs
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
