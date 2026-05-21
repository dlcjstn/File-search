@echo off
echo ============================================================
echo    File Search Tool - Quick Start
echo ============================================================
echo.

cd /d "%~dp0"

echo [Step 1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies (first run may take a few minutes)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)
echo [OK] Dependencies ready
echo.

echo [Step 2/3] Starting backend server on port 3001...
echo.
start "FileSearch-Backend" cmd /k "npm run server:dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo [Step 3/3] Starting frontend server on port 5173...
echo.
start "FileSearch-Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo    SUCCESS! Both servers are starting...
echo ============================================================
echo.
echo Please open in your browser:
echo   http://localhost:5173/file-search
echo.
echo IMPORTANT:
echo   - Keep BOTH terminal windows open
echo   - Press Ctrl+C to stop servers
echo.
pause
