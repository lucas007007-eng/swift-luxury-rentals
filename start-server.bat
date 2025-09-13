@echo off
echo.
echo ====================================
echo  Berlin Luxe Rentals - Server Start
echo ====================================
echo.

:: Get the directory where this batch file is located
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo 📁 Project Directory: %PROJECT_DIR%
echo.

:: Navigate to the project directory (where this script is located)
cd /d "%PROJECT_DIR%"

if exist package.json (
    echo ✅ Found package.json - Starting server...
    echo.
    echo 🚀 Starting server in new window on port 3002...
    start "Berlin Luxe Rentals Server" powershell -NoExit -Command "cd '%PROJECT_DIR%'; Write-Host 'Berlin Luxe Rentals Server' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:3002' -ForegroundColor Green; npm run dev -- --port 3002"
    echo.
    echo ✅ Server started successfully!
    echo 🌐 Access your site at: http://localhost:3002
    echo 📝 Server is running in the separate window
    echo.
    echo 🔁 Restore point: See backups folder for latest zip (e.g., site-20250913-020344.zip)
    echo      To restore, unzip into project root and overwrite files.
) else (
    echo ❌ package.json not found!
    echo Make sure this script is in the berlinluxerentals directory
    echo Current directory: %PROJECT_DIR%
)

echo.
pause




