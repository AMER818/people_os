@echo off
echo [DEPLOY] Starting PeopleOS Deployment...

:: 1. Install/Update Dependencies
echo [1/4] Checking Python Dependencies...
call venv\Scripts\activate
pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    exit /b %ERRORLEVEL%
)

:: 2. Run Database Migrations (Simulated)
echo [2/4] Verifying Database Schema...
python -m backend.migrate_db
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Database migration script not found or failed. Skipping...
)

:: 3. Create Backup
echo [3/4] Creating Pre-deployment Backup...
python scripts\backup_db.py

:: 4. Start Application
echo [4/4] Starting Server...
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

echo [DEPLOY] Deployment Complete.
