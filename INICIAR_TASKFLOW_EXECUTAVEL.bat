@echo off
chcp 65001 >nul
title TaskFlow V4 Profissional

set "APP_DIR=%~dp0release\TaskFlow_V4"
set "EXE=%APP_DIR%\TaskFlowV4.exe"

if not exist "%EXE%" (
    echo.
    echo ERRO: Executavel nao encontrado.
    echo Esperado em:
    echo %EXE%
    echo.
    echo Primeiro execute: GERAR_EXECUTAVEL_V4.bat
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando TaskFlow V4...
echo.
start "" "%EXE%"
timeout /t 3 >nul
start "" "http://127.0.0.1:8000"
exit