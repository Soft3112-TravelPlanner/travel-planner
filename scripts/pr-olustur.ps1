param(
  [Parameter(Mandatory = $true)]
  [string]$Title,
  [string]$Body,
  [string]$Base = "main",
  [string]$Head
)

$ErrorActionPreference = "Stop"
$titlePattern = '^(feat|fix|docs|chore|ci|test|refactor|style|perf|build): .+'

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  Write-Host "GitHub CLI kurulu degil." -ForegroundColor Red
  Write-Host "Simdi GitHub CLI kurun, sonra tekrar deneyin." -ForegroundColor Yellow
  exit 1
}

cmd /c "gh auth status >nul 2>nul"
$authOk = $LASTEXITCODE -eq 0
if (-not $authOk) {
  Write-Host "GitHub CLI girisi yapilmamis." -ForegroundColor Red
  Write-Host "Simdi su komutu calistirin: gh auth login" -ForegroundColor Yellow
  exit 1
}

if (-not $Head) {
  $Head = git rev-parse --abbrev-ref HEAD
}

if ($Head -in @("main", "dev")) {
  Write-Host "Pull request bir ozellik dali uzerinden olusturulmalidir." -ForegroundColor Red
  Write-Host "Once .\\scripts\\goreve-basla.ps1 ile yeni bir dal acin." -ForegroundColor Yellow
  exit 1
}

if ($Title -notmatch $titlePattern) {
  Write-Host "PR basligi beklenen formata uymuyor." -ForegroundColor Red
  Write-Host "Ornek: feat: login sayfasini ekle" -ForegroundColor Yellow
  exit 1
}

$bodyText = $Body
if (-not $bodyText) {
  $bodyText = @"
## Ozet
- Bu PR'da yaptigin degisikligi kisaca yaz.

## Test
- Neyi test ettigini yaz.

## Kontrol Listesi
- [ ] Kodumu kendi tarafimda kontrol ettim.
- [ ] Gerekiyorsa dokumani guncelledim.
- [ ] Reviewer icin gerekli notlari ekledim.

## Reviewer Notlari
- Buraya reviewer'in bilmesi gereken ek bilgileri yaz.
"@
}

& gh pr create --base $Base --head $Head --title $Title --body $bodyText
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "'$Head' dalindan '$Base' dalina pull request basariyla olusturuldu." -ForegroundColor Green
Write-Host "Review geldikten sonra duzeltme gerekiyorsa .\\scripts\\gorevi-guncelle.ps1 kullanin." -ForegroundColor Cyan
