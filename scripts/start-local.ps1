$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $Command $($Arguments -join ' ')"
  }
}

Write-Host "Starting AI Omnichannel Chat Rooms local stack..." -ForegroundColor Cyan
Write-Host "Stopping old local Node processes first..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "stop-local.ps1")

Invoke-Step npm run local:infra
Invoke-Step npm run prisma:generate
Invoke-Step npm run db:push:docker
Invoke-Step npm run db:seed
Invoke-Step npm run build

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$nextBin = Join-Path $root "node_modules\next\dist\bin\next"

Write-Host "Starting API on http://localhost:4000" -ForegroundColor Green
$api = Start-Process -FilePath node -ArgumentList @("apps/api/dist/main.js") -WorkingDirectory $root -WindowStyle Hidden -PassThru

Write-Host "Starting worker" -ForegroundColor Green
$worker = Start-Process -FilePath node -ArgumentList @("apps/worker/dist/main.js") -WorkingDirectory $root -WindowStyle Hidden -PassThru

Write-Host "Starting web dashboard on http://localhost:3012" -ForegroundColor Green
$web = Start-Process -FilePath node -ArgumentList @($nextBin, "start", "--port", "3012") -WorkingDirectory (Join-Path $root "apps/web") -WindowStyle Hidden -PassThru

@"
Local stack started.

Web:    http://localhost:3012  PID $($web.Id)
API:    http://localhost:4000  PID $($api.Id)
Worker: PID $($worker.Id)

To stop these Node processes, run:
  npm run local:stop
"@
