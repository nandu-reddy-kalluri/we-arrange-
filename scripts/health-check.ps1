<#
.SYNOPSIS
  Checks HTTP readiness and health across all five YMWA applications.
#>

$apps = @(
  @{ Name = "Web (Public Portal)";      Port = 3000; Url = "http://localhost:3000/" },
  @{ Name = "Customer Dashboard";       Port = 3001; Url = "http://localhost:3001/" },
  @{ Name = "Vendor Dashboard";         Port = 3002; Url = "http://localhost:3002/" },
  @{ Name = "Admin Governance";         Port = 3003; Url = "http://localhost:3003/" },
  @{ Name = "Concierge Operations";     Port = 3004; Url = "http://localhost:3004/" }
)

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " YMWA 5-App Health Verification" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

$results = @()

foreach ($app in $apps) {
  $url = $app.Url
  $port = $app.Port
  $name = $app.Name
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  
  try {
    # Check TCP port first
    $tcp = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
    
    if (-not $tcp.TcpTestSucceeded) {
      $results += [PSCustomObject]@{
        App = $name
        Port = $port
        Status = "OFFLINE"
        HttpCode = "---"
        Latency = "---"
      }
      continue
    }

    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Timeout = 5000
    $req.AllowAutoRedirect = $false
    $response = $req.GetResponse()
    $sw.Stop()
    $statusCode = [int]$response.StatusCode
    $response.Close()

    $results += [PSCustomObject]@{
      App = $name
      Port = $port
      Status = if ($statusCode -lt 400) { "READY" } else { "ERROR" }
      HttpCode = $statusCode
      Latency = "$($sw.ElapsedMilliseconds)ms"
    }
  } catch [System.Net.WebException] {
    $sw.Stop()
    $webEx = $_.Exception
    if ($webEx.Response) {
      $statusCode = [int]$webEx.Response.StatusCode
      $webEx.Response.Close()
      $results += [PSCustomObject]@{
        App = $name
        Port = $port
        Status = if ($statusCode -ge 300 -and $statusCode -lt 400) { "REDIRECT" } else { "HTTP_ERR" }
        HttpCode = $statusCode
        Latency = "$($sw.ElapsedMilliseconds)ms"
      }
    } else {
      $results += [PSCustomObject]@{
        App = $name
        Port = $port
        Status = "CONN_REFUSED"
        HttpCode = "---"
        Latency = "$($sw.ElapsedMilliseconds)ms"
      }
    }
  } catch {
    $sw.Stop()
    $results += [PSCustomObject]@{
      App = $name
      Port = $port
      Status = "ERROR"
      HttpCode = "---"
      Latency = "---"
    }
  }
}

$results | Format-Table -AutoSize
