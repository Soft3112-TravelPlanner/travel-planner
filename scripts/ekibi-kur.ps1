[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
  [string]$GitName,
  [string]$GitEmail
)

$ErrorActionPreference = "Stop"

Write-Host "Bu depo ekip kullanimi icin ayarlaniyor..." -ForegroundColor Cyan

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "araclari-kontrol-et.ps1")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git config core.hooksPath .githooks

if ($GitName) {
  git config user.name $GitName
}

if ($GitEmail) {
  git config user.email $GitEmail
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "depoyu-dogrula.ps1")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

cmd /c "gh auth status >nul 2>nul"
$ghLoggedIn = $LASTEXITCODE -eq 0

Write-Host ""
Write-Host "Kurulum tamamlandi." -ForegroundColor Green
Write-Host "Bu depo icin Git hook'lari aktif edildi." -ForegroundColor Green
if ($ghLoggedIn) {
  Write-Host "GitHub CLI girisi hazir. Pull request olusturabilirsiniz." -ForegroundColor Green
} else {
  Write-Host "GitHub CLI girisi bulunamadi." -ForegroundColor Yellow
  Write-Host "Simdi su komutu calistirin: gh auth login" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Gunun akisi:" -ForegroundColor Cyan
Write-Host '1. .\scripts\ekibi-kur.ps1 -GitName "Ad Soyad" -GitEmail "mail@example.com"' -ForegroundColor Yellow
Write-Host '2. .\scripts\goreve-basla.ps1 -BranchName "feature/gorev-adi"' -ForegroundColor Yellow
Write-Host '3. .\scripts\degisiklikleri-gonder.ps1 -Message "feat: yaptigim degisiklik"' -ForegroundColor Yellow
Write-Host '4. .\scripts\pr-olustur.ps1 -Title "Kisa PR basligi"' -ForegroundColor Yellow
