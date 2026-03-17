param(
  [Parameter(Mandatory = $true)]
  [string]$Message
)

$ErrorActionPreference = "Stop"
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -in @("main", "dev")) {
  Write-Host "Review sonrasi guncelleme bir ozellik dalinda yapilmalidir." -ForegroundColor Red
  Write-Host "Once ilgili gorev dalina gecin." -ForegroundColor Yellow
  exit 1
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "degisiklikleri-gonder.ps1") -Message $Message -Branch $currentBranch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Ayni pull request uzerinden guncelleme gonderildi." -ForegroundColor Green
