@echo off
echo Starting Habit Tracker Development Environment...
echo.

echo Starting Backend (FastAPI)...
start "Backend" cmd /k "cd /d %~dp0 && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (React)...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Development environment started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
