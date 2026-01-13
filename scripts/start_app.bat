@echo off
echo Starting Hunzal People OS...
echo.
cd /d "%~dp0"
cd ..
start "Backend Server" cmd /k "venv\Scripts\activate && python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 3002"
start "Frontend Client" cmd /k "npm run dev"

echo Services started in separate windows.
echo Frontend: http://localhost:5173
echo Backend: http://127.0.0.1:3002
