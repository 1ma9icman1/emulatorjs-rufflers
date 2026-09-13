# start-romm.ps1
# Starts RomM and its database services with RetroArch integration

$baseDir = "C:\ai\nes"
Set-Location $baseDir

Write-Host "=== Starting RomM + RetroArch Station ===" -ForegroundColor Cyan

# Run library preparation if needed
if (-not (Test-Path "$baseDir\library\roms\nes")) {
    Write-Host "Preparing library structure..." -ForegroundColor Yellow
    powershell -ExecutionPolicy Bypass -File "$baseDir\scripts\prepare-library.ps1"
}

# Check docker availability
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker daemon is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Docker containers..." -ForegroundColor Green
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker Compose could not start RomM." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  RomM is launching at: http://localhost:8080    " -ForegroundColor Green
Write-Host "  NES ROMs, SNES ROMs, Box Art & RetroArch Cores " -ForegroundColor Green
Write-Host "  are connected and ready!                       " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
