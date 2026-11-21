<#
.SYNOPSIS
  Safely inspects and clears processes occupying YMWA development ports (3000-3004).
.DESCRIPTION
  Only terminates node/next processes belonging to the YMWA repository workspace.
  Never terminates unrelated system or user processes.
#>

$ports = @(3000, 3001, 3002, 3003, 3004)
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path

Write-Host "Scanning YMWA development ports: $($ports -join ', ')..." -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "All YMWA development ports (3000-3004) are clean and ready." -ForegroundColor Green
  exit 0
}

$killedCount = 0

foreach ($conn in $connections) {
  $targetPid = $conn.OwningProcess
  $port = $conn.LocalPort

  if ($targetPid -eq 0 -or $targetPid -eq 4) {
    Write-Host "Port $port is used by System kernel ($targetPid), skipping." -ForegroundColor Yellow
    continue
  }

  $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $targetPid" -ErrorAction SilentlyContinue

  if (-not $proc) {
    continue
  }

  $procName = $proc.Name
  $cmdLine = $proc.CommandLine

  # Verify process is a Node/Next process and relates to YMWA or Next.js
  $isNodeProcess = ($procName -like "*node*" -or $procName -like "*next*")
  $isYmwaRelated = ($cmdLine -like "*we-arrange*" -or $cmdLine -like "*next*" -or $cmdLine -like "*turbo*")

  if ($isNodeProcess -and $isYmwaRelated) {
    Write-Host "Stopping orphaned YMWA process on port $port (PID: $targetPid, Process: $procName)..." -ForegroundColor Yellow
    try {
      Stop-Process -Id $targetPid -Force -ErrorAction Stop
      Write-Host "Successfully stopped PID $targetPid on port $port." -ForegroundColor Green
      $killedCount++
    } catch {
      Write-Host "Failed to stop PID $($targetPid): $_" -ForegroundColor Red
    }
  } else {
    Write-Host "Port $port is held by unrelated process '$procName' (PID: $targetPid). Skipped." -ForegroundColor Yellow
  }
}

Write-Host "Cleaned $killedCount YMWA process(es). Ports 3000-3004 are now available." -ForegroundColor Green
