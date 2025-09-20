param(
  [string]$message = "update",
  [string[]]$commands
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Sanitize-Message([string]$msg) {
  $s = $msg
  # Remove risky/special characters per memory rules
  $s = $s -replace '[:"'']', ''
  $s = $s -replace '[\(\)&\|<>;]', ''
  if ($s.Length -gt 50) { $s = $s.Substring(0,50) }
  if ([string]::IsNullOrWhiteSpace($s)) { $s = 'update' }
  return $s
}

function Invoke-SafeCommand([string]$cmd) {
  if ([string]::IsNullOrWhiteSpace($cmd)) { return }
  # Split on && and run sequentially (PowerShell-safe)
  $parts = $cmd -split '&&'
  foreach ($p in $parts) {
    $line = $p.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    # Avoid pagers: append | cat for git log
    if ($line -match '^(?i)git\s+log\b') { $line = "$line | cat" }
    Write-Host "$ $line" -ForegroundColor Cyan
    try {
      Invoke-Expression $line
    } catch {
      Write-Warning "Command failed: $line"
      Write-Host "Tip: Run 'git status | cat' to inspect state and retry with simpler command." -ForegroundColor Yellow
    }
  }
}

function Invoke-SafeCommands([string[]]$cmds) {
  foreach ($c in $cmds) { Invoke-SafeCommand $c }
}

if ($commands -and $commands.Count -gt 0) {
  # Generic safe runner mode
  Invoke-SafeCommands $commands
  exit 0
}

# Default: safe git commit flow
$safe = Sanitize-Message $message
try {
  git status | cat
  git add -A
  git commit -m $safe
  git push
} catch {
  Write-Warning "Safe commit encountered an error. Showing git status:"
  git status | cat
  throw
}

