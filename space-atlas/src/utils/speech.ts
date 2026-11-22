/**
 * Speech for little learners.
 *
 * 1. Pre-recorded clips in /audio/en (natural American voice, Kokoro af_heart, made with
 *    scripts/make_voice.py). They are decoded once and played through the Web Audio
 *    context, which iOS lets us use at any time after the first tap.
 * 2. Fallback: Web Speech API, forced to an en-US voice,
 *    so the iPad never reads English with a Vietnamese voice.
 */
import { ensureAudio, getAudioContext } from './soundEffects'
import { slugify } from './slug'
import { getVi } from './viRecordings'

export { slugify }
export type SpeechRate = 'slow' | 'normal'

const RATE: Record<SpeechRate, number> = { slow: 0.7, normal: 0.85 }
/** Clip playback speed: recordings are already child-paced; Slow makes them a bit slower. */
const CLIP_RATE: Record<SpeechRate, number> = { slow: 0.88, normal: 1 }

// Natural US voices that match the recorded clips (warm female), then any other en-US voice.
const PREFERRED_EN = [
  'Ava',
  'Samantha',
  'Allison',
  'Nicky',
  'Microsoft Jenny',
  'Microsoft Aria',
  'Google US English',
  'Evan',
  'Nathan',
  'Tom',
  'Aaron',
]
const PREFERRED_VI = ['Linh', 'Google Tiếng Việt', 'Microsoft HoaiMy', 'Microsoft An']

let currentRate: SpeechRate = 'normal'
let enVoice: SpeechSynthesisVoice | null = null
let viVoice: SpeechSynthesisVoice | null = null
let currentSource: AudioBufferSourceNode | null = null
/** Bumped every time speech is interrupted, so queued follow-ups can bail out. */
let generation = 0

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

/** Optional debug log (used by the automated tests): set window.__speechLog = [] to record. */
function log(text: string, via: 'clip' | 'synth') {
  ;(window as unknown as { __speechLog?: { text: string; via: string }[] }).__speechLog?.push({ text, via })
}

// ---------------------------------------------------------------- recorded clips
let manifest: Record<string, string> | null = null
let manifestPromise: Promise<void> | null = null
const buffers = new Map<string, AudioBuffer>()
const loading = new Map<string, Promise<AudioBuffer | null>>()

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch('./audio/en/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { clips?: Record<string, string> } | null) => {
        manifest = j?.clips ?? {}
      })
      .catch(() => {
        manifest = {}
      })
  }
  return manifestPromise
}

function loadClip(slug: string): Promise<AudioBuffer | null> {
  if (buffers.has(slug)) return Promise.resolve(buffers.get(slug)!)
  if (loading.has(slug)) return loading.get(slug)!
  const ctx = getAudioContext()
  const file = manifest?.[slug]
  if (!ctx || !file) return Promise.resolve(null)
  const p = fetch(`./audio/en/${file}`)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('missing'))))
    // callback form: older iOS Safari has no promise-based decodeAudioData
    .then((data) => new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(data, res, rej)))
    .then((buf) => {
      buffers.set(slug, buf)
      return buf
    })
    .catch(() => null)
  loading.set(slug, p)
  return p
}

/**
 * Warm up only the clips needed first (planet names), slowly, when the device is idle.
 * Decoding all ~250 clips at start-up competed with the 3D scene and made the first seconds lag;
 * every other clip is decoded the first time it is needed (a few milliseconds).
 */
export async function preloadVoiceClips(texts: string[]) {
  await loadManifest()
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  for (const t of texts) {
    await new Promise<void>((r) => (idle ? idle(() => r(), { timeout: 1500 }) : setTimeout(r, 120)))
    await loadClip(slugify(t))
  }
}

function playBuffer(buf: AudioBuffer, rate?: number): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return Promise.resolve()
  return new Promise((resolve) => {
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.playbackRate.value = rate ?? CLIP_RATE[currentRate]
    const g = ctx.createGain()
    g.gain.value = 1
    src.connect(g).connect(ctx.destination)
    src.onended = () => {
      if (currentSource === src) currentSource = null
      resolve()
    }
    currentSource = src
    // wake the engine first if iOS put it to sleep, then play
    if (ctx.state === 'running') src.start()
    else void ensureAudio().then(() => src.start())
  })
}

/** A line recorded by the family (Settings › Giọng Việt), decoded once and kept. */
const viBuffers = new Map<string, AudioBuffer | null>()
async function familyClip(text: string): Promise<AudioBuffer | null> {
  const key = slugify(text)
  if (viBuffers.has(key)) return viBuffers.get(key)!
  let buf: AudioBuffer | null = null
  try {
    const blob = await getVi(text)
    const ctx = getAudioContext()
    if (blob && ctx) {
      const data = await blob.arrayBuffer()
      buf = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(data, res, rej))
    }
  } catch {
    buf = null
  }
  viBuffers.set(key, buf)
  return buf
}
/** Forget cached recordings (after the parent records or deletes a line). */
export function forgetFamilyClip(text: string) {
  viBuffers.delete(slugify(text))
}
/** Play any audio blob right now (the recorder previews a take with this). */
export async function playBlob(blob: Blob) {
  const ctx = getAudioContext()
  if (!ctx) return
  await ensureAudio()
  try {
    const data = await blob.arrayBuffer()
    const buf = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(data, res, rej))
    stopSpeaking()
    await playBuffer(buf, 1)
  } catch {
    /* unreadable take – ignore */
  }
}

// ---------------------------------------------------------------- Web Speech fallback
function pickVoices() {
  if (!synth) return
  const voices = synth.getVoices()
  if (!voices.length) return
  const norm = (l: string) => l.replace('_', '-').toLowerCase()
  const byName = (names: string[], lang: string) => {
    for (const n of names) {
      const v = voices.find((x) => x.name.startsWith(n) && norm(x.lang).startsWith(lang))
      if (v) return v
    }
    return null
  }
  enVoice =
    byName(PREFERRED_EN, 'en-us') ??
    voices.find((v) => norm(v.lang) === 'en-us') ??
    byName(PREFERRED_EN, 'en') ??
    voices.find((v) => norm(v.lang).startsWith('en')) ??
    null
  viVoice = byName(PREFERRED_VI, 'vi') ?? voices.find((v) => norm(v.lang).startsWith('vi')) ?? null
}

/** iOS fills the voice list late; wait for it (max ~1.5 s) so we never fall back to the system voice. */
async function ensureVoices() {
  if (!synth) return
  for (let i = 0; i < 15 && !synth.getVoices().length; i++) await new Promise((r) => setTimeout(r, 100))
  pickVoices()
}

if (synth) {
  pickVoices()
  synth.addEventListener?.('voiceschanged', pickVoices)
}

function speakWithSynth(text: string, lang: 'en' | 'vi'): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) return resolve()
    const u = new SpeechSynthesisUtterance(lang === 'en' ? text.charAt(0) + text.slice(1).toLowerCase() : text)
    const voice = lang === 'en' ? enVoice : viVoice
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? (lang === 'en' ? 'en-US' : 'vi-VN')
    u.rate = lang === 'en' ? RATE[currentRate] : 1
    u.pitch = 1
    u.volume = 1
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        resolve()
      }
    }
    u.onend = finish
    u.onerror = finish
    setTimeout(finish, 1500 + text.length * 180)
    synth.speak(u)
  })
}

// ---------------------------------------------------------------- public API
export function setSpeechRate(rate: SpeechRate) {
  currentRate = rate
}

export function hasVietnameseVoice() {
  pickVoices()
  return !!viVoice
}

/** Must be called inside a user gesture (iOS Safari policy). */
export function unlockSpeech() {
  void loadManifest()
  if (!synth) return
  pickVoices()
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    synth.speak(u)
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  generation++
  synth?.cancel()
  if (currentSource) {
    try {
      currentSource.stop()
    } catch {
      /* already stopped */
    }
    currentSource = null
  }
}

/** Speak an English word or short phrase (or Vietnamese with lang 'vi'). */
export async function speak(text: string, opts: { lang?: 'en' | 'vi'; interrupt?: boolean } = {}) {
  const lang = opts.lang ?? 'en'
  const synthBusy = !!(synth?.speaking || synth?.pending)
  if (opts.interrupt !== false) stopSpeaking()
  const myGeneration = generation

  if (lang === 'en') {
    await loadManifest()
    const buf = await loadClip(slugify(text))
    if (myGeneration !== generation) return
    if (buf) {
      log(text, 'clip')
      return playBuffer(buf)
    }
    await ensureVoices()
  } else {
    const fam = await familyClip(text)
    if (myGeneration !== generation) return
    if (fam) {
      log(text, 'clip')
      return playBuffer(fam, 1)
    }
    await ensureVoices()
  }
  // iOS Safari drops an utterance queued right after cancel(): give it a breath.
  if (synthBusy) await new Promise((r) => setTimeout(r, 90))
  if (myGeneration !== generation) return
  log(text, 'synth')
  return speakWithSynth(text, lang)
}

/** English first, then (optionally) the Vietnamese meaning. */
export async function speakBilingual(en: string, vi: string | undefined, withVietnamese: boolean) {
  const first = speak(en)
  const myGeneration = generation
  await first
  if (!withVietnamese || !vi || myGeneration !== generation) return
  await new Promise((r) => setTimeout(r, 120))
  if (myGeneration !== generation) return
  await speak(vi, { lang: 'vi', interrupt: false })
}

/** Say a list of English words one after another, `gap` seconds apart (PLANETS counting). */
export async function speakSequence(words: string[], gap: number) {
  stopSpeaking()
  const myGeneration = generation
  // Load every clip first: otherwise a clip that decodes faster could jump the queue
  // and the planets would be counted out of order.
  await loadManifest()
  await Promise.all(words.map((w) => loadClip(slugify(w))))
  if (myGeneration !== generation) return
  const start = performance.now()
  for (let i = 0; i < words.length; i++) {
    const wait = start + i * gap * 1000 - performance.now()
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    if (myGeneration !== generation) return
    void speak(words[i], { interrupt: false })
  }
}
