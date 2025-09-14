# Berlin Luxe Rentals - Server Startup Script
# This script starts the Next.js development server on port 3002

# Get the directory where this script is located
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Berlin Luxe Rentals Server..." -ForegroundColor Green
Write-Host "📁 Project Directory: $PROJECT_DIR" -ForegroundColor Yellow

# Navigate to project directory (where this script is located)
Set-Location $PROJECT_DIR

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ Found package.json - Starting server..." -ForegroundColor Green
    
    # Start server in a new PowerShell window that stays open
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_DIR'; Write-Host 'Berlin Luxe Rentals Server' -ForegroundColor Cyan; Write-Host 'Starting on port 3002...' -ForegroundColor Yellow; npm run dev -- --port 3002"
    
    Write-Host "✅ Server started in new window on port 3002" -ForegroundColor Green
    Write-Host "🌐 Access your site at: http://localhost:3002" -ForegroundColor Cyan
    Write-Host "📝 Server will run in the separate PowerShell window" -ForegroundColor Yellow
} else {
    Write-Host "❌ package.json not found! Make sure this script is in the berlinluxerentals directory." -ForegroundColor Red
    Write-Host "Current directory: $PROJECT_DIR" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




