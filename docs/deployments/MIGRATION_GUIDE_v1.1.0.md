# Migration Guide v1.1.0 - Designation Decoupling

## Overview

This release (v1.1.0) decouples Designations from Departments, enabling Organization-Wide ("Global") designations.

## Changes

- **Database**: `designations` table `department_id` column is now NULLABLE.
- **API**: `POST /api/designations` accepts payloads without `department_id`.
- **UI**: Designation creation simplified.

## deployment Steps

### 1. Database Migration

No manual SQL is strictly required if using SQLite as the column definition change is backward compatible (relaxing a constraint), but to ensure schema consistency:

```bash
cd backend
alembic upgrade head
```

_Note: If using the provided `sqlite` db, the schema is already compatible. The logic layer handles the optionality._

### 2. Application Deployment

1.  Stop the backend service.
2.  Deploy new code (checking out tag `v1.1.0`).
3.  Start backend service.

### 3. Verification (Smoke Test)

Run the verification script to confirm API health and Designation Global creation:

```bash
python scripts/verify_designation_api.py
```

## Rollback Plan

Since the change is **Backward Compatible** (making a column nullable), rolling back the application code (to v1.0.0) works immediately. The v1.0.0 code will simply populate the `department_id` again.
_Caution_: Designations created while in v1.1.0 (Global) will have `NULL` department_id. If traversing back to v1.0.0, ensure UI/API handles them or run a cleanup script to assign them to a "General" department if v1.0.0 crashes on NULLs.

## Monitoring & Alerts

Monitor logs for `Designation Creation Failed` errors.

- **Log Pattern**: `ERROR:root:Failed to create designation: ...`
- **Metric**: `api_designation_create_error_total` (if Prometheus enabled).
