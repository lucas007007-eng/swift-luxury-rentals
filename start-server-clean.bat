@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
cd /d "%PROJECT_DIR%"

echo Killing any running Node processes...
taskkill /F /IM node.exe >nul 2>nul

echo Ensuring dependencies are installed...
if not exist node_modules (
  call npm install || goto :fail
)

echo Cleaning caches...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Prisma generate and migrate (best-effort)...
if exist prisma\schema.prisma (
  call npx prisma generate >nul 2>nul
  call npx prisma migrate deploy >nul 2>nul
)

echo Starting Next.js dev on port 3002...
start "Berlin Luxe Rentals Server" cmd /k cd /d "%PROJECT_DIR%" ^&^& npm run dev -- --port 3002
echo Launched dev window. Access: http://localhost:3002
goto :eof

:fail
echo Failed to install dependencies. Please run npm install manually.
pause
endlocal


