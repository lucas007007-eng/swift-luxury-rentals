param(
  [Parameter(Mandatory = $true)]
  [string]$Message
)

Write-Host "[git] add -A" -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) { Write-Error "git add failed"; exit 1 }

Write-Host "[git] commit -m \"$Message\"" -ForegroundColor Cyan
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) { Write-Error "git commit failed"; exit 1 }

Write-Host "[git] branch -f staging" -ForegroundColor Cyan
git branch -f staging
if ($LASTEXITCODE -ne 0) { Write-Error "git branch failed"; exit 1 }

Write-Host "[git] status" -ForegroundColor Cyan
git status

Write-Host "✅ Completed." -ForegroundColor Green


