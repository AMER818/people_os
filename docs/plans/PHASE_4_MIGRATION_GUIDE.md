# Phase 4 Migration Guide - Notification Settings & Background Jobs

## Overview
Phase 4 adds comprehensive notification management and background job tracking to the HCM system.

**Tables Being Created:**
- `notification_settings` - Email, SMS, Slack configuration
- `background_jobs` - Async job execution tracking

## Prerequisites
- Python 3.9+
- SQLAlchemy models defined in `backend/models.py`
- FastAPI backend running or accessible
- SQLite database at path defined in `settings.DATABASE_URL`

## Migration Methods

### Method 1: Automatic (Recommended)
Uses SQLAlchemy ORM to create tables directly from models:

```bash
cd backend
python migrate_phase4.py
```

**What it does:**
- Reads table definitions from `models.py` 
- Creates tables only if they don't exist
- Ensures consistency between code and database

**Pros:** 
- No SQL syntax errors
- Automatic consistency with Python models
- Idempotent (safe to run multiple times)

**Cons:** None - this is the preferred method

---

### Method 2: Manual SQL (SQLite CLI)
If you need to run migrations manually:

```bash
# For SQLite (built-in to most systems)
sqlite3 backend/data/hunzal_hcm.db < backend/migrations/sqlite_notifications.sql
sqlite3 backend/data/hunzal_hcm.db < backend/migrations/sqlite_background_jobs.sql

# Or for all Phase 4 tables at once:
cat backend/migrations/sqlite_notifications.sql backend/migrations/sqlite_background_jobs.sql | sqlite3 backend/data/hunzal_hcm.db
```

---

## Verification

### After running migration, verify tables exist:

**Option 1: Using SQLite CLI**
```bash
sqlite3 backend/data/hunzal_hcm.db
sqlite> .schema notification_settings
sqlite> .schema background_jobs
sqlite> SELECT COUNT(*) FROM notification_settings;
sqlite> SELECT COUNT(*) FROM background_jobs;
sqlite> .quit
```

**Option 2: Using Python**
```bash
cd backend
python inspect_db.py
# Should list: notification_settings, background_jobs
```

**Option 3: Using HTTP Request**
```bash
# Start backend first: python -m uvicorn main:app --reload --port 2000
curl -X GET http://localhost:2000/api/system/notification-settings \
  -H "Authorization: Bearer <admin_token>"
# Should return 200 with notification settings
```

---

## Table Schemas

### notification_settings

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| id | TEXT | UUID | Unique identifier |
| organization_id | TEXT | - | Organization (FK, UNIQUE) |
| email_enabled | INTEGER | 1 | Email notifications on/off |
| email_provider | TEXT | 'smtp' | SMTP, SendGrid, SES |
| email_from_address | TEXT | noreply@... | From address |
| email_from_name | TEXT | - | From display name |
| sms_enabled | INTEGER | 0 | SMS on/off |
| sms_provider | TEXT | - | Twilio, AWS SNS |
| slack_enabled | INTEGER | 0 | Slack on/off |
| slack_webhook_url | TEXT | - | Slack incoming webhook |
| digest_frequency | TEXT | 'daily' | hourly, daily, weekly |
| dnd_enabled | INTEGER | 0 | Do Not Disturb on/off |
| dnd_start | TEXT | '22:00' | Quiet hours start time |
| dnd_end | TEXT | '06:00' | Quiet hours end time |
| custom_settings | TEXT | - | JSON extensibility |
| created_at | TIMESTAMP | now() | Created timestamp |
| updated_at | TIMESTAMP | now() | Last update timestamp |

**Indexes:**
- `idx_notification_settings_org` - Fast lookup by organization_id
- `idx_notification_settings_created` - Fast lookup by creation date

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `organization_id` (one row per organization)
- FOREIGN KEY: `organization_id` → organizations(id) ON DELETE CASCADE

### background_jobs

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| id | TEXT | UUID | Unique identifier |
| organization_id | TEXT | - | Organization (FK) |
| job_type | TEXT | - | cache_flush, db_optimize, etc. |
| status | TEXT | 'queued' | queued, processing, completed, failed |
| priority | INTEGER | 0 | 1=high, 0=normal, -1=low |
| payload | TEXT | - | JSON input parameters |
| result | TEXT | - | JSON output after execution |
| error_message | TEXT | - | Error details if failed |
| retry_count | INTEGER | 0 | Number of retries attempted |
| max_retries | INTEGER | 3 | Maximum retries allowed |
| next_retry_at | TIMESTAMP | - | When to retry (if failed) |
| started_at | TIMESTAMP | - | Execution start time |
| completed_at | TIMESTAMP | - | Execution end time |
| created_at | TIMESTAMP | now() | Created timestamp |
| updated_at | TIMESTAMP | now() | Last update timestamp |

**Indexes:**
- `idx_background_jobs_org` - Fast lookup by organization_id
- `idx_background_jobs_status` - Fast lookup by status
- `idx_background_jobs_type` - Fast lookup by job_type
- `idx_background_jobs_created` - Fast lookup by creation date
- `idx_background_jobs_next_retry` - Fast lookup of jobs to retry (filtered on status='queued')

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `organization_id` → organizations(id) ON DELETE CASCADE

---

## Testing After Migration

### 1. Verify Auto-Create on First Access
```bash
curl -X GET http://localhost:2000/api/system/notification-settings \
  -H "Authorization: Bearer <admin_token>"

# Response should be 200 with default notification settings created
```

### 2. Test Update Notification Settings
```bash
curl -X PUT http://localhost:2000/api/system/notification-settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"email_enabled": false, "sms_enabled": true}'

# Response should be 200 with updated settings
```

### 3. Test Background Job Creation
```bash
curl -X POST http://localhost:2000/api/system/background-jobs \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "cache_flush",
    "payload": {"action": "full"}
  }'

# Response should be 201 with job_id
```

### 4. Test Job List with Filter
```bash
curl -X GET 'http://localhost:2000/api/system/background-jobs?status=queued' \
  -H "Authorization: Bearer <admin_token>"

# Response should be 200 with filtered jobs
```

---

## Rollback

If migration fails or needs to be reverted:

```bash
# Using Python
cd backend
python
>>> import models
>>> from database import Base, engine
>>> # Drop tables
>>> Base.metadata.drop_all(bind=engine)

# Or manually with SQLite:
sqlite3 backend/data/hunzal_hcm.db
sqlite> DROP TABLE IF EXISTS notification_settings;
sqlite> DROP TABLE IF EXISTS background_jobs;
sqlite> .quit
```

---

## Next Steps

After successful migration:

1. **Integration Testing** - Run end-to-end tests for all 4 phases
2. **Background Worker** - Implement async job processor (worker.py)
3. **UI Integration** - Update SystemSettings.tsx to call new endpoints
4. **Phase 5** - Optional email/SMS/Slack provider integration

---

## Troubleshooting

### "Table already exists" error
- Safe to ignore - tables already created in a previous run
- Run with SQLite to verify: `sqlite3 backend/data/hunzal_hcm.db ".schema notification_settings"`

### "Foreign key constraint failed"
- Ensure `organizations` table exists first
- Check database path in `settings.DATABASE_URL`

### "Permission denied" error
- Ensure write permissions on SQLite database file
- Database file: Check in `backend/data/` directory

### "Module not found" error
- Ensure working directory is `backend/`
- Run `python migrate_phase4.py` from `backend/` folder

---

## Quick Reference

| Task | Command |
|------|---------|
| **Run migration** | `cd backend && python migrate_phase4.py` |
| **Verify tables** | `sqlite3 backend/data/hunzal_hcm.db ".schema"` |
| **Check table data** | `sqlite3 backend/data/hunzal_hcm.db "SELECT * FROM notification_settings LIMIT 5;"` |
| **Rebuild tables** | `cd backend && python -c "from database import Base, engine; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"` |

