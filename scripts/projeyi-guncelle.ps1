[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()
$ErrorActionPreference = "Stop"
Write-Host "Proje guncelleniyor..." -ForegroundColor Cyan

Set-Location (Split-Path -Parent $PSScriptRoot)

git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Proje basariyla guncellendi." -ForegroundColor Green
} else {
    Write-Host "Guncelleme sirasinda hata olustu. Git durumunu kontrol edin." -ForegroundColor Red
    exit $LASTEXITCODE
}
