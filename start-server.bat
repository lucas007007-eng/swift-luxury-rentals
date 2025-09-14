@echo off

echo.
echo ====================================
echo  Berlin Luxe Rentals - Server Start
echo ====================================
echo.

:: Determine project directory (this script's folder)
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
echo 📁 Project Directory: %PROJECT_DIR%
echo.

:: Prefer desktop launcher if available
if exist "%PROJECT_DIR%\start-server-desktop.bat" (
  echo 🖥️  Detected desktop launcher. Delegating to start-server-desktop.bat ...
  call "%PROJECT_DIR%\start-server-desktop.bat"
  goto :eof
)

:: Ensure Node.js and npm exist
where node >nul 2>nul
if errorlevel 1 (
  echo ❌ Node.js not found. Attempting desktop setup if available...
  if exist "%PROJECT_DIR%\DESKTOP_SETUP.bat" (
    call "%PROJECT_DIR%\DESKTOP_SETUP.bat"
  ) else (
    echo Please install Node.js (v18+) and re-run this script: https://nodejs.org/
    pause
    goto :eof
  )
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ❌ npm not found. Please install Node.js which includes npm.
  pause
  goto :eof
)

if not exist package.json (
  echo ❌ package.json not found!
  echo Make sure this script is in the berlinluxerentals directory
  echo Current directory: %PROJECT_DIR%
  echo.
  pause
  goto :eof
)

echo ✅ Found package.json - Starting server...
echo.

:: Create .env.local from example if missing
if not exist .env.local (
  if exist env.local.example (
    echo 🧩 Creating .env.local from env.local.example ...
    copy /y env.local.example .env.local >nul
  ) else (
    echo ⚠️  .env.local missing and no example file found. Ensure DATABASE_URL is set if using Postgres.
  )
)

echo 🔎 Pre-start checks...
echo -------------------------------------------
:: Install dependencies if missing
if not exist node_modules (
  echo 📦 node_modules missing. Running npm install...
  call npm install
)

:: Prisma client and migrations
if exist prisma\schema.prisma (
  echo 🧬 Generating Prisma client...
  call npx prisma generate
  echo 🗄️  Applying database migrations (deploy)...
  call npx prisma migrate deploy || call npx prisma db push
  if exist prisma\seed.cjs (
    echo 🌱 Seeding database (safe run)...
    node prisma\seed.cjs || echo (seed skipped)
  )
)

:: Start Docker Postgres (db) if docker-compose exists and Docker is available
if exist docker-compose.yml (
  where docker >nul 2>nul && (
    echo 🐳 Starting Docker services (db) if needed...
    docker compose up -d db >nul 2>nul
  )
)

:: Clean Next.js cache to avoid RSC client manifest issues
if exist .next (
  echo 🧹 Cleaning .next cache to ensure a fresh build...
  rmdir /s /q .next
)

echo -------------------------------------------
echo.

:: Pick port (prefer 3002, fallback to 3003 if busy)
set PORT=3002
netstat -ano | findstr /c:":3002" | findstr LISTENING >nul 2>nul && set PORT=3003
if "%PORT%"=="3003" (
  echo ⚠️  Port 3002 is in use. Using port 3003 instead.
)

:: Optional audit/outdated (non-blocking)
echo 📋 Running quick audit/outdated checks (non-blocking)...
call npm audit --omit=dev >nul 2>nul
call npm outdated >nul 2>nul

:: Launch dev server in a new window
set "TITLE=Berlin Luxe Rentals Server"
echo 🚀 Starting server in new window on port %PORT%...
start "%TITLE%" powershell -NoExit -Command "cd '%PROJECT_DIR%'; Write-Host 'Berlin Luxe Rentals Server' -ForegroundColor Cyan; Write-Host ('URL: http://localhost:%PORT%') -ForegroundColor Green; npm run dev -- --port %PORT%"

echo.
echo ✅ Server start requested!
echo 🌐 Access your site at: http://localhost:%PORT%
echo 📝 Server is running in a separate window

echo.
echo 🔁 Restore point: See backups folder for latest zip

echo.
pause




