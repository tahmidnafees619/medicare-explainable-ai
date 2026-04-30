@echo off
echo ==========================================
echo   MediCare AI - Quick Start
echo ==========================================
cd /d "%~dp0"

echo [1/3] Starting Backend (port 5000)...
start "MediCare Backend" cmd /k "npm run dev:backend"

REM Wait for backend to initialize
timeout /t 3 >nul

echo [2/3] Starting Frontend (port 5173)...
start "MediCare Frontend" cmd /k "npm run dev"

REM Start ML Service if Python is available
python --version >nul 2>&1
if not errorlevel 1 (
    echo [3/3] Starting ML Service (port 8000)...
    start "MediCare ML" cmd /k "python ml_service.py"
) else (
    echo.
    echo WARNING: Python not installed. ML service skipped.
    echo Install Python 3.8+ to enable ML predictions.
)

echo.
echo ==========================================
echo   Services Started!
echo ==========================================
echo   Frontend:    http://localhost:5173
echo   Backend:   http://localhost:5000
echo   ML:        http://localhost:8000
