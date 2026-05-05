@echo off
chcp 65001 >nul
title Backup Banco TaskFlow V4

set "APPDATA_DB=%LOCALAPPDATA%\TaskFlowV4\data\taskflow.db"
set "BACKUP_DIR=%~dp0backups"

if not exist "%APPDATA_DB%" (
    echo.
    echo Banco nao encontrado em:
    echo %APPDATA_DB%
    echo.
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set DIA=%%a
    set MES=%%b
    set ANO=%%c
)

set HORA=%time:~0,2%
set MIN=%time:~3,2%
set SEG=%time:~6,2%
set HORA=%HORA: =0%

set "DESTINO=%BACKUP_DIR%\taskflow_backup_%ANO%-%MES%-%DIA%_%HORA%-%MIN%-%SEG%.db"

copy "%APPDATA_DB%" "%DESTINO%" >nul

echo.
echo Backup concluido:
echo %DESTINO%
echo.
pause