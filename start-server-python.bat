@echo off
REM FRED Dashboard Server Startup Script (Python 3)
REM This script starts the local server on port 3000

echo ========================================
echo FRED Dashboard Server (Python)
echo ========================================
echo.

REM Check if Python 3 is installed
where python3 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    REM Try python instead
    where python >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Python is not installed or not in PATH
        echo.
        echo Please install Python from: https://www.python.org/downloads
        echo Make sure to check "Add python.exe to PATH" during installation
        echo.
        pause
        exit /b 1
    )
    set PYTHON_CMD=python
) else (
    set PYTHON_CMD=python3
)

echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
%PYTHON_CMD% server.py

pause
