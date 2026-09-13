import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, isAbsolute, join, normalize, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.VLC_SERVER_PORT ?? 8090)
const vlcBinary = process.env.VLC_PATH ?? 'vlc'
const videoRoot = resolve(process.env.VIDEO_ROOT ?? join(here, '..', '..', 'library', 'media'))
const streamRoot = join(tmpdir(), 'kodi-vlc-stream')
const playlistPath = join(streamRoot, 'index.m3u8')
let vlcProcess

mkdirSync(streamRoot, { recursive: true })

const headers = (contentType = 'application/json') => ({
  'Access-Control-Allow-Origin': process.env.WEB_ORIGIN ?? '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': contentType,
})

const send = (response, status, data) => {
  response.writeHead(status, headers())
  response.end(JSON.stringify(data))
}

const body = async (request) => {
  let content = ''
  for await (const chunk of request) content += chunk
  return JSON.parse(content || '{}')
}

const cleanStream = () => {
  if (vlcProcess) vlcProcess.kill()
  vlcProcess = undefined
  for (const file of readdirSync(streamRoot)) rmSync(join(streamRoot, file), { force: true })
}

const resolveSource = (source) => {
  if (/^https?:\/\//i.test(source)) return source
  const candidate = resolve(isAbsolute(source) ? source : join(videoRoot, source))
  const root = normalize(videoRoot + '\\')
  if (!normalize(candidate).startsWith(root) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    throw new Error('Source must be a file inside VIDEO_ROOT or an http(s) URL')
  }
  return candidate
}

const launchVlc = (source) => {
  cleanStream()
  const segmentPattern = join(streamRoot, 'segment-#####.ts')
  const sout = `#transcode{vcodec=h264,vb=2500,acodec=mp4a,ab=128,channels=2,samplerate=44100}:std{access=livehttp{seglen=6,delsegs=true,numsegs=6,index=${playlistPath},index-url=segment-#####.ts},mux=ts{use-key-frames},dst=${segmentPattern}}`
  vlcProcess = spawn(vlcBinary, ['--intf', 'dummy', '--no-video-title-show', '--network-caching', '1000', source, '--sout', sout, '--sout-keep'], { windowsHide: true })
  vlcProcess.on('error', (error) => writeFileSync(join(streamRoot, 'error.txt'), error.message))
  vlcProcess.on('exit', () => { vlcProcess = undefined })
}

const contentType = (file) => extname(file) === '.m3u8' ? 'application/vnd.apple.mpegurl' : 'video/mp2t'

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  if (request.method === 'OPTIONS') { response.writeHead(204, headers()); response.end(); return }
  if (url.pathname === '/api/vlc/health') { send(response, 200, { running: Boolean(vlcProcess), videoRoot }); return }
  if (url.pathname === '/api/vlc/stop' && request.method === 'POST') { cleanStream(); send(response, 200, { stopped: true }); return }
  if (url.pathname === '/api/vlc/play' && request.method === 'POST') {
    try {
      const input = await body(request)
      const source = resolveSource(String(input.source ?? ''))
      launchVlc(source)
      send(response, 202, { stream: `/stream/index.m3u8` })
    } catch (error) {
      send(response, 400, { error: error instanceof Error ? error.message : 'Unable to start VLC' })
    }
    return
  }
  if (url.pathname.startsWith('/stream/')) {
    const file = resolve(streamRoot, url.pathname.replace('/stream/', ''))
    if (!file.startsWith(normalize(streamRoot + '\\')) || !existsSync(file)) { send(response, 404, { error: 'Stream segment not ready' }); return }
    response.writeHead(200, { ...headers(contentType(file)), 'Content-Length': statSync(file).size })
    createReadStream(file).pipe(response)
    return
  }
  send(response, 404, { error: 'Not found' })
}).listen(port, '127.0.0.1', () => console.log(`VLC web bridge listening on http://127.0.0.1:${port}`))
