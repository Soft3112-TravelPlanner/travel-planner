$ErrorActionPreference = "Stop"

$requiredCommands = @(
  @{ Name = "git"; Install = "Git for Windows kurun: https://git-scm.com/download/win" },
  @{ Name = "gh"; Install = "GitHub CLI kurun: https://cli.github.com/" }
)

$missing = @()
foreach ($command in $requiredCommands) {
  if (-not (Get-Command $command.Name -ErrorAction SilentlyContinue)) {
    $missing += $command
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Bazi gerekli araclar bulunamadi." -ForegroundColor Red
  foreach ($item in $missing) {
    Write-Host "- Eksik: $($item.Name)" -ForegroundColor Red
    Write-Host "  Kurulum: $($item.Install)" -ForegroundColor Yellow
  }
  exit 1
}

Write-Host "Gerekli araclar bulundu: git ve GitHub CLI hazir." -ForegroundColor Green
