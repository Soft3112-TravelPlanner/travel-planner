[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
  [Parameter(Mandatory = $true)]
  [string]$BranchName,
  [string]$BaseBranch = "main"
)

$ErrorActionPreference = "Stop"

if ($BranchName -match "\s") {
  Write-Host "Dal adinda bosluk olamaz." -ForegroundColor Red
  Write-Host "Ornek: benim-dalim" -ForegroundColor Yellow
  exit 1
}

if ($BranchName -in @("main", "dev")) {
  Write-Host "'$BranchName' yerine bir ozellik dali adi secin." -ForegroundColor Red
  Write-Host "Ornek: benim-dalim" -ForegroundColor Yellow
  exit 1
}

git fetch origin
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git checkout $BaseBranch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git pull --ff-only origin $BaseBranch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$existingBranch = git branch --list $BranchName
if ($existingBranch) {
  Write-Host "'$BranchName' dali zaten mevcut." -ForegroundColor Red
  Write-Host "Baska bir dal adi secin veya mevcut dala gecin." -ForegroundColor Yellow
  exit 1
}

git checkout -b $BranchName
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "'$BranchName' dali hazir." -ForegroundColor Green
Write-Host "Simdi kodunuzu yazin." -ForegroundColor Cyan
Write-Host 'Bitince su komutu calistirin: .\scripts\degisiklikleri-gonder.ps1 -Message "feat: yaptigim degisiklik"' -ForegroundColor Yellow
