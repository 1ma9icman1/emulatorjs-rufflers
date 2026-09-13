import './style.css'
import Hls from 'hls.js'
import { getRomMLibrary, getRomMPlayerUrl, getRomMStatus, services, startVlcPlayback, type RomMGame } from './services'

type MediaItem = { id?: number; title: string; meta: string; image: string; kind: string }

const icon = (name: string) => {
  const paths: Record<string, string> = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-6h6v6"/>',
    film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    tv: '<rect width="20" height="15" x="2" y="3" rx="2"/><path d="m8 21 4-3 4 3M12 3V1"/>',
    heart: '<path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.3Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? paths.more}</svg>`
}

const media: MediaItem[] = [
  { title: 'The Last of Us', meta: 'S2 E7  •  2025  •  Drama', kind: 'TV', image: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=85' },
  { title: 'Dune: Part Two', meta: '2024  •  2h 46m', kind: 'MOVIE', image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=900&q=85' },
  { title: 'Civil War', meta: '2024  •  1h 49m', kind: 'MOVIE', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85' },
  { title: 'Arcane', meta: 'S2 E3  •  Animation', kind: 'TV', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85' },
  { title: 'The Bear', meta: 'S3 E2  •  Comedy drama', kind: 'TV', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85' },
  { title: 'Nocturne Radio', meta: 'Late night essentials', kind: 'MUSIC', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85' },
]

const card = (item: MediaItem, index: number) => `<article class="media-card" data-rom-id="${item.id ?? ''}" data-title="${item.title.toLowerCase()}" style="--delay:${index * 70}ms">
  <div class="poster"><img src="${item.image}" alt="${item.title} cover" loading="lazy"><span>${item.kind}</span><button class="poster-play" aria-label="Play ${item.title}">${icon('play')}</button></div>
  <div class="card-copy"><h3>${item.title}</h3><p>${item.meta}</p></div>
</article>`

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div class="app-shell">
  <aside class="sidebar">
    <a class="brand" href="#" aria-label="Kodi Web home"><span class="brand-mark">K</span><span>kodi<span class="brand-dot">.</span>web</span></a>
    <nav class="primary-nav" aria-label="Primary navigation">
      <button class="nav-item active" data-view="Home">${icon('home')}<span>Home</span></button>
      <button class="nav-item" data-view="Movies">${icon('film')}<span>Movies</span></button>
      <button class="nav-item" data-view="Shows">${icon('tv')}<span>TV Shows</span></button>
      <button class="nav-item" data-view="Music">${icon('music')}<span>Music</span></button>
    </nav>
    <div class="nav-label">Your library</div>
    <nav class="secondary-nav" aria-label="Library navigation">
      <button class="nav-item" data-view="Favorites">${icon('heart')}<span>Favorites</span><b>12</b></button>
      <button class="nav-item" data-view="Playlists">${icon('plus')}<span>Playlists</span></button>
    </nav>
    <div class="sidebar-foot"><span class="status-dot"></span><span id="connection-status">Demo library</span><button aria-label="More options">${icon('more')}</button></div>
  </aside>
  <main class="main-content">
    <header class="topbar"><button class="mobile-menu" aria-label="Open menu">${icon('more')}</button><div class="breadcrumb"><span>Library</span><strong>/</strong><span id="view-label">Home</span></div><label class="search-box">${icon('search')}<input id="search" placeholder="Search your library" type="search"><kbd>⌘ K</kbd></label><input id="local-file" type="file" accept="video/*,.mkv,.avi,.mov,.mp4,.webm" hidden><button class="load-local" id="load-local" type="button">${icon('plus')} Load local file</button><button class="avatar" aria-label="Profile">JD</button></header>
    <section class="hero" aria-label="Load local file"><div class="hero-image"></div><div class="hero-content"><span class="eyebrow">Load local file</span><h1>Interstellar</h1><p class="hero-meta">2014  <i></i>  PG-13  <i></i>  2h 49m</p><p class="hero-description">A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.</p><div class="hero-actions"><button class="primary-action" id="play-featured">${icon('play')} Play now</button><button class="video-action" id="watch-featured">Watch video</button><button class="circle-action" aria-label="Add to favorites">${icon('plus')}</button><button class="circle-action" aria-label="More options">${icon('more')}</button></div></div><div class="hero-index"><strong>01</strong><span>/ 04</span></div></section>
    <section class="content-section continue-section"><div class="section-heading"><div><span class="section-kicker">Pick up where you left off</span><h2>Continue watching</h2></div><button class="text-button">View all ${icon('play')}</button></div><div class="continue-row"><div class="continue-card"><div class="continue-thumb"><img src="${media[0].image}" alt="The Last of Us"><button class="mini-play">${icon('play')}</button></div><div class="continue-info"><div class="progress-line"><span style="width:64%"></span></div><h3>The Last of Us</h3><p>S2 E7  •  36 min left</p></div></div><div class="continue-card"><div class="continue-thumb"><img src="${media[3].image}" alt="Arcane"><button class="mini-play">${icon('play')}</button></div><div class="continue-info"><div class="progress-line"><span style="width:28%"></span></div><h3>Arcane</h3><p>S2 E3  •  42 min left</p></div></div><div class="continue-card"><div class="continue-thumb"><img src="${media[4].image}" alt="The Bear"><button class="mini-play">${icon('play')}</button></div><div class="continue-info"><div class="progress-line"><span style="width:81%"></span></div><h3>The Bear</h3><p>S3 E2  •  11 min left</p></div></div></div></section>
    <section class="content-section library-section"><div class="section-heading"><div><span class="section-kicker">Recently added</span><h2>From your library</h2></div><div class="section-tabs"><button class="tab active">All</button><button class="tab">Movies</button><button class="tab">Shows</button></div></div><div class="media-grid">${media.map(card).join('')}</div></section>
  </main>
  <footer class="player-bar"><div class="now-playing"><div class="album-art"><img src="${media[5].image}" alt="Nocturne Radio"></div><div><strong id="track-title">Midnight City</strong><span>M83  •  Hurry Up, We're Dreaming</span></div><button aria-label="Like track">${icon('heart')}</button></div><div class="player-controls"><div class="transport"><button aria-label="Previous">◀◀</button><button class="main-play" id="player-toggle" aria-label="Pause">Ⅱ</button><button aria-label="Next">▶▶</button></div><div class="track-progress"><span>1:24</span><div><i></i></div><span>4:03</span></div></div><div class="player-tools">${icon('volume')}<div class="volume-line"><i></i></div>${icon('more')}</div></footer>
  <dialog id="video-dialog"><div class="video-shell"><button class="video-close" id="close-video" aria-label="Close video">×</button><video id="video-player" controls playsinline></video><p id="video-status">Preparing VLC playback...</p></div></dialog>
</div>`

const search = document.querySelector<HTMLInputElement>('#search')!
const viewLabel = document.querySelector('#view-label')!
const playerToggle = document.querySelector<HTMLButtonElement>('#player-toggle')!
const playFeatured = document.querySelector<HTMLButtonElement>('#play-featured')!
const watchFeatured = document.querySelector<HTMLButtonElement>('#watch-featured')!
const videoDialog = document.querySelector<HTMLDialogElement>('#video-dialog')!
const videoPlayer = document.querySelector<HTMLVideoElement>('#video-player')!
const videoStatus = document.querySelector<HTMLParagraphElement>('#video-status')!
const localFileInput = document.querySelector<HTMLInputElement>('#local-file')!
const loadLocal = document.querySelector<HTMLButtonElement>('#load-local')!
let hls: Hls | undefined
let localObjectUrl = ''

document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'))
  button.classList.add('active')
  viewLabel.textContent = button.dataset.view ?? 'Home'
}))

document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'))
  tab.classList.add('active')
  const filter = tab.textContent?.toLowerCase() ?? 'all'
  document.querySelectorAll<HTMLElement>('.media-card').forEach((item) => {
    item.style.display = filter === 'all' || item.textContent?.toLowerCase().includes(filter) ? '' : 'none'
  })
}))

search.addEventListener('input', () => {
  const query = search.value.toLowerCase().trim()
  document.querySelectorAll<HTMLElement>('.media-card').forEach((item) => {
    item.style.display = !query || item.dataset.title?.includes(query) ? '' : 'none'
  })
})

const togglePlay = () => {
  playerToggle.textContent = playerToggle.textContent === 'Ⅱ' ? '▶' : 'Ⅱ'
  playerToggle.setAttribute('aria-label', playerToggle.textContent === 'Ⅱ' ? 'Pause' : 'Play')
}
playerToggle.addEventListener('click', togglePlay)
playFeatured.addEventListener('click', () => { document.querySelector('#track-title')!.textContent = 'Cornfield Chase'; playerToggle.textContent = 'Ⅱ' })

const openVideo = async (source: string) => {
  videoDialog.showModal()
  videoStatus.textContent = 'Starting VLC transcoder...'
  try {
    const streamUrl = await startVlcPlayback(source)
    if (Hls.isSupported()) {
      hls?.destroy()
      hls = new Hls({ enableWorker: true })
      hls.loadSource(streamUrl)
      hls.attachMedia(videoPlayer)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { videoStatus.textContent = 'Playing through VLC'; void videoPlayer.play() })
    } else {
      videoPlayer.src = streamUrl
      videoStatus.textContent = 'Playing through VLC'
      void videoPlayer.play()
    }
  } catch (error) {
    videoStatus.textContent = error instanceof Error ? error.message : 'VLC playback unavailable'
  }
}

watchFeatured.addEventListener('click', () => {
  if (services.featuredVideo) void openVideo(services.featuredVideo)
  else { videoDialog.showModal(); videoStatus.textContent = 'Set VITE_FEATURED_VIDEO to a file inside VIDEO_ROOT or an approved stream.' }
})
document.querySelector<HTMLButtonElement>('#close-video')!.addEventListener('click', () => { hls?.destroy(); videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoDialog.close() })
loadLocal.addEventListener('click', () => localFileInput.click())
localFileInput.addEventListener('change', () => {
  const file = localFileInput.files?.[0]
  if (!file) return
  hls?.destroy()
  if (localObjectUrl) URL.revokeObjectURL(localObjectUrl)
  localObjectUrl = URL.createObjectURL(file)
  videoDialog.showModal()
  videoPlayer.src = localObjectUrl
  videoPlayer.load()
  videoStatus.textContent = `Playing local file: ${file.name}`
  void videoPlayer.play()
})

const rommStatus = document.querySelector<HTMLSpanElement>('#connection-status')!
const libraryGrid = document.querySelector<HTMLDivElement>('.media-grid')!

const toMediaItem = (game: RomMGame, index: number): MediaItem => ({
  id: game.id,
  title: game.name ?? game.title ?? 'Untitled game',
  meta: `${game.platform_name ?? game.platform_slug ?? 'Game'}${game.has_file_on_disk === false ? '  •  Missing file' : ''}`,
  image: game.cover_url ?? game.path_cover_l ?? media[index % media.length].image,
  kind: (game.platform_slug ?? game.platform_name ?? 'GAME').toUpperCase(),
})

const attachRomLaunchers = () => document.querySelectorAll<HTMLElement>('[data-rom-id]').forEach((item) => {
  const id = Number(item.dataset.romId)
  if (!id) return
  item.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('button')) event.preventDefault()
    window.location.assign(getRomMPlayerUrl(id))
  })
})

const connectRomM = async () => {
  try {
    const [, games] = await Promise.all([getRomMStatus(), getRomMLibrary()])
    rommStatus.textContent = `RomM connected${services.rommUrl ? '' : ''}`
    document.querySelector('.status-dot')?.classList.add('online')
    if (games.length) {
      libraryGrid.innerHTML = games.map((game, index) => card(toMediaItem(game, index), index)).join('')
      attachRomLaunchers()
    }
  } catch {
    rommStatus.textContent = 'Demo library  •  RomM offline'
  }
}

attachRomLaunchers()
void connectRomM()
