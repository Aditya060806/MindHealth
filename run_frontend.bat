@echo off
title MindHealth - Frontend
color 0B

echo.
echo ============================================
echo    MindHealth - Frontend (React + Vite)
echo ============================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] Installing npm packages...
    npm install
)

echo [INFO] Starting Vite dev server...
echo [INFO] Frontend: http://localhost:5173
echo.

npm run dev

pause
