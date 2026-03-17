[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
  [string]$BaseBranch = "main"
)

$ErrorActionPreference = "Stop"
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -in @("main", "dev")) {
  Write-Host "Su anda zaten korumali bir daldasiniz." -ForegroundColor Yellow
  Write-Host "Temizlik icin merge edilmis gorev dalinda olun." -ForegroundColor Yellow
  exit 1
}

git checkout $BaseBranch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git pull origin $BaseBranch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git branch -D $currentBranch
if ($LASTEXITCODE -ne 0) {
  Write-Host "Yerel dal silinemedi. Muhtemelen merge edilmedi veya ek degisiklik var." -ForegroundColor Yellow
  Write-Host "Durumu kontrol edip tekrar deneyin." -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "'$currentBranch' yerel dali temizlendi." -ForegroundColor Green
Write-Host "Artik guncel '$BaseBranch' dalindasiniz." -ForegroundColor Green
Write-Host "Yeni goreve baslamak icin .\\scripts\\goreve-basla.ps1 komutunu kullanin." -ForegroundColor Cyan
