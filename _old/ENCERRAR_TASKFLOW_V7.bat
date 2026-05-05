@echo off
chcp 65001 >nul
title Encerrar TaskFlow V7

echo.
echo Encerrando TaskFlow...
echo.

taskkill /IM TaskFlow.exe /F >nul 2>&1

echo Processo encerrado.
echo.
pause