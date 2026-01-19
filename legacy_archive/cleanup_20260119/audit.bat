@echo off
echo [SYSTEM] Initializing PeopleOS Deduplication Matrix...
echo [SYSTEM] Loading Enforcement Protocols...
echo.
venv\Scripts\python scripts/deduplication_audit.py
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SYSTEM] AUDIT PASSED. System is clean.
    exit /b 0
) else (
    echo [SYSTEM] AUDIT FAILED. Violations detected.
    exit /b 1
)
