$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$requiredFiles = @(
  ".github/workflows/build.yml",
  "sonar-project.properties",
  ".githooks/pre-push",
  ".githooks/commit-msg",
  "scripts/push-oncesi-kontrol.ps1",
  "scripts/commit-mesaji-kontrol.ps1",
  "CONTRIBUTING.md"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
  $fullPath = Join-Path $repoRoot $file
  if (-not (Test-Path $fullPath)) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Host ""
  Write-Host "Depo dogrulamasi basarisiz oldu." -ForegroundColor Red
  Write-Host "Eksik dosyalar:" -ForegroundColor Red
  foreach ($file in $missingFiles) {
    Write-Host " - $file" -ForegroundColor Red
  }
  exit 1
}

$workflowPath = Join-Path $repoRoot ".github/workflows/build.yml"
$workflowContent = Get-Content $workflowPath -Raw
if ($workflowContent -notmatch "SONAR_TOKEN") {
  Write-Host ""
  Write-Host "Depo dogrulamasi basarisiz oldu." -ForegroundColor Red
  Write-Host "SonarCloud workflow dosyasi SONAR_TOKEN degiskenine referans vermiyor." -ForegroundColor Red
  exit 1
}

$prTemplatePath = Join-Path $repoRoot ".github/PULL_REQUEST_TEMPLATE.md"
if (-not (Test-Path $prTemplatePath)) {
  Write-Host ""
  Write-Host "Depo dogrulamasi basarisiz oldu." -ForegroundColor Red
  Write-Host "Pull request template dosyasi bulunamadi." -ForegroundColor Red
  exit 1
}

Write-Host "Depo dogrulamasi basariyla tamamlandi." -ForegroundColor Green
