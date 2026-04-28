@echo off
cd /d "%~dp0"
echo Starting Backend...
start "Backend" cmd /k "npm run dev:backend"
timeout /t 3 >nul
echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"
echo.
echo Services started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
