[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()

$ErrorActionPreference = "Stop"
$repoRoot = git rev-parse --show-toplevel
$currentBranch = git rev-parse --abbrev-ref HEAD
$branchTypes = @('feature', 'fix', 'docs', 'chore', 'ci', 'test', 'refactor', 'style')
$branchPattern = '^(' + ($branchTypes -join '|') + ')\/[a-z0-9]+(?:-[a-z0-9]+)*$'

if (-not $repoRoot) {
  Write-Error "Depo kok dizini belirlenemedi."
}

if ($currentBranch -in @("main", "dev")) {
  Write-Host ""
  Write-Host "Bu depoda '$currentBranch' dalina dogrudan push atilamaz." -ForegroundColor Red
  Write-Host "Bunun yerine bir ozellik dali acip pull request olusturun." -ForegroundColor Yellow
  exit 1
}

if ($currentBranch -notmatch $branchPattern) {
  Write-Host ""
  Write-Host "Dal adi beklenen formata uymuyor." -ForegroundColor Red
  Write-Host "Ornek: feature/login-page, fix/menu-bug, ci/pipeline, test/login-test, refactor/auth-module" -ForegroundColor Yellow
  exit 1
}

& powershell -ExecutionPolicy Bypass -File (Join-Path (Join-Path $repoRoot "scripts") "depoyu-dogrula.ps1")
exit $LASTEXITCODE
