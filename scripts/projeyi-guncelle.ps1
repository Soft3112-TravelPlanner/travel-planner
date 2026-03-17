[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()
$ErrorActionPreference = "Stop"
$BaseBranch = "main"

Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Proje guncelleniyor..." -ForegroundColor Cyan

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "Mevcut git dali belirlenemedi. Git durumunu kontrol edin." -ForegroundColor Red
    exit 1
}

if ($currentBranch -ne $BaseBranch) {
    Write-Host "Su anda '$currentBranch' dalındasiniz. '$BaseBranch' dalina geciliyor..." -ForegroundColor Yellow
    git checkout $BaseBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "'$BaseBranch' dalina gecilemedi. Git durumunu kontrol edin." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

git pull --ff-only origin $BaseBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "Proje basariyla guncellendi." -ForegroundColor Green
} else {
    Write-Host "Guncelleme sirasinda hata olustu. Git durumunu kontrol edin." -ForegroundColor Red
    exit $LASTEXITCODE
}
