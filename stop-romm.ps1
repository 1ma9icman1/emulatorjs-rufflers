# stop-romm.ps1
Set-Location "C:\ai\nes"
Write-Host "Stopping RomM services..." -ForegroundColor Yellow
docker compose down
Write-Host "Services stopped." -ForegroundColor Green
