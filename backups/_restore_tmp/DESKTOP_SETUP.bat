@echo off
echo.
echo ========================================
echo  Berlin Luxe Rentals - Desktop Setup
echo ========================================
echo.

:: Get the current directory (where this script is located)
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo 📁 Project Directory: %PROJECT_DIR%
echo.

:: Check if Node.js is installed
echo ⚡ Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download and install the LTS version
    echo 3. Restart this script after installation
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found:
    node --version
)

:: Check if npm is available
echo.
echo ⚡ Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    echo ✅ npm found:
    npm --version
)

echo.
echo 📦 Installing dependencies...
echo This may take a few minutes...
echo.

:: Install dependencies
npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ npm install failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

:: Create desktop-specific start script
echo 🔧 Creating desktop start script...

echo @echo off > "%PROJECT_DIR%\start-server-desktop.bat"
echo echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo echo ==================================== >> "%PROJECT_DIR%\start-server-desktop.bat"
echo echo  Berlin Luxe Rentals - Server Start >> "%PROJECT_DIR%\start-server-desktop.bat"
echo echo ==================================== >> "%PROJECT_DIR%\start-server-desktop.bat"
echo echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo cd /d "%PROJECT_DIR%" >> "%PROJECT_DIR%\start-server-desktop.bat"
echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo if exist package.json ^( >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo ✅ Found package.json - Starting server... >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo 🚀 Starting server in new window on port 3002... >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     start "Berlin Luxe Rentals Server" powershell -NoExit -Command "cd '%PROJECT_DIR%'; Write-Host 'Berlin Luxe Rentals Server' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:3002' -ForegroundColor Green; npm run dev -- --port 3002" >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo ✅ Server started successfully! >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo 🌐 Access your site at: http://localhost:3002 >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo 📝 Server is running in the separate window >> "%PROJECT_DIR%\start-server-desktop.bat"
echo ^) else ^( >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo ❌ package.json not found! >> "%PROJECT_DIR%\start-server-desktop.bat"
echo     echo Make sure you're in the correct directory >> "%PROJECT_DIR%\start-server-desktop.bat"
echo ^) >> "%PROJECT_DIR%\start-server-desktop.bat"
echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo echo. >> "%PROJECT_DIR%\start-server-desktop.bat"
echo pause >> "%PROJECT_DIR%\start-server-desktop.bat"

echo ✅ Desktop start script created: start-server-desktop.bat
echo.

echo 🧪 Testing server startup...
echo.

:: Test the installation
npm run dev -- --port 3002 --help >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Server test failed, but dependencies are installed.
    echo You can still try running the server manually.
) else (
    echo ✅ Server test passed!
)

echo.
echo ========================================
echo  🎉 SETUP COMPLETE! 
echo ========================================
echo.
echo Next steps:
echo 1. Double-click 'start-server-desktop.bat' to start the server
echo 2. Open http://localhost:3002 in your browser
echo 3. Open this folder in Cursor AI to start coding
echo.
echo Files created:
echo - start-server-desktop.bat (server launcher)
echo - node_modules/ (dependencies)
echo.
pause

