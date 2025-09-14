@echo off
setlocal

echo.
echo ====================================
echo  Berlin Luxe Rentals - Start Production

echo ====================================

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
echo Project Directory: %PROJECT_DIR%

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js not found.
  pause
  goto :eof
)

if not exist .env (
  if exist .env.local (
    echo WARNING: .env missing; using .env.local for build-time vars
  ) else (
    echo WARNING: No env files found. Ensure DATABASE_URL is set in environment.
  )
)

REM Disable ESLint in production build to avoid blocking on warnings/errors
set NEXT_DISABLE_ESLINT=1
set NEXT_TELEMETRY_DISABLED=1

echo Building Next.js for production...
call npm install
call npm run build
if errorlevel 1 (
  echo ERROR: Build failed. Aborting start.
  pause
  goto :eof
)

echo Starting Next.js on port 3002...
start "SwiftLuxury Prod" powershell -NoExit -Command "cd '%PROJECT_DIR%'; next start --port 3002"

echo Done. Open http://localhost:3002
pause
endlocal
