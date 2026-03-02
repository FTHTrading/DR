<#
.SYNOPSIS
  DICS Pipeline Manager — start, stop, status, logs for the intelligence pipeline.

.DESCRIPTION
  Wraps docker compose for the Neon-connected collector + extractor.
  Usage:
    .\pipeline.ps1 up       # Build + start collector & extractor (detached)
    .\pipeline.ps1 down     # Stop all services
    .\pipeline.ps1 status   # Show running containers
    .\pipeline.ps1 logs     # Tail live logs
    .\pipeline.ps1 restart  # Restart both services
    .\pipeline.ps1 rebuild  # Force rebuild images + restart
    .\pipeline.ps1 check    # Query Neon for table counts + extraction status
#>

param(
  [Parameter(Position = 0)]
  [ValidateSet("up", "down", "status", "logs", "restart", "rebuild", "check")]
  [string]$Action = "status"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$root\docker-compose.yml")) { $root = $PSScriptRoot }

Push-Location $root

switch ($Action) {
  "up" {
    Write-Host ">> Starting DICS pipeline (Neon mode)..." -ForegroundColor Cyan
    docker compose --profile neon up -d --build
    Write-Host "`n>> Pipeline running. Use '.\pipeline.ps1 logs' to watch." -ForegroundColor Green
  }
  "down" {
    Write-Host ">> Stopping DICS pipeline..." -ForegroundColor Yellow
    docker compose --profile neon down
    Write-Host ">> Stopped." -ForegroundColor Green
  }
  "status" {
    Write-Host ">> DICS Container Status:" -ForegroundColor Cyan
    docker compose --profile neon ps -a
  }
  "logs" {
    Write-Host ">> Tailing logs (Ctrl+C to stop)..." -ForegroundColor Cyan
    docker compose --profile neon logs -f --tail 50
  }
  "restart" {
    Write-Host ">> Restarting DICS pipeline..." -ForegroundColor Yellow
    docker compose --profile neon restart
    Write-Host ">> Restarted." -ForegroundColor Green
  }
  "rebuild" {
    Write-Host ">> Rebuilding + restarting DICS pipeline..." -ForegroundColor Yellow
    docker compose --profile neon up -d --build --force-recreate
    Write-Host ">> Rebuilt and running." -ForegroundColor Green
  }
  "check" {
    Write-Host ">> Querying Neon database..." -ForegroundColor Cyan
    Push-Location "$root\shared\db"
    node _check.js
    Write-Host ""
    node _status.js
    Pop-Location
  }
}

Pop-Location
