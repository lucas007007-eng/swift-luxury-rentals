param(
  [string]$message = "update"
)

# Sanitize commit message for PowerShell safety per memory rules
$safe = $message
$safe = $safe -replace '[:"'']', ''
$safe = $safe -replace '[\(\)&\|<>]', ''
if ($safe.Length -gt 50) { $safe = $safe.Substring(0,50) }

git status | cat
git add -A
git commit -m $safe
git push

