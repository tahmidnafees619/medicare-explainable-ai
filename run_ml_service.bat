@echo off
echo Starting MediCare AI ML Service...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist requirements.txt (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if training data exists
if not exist training_data.csv (
    echo ERROR: training_data.csv not found
    echo Please ensure your CSV training data is in the current directory
    pause
    exit /b 1
)

REM Train models if not already trained
if not exist models (
    echo Training ML models...
    python train_models.py
    if errorlevel 1 (
        echo ERROR: Model training failed
        pause
        exit /b 1
    )
) else (
    echo Using existing trained models...
)

REM Start the ML service
echo.
echo Starting ML service on http://localhost:8000
echo Press Ctrl+C to stop the service
echo.
python ml_service.py