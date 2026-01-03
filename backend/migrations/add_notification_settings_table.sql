-- Migration: Add notification_settings table for email, SMS, and Slack integration
-- Created: 2026-01-07
-- Purpose: Store notification preferences and channels for each organization

CREATE TABLE IF NOT EXISTS notification_settings (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL UNIQUE,
    
    -- Email Configuration
    email_enabled BOOLEAN DEFAULT TRUE,
    email_provider VARCHAR(50) DEFAULT 'smtp',  -- "smtp", "sendgrid", "ses"
    email_from_address VARCHAR(255),
    email_from_name VARCHAR(255),
    
    -- Email Event Triggers
    email_on_employee_created BOOLEAN DEFAULT TRUE,
    email_on_leave_request BOOLEAN DEFAULT TRUE,
    email_on_payroll_processed BOOLEAN DEFAULT TRUE,
    email_on_system_alert BOOLEAN DEFAULT TRUE,
    
    -- SMS Configuration
    sms_enabled BOOLEAN DEFAULT FALSE,
    sms_provider VARCHAR(50),  -- "twilio", "aws_sns"
    sms_from_number VARCHAR(20),
    
    -- SMS Event Triggers
    sms_on_leave_approval BOOLEAN DEFAULT FALSE,
    sms_on_payroll_processed BOOLEAN DEFAULT FALSE,
    sms_on_system_alert BOOLEAN DEFAULT FALSE,
    
    -- Slack Integration
    slack_enabled BOOLEAN DEFAULT FALSE,
    slack_webhook_url VARCHAR(2048),
    slack_channel VARCHAR(100),
    slack_on_critical_alerts BOOLEAN DEFAULT TRUE,
    
    -- Digest & Quiet Hours
    digest_enabled BOOLEAN DEFAULT TRUE,
    digest_frequency VARCHAR(20) DEFAULT 'daily',  -- "hourly", "daily", "weekly"
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start VARCHAR(5),  -- "HH:MM"
    quiet_hours_end VARCHAR(5),    -- "HH:MM"
    
    -- Do Not Disturb (DND)
    dnd_enabled BOOLEAN DEFAULT FALSE,
    dnd_start_date DATETIME,
    dnd_end_date DATETIME,
    
    -- Custom JSON settings for extensibility
    custom_settings LONGTEXT,
    
    -- Audit fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Relationships
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (organization_id),
    INDEX idx_email_enabled (email_enabled),
    INDEX idx_sms_enabled (sms_enabled),
    INDEX idx_slack_enabled (slack_enabled)
);

-- Add trigger to update updated_at
DELIMITER $$
CREATE TRIGGER notification_settings_updated_at_trigger
BEFORE UPDATE ON notification_settings
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
