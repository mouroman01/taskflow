@echo off
chcp 65001 >nul
title Gerar Executavel TaskFlow V8 Auto Update

echo.
echo ============================================
echo   TaskFlow V8 - Auto Update
echo ============================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0BUILD_TASKFLOW_V8.ps1"

echo.
pause