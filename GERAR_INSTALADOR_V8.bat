@echo off
chcp 65001 >nul
title Gerar Instalador TaskFlow V8

set "ROOT=%~dp0"
set "INNO=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
set "SCRIPT=%ROOT%TaskFlow_V8_Setup.iss"
set "EXE=%ROOT%release\TaskFlow_V8\TaskFlow.exe"

if not exist "%INNO%" (
    set "INNO=%ProgramFiles%\Inno Setup 6\ISCC.exe"
)

if not exist "%EXE%" (
    echo ERRO: Executavel V8 nao encontrado.
    echo Gere primeiro: GERAR_EXECUTAVEL_V8.bat
    pause
    exit /b 1
)

if not exist "%INNO%" (
    echo ERRO: Inno Setup nao encontrado.
    pause
    exit /b 1
)

"%INNO%" "%SCRIPT%"

pause