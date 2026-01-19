@echo off
title PeopleOS Environment
color 0A
cls

echo ========================================================
echo   PeopleOS - Enterprise Management System
echo ========================================================
echo.
echo [1] Initializing Environment...
call venv\Scripts\activate.bat

echo [2] Checking System Integrity...
python verify_connection.py

echo [3] Starting Backend Services...
start "PeopleOS Backend" /min cmd /k "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo [4] Starting Frontend Interface...
start "PeopleOS Client" /min cmd /k "npm run dev"

echo.
echo [SUCCESS] PeopleOS is running!
echo Access the dashboard at: http://localhost:5173
echo.
pause
