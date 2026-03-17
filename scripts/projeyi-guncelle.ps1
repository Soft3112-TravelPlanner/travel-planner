[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()
$ErrorActionPreference = "Stop"
Write-Host "Proje guncelleniyor..." -ForegroundColor Cyan

Set-Location (Split-Path -Parent $PSScriptRoot)

$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -ne "main") {
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Ana dala gecis yapilamadi. Git durumunu kontrol edin." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

git pull --ff-only origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Proje basariyla guncellendi." -ForegroundColor Green
} else {
    Write-Host "Guncelleme sirasinda hata olustu. Git durumunu kontrol edin." -ForegroundColor Red
    exit $LASTEXITCODE
}
