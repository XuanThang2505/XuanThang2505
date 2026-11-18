/**
 * Speech system for little learners.
 * 1. Plays a recorded file /audio/en/<slug>.mp3 if one exists (e.g. a parent's voice).
 * 2. Otherwise falls back to the Web Speech API with the nicest en-US voice available.
 */

export type SpeechRate = 'slow' | 'normal'

const RATE: Record<SpeechRate, number> = { slow: 0.7, normal: 0.85 }
const PITCH = 1.05

const PREFERRED_EN = [
  'Samantha',
  'Ava',
  'Allison',
  'Nicky',
  'Google US English',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Alex',
  'Karen',
]
const PREFERRED_VI = ['Linh', 'Google Tiếng Việt', 'Microsoft HoaiMy', 'Microsoft An']

let currentRate: SpeechRate = 'normal'
let enVoice: SpeechSynthesisVoice | null = null
let viVoice: SpeechSynthesisVoice | null = null
let currentAudio: HTMLAudioElement | null = null
/** Bumped every time speech is interrupted, so queued follow-ups can bail out. */
let generation = 0
const audioFileCache = new Map<string, boolean>()

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

function pickVoices() {
  if (!synth) return
  const voices = synth.getVoices()
  if (!voices.length) return
  const byName = (names: string[], lang: string) => {
    for (const n of names) {
      const v = voices.find((x) => x.name.startsWith(n) && x.lang.replace('_', '-').startsWith(lang))
      if (v) return v
    }
    return null
  }
  enVoice =
    byName(PREFERRED_EN, 'en') ??
    voices.find((v) => v.lang.replace('_', '-') === 'en-US' && v.localService) ??
    voices.find((v) => v.lang.replace('_', '-') === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  viVoice = byName(PREFERRED_VI, 'vi') ?? voices.find((v) => v.lang.startsWith('vi')) ?? null
}

if (synth) {
  pickVoices()
  synth.addEventListener?.('voiceschanged', pickVoices)
}

export function setSpeechRate(rate: SpeechRate) {
  currentRate = rate
}

export function hasVietnameseVoice() {
  pickVoices()
  return !!viVoice
}

/** Must be called inside a user gesture (iOS Safari policy). */
export function unlockSpeech() {
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

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function recordedFileExists(url: string): Promise<boolean> {
  if (audioFileCache.has(url)) return audioFileCache.get(url)!
  try {
    const res = await fetch(url, { method: 'HEAD' })
    // Dev servers answer missing files with index.html, so check the content type too.
    const ok = res.ok && (res.headers.get('content-type') ?? '').includes('audio')
    audioFileCache.set(url, ok)
    return ok
  } catch {
    audioFileCache.set(url, false)
    return false
  }
}

export function stopSpeaking() {
  generation++
  synth?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

function speakWithSynth(text: string, lang: 'en' | 'vi'): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) return resolve()
    pickVoices()
    const u = new SpeechSynthesisUtterance(text)
    const voice = lang === 'en' ? enVoice : viVoice
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? (lang === 'en' ? 'en-US' : 'vi-VN')
    u.rate = lang === 'en' ? RATE[currentRate] : RATE[currentRate] + 0.1
    u.pitch = PITCH
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
    // Safety net: some browsers never fire onend.
    setTimeout(finish, 1500 + text.length * 180)
    synth.speak(u)
  })
}

/** Speak an English word or short phrase. */
export async function speak(text: string, opts: { lang?: 'en' | 'vi'; interrupt?: boolean } = {}) {
  const lang = opts.lang ?? 'en'
  if (opts.interrupt !== false) stopSpeaking()

  const url = `./audio/${lang}/${slugify(text)}.mp3`
  if (await recordedFileExists(url)) {
    return new Promise<void>((resolve) => {
      const a = new Audio(url)
      currentAudio = a
      a.onended = () => resolve()
      a.onerror = () => resolve()
      a.play().catch(() => speakWithSynth(text, lang).then(resolve))
    })
  }
  return speakWithSynth(text, lang)
}

/** English first, then (optionally) the Vietnamese meaning. */
export async function speakBilingual(en: string, vi: string | undefined, withVietnamese: boolean) {
  const first = speak(en)
  const myGeneration = generation
  await first
  if (!withVietnamese || !vi || myGeneration !== generation) return
  await new Promise((r) => setTimeout(r, 250))
  if (myGeneration !== generation) return
  await speak(vi, { lang: 'vi', interrupt: false })
}
