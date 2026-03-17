param(
  [Parameter(Mandatory = $true)]
  [string]$CommitMessageFile
)

$ErrorActionPreference = "Stop"
$message = Get-Content $CommitMessageFile -Raw
$message = $message.Trim()
$pattern = '^(feat|fix|docs|chore|ci|test|refactor|style|perf|build): .+'

if ($message -notmatch $pattern) {
  Write-Host ""
  Write-Host "Commit mesaji beklenen formata uymuyor." -ForegroundColor Red
  Write-Host "Kullanim: feat|fix|docs|chore|ci|test|refactor|style|perf|build: aciklama" -ForegroundColor Yellow
  exit 1
}
