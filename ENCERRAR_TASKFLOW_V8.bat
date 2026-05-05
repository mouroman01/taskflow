@echo off
chcp 65001 >nul
title Encerrar TaskFlow V8

taskkill /IM TaskFlow.exe /F >nul 2>&1

echo TaskFlow encerrado.
pause