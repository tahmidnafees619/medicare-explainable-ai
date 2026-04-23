@echo off
echo Starting Medicare AI Chat...
echo.

echo [1/5] Installing dependencies...
call npm install

echo [2/5] Prisma generate...
call npx prisma generate

echo [3/5] Prisma db push...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Prisma failed to push to the database. 
    echo Please check if your database service is running and DATABASE_URL in .env is correct.
    pause
    exit /b %ERRORLEVEL%
)

echo [4/5] Starting backend...
start "Backend" cmd /k "npm run dev:backend"
timeout /t 3

echo [5/5] Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo Done! Medicare AI Chat is starting up.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
pause