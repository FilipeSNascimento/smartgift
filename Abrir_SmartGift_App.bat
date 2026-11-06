@echo off
chcp 65001 >nul
title SmartGift — Inicializador do Aplicativo Desktop
echo =========================================================
echo   🎁 SmartGift — Abrindo Aplicativo Standalone (PC/Mobile)
echo   Banco de Dados: Supabase PostgreSQL (sa-east-1)
echo =========================================================
echo.

REM Verifica se a porta 4200 já está escutando
netstat -ano | findstr ":4200" >nul
if %errorlevel% neq 0 (
    echo [1/2] Iniciando servidor local do SmartGift em segundo plano...
    start "SmartGift Server" /min cmd /c "cd /d "%~dp0web" && npm start"
    echo Aguardando o aplicativo iniciar (8 segundos)...
    timeout /t 8 /nobreak >nul
) else (
    echo [1/2] Servidor SmartGift ja esta ativo em http://localhost:4200
)

echo [2/2] Abrindo janela dedicada de aplicativo SmartGift...
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start "" msedge --app=http://localhost:4200 --window-size=430,880
    goto :eof
)

where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start "" chrome --app=http://localhost:4200 --window-size=430,880
    goto :eof
)

start http://localhost:4200
