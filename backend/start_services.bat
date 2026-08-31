@echo off
echo ========================================
echo MediCore - Start All Services
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Redis is running
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis is not running!
    echo Please start Redis first:
    echo   redis-server
    echo.
    pause
    exit /b 1
)
echo [OK] Redis is running
echo.

echo Starting services in new windows...
echo.

REM Start Flask Server
echo [1/3] Starting Flask Server...
start "MediCore - Flask Server" cmd /k "cd /d %~dp0 && python app.py"
timeout /t 2 >nul

REM Start Celery Worker
echo [2/3] Starting Celery Worker...
start "MediCore - Celery Worker" cmd /k "cd /d %~dp0 && celery -A celery_worker.celery_app worker --loglevel=info --pool=solo"
timeout /t 2 >nul

REM Start Celery Beat
echo [3/3] Starting Celery Beat...
start "MediCore - Celery Beat" cmd /k "cd /d %~dp0 && celery -A celery_worker.celery_app beat --loglevel=info"
timeout /t 2 >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Running services:
echo   - Flask Server: http://localhost:5001
echo   - Celery Worker: Processing tasks
echo   - Celery Beat: Scheduling reminders
echo.
echo Press any key to open test menu...
pause >nul

REM Open test menu
python run_tests.py

echo.
echo To stop all services, close the terminal windows.
pause
