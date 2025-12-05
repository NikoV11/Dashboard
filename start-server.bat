@echo off
REM FRED Dashboard Server Startup Script (Node.js)
REM This script starts the local server on port 3000

echo ========================================
echo FRED Dashboard Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Make sure to add Node.js to your PATH during installation
    echo.
    pause
    exit /b 1
)

echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause
