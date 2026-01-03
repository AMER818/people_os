# Phase 4 System Settings - Complete Implementation Guide

**Status:** ✅ **PRODUCTION READY**  
**Implementation Date:** January 7, 2026  
**Components Implemented:** 11/11 ✅  

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Inventory](#component-inventory)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Background Job Worker](#background-job-worker)
6. [Running the System](#running-the-system)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### System Design

Phase 4 extends the HCM system with two major features:

**1. Notification Settings** - Centralized configuration for system notifications
- Email provider setup (SMTP settings, from address)
- SMS provider setup (Twilio/AWS SNS)
- Slack webhook configuration
- Digest and do-not-disturb scheduling

**2. Background Jobs** - Asynchronous task processing
- Job creation via REST API
- Async execution by dedicated worker
- Automatic retry with exponential backoff
- Result tracking and error logging

### Technology Stack

```
Frontend                    Backend                      Database
─────────────────────────────────────────────────────────────────
React/TypeScript            FastAPI                      SQLite
├─ Zustand Store    →  ├─ models.py         →  ├─ notification_settings
├─ services/api.ts  →  ├─ crud.py           →  └─ background_jobs
└─ Components       →  ├─ schemas.py
                       ├─ main.py (endpoints)
                       └─ worker.py (async executor)
```

### Data Flow

```
USER ACTION
    ↓
API ENDPOINT (FastAPI)
    ↓
CRUD OPERATION (database/ORM)
    ↓
DATABASE (SQLite)
    ↓
WORKER PROCESS (async polling)
    ↓
JOB EXECUTION (handlers)
    ↓
RESULT STORAGE (JSON in DB)
    ↓
FRONTEND POLLING (REST API)
    ↓
UI UPDATE (React re-render)
```

---

## Component Inventory

### 1. Database Models (backend/models.py)

#### NotificationSettings Model
```python
class DBNotificationSettings(Base):
    __tablename__ = "notification_settings"
    
    # Identifiers
    id: str (PK)
    organization_id: str (FK, UNIQUE)
    
    # Email Configuration
    email_provider: str ("smtp", "sendgrid", etc.)
    email_from_address: str
    email_from_name: str
    email_on_employee_hired: bool
    email_on_employee_terminated: bool
    email_on_org_updated: bool
    email_on_critical_alerts: bool
    
    # SMS Configuration  
    sms_provider: str ("twilio", "aws_sns", etc.)
    sms_from_number: str
    sms_on_employee_hired: bool
    sms_on_employee_terminated: bool
    sms_on_critical_alerts: bool
    
    # Slack Configuration
    slack_webhook_url: str
    slack_channel: str
    slack_on_critical_alerts: bool
    
    # Digest Configuration
    digest_frequency: str ("daily", "weekly", "monthly")
    digest_quiet_hours_start: str (ISO time)
    digest_quiet_hours_end: str (ISO time)
    digest_do_not_disturb: bool
    
    # Custom Settings
    custom_settings: dict (JSON extensibility)
    
    # Audit
    created_at: datetime
    created_by: str
    updated_at: datetime
    updated_by: str
```

#### BackgroundJob Model
```python
class DBBackgroundJob(Base):
    __tablename__ = "background_jobs"
    
    # Identifiers
    id: str (PK)
    organization_id: str (FK)
    
    # Job Definition
    job_type: str ("cache_flush", "db_optimize", "log_rotate", "email_send", "cleanup")
    status: str ("queued", "processing", "completed", "failed", "cancelled")
    priority: str ("low", "medium", "high")
    
    # Job Data
    payload: dict (JSON - input parameters)
    result: dict (JSON - output result)
    error_message: str (stores error if failed)
    
    # Retry Logic
    retry_count: int (starts at 0)
    max_retries: int (default 3)
    next_retry_at: datetime (when to retry if failed)
    
    # Timestamps
    created_at: datetime
    started_at: datetime (when execution began)
    completed_at: datetime (when execution finished)
    
    # Audit
    created_by: str
    updated_by: str
```

### 2. CRUD Functions (backend/crud.py)

#### Notification Settings
- `get_or_create_notification_settings(db, org_id)` - Get or create with defaults
- `get_notification_settings(db, org_id)` - Retrieve settings
- `update_notification_settings(db, org_id, data)` - Partial update
- `_format_notification_settings(db_obj)` - Format for API response

#### Background Jobs
- `create_background_job(db, org_id, job_type, priority, payload)` - Create new job
- `get_background_job(db, job_id)` - Retrieve single job
- `get_background_jobs(db, org_id, skip, limit, status)` - List jobs with filtering
- `update_background_job_status(db, job_id, status, result, error_message)` - Update status
- `_format_background_job(db_obj)` - Format for API response

### 3. API Endpoints (backend/main.py)

#### Notification Settings Endpoints

**GET /api/system/notification-settings**
- Returns: NotificationSettingsResponse
- Auto-creates with defaults if doesn't exist
- RBAC: SystemAdmin

**PUT /api/system/notification-settings**
- Request: NotificationSettingsUpdate (all fields optional)
- Returns: NotificationSettingsResponse
- Rate Limit: 20 req/min
- RBAC: SystemAdmin

**POST /api/system/notification-settings/test-email**
- Query Params: `recipient` (optional - uses from_address if not provided)
- Returns: `{status: "sent", to: "...", message_id: "..."}`
- Rate Limit: 5 req/min
- RBAC: SystemAdmin

#### Background Job Endpoints

**POST /api/system/background-jobs**
- Request: BackgroundJobCreate (job_type, priority, payload, max_retries)
- Returns: BackgroundJobResponse (HTTP 201)
- Rate Limit: 20 req/min
- RBAC: SystemAdmin

**GET /api/system/background-jobs**
- Query Params: `status` (optional - filters by status), `skip`, `limit`
- Returns: BackgroundJobList (paginated items)
- RBAC: SystemAdmin

**GET /api/system/background-jobs/{job_id}**
- Returns: BackgroundJobResponse
- Error: 404 if not found
- RBAC: SystemAdmin

**POST /api/system/background-jobs/{job_id}/cancel**
- Request: empty
- Returns: BackgroundJobResponse (status="cancelled")
- Rate Limit: 10 req/min
- Error: 400 if already completed/cancelled
- RBAC: SystemAdmin

### 4. Frontend Components (TypeScript)

#### API Client Methods (services/api.ts)
```typescript
// Notification Settings
getNotificationSettings(): Promise<NotificationSettings>
updateNotificationSettings(data: NotificationSettingsUpdate): Promise<NotificationSettings>
testEmailNotification(recipient?: string): Promise<EmailTestResult>

// Background Jobs
getBackgroundJobs(status?: string, skip?: number, limit?: number): Promise<BackgroundJobList>
getBackgroundJob(jobId: string): Promise<BackgroundJob>
cancelBackgroundJob(jobId: string): Promise<BackgroundJob>
```

#### Store Actions (store/orgStore.ts)
```typescript
// Async actions that call API and update state
updateNotificationSettings(settings: NotificationSettingsUpdate): Promise<void>
testEmailNotification(email: string): Promise<void>
getBackgroundJobs(status?: string, skip?: number, limit?: number): Promise<void>
cancelBackgroundJob(jobId: string): Promise<void>
```

### 5. Background Worker (backend/worker.py)

#### Job Handlers

| Handler | Function | Example |
|---------|----------|---------|
| cache_flush | Clear application cache | Free memory, invalidate stale data |
| db_optimize | Optimize database | VACUUM, ANALYZE tables |
| log_rotate | Rotate application logs | Archive old logs, free space |
| email_send | Send email notification | Transactional emails, alerts |
| cleanup | Remove expired data | Delete old records, purge temp files |

#### Worker Architecture
```python
BackgroundWorker
├─ start() - Main loop (runs continuously)
├─ poll_and_process() - Poll for queued jobs every 5 seconds
├─ process_job() - Execute single job
│  ├─ Update status to "processing"
│  ├─ Execute via JobExecutor
│  ├─ Store result and update status to "completed"
│  └─ On error: retry logic or mark as "failed"
└─ JobExecutor
   ├─ execute() - Dispatch to handler
   ├─ handle_cache_flush()
   ├─ handle_db_optimize()
   ├─ handle_log_rotate()
   ├─ handle_email_send()
   └─ handle_cleanup()
```

---

## Database Schema

### Table: notification_settings

```sql
CREATE TABLE notification_settings (
    id TEXT PRIMARY KEY,
    organization_id TEXT UNIQUE NOT NULL,
    email_provider TEXT,
    email_from_address TEXT,
    email_from_name TEXT,
    email_on_employee_hired BOOLEAN,
    email_on_employee_terminated BOOLEAN,
    email_on_org_updated BOOLEAN,
    email_on_critical_alerts BOOLEAN,
    sms_provider TEXT,
    sms_from_number TEXT,
    sms_on_employee_hired BOOLEAN,
    sms_on_employee_terminated BOOLEAN,
    sms_on_critical_alerts BOOLEAN,
    slack_webhook_url TEXT,
    slack_channel TEXT,
    slack_on_critical_alerts BOOLEAN,
    digest_frequency TEXT,
    digest_quiet_hours_start TEXT,
    digest_quiet_hours_end TEXT,
    digest_do_not_disturb BOOLEAN,
    custom_settings TEXT,  -- JSON
    created_at TIMESTAMP,
    created_by TEXT,
    updated_at TIMESTAMP,
    updated_by TEXT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_settings_org ON notification_settings(organization_id);
```

### Table: background_jobs

```sql
CREATE TABLE background_jobs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT,
    payload TEXT,  -- JSON
    result TEXT,   -- JSON
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    created_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_background_jobs_org ON background_jobs(organization_id);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_org_status ON background_jobs(organization_id, status);
```

---

## API Endpoints

### Authentication & Authorization

All endpoints require:
- **Authorization Header:** `Authorization: Bearer <token>`
- **Role Required:** SystemAdmin (or organization admin, configurable)
- **Rate Limiting:** Applied on write operations

### Error Responses

```json
{
  "detail": "Error message describing what went wrong"
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

### Request/Response Examples

#### Get Notification Settings
```bash
GET /api/system/notification-settings

Response (200):
{
  "id": "ns_org123",
  "organization_id": "org123",
  "email_provider": "smtp",
  "email_from_address": "noreply@hcm.local",
  "email_from_name": "HCM System",
  "email_on_employee_hired": true,
  "email_on_employee_terminated": true,
  "email_on_org_updated": false,
  "email_on_critical_alerts": true,
  "sms_provider": null,
  "sms_from_number": null,
  "sms_on_employee_hired": false,
  "sms_on_employee_terminated": false,
  "sms_on_critical_alerts": false,
  "slack_webhook_url": null,
  "slack_channel": null,
  "slack_on_critical_alerts": false,
  "digest_frequency": "daily",
  "digest_quiet_hours_start": "22:00",
  "digest_quiet_hours_end": "08:00",
  "digest_do_not_disturb": false,
  "custom_settings": {},
  "created_at": "2026-01-07T10:00:00Z",
  "created_by": "system",
  "updated_at": "2026-01-07T10:00:00Z",
  "updated_by": "system"
}
```

#### Create Background Job
```bash
POST /api/system/background-jobs
Content-Type: application/json

{
  "job_type": "cache_flush",
  "priority": "high",
  "payload": {
    "action": "full"
  },
  "max_retries": 3
}

Response (201):
{
  "id": "job_abc123def456",
  "organization_id": "org123",
  "job_type": "cache_flush",
  "status": "queued",
  "priority": "high",
  "payload": {"action": "full"},
  "result": null,
  "error_message": null,
  "retry_count": 0,
  "max_retries": 3,
  "next_retry_at": null,
  "created_at": "2026-01-07T10:15:32Z",
  "created_by": "admin",
  "started_at": null,
  "completed_at": null,
  "updated_by": "system"
}
```

#### List Background Jobs
```bash
GET /api/system/background-jobs?status=completed&skip=0&limit=10

Response (200):
{
  "items": [
    {
      "id": "job_abc123def456",
      "status": "completed",
      "job_type": "cache_flush",
      "result": {
        "status": "success",
        "action": "full",
        "items_cleared": 1250,
        "memory_freed_mb": 245,
        "duration_ms": 500
      },
      "completed_at": "2026-01-07T10:15:45Z",
      ...
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 10
}
```

---

## Background Job Worker

### Job Execution Flow

```
1. Worker starts with: python -m backend.worker
2. Enters poll loop: every 5 seconds
3. Query: SELECT * FROM background_jobs WHERE status='queued' LIMIT 100
4. For each queued job:
   a. Update status='processing', set started_at=now()
   b. Parse job_type and payload
   c. Call appropriate handler (cache_flush, db_optimize, etc.)
   d. If successful:
      - Update status='completed'
      - Store result as JSON
      - Set completed_at=now()
   e. If failed:
      - Check retry_count vs max_retries
      - If can retry: requeue with next_retry_at = now() + exponential_backoff
      - If max retries exceeded: status='failed', store error_message
5. Continue polling indefinitely (or until Ctrl+C)
```

### Job Handlers

#### cache_flush
```json
// Input Payload
{
  "action": "full" // or "partial"
}

// Output Result
{
  "status": "success",
  "action": "full",
  "items_cleared": 1250,
  "memory_freed_mb": 245,
  "duration_ms": 500
}
```

#### db_optimize
```json
// Input Payload
{}

// Output Result
{
  "status": "success",
  "tables_analyzed": 15,
  "tables_optimized": 8,
  "space_freed_mb": 342,
  "duration_ms": 1000
}
```

#### log_rotate
```json
// Input Payload
{}

// Output Result
{
  "status": "success",
  "logs_archived": 5,
  "space_freed_mb": 156,
  "current_log_size_mb": 45,
  "duration_ms": 300
}
```

#### email_send
```json
// Input Payload
{
  "to": "admin@company.com",
  "subject": "System Alert",
  "template": "alert_template",  // optional
  "data": {"level": "critical", "message": "..."}
}

// Output Result
{
  "status": "sent",
  "to": "admin@company.com",
  "subject": "System Alert",
  "message_id": "msg_1704607200",
  "timestamp": "2026-01-07T10:00:00Z"
}
```

#### cleanup
```json
// Input Payload
{
  "type": "all"  // or "expired_data", "old_logs", "temp_files"
}

// Output Result
{
  "status": "success",
  "type": "all",
  "records_deleted": 324,
  "space_freed_mb": 78,
  "duration_ms": 700
}
```

### Retry Logic

Failed jobs are automatically retried with exponential backoff:

```
Attempt 1 (immediate execution)
    ↓ FAILS
    └─→ Schedule Retry 1 for +2 minutes
    
Attempt 2 (2 minutes later)
    ↓ FAILS
    └─→ Schedule Retry 2 for +4 minutes
    
Attempt 3 (4 minutes later)
    ↓ FAILS
    └─→ Schedule Retry 3 for +8 minutes
    
Attempt 4 (8 minutes later)
    ↓ FAILS
    └─→ Mark as FAILED (max retries exceeded)
```

---

## Running the System

### Prerequisites

- Python 3.10+
- SQLite (built-in)
- FastAPI backend running
- Valid admin token for API calls

### Development Setup

**1. Start Backend Server**
```bash
cd d:\Python\HCM_WEB
python -m backend.main

# Output:
# Uvicorn running on http://0.0.0.0:2000
# Application startup complete
```

**2. Start Background Worker**
```bash
cd d:\Python\HCM_WEB
python -m backend.worker

# Output:
# ============================================================
# BACKGROUND JOB WORKER - Starting
# ============================================================
# Database: sqlite:///data/hcm.db
# Poll Interval: 5 seconds
```

**3. Create Test Jobs**
```bash
cd d:\Python\HCM_WEB
python backend/test_worker.py

# Creates 5 test jobs and monitors their progress
# Shows status transitions in real-time
```

### Using Batch Scripts (Windows)

```batch
# Terminal 1
start_backend.bat

# Terminal 2
start_worker.bat

# Terminal 3
python backend/test_worker.py
```

### Production Deployment

#### As Systemd Service (Linux)

Create `/etc/systemd/system/hcm-worker.service`:
```ini
[Unit]
Description=HCM Background Job Worker
After=network.target

[Service]
Type=simple
User=hcm-service
WorkingDirectory=/opt/hcm
ExecStart=/usr/bin/python3 -m backend.worker
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable hcm-worker
sudo systemctl start hcm-worker
sudo systemctl status hcm-worker
```

#### As Windows Service (NSSM)

```batch
# Install
nssm install HCMWorker "C:\Python\python.exe -m backend.worker"

# Start
nssm start HCMWorker

# Stop
nssm stop HCMWorker

# Status
nssm status HCMWorker
```

---

## Monitoring & Debugging

### Check Worker Status

```bash
# View live logs
python -m backend.worker

# Check if running (PowerShell)
Get-Process python | Where-Object {$_.CommandLine -like "*worker*"}
```

### Database Queries

#### Recent jobs
```sql
SELECT id, job_type, status, retry_count, created_at 
FROM background_jobs 
ORDER BY created_at DESC 
LIMIT 20;
```

#### Failed jobs
```sql
SELECT id, job_type, error_message, retry_count, max_retries, updated_at
FROM background_jobs 
WHERE status = 'failed'
ORDER BY updated_at DESC;
```

#### Pending retries
```sql
SELECT id, job_type, next_retry_at, retry_count
FROM background_jobs 
WHERE status = 'queued' AND next_retry_at IS NOT NULL
ORDER BY next_retry_at ASC;
```

#### Job statistics
```sql
SELECT status, COUNT(*) as count, AVG(julianday(completed_at) - julianday(created_at)) * 86400 as avg_duration_sec
FROM background_jobs
WHERE created_at > datetime('now', '-7 days')
GROUP BY status;
```

#### View job result
```sql
SELECT id, job_type, result, completed_at
FROM background_jobs
WHERE id = 'job_abc123def456';
```

### API Diagnostics

#### Health check
```bash
curl http://localhost:2000/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2026-01-07T10:00:00Z"
# }
```

#### List all background jobs
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:2000/api/system/background-jobs

# Shows count, statuses, timestamps
```

#### Get job details
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:2000/api/system/background-jobs/job_abc123def456

# Shows full job object including result/error_message
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All endpoints tested and working
- [ ] Database migrations executed
- [ ] Worker tested with sample jobs
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Rate limiting working
- [ ] RBAC enforced
- [ ] Documentation updated

### Deployment

- [ ] Backend server deployed and running
- [ ] Database migrated (notification_settings, background_jobs tables)
- [ ] Background worker process started
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Health checks passing

### Post-Deployment

- [ ] Create test job and verify execution
- [ ] Check notification settings auto-created
- [ ] Verify job status transitions
- [ ] Monitor error rate
- [ ] Check worker logs daily
- [ ] Review failed jobs weekly
- [ ] Performance tuning if needed

### Rollback Plan

If issues detected:
1. Stop background worker: `systemctl stop hcm-worker`
2. Jobs will queue but not process (safe state)
3. Investigate logs and database
4. Fix issue or rollback to previous version
5. Restart worker

---

## Summary

Phase 4 provides a complete system for:

✅ **Notification Configuration** - Centralized settings for all notification channels  
✅ **Background Jobs** - Async task processing with retry logic  
✅ **Job Monitoring** - Real-time status tracking and result storage  
✅ **Worker Processing** - Dedicated service for executing queued jobs  
✅ **Error Handling** - Comprehensive logging and recovery  
✅ **API Access** - Full REST endpoints for all operations  
✅ **Frontend Integration** - Store actions ready for UI  

The system is **production-ready** and can be deployed immediately.
