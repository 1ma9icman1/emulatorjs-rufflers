# prepare-library.ps1
# Sets up RomM library directory hierarchy with junctions/symlinks

$baseDir = "C:\ai\nes"
$libDir = "$baseDir\library"

Write-Host "=== Setting up RomM Library Structure ===" -ForegroundColor Cyan

# Ensure target directories exist
$targetDirs = @(
    "$libDir\roms\nes",
    "$libDir\roms\snes",
    "$libDir\media\nes\box2d",
    "$libDir\media\nes\video",
    "$libDir\media\snes\box2d",
    "$libDir\media\snes\video"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# 1. Link NES ROMs
Write-Host "Linking NES ROMs..." -ForegroundColor Yellow
$nesSource = "$baseDir\ROMS"
if (Test-Path $nesSource) {
    $subDirs = Get-ChildItem -Path $nesSource -Directory
    foreach ($sub in $subDirs) {
        $destPath = "$libDir\roms\nes\$($sub.Name)"
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Junction -Path $destPath -Target $sub.FullName | Out-Null
        }
    }
    Write-Host "  NES ROM subdirectories linked successfully." -ForegroundColor Green
}

# 2. Link SNES ROMs
Write-Host "Linking SNES ROMs..." -ForegroundColor Yellow
$snesSource = "$baseDir\roms-snes"
if (Test-Path $snesSource) {
    $snesFiles = Get-ChildItem -Path $snesSource -File
    $count = 0
    foreach ($f in $snesFiles) {
        $destFile = "$libDir\roms\snes\$($f.Name)"
        if (-not (Test-Path $destFile)) {
            New-Item -ItemType HardLink -Path $destFile -Target $f.FullName | Out-Null
            $count++
        }
    }
    Write-Host "  Linked $count SNES ROM files." -ForegroundColor Green
}

# 3. Link NES Box Art
Write-Host "Linking NES Box Art..." -ForegroundColor Yellow
$nesArtSource = "$baseDir\NES Classic- Box Art\NES Classic - Accurate USA Box Art (742 covers)"
if (Test-Path $nesArtSource) {
    $artFiles = Get-ChildItem -Path $nesArtSource -File -Filter "*.png"
    $artCount = 0
    foreach ($f in $artFiles) {
        $destFile = "$libDir\media\nes\box2d\$($f.Name)"
        if (-not (Test-Path $destFile)) {
            New-Item -ItemType HardLink -Path $destFile -Target $f.FullName | Out-Null
            $artCount++
        }
    }
    Write-Host "  Linked $artCount NES box art covers." -ForegroundColor Green
}

# 4. Link SNES Box Art
Write-Host "Linking SNES Box Art..." -ForegroundColor Yellow
$snesArtSource = "$baseDir\covers-snes"
if (Test-Path $snesArtSource) {
    $snesArtFiles = Get-ChildItem -Path $snesArtSource -File -Filter "*.jpg"
    $snesArtCount = 0
    foreach ($f in $snesArtFiles) {
        $destFile = "$libDir\media\snes\box2d\$($f.Name)"
        if (-not (Test-Path $destFile)) {
            New-Item -ItemType HardLink -Path $destFile -Target $f.FullName | Out-Null
            $snesArtCount++
        }
    }
    Write-Host "  Linked $snesArtCount SNES box art covers." -ForegroundColor Green
}

# 5. Link Video Snaps
Write-Host "Linking NES Video Snaps..." -ForegroundColor Yellow
$nesVideoSource = "$baseDir\Nintendo Entertainment System (Video Snaps)(SQ)(No-Intro)(EM 2.5)"
if (Test-Path $nesVideoSource) {
    $nesVideos = Get-ChildItem -Path $nesVideoSource -File -Filter "*.mp4"
    $nesVidCount = 0
    foreach ($f in $nesVideos) {
        $destFile = "$libDir\media\nes\video\$($f.Name)"
        if (-not (Test-Path $destFile)) {
            New-Item -ItemType HardLink -Path $destFile -Target $f.FullName | Out-Null
            $nesVidCount++
        }
    }
    Write-Host "  Linked $nesVidCount NES video snaps." -ForegroundColor Green
}

$snesVideoSource = "$baseDir\Nintendo Super Nintendo (Video Snaps)(SQ)(HyperList)(EM 2.2)\Nintendo Super Nintendo (Video Snaps)(SQ)(HyperList)(EM 2.2)"
if (Test-Path $snesVideoSource) {
    $snesVideos = Get-ChildItem -Path $snesVideoSource -File -Filter "*.mp4"
    $snesVidCount = 0
    foreach ($f in $snesVideos) {
        $destFile = "$libDir\media\snes\video\$($f.Name)"
        if (-not (Test-Path $destFile)) {
            New-Item -ItemType HardLink -Path $destFile -Target $f.FullName | Out-Null
            $snesVidCount++
        }
    }
    Write-Host "  Linked $snesVidCount SNES video snaps." -ForegroundColor Green
}

Write-Host "=== RomM Library Preparation Complete ===" -ForegroundColor Cyan
