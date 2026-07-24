@echo off
title Micro-Timegrapher Studio Pro Launcher
echo ========================================================
echo Launching Micro-Timegrapher Studio Pro Workstation...
echo ========================================================

cd /d "%~dp0"

if exist "%~dp0dist\index.html" (
    node server.js
) else (
    echo Building production assets...
    call npm run build
    node server.js
)

pause
