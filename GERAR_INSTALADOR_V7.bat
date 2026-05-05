@echo off
chcp 65001 >nul
title Gerar Instalador TaskFlow V7

echo.
echo ============================================
echo   TaskFlow V7 - Instalador Desktop
echo ============================================
echo.

set "ROOT=%~dp0"
set "INNO=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
set "SCRIPT=%ROOT%TaskFlow_V7_Setup.iss"
set "EXE=%ROOT%release\TaskFlow_V7\TaskFlow.exe"

if not exist "%INNO%" (
    set "INNO=%ProgramFiles%\Inno Setup 6\ISCC.exe"
)

if not exist "%EXE%" (
    echo ERRO: Executavel V7 nao encontrado.
    echo Caminho esperado:
    echo "%EXE%"
    echo.
    echo Gere primeiro a V7 executando:
    echo GERAR_EXECUTAVEL_V7.bat
    echo.
    pause
    exit /b 1
)

if not exist "%SCRIPT%" (
    echo ERRO: Script do instalador nao encontrado:
    echo "%SCRIPT%"
    echo.
    pause
    exit /b 1
)

if not exist "%INNO%" (
    echo ERRO: Inno Setup nao encontrado.
    echo.
    pause
    exit /b 1
)

"%INNO%" "%SCRIPT%"

if errorlevel 1 (
    echo.
    echo ERRO: O Inno Setup encontrou uma falha.
    echo.
    pause
    exit /b 1
)

echo.
echo Instalador gerado com sucesso:
echo "%ROOT%installer_output\TaskFlowV7_Setup.exe"
echo.
pause