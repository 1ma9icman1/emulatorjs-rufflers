export type RomMConfig = {
  rommUrl: string
  jellyfinUrl: string
  tvUrl: string
  vlcUrl: string
  featuredVideo: string
}

export type RomMGame = {
  id: number
  name?: string
  title?: string
  platform_name?: string
  platform_slug?: string
  summary?: string
  cover_url?: string
  path_cover_l?: string
  has_file_on_disk?: boolean
}

export const services: RomMConfig = {
  rommUrl: import.meta.env.VITE_ROMM_URL ?? 'http://localhost:8080',
  jellyfinUrl: import.meta.env.VITE_JELLYFIN_URL ?? '',
  tvUrl: import.meta.env.VITE_TV_URL ?? '',
  vlcUrl: import.meta.env.VITE_VLC_URL ?? 'http://127.0.0.1:8090',
  featuredVideo: import.meta.env.VITE_FEATURED_VIDEO ?? '',
}

const api = async <T>(path: string): Promise<T> => {
  const response = await fetch(`/romm-api${path}`, { credentials: 'include' })
  if (!response.ok) throw new Error(`RomM request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export async function getRomMStatus() {
  return api<{ version?: string }>('/heartbeat')
}

export async function getRomMLibrary() {
  const result = await api<{ items?: RomMGame[] } | RomMGame[]>('/roms?limit=24&offset=0&with_total=false&with_char_index=false&with_filter_values=false&with_rom_id_index=false')
  return Array.isArray(result) ? result : result.items ?? []
}

export function getRomMPlayerUrl(id: number) {
  return `${services.rommUrl.replace(/\/$/, '')}/rom/${id}/ejs`
}

export function getVideoUrl(path: string) {
  const base = services.jellyfinUrl.replace(/\/$/, '')
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path
}

export function getLiveUrl(path: string) {
  const base = services.tvUrl.replace(/\/$/, '')
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path
}

export async function startVlcPlayback(source: string) {
  const response = await fetch(`${services.vlcUrl}/api/vlc/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  })
  const result = await response.json() as { stream?: string; error?: string }
  if (!response.ok || !result.stream) throw new Error(result.error ?? 'VLC could not start playback')
  return `${services.vlcUrl}${result.stream}`
}
