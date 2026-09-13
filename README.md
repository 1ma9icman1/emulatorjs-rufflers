# romM - NES & SNES Station

A custom **RomM** (ROM Manager & Web Emulator) station powered by [rommapp/romm](https://github.com/rommapp/romm).

## 🚀 Features
- **NES & SNES Library Integration**: Pre-linked ROMs and media assets with automatic hashing, metadata matching, and cover scraper.
- **Built-in Web Emulation**: Play games directly in your browser via EmulatorJS (FCEUMM for NES, SNES9x for Super Nintendo) and Ruffle (Flash).
- **Video Snaps & Box Art**: Pre-configured media directories for 2D/3D box arts and gameplay video previews.
- **WeWeb Integration**: Cloud sync with WeWeb game catalog tables for cross-platform app frontend and streaming.

## 📁 Library Layout
```text
library/
├── roms/
│   ├── nes/      <-- Links to ROMS/USA
│   └── snes/     <-- Links to roms-snes/
└── media/
    ├── nes/
    │   ├── box2d/
    │   └── video/
    └── snes/
        ├── box2d/
        └── video/
```

## 🛠️ Quick Start

### 1. Launch with Docker Compose (Local)
```powershell
.\start-romm.ps1
```
Access RomM at: **http://localhost:8080**

### 2. Stop Service
```powershell
.\stop-romm.ps1
```

### 3. Deploy to Cloud (Render / Railway / Docker)
Use the included `Dockerfile` pointing to port `8080`.

## Kodi Web dashboard

The `kodi-web` folder contains a browser dashboard that connects to RomM's API
and EmulatorJS player. Start Docker Desktop first, then run:

```powershell
.\start-romm.ps1
Set-Location kodi-web
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. The dashboard uses RomM at `http://localhost:8080`
by default, loads the real ROM library when authenticated, and falls back to its
demo catalog while RomM is offline. Copy `kodi-web/.env.example` to
`kodi-web/.env.local` to point it at another RomM, Jellyfin, or legal IPTV server.
