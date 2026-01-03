-- SQLite Migration: Notification Settings Table
-- Created: 2026-01-07
-- Purpose: Store email, SMS, Slack, and notification preferences

CREATE TABLE IF NOT EXISTS notification_settings (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL UNIQUE,
    
    -- Email Configuration
    email_enabled INTEGER DEFAULT 1,
    email_provider TEXT DEFAULT 'smtp',
    email_from_address TEXT DEFAULT 'noreply@hcmsystem.com',
    email_from_name TEXT,
    email_critical_alerts INTEGER DEFAULT 1,
    email_policy_updates INTEGER DEFAULT 1,
    email_system_alerts INTEGER DEFAULT 1,
    email_digest_notifications INTEGER DEFAULT 0,
    
    -- SMS Configuration
    sms_enabled INTEGER DEFAULT 0,
    sms_provider TEXT,
    sms_from_number TEXT,
    sms_critical_alerts INTEGER DEFAULT 0,
    sms_policy_updates INTEGER DEFAULT 0,
    sms_system_alerts INTEGER DEFAULT 0,
    
    -- Slack Configuration
    slack_enabled INTEGER DEFAULT 0,
    slack_webhook_url TEXT,
    slack_channel TEXT,
    slack_critical_alerts INTEGER DEFAULT 0,
    
    -- Digest Configuration
    digest_frequency TEXT DEFAULT 'daily',
    digest_quiet_hours_enabled INTEGER DEFAULT 0,
    digest_quiet_hours_start TEXT DEFAULT '22:00',
    digest_quiet_hours_end TEXT DEFAULT '06:00',
    
    -- Do Not Disturb (DND)
    dnd_enabled INTEGER DEFAULT 0,
    dnd_start TEXT DEFAULT '22:00',
    dnd_end TEXT DEFAULT '06:00',
    
    -- Custom settings (JSON extensibility)
    custom_settings TEXT,
    
    -- Audit fields
    created_by TEXT,
    updated_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_org ON notification_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_created ON notification_settings(created_at);
