@echo off
cd /d %~dp0
echo Starting MediCare AI ML Service...
echo.

REM Ensure we are in the repository root directory
cd /d %~dp0

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
    echo Please ensure your CSV training data is in the repository root directory
    pause
    exit /b 1
)

REM Ensure all model files exist before starting ML service
set MISSING_MODELS=0
for %%f in (tfidf_vectorizer.pkl label_encoder.pkl random_forest.pkl svm.pkl naive_bayes.pkl) do (
    if not exist models\%%f (
        set MISSING_MODELS=1
    )
)

if %MISSING_MODELS%==1 (
    echo One or more trained model files are missing. Training ML models now...
    python train_models.py
    if errorlevel 1 (
        echo ERROR: Model training failed
        pause
        exit /b 1
    )
) else (
    echo All trained model files are present.
)

REM Start the ML service
echo.
echo Starting ML service on http://localhost:8000
echo Press Ctrl+C to stop the service
echo.
python ml_service.py