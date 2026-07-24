@echo off
title Horology Studio 3D - Local Build Script
echo ========================================================
echo   Horology Studio 3D - Native Qt 6 C++20 Local Build
echo ========================================================

if not exist build mkdir build

cd build
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release ..
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake configuration failed. Ensure Qt 6.8+ and Ninja are in PATH.
    pause
    exit /b %ERRORLEVEL%
)

cmake --build . --config Release
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   BUILD SUCCESSFUL! Executable: build\HorologyStudio3D.exe
echo ========================================================
pause
