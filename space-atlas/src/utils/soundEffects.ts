/**
 * Tiny Web Audio sound kit – every sound is synthesised, no files needed.
 * Volumes are deliberately soft for little ears.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicGain: GainNode | null = null
let musicTimer: number | null = null
let musicNodes: AudioNode[] = []

/** Called when the audio engine had to be rebuilt (iOS can leave it dead after a call / lock). */
let onRebuilt: (() => void) | null = null
export function setAudioRebuiltHandler(fn: (() => void) | null) {
  onRebuilt = fn
}

function ac(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  }
  return ctx
}

/** Shared AudioContext (created on first use). Voice clips play through it too. */
export function getAudioContext() {
  return ac()
}

// A looping silent <audio> tag moves iOS Safari into the "playback" audio session, so Web Audio
// keeps playing even when the ring/silent switch is on (the child's iPad is usually muted).
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='
let keepAlive: HTMLAudioElement | null = null

function setPlaybackSession() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) nav.audioSession.type = 'playback'
  } catch {
    /* not supported */
  }
}

function startKeepAlive() {
  try {
    if (!keepAlive) {
      keepAlive = new Audio(SILENT_WAV)
      keepAlive.loop = true
      keepAlive.setAttribute('playsinline', '')
    }
    void keepAlive.play().catch(() => {})
  } catch {
    /* ignore */
  }
}

function stopKeepAlive() {
  try {
    keepAlive?.pause()
  } catch {
    /* ignore */
  }
}

/**
 * Make sure sound will come out. Safe to call often (every tap, when the app comes back).
 * Handles iOS "suspended" AND "interrupted" (after a lock / call / app switch). If the context
 * will not wake up, it is rebuilt – recorded clips survive because AudioBuffers are not tied to it.
 */
export async function ensureAudio(): Promise<boolean> {
  setPlaybackSession()
  let c = ac()
  if (!c) return false
  const state = c.state as string
  if (state !== 'running') {
    try {
      await Promise.race([c.resume(), new Promise((r) => setTimeout(r, 400))])
    } catch {
      /* fall through */
    }
  }
  if ((c.state as string) === 'closed' || (c.state as string) === 'interrupted' || c.state === 'suspended') {
    // still dead → rebuild once
    try {
      await c.close()
    } catch {
      /* ignore */
    }
    ctx = null
    master = null
    musicGain = null
    musicNodes = []
    if (musicTimer) window.clearInterval(musicTimer)
    musicTimer = null
    c = ac()
    if (!c) return false
    try {
      await Promise.race([c.resume(), new Promise((r) => setTimeout(r, 400))])
    } catch {
      /* ignore */
    }
    onRebuilt?.()
  }
  return c.state === 'running'
}

/** Call inside the first user gesture (iOS Safari policy). */
export async function unlockAudio() {
  setPlaybackSession()
  startKeepAlive()
  const c = ac()
  if (!c) return
  if (c.state !== 'running') await c.resume().catch(() => {})
  // Play one silent sample – this is what really unlocks iOS.
  const buf = c.createBuffer(1, 1, 22050)
  const src = c.createBufferSource()
  src.buffer = buf
  src.connect(c.destination)
  src.start(0)
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; vol?: number; delay?: number; slideTo?: number; attack?: number } = {},
) {
  const c = ac()
  if (!c || !master) return
  const t = c.currentTime + (opts.delay ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t)
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t + dur)
  const vol = opts.vol ?? 0.25
  const attack = opts.attack ?? 0.01
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** Rocket "whoosh" for flying between planets. */
export function playWhoosh() {
  const c = ac()
  if (!c || !master) return
  const t = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 1.6)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.2
  bp.frequency.setValueAtTime(250, t)
  bp.frequency.exponentialRampToValueAtTime(2400, t + 0.7)
  bp.frequency.exponentialRampToValueAtTime(300, t + 1.5)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.35)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.55)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
  src.stop(t + 1.6)
  tone(180, 1.2, { type: 'triangle', vol: 0.08, slideTo: 520 })
}

/** Soft "pop" for button taps. */
export function playPop() {
  tone(660, 0.12, { type: 'sine', vol: 0.22, slideTo: 990 })
}

/** Bouncy "boing" when tapping the planet. */
export function playBoing() {
  tone(220, 0.35, { type: 'triangle', vol: 0.2, slideTo: 440 })
  tone(440, 0.25, { type: 'sine', vol: 0.1, delay: 0.05, slideTo: 660 })
}

/** Magic sparkle when a vocab card fires an effect. */
export function playSparkle() {
  const notes = [1046.5, 1318.5, 1568, 2093]
  notes.forEach((f, i) => tone(f, 0.45, { type: 'sine', vol: 0.12, delay: i * 0.07 }))
}

/** Little fanfare when arriving at a planet. */
export function playArrive() {
  ;[523.25, 659.25, 783.99].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.1, delay: i * 0.09 }))
}

/** Gentle ambient space pad (generated). */
export function startMusic() {
  const c = ac()
  if (!c || !master || musicGain) return
  musicGain = c.createGain()
  musicGain.gain.setValueAtTime(0.0001, c.currentTime)
  musicGain.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 3)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  musicGain.connect(lp).connect(master)
  musicNodes = [lp]

  // Calm chord loop: Cmaj7 – Am7 – Fmaj7 – G6
  const chords = [
    [130.81, 196.0, 246.94, 329.63],
    [110.0, 164.81, 196.0, 261.63],
    [87.31, 130.81, 174.61, 220.0],
    [98.0, 146.83, 196.0, 246.94],
  ]
  let i = 0
  const playChord = () => {
    if (!musicGain || !ctx) return
    const t = ctx.currentTime
    for (const f of chords[i % chords.length]) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = f
      o.detune.value = (Math.random() - 0.5) * 8
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.25, t + 2.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 8.5)
      o.connect(g).connect(musicGain)
      o.start(t)
      o.stop(t + 9)
    }
    // A twinkle on top
    const tw = ctx.createOscillator()
    const tg = ctx.createGain()
    tw.frequency.value = chords[i % chords.length][3] * 4
    tg.gain.setValueAtTime(0.0001, t + 1)
    tg.gain.exponentialRampToValueAtTime(0.05, t + 1.05)
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 3)
    tw.connect(tg).connect(musicGain)
    tw.start(t + 1)
    tw.stop(t + 3.2)
    i++
  }
  playChord()
  musicTimer = window.setInterval(playChord, 7000)
}

export function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer)
  musicTimer = null
  if (musicGain && ctx) {
    const g = musicGain
    g.gain.cancelScheduledValues(ctx.currentTime)
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1)
    const nodes = musicNodes
    window.setTimeout(() => {
      g.disconnect()
      nodes.forEach((n) => n.disconnect())
    }, 1200)
  }
  musicGain = null
  musicNodes = []
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopKeepAlive()
      void ctx?.suspend().catch(() => {})
    } else {
      startKeepAlive()
      void ensureAudio()
    }
  })
  // any touch re-checks the engine (cheap when it is already running)
  window.addEventListener(
    'pointerdown',
    () => {
      if (ctx && (ctx.state as string) !== 'running') void ensureAudio()
    },
    { capture: true, passive: true },
  )
}
