@echo off
echo ==============================================
echo GKI Dashboard Startup Script
echo ==============================================

cd /d "%~dp0"

REM Check if conda environment exists
call conda activate gki_waha_env 2>nul
if errorlevel 1 (
    echo Creating conda environment 'gki_waha_env'...
    call conda create -n gki_waha_env python=3.11 -y
    if errorlevel 1 (
        echo Failed to create Conda environment. Make sure Conda is installed and in your PATH.
        pause
        exit /b 1
    )
    call conda activate gki_waha_env
    echo Installing Python dependencies...
    pip install -r requirements.txt
    
    echo Installing Frontend dependencies...
    cd frontend
    call npm install
    call npm run build
    cd ..
) else (
    echo Conda environment 'gki_waha_env' activated.
)

REM Start the FastAPI backend
echo Starting Backend Server...
cd backend
start "GKI Dashboard - Server" cmd /c "uvicorn main:app --port 8000"

echo.
echo ==============================================
echo Dashboard is starting...
echo Please open your browser and go to:
echo http://localhost:8000
echo ==============================================

REM Wait a couple of seconds for the server to start, then open the browser
ping 127.0.0.1 -n 4 > nul
start http://localhost:8000
