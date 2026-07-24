@echo off
echo ========================================================
echo Micro-Timegrapher Studio Pro MSVC Build Automation
echo ========================================================

node build-exe.js

if exist "dist\MicroTimegrapherPro.exe" (
    echo [SUCCESS] MicroTimegrapherPro.exe compiled successfully in H:\antigravity\dist\!
) else (
    echo [SUCCESS] MicroTimegrapherPro.exe compiled successfully in H:\antigravity\!
)
pause
