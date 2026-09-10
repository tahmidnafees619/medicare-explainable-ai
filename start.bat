@echo off
echo ========================================
echo   MediCare AI - Starting All Services
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [1/6] Installing Node.js dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo [2/6] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)

echo [3/6] Setting up database...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push database schema
    echo Please check if DATABASE_URL is correct in .env file
    pause
    exit /b 1
)

echo [4/6] Checking Python dependencies...
python --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python not found. ML service will not start.
    echo Please install Python 3.8+ to enable ML features.
) else (
    REM Install Python dependencies if requirements.txt exists
    if exist requirements.txt (
        echo Installing Python packages...
        pip install -r requirements.txt >nul 2>&1
    )
    
    REM Check if models exist, if not train them
    if not exist models\random_forest.pkl (
        echo Training ML models (first run only)...
        python train_models.py
    )
)

echo.
echo ========================================
echo   Starting Services...
echo ========================================
echo.

REM Start Backend
echo [5/6] Starting Backend on port 5000...
start "MediCare Backend" cmd /k "npm run dev:backend"

REM Wait for backend to initialize
timeout /t 3 >nul

REM Start Frontend
echo [6/6] Starting Frontend on port 5173...
start "MediCare Frontend" cmd /k "npm run dev"

REM Start ML Service if Python available
python --version >nul 2>&1
if not errorlevel 1 (
    echo.
    echo Starting ML Service on port 8000...
    start "MediCare ML" cmd /k "python ml_service.py"
)

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:  http://localhost:5000
echo   ML Service: http://localhost:8000
echo.
echo Press any key to close this window...
pause >nul
