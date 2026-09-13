import './style.css'
import Hls from 'hls.js'
import { services, startVlcPlayback } from './services'

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

const neonDriveInImage = '/2026-09-13%2017_40_21-Roblox.png'
const googleDriveVideo = 'https://drive.google.com/uc?export=download&id=1FDjrUOgEn57U4cBSpwDtmamoFNBaa1rf'
const featuredVideoSource = services.featuredVideo || googleDriveVideo

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div class="app-shell">
  <main class="main-content">
    <input id="local-file" type="file" accept="video/*,.mkv,.avi,.mov,.mp4,.webm" hidden>
    <section class="hero" aria-label="ma9ic movie launcher"><img class="hero-drive" src="${neonDriveInImage}" alt="Vintage neon drive-in sign"><div class="hero-shade"></div><div class="hero-content"><span class="eyebrow">Movie night</span><h1>ma9ic</h1><p class="hero-description">Load a movie and settle in under the lights.</p><div class="hero-actions"><button class="primary-action" id="watch-featured" type="button">${icon('play')} Load movie</button></div></div></section>
  </main>
  <dialog id="video-dialog"><div class="video-shell"><button class="video-back" id="back-video" type="button">← Back</button><button class="video-close" id="close-video" aria-label="Close video">×</button><video id="video-player" controls playsinline loop></video><progress id="video-loading" max="100" value="0" aria-label="Loading video"></progress><button class="video-sound" id="video-sound" type="button">Enable sound</button><p id="video-status">Preparing playback...</p></div></dialog>
</div>`

const watchFeatured = document.querySelector<HTMLButtonElement>('#watch-featured')!
const videoDialog = document.querySelector<HTMLDialogElement>('#video-dialog')!
const videoPlayer = document.querySelector<HTMLVideoElement>('#video-player')!
const videoStatus = document.querySelector<HTMLParagraphElement>('#video-status')!
const videoLoading = document.querySelector<HTMLProgressElement>('#video-loading')!
const videoSound = document.querySelector<HTMLButtonElement>('#video-sound')!
const backVideo = document.querySelector<HTMLButtonElement>('#back-video')!
const localFileInput = document.querySelector<HTMLInputElement>('#local-file')!
const loadLocal = document.querySelector<HTMLButtonElement>('#load-local')!
let hls: Hls | undefined
let localObjectUrl = ''

const showVideoLoading = (loading: boolean, progress = 0) => {
  videoLoading.hidden = !loading
  videoLoading.value = progress
}
showVideoLoading(false)

const enableVideoAudio = () => {
  videoPlayer.muted = false
  videoPlayer.volume = 1
  videoPlayer.controls = true
}
videoSound.addEventListener('click', () => {
  videoPlayer.muted = false
  videoPlayer.volume = 1
  videoSound.hidden = true
  void videoPlayer.play()
})
videoPlayer.addEventListener('click', () => {
  if (!videoPlayer.muted) return
  videoPlayer.muted = false
  videoPlayer.volume = 1
  videoSound.hidden = true
  void videoPlayer.play()
})

const openVideo = async (source: string) => {
  videoDialog.showModal()
  videoStatus.textContent = 'Starting VLC transcoder...'
  showVideoLoading(true)
  enableVideoAudio()
  try {
    if (/\.mp4$/i.test(source) && !/^https?:\/\//i.test(source)) {
      videoPlayer.src = `${services.vlcUrl}/api/vlc/file?source=${encodeURIComponent(source)}`
      videoPlayer.load()
      videoStatus.textContent = 'Playing video'
      await videoPlayer.play()
      videoPlayer.muted = false
      videoPlayer.volume = 1
      videoSound.hidden = true
      showVideoLoading(false)
      return
    }
    const streamSource = source === googleDriveVideo
      ? `${services.vlcUrl}/api/vlc/proxy?source=${encodeURIComponent(source)}`
      : source
    const streamUrl = await startVlcPlayback(streamSource)
    if (Hls.isSupported()) {
      hls?.destroy()
      hls = new Hls({ enableWorker: true, startPosition: -1 })
      hls.loadSource(streamUrl)
      hls.attachMedia(videoPlayer)
      hls.on(Hls.Events.FRAG_LOADING, () => showVideoLoading(true))
      hls.on(Hls.Events.FRAG_LOADED, () => showVideoLoading(false))
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        enableVideoAudio()
        void videoPlayer.play().then(() => {
          videoSound.hidden = true
          showVideoLoading(false)
          videoStatus.textContent = 'Playing through VLC'
        }).catch(() => { videoStatus.textContent = 'Click Enable sound to start audio' })
      })
    } else {
      videoPlayer.src = streamUrl
      videoStatus.textContent = 'Playing through VLC'
      void videoPlayer.play()
      showVideoLoading(false)
    }
  } catch (error) {
    showVideoLoading(false)
    videoStatus.textContent = error instanceof Error ? error.message : 'VLC playback unavailable'
  }
}

watchFeatured.addEventListener('click', () => {
  void openVideo(featuredVideoSource)
})
const closeVideo = () => { hls?.destroy(); videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoDialog.close() }
document.querySelector<HTMLButtonElement>('#close-video')!.addEventListener('click', closeVideo)
backVideo.addEventListener('click', closeVideo)
loadLocal.addEventListener('click', () => localFileInput.click())
localFileInput.addEventListener('change', () => {
  const file = localFileInput.files?.[0]
  if (!file) return
  hls?.destroy()
  if (localObjectUrl) URL.revokeObjectURL(localObjectUrl)
  localObjectUrl = URL.createObjectURL(file)
  videoDialog.showModal()
  enableVideoAudio()
  videoPlayer.src = localObjectUrl
  videoPlayer.load()
  videoStatus.textContent = `Playing local file: ${file.name}`
  void videoPlayer.play()
})

