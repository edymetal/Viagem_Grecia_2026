@echo off
setlocal
title Atenas 2026
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 22.12 ou superior para abrir o aplicativo.
  echo Depois, clique duas vezes neste arquivo novamente.
  pause
  exit /b 1
)
node "%~dp0scripts\open-app.mjs"
if errorlevel 1 (
  echo.
  echo Nao foi possivel abrir Atenas 2026. Confira a mensagem acima.
  pause
  exit /b 1
)
if /i "%~1"=="--no-open" exit /b 0
start "" "http://127.0.0.1:5173/Viagem_Grecia_2026/"
endlocal
