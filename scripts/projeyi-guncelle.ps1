[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()
$ErrorActionPreference = "Stop"
Write-Host "Proje guncelleniyor..." -ForegroundColor Cyan

$baseBranch = "main"
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -ne $baseBranch) {
    git checkout $baseBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "'$baseBranch' dalina gecis yapilamadi." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

git pull --ff-only origin $baseBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "Proje basariyla guncellendi." -ForegroundColor Green
} else {
    Write-Host "Guncelleme sirasinda hata olustu. Git durumunu kontrol edin." -ForegroundColor Red
    exit $LASTEXITCODE
}
