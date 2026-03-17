[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
  [Parameter(Mandatory = $true)]
  [string]$Message,
  [string]$Branch
)

$ErrorActionPreference = "Stop"
$commitPattern = '^(feat|fix|docs|chore|ci|test|refactor|style|perf|build): .+'

$currentBranch = git rev-parse --abbrev-ref HEAD
if (-not $Branch) {
  $Branch = $currentBranch
}

if ($Branch -in @("main", "dev")) {
  Write-Host "'$Branch' dalinda dogrudan commit ve push yapilamaz." -ForegroundColor Red
  Write-Host "Once .\\scripts\\goreve-basla.ps1 ile bir ozellik dali olusturun." -ForegroundColor Yellow
  exit 1
}

if ($Message -notmatch $commitPattern) {
  Write-Host "Commit mesaji beklenen formata uymuyor." -ForegroundColor Red
  Write-Host "Ornekler: feat: login ekle, fix: hata duzelt, docs: rehber guncelle, ci: pipeline ekle, test: test yaz, refactor: kodu temizle" -ForegroundColor Yellow
  exit 1
}

$status = git status --short
if (-not $status) {
  Write-Host "Commitlenecek herhangi bir degisiklik bulunamadi." -ForegroundColor Yellow
  Write-Host "Once dosyalarda degisiklik yapin, sonra bu komutu tekrar calistirin." -ForegroundColor Yellow
  exit 0
}

git add -A
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$sensitiveFiles = git diff --cached --name-only | Where-Object { $_ -match '(\.env$|\.env\.(?!example$|sample$)|credentials|secrets|private_key)' }
if ($sensitiveFiles) {
  Write-Host ""
  Write-Host "UYARI: Hassas dosya commit etmeye calisiyorsunuz:" -ForegroundColor Red
  $sensitiveFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  Write-Host "Bu dosyalari .gitignore'a ekleyin ve tekrar deneyin." -ForegroundColor Yellow
  git reset HEAD
  exit 1
}

$hasStagedChanges = git diff --cached --name-only
if (-not $hasStagedChanges) {
  Write-Host "git add sonrasi stage edilmis degisiklik bulunamadi." -ForegroundColor Yellow
  Write-Host "Dosyalarin gercekten degistiginden emin olun." -ForegroundColor Yellow
  exit 0
}

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

git push -u origin $Branch
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Degisiklikler '$Branch' dalina basariyla push edildi." -ForegroundColor Green
Write-Host 'Sonraki adim: .\scripts\pr-olustur.ps1 -Title "Kisa PR basligi"' -ForegroundColor Cyan
