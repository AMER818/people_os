-- SQLite Migration: Background Jobs Table
-- Created: 2026-01-07
-- Purpose: Track background job execution, status, and retry logic

CREATE TABLE IF NOT EXISTS background_jobs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    
    -- Job Definition
    job_type TEXT NOT NULL,  -- 'cache_flush', 'db_optimize', 'log_rotate', 'email_send', etc.
    status TEXT DEFAULT 'queued',  -- queued, processing, completed, failed, cancelled
    priority INTEGER DEFAULT 0,  -- 0=normal, 1=high, -1=low
    
    -- Payload and Results
    payload TEXT,  -- JSON payload with job parameters
    result TEXT,  -- JSON result after execution
    error_message TEXT,  -- Error details if failed
    
    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    
    -- Execution Tracking
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Audit fields
    created_by TEXT,
    updated_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_org ON background_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created ON background_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_next_retry ON background_jobs(next_retry_at) WHERE status = 'queued';
