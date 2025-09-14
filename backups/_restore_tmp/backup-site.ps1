$ErrorActionPreference = 'Stop'

try {
    # Resolve project root to the script directory
    $root = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $root

    # Prepare backups directory and timestamped temp folder
    $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupRoot = Join-Path $root 'backups'
    if (-not (Test-Path $backupRoot)) { New-Item -ItemType Directory -Path $backupRoot | Out-Null }

    $staging = Join-Path $backupRoot ("site-$ts")
    New-Item -ItemType Directory -Path $staging | Out-Null

    # Mirror project into staging, excluding heavy/build dirs
    robocopy $root $staging /MIR /XD node_modules .next .git backups /XF backup-*.zip 1>$null 2>$null

    # Create zip from staging
    $zipPath = Join-Path $backupRoot ("site-$ts.zip")
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $zipPath)

    # Clean staging
    Remove-Item $staging -Recurse -Force

    Write-Host "Backup created: $zipPath"
    exit 0
}
catch {
    Write-Error $_
    exit 1
}




