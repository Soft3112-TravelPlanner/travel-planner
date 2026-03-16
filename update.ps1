Write-Host "Proje güncelleniyor" -ForegroundColor Cyan

Set-Location $PSScriptRoot

git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Proje başarıyla güncellendi." -ForegroundColor Green
} else {
    Write-Host "Güncelleme sırasında hata oluştu. Git durumunu kontrol edin." -ForegroundColor Red
}

Read-Host "Çıkmak için ENTER'a basın"