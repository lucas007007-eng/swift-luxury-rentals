@echo off
setlocal

echo.
echo ====================================
echo  Berlin Luxe Rentals - Desktop Launcher

echo ====================================

REM Attempt to locate project directory relative to this script
set "HERE=%~dp0"

REM Common locations to probe
set "CANDIDATE1=%HERE%berlinluxerentals"
set "CANDIDATE2=%HERE%..\berlinluxerentals"
set "CANDIDATE3=%USERPROFILE%\Desktop\berlinluxerentals\berlinluxerentals"
set "CANDIDATE4=%USERPROFILE%\berlinluxerentals\berlinluxerentals"

set "PROJECT_DIR="
if exist "%CANDIDATE1%\package.json" set "PROJECT_DIR=%CANDIDATE1%"
if "%PROJECT_DIR%"=="" if exist "%CANDIDATE2%\package.json" set "PROJECT_DIR=%CANDIDATE2%"
if "%PROJECT_DIR%"=="" if exist "%CANDIDATE3%\package.json" set "PROJECT_DIR=%CANDIDATE3%"
if "%PROJECT_DIR%"=="" if exist "%CANDIDATE4%\package.json" set "PROJECT_DIR=%CANDIDATE4%"

if "%PROJECT_DIR%"=="" (
  echo ERROR: Could not locate the berlinluxerentals project directory.
  echo Please open this launcher inside the project folder or edit this file to set PROJECT_DIR.
  pause
  goto :eof
)

echo Project Directory: %PROJECT_DIR%

pushd "%PROJECT_DIR%"
if exist start-server.bat (
  call start-server.bat
) else (
  echo start-server.bat not found in project. Running fallback: npm run dev on port 3003
  start "Berlin Luxe Rentals Server" powershell -NoExit -Command "cd \"%PROJECT_DIR%\"; npm run dev -- --port 3003"
)
popd

endlocal
