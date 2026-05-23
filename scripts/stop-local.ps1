$ErrorActionPreference = "SilentlyContinue"

$processIds = New-Object System.Collections.Generic.List[int]
$lines = netstat -ano

foreach ($line in $lines) {
  foreach ($port in @(3012, 4000)) {
    if ($line -match "^\s*TCP\s+\S+:$port\s+\S+\s+LISTENING\s+(\d+)\s*$") {
      $processIds.Add([int]$Matches[1])
    }
  }

  foreach ($servicePort in @(55432, 56379)) {
    if ($line -match "^\s*TCP\s+\S+\s+\S+:$servicePort\s+ESTABLISHED\s+(\d+)\s*$") {
      $processIds.Add([int]$Matches[1])
    }
  }
}

$uniqueProcessIds = $processIds | Sort-Object -Unique | Where-Object { $_ -gt 0 }

foreach ($processId in $uniqueProcessIds) {
  Stop-Process -Id $processId -Force
  Write-Host "Stopped PID $processId"
}

if (($uniqueProcessIds | Measure-Object).Count -eq 0) {
  Write-Host "No local API/Web/Worker process found."
}
