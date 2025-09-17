@echo off
setlocal

echo.
echo ====================================
echo  Berlin Luxe Rentals - Server Start

echo ====================================

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
echo Project Directory: %PROJECT_DIR%

REM Delegate to clean launcher for reliability
if exist start-server-clean.bat (
  call start-server-clean.bat
  goto :eof
)

if /I "%~1"=="restore" goto restore

set "EXISTING_PORT="
for /f "tokens=*" %%A in ('netstat -ano ^| findstr /c:":3002" ^| findstr LISTENING') do set "EXISTING_PORT=3002"
if defined EXISTING_PORT goto existing
for /f "tokens=*" %%A in ('netstat -ano ^| findstr /c:":3003" ^| findstr LISTENING') do set "EXISTING_PORT=3003"
if defined EXISTING_PORT goto existing

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js not found.
  pause
  goto :eof
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm not found.
  pause
  goto :eof
)

echo Tool versions:
for /f %%V in ('node -v') do set NODEVER=%%V
for /f %%V in ('npm -v') do set NPMVER=%%V
echo   node %NODEVER%
echo   npm %NPMVER%
where docker >nul 2>nul
if not errorlevel 1 (
  for /f "tokens=*" %%V in ('docker --version') do echo   %%V
) else (
  echo   docker not found (optional)
)

if not exist package.json (
  echo ERROR: package.json not found!
  pause
  goto :eof
)

echo Found package.json - Starting server...

if not exist .env.local (
  if exist env.local.example (
    echo Creating .env.local from env.local.example ...
    copy /y env.local.example .env.local >nul
  ) else (
    echo WARNING: .env.local missing and no example file found.
  )
)

echo Pre-start checks...
echo -------------------------------------------
if not exist node_modules (
  echo node_modules missing. Running npm install...
  call npm install
)

if exist prisma\schema.prisma (
  echo Generating Prisma client...
  call npx prisma generate
  echo Applying database migrations - deploy
  call npx prisma migrate deploy
  if errorlevel 1 (
    echo migrate deploy failed, attempting prisma db push
    call npx prisma db push
  )
  if exist prisma\seed.cjs (
    echo Seeding database - safe run
    node prisma\seed.cjs
  )
)

REM Skipping Docker compose auto-start during dev to avoid intermittent batch parsing errors
REM If you need the database, run `npm run db:up` manually in a separate shell

if exist .next (
  echo Cleaning .next cache to ensure a fresh build...
  rmdir /s /q .next
)

if exist node_modules\.cache (
  echo Cleaning node_modules cache (SWC/webpack) to prevent runtime corruption...
  rmdir /s /q node_modules\.cache
)

echo -------------------------------------------

set PORT=3002
for /f "tokens=*" %%A in ('netstat -ano ^| findstr /c:":3002" ^| findstr LISTENING') do set PORT=3003
if "%PORT%"=="3003" (
  echo Port 3002 is in use. Using port 3003 instead.
)

echo Running quick audit/outdated checks (non-blocking)...
call npm audit --omit=dev >nul 2>nul
call npm outdated >nul 2>nul

set "TITLE=Berlin Luxe Rentals Server"
echo Starting server in new window on port %PORT% ...
start "%TITLE%" powershell -NoExit -Command "cd \"%PROJECT_DIR%\"; Write-Host 'Berlin Luxe Rentals Server' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:%PORT%' -ForegroundColor Green; npm run dev -- --port %PORT%"

echo Probing health endpoint...
powershell -NoProfile -Command "Start-Sleep -Seconds 2; try { (Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5).StatusCode } catch { 'ERR' }" >nul 2>nul
echo Access your site at: http://localhost:%PORT%
pause
endlocal

goto :eof

:existing
echo Detected running server on port %EXISTING_PORT%.
echo Access your site at: http://localhost:%EXISTING_PORT%
start "" "http://localhost:%EXISTING_PORT%"
pause
endlocal

:restore
echo Restore requested: locating latest backup zip...
set "ZIPPATH="
for /f "usebackq delims=" %%Z in (`powershell -NoProfile -Command "Get-ChildItem -Path \"%PROJECT_DIR%\backups\" -Filter 'site-*.zip' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName"`) do set "ZIPPATH=%%Z"
if not defined ZIPPATH (
  echo No backup zip found in backups\site-*.zip
  pause
  goto :eof
)
echo Using backup: %ZIPPATH%
set "TMPRESTORE=%PROJECT_DIR%\backups\_restore_tmp"
if exist "%TMPRESTORE%" rmdir /s /q "%TMPRESTORE%"
powershell -NoProfile -Command "Expand-Archive -Path \"%ZIPPATH%\" -DestinationPath \"%TMPRESTORE%\" -Force" 1>nul 2>nul
if errorlevel 1 (
  echo Failed to expand archive.
  pause
  goto :eof
)
echo Restoring files from backup (non-destructive)...
echo Skipping node_modules, .next, .git, backups, and start scripts
robocopy "%TMPRESTORE%" "%PROJECT_DIR%" /E /XD node_modules .next .git backups /XF start-server.bat start-server-desktop.bat start-prod.bat /NFL /NDL /NJH /NJS 1>nul 2>nul
rmdir /s /q "%TMPRESTORE%"
echo Restore complete. You can now run start-server.bat normally.
pause
goto :eof




