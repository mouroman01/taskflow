@echo off
chcp 65001 >nul
title Gerar Executavel TaskFlow V7 Desktop

echo.
echo ============================================
echo   TaskFlow V7 - Desktop App
echo ============================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0BUILD_TASKFLOW_V7.ps1"

echo.
pause