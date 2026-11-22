/**
 * Splash's ocean: an ocean under the stars. Tap something in the sky and Splash the dolphin leaps
 * out of the water to catch it – every catch says an English word (BUBBLE, FISH, WHALE…).
 * No timer, no losing: tapping anywhere makes Splash jump.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { OCEAN_WORDS, SPLASH_LINES } from '../data/storyData'
import { catchLine, COUNT_WORDS, DOLPHIN_LEVEL_LINES } from '../data/moreData'
import { PUZZLE_LINES } from '../data/planetsData'
import { Screen, TopBar, wait, type Say } from '../games/ui'
import { playBoing, playBubble, playPop, playSparkle, playSplash } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Splash } from './Cosmo'

/** Level 1: catch anything · 2: listen and catch the word you hear · 3: catch and count */
type Level = 1 | 2 | 3
const GOALS: Record<Level, number> = { 1: 8, 2: 6, 3: 12 }
const COUNT_ROUNDS = [3, 4, 5]
const WATER = 0.66 // water surface, fraction of the play area's height

interface Thing {
  id: number
  w: (typeof OCEAN_WORDS)[number]
  x: number // 0..1
  y: number // 0..1 (sky part)
}

const WAVE = 'M0 30 ' + Array.from({ length: 8 }, (_, i) => `Q ${i * 150 + 75} ${i % 2 ? 58 : 2} ${(i + 1) * 150} 30`).join(' ') + ' V60 H0 Z'

export function DolphinGame(props: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const [level, setLevel] = useState<Level | null>(null)
  const c = useLayout().compact
  if (level) return <DolphinPlay key={level} level={level} {...props} onBack={() => setLevel(null)} />
  const levels: { l: Level; icon: string; en: string; vi: string; cls: string }[] = [
    { l: 1, icon: '🐬', en: 'Catch!', vi: 'Bắt tự do', cls: 'from-sky-400 to-blue-700' },
    { l: 2, icon: '👂', en: 'Listen & catch', vi: 'Nghe và bắt đúng', cls: 'from-teal-400 to-cyan-700' },
    { l: 3, icon: '🔢', en: 'Count!', vi: 'Bắt và đếm số', cls: 'from-indigo-400 to-violet-700' },
  ]
  return (
    <Screen>
      <TopBar onBack={props.onBack} stars={props.stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Splash's ocean 🌊</div>} />
      <div className={`flex flex-1 flex-col items-center justify-center ${c ? 'gap-3' : 'gap-6'} px-3 pb-3`}>
        <Splash size={c ? 110 : 200} />
        <div className={`flex flex-wrap justify-center ${c ? 'gap-2' : 'gap-5'}`}>
          {levels.map((lv) => (
            <button
              key={lv.l}
              data-testid={`dolphin-level-${lv.l}`}
              onClick={() => {
                playPop()
                setLevel(lv.l)
              }}
              className={`relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-white/25 bg-gradient-to-br ${lv.cls} shadow-xl active:scale-95 ${c ? 'h-28 w-28 p-2' : 'h-48 w-52 p-3'}`}
            >
              <span className={`absolute left-3 top-2 rounded-full bg-black/25 px-2 font-black ${c ? 'text-xs' : 'text-base'}`}>{lv.l}</span>
              <span className={c ? 'text-4xl' : 'text-6xl'}>{lv.icon}</span>
              <b className={`font-black leading-tight ${c ? 'text-sm' : 'text-2xl'}`}>{lv.en}</b>
              <small className={`font-semibold text-white/85 ${c ? 'text-[11px]' : 'text-base'}`}>{lv.vi}</small>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  )
}

function DolphinPlay({ level, stars, onBack, onStar, onSay }: { level: Level; stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const GOAL = GOALS[level]
  const L = useLayout()
  const c = L.compact
  const area = useRef<HTMLDivElement>(null)
  const dolphin = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 800, h: 500 })
  const [restX, setRestX] = useState(0.5)
  const [facing, setFacing] = useState(1)
  const [things, setThings] = useState<Thing[]>([])
  const [caught, setCaught] = useState(0)
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([])
  const [pops, setPops] = useState<{ id: number; x: number; y: number; t: string }[]>([])
  const [tapped, setTapped] = useState(false)
  const busy = useRef(false)
  const alive = useRef(true)
  const nextId = useRef(1)
  const deck = useRef<number[]>([])
  const want = useRef<string>('') // level 2: the word to catch
  const round = useRef(0) // level 3: which counting round
  const inRound = useRef(0) // level 3: catches in this round
  const [wobble, setWobble] = useState<number | null>(null)
  const done = caught >= GOALS[level]
  const dSize = c ? 110 : 190
  const dH = dSize * 0.75

  useEffect(() => {
    const el = area.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setBox({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [done])

  useEffect(() => {
    alive.current = true
    const t = setTimeout(async () => {
      if (level === 1) void onSay(SPLASH_LINES.tap.en, SPLASH_LINES.tap.vi)
      else if (level === 3) void onSay(DOLPHIN_LEVEL_LINES.count.en, DOLPHIN_LEVEL_LINES.count.vi)
      else if (want.current) void speak(catchLine(want.current).en)
    }, 500)
    return () => {
      alive.current = false
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay, level])

  const spawn = (avoid: number[] = []) => {
    if (!deck.current.length) deck.current = OCEAN_WORDS.map((_, i) => i).sort(() => Math.random() - 0.5)
    const w = OCEAN_WORDS[deck.current.pop()!]
    // pick an x away from the others
    let x = 0.5
    for (let k = 0; k < 12; k++) {
      x = 0.12 + Math.random() * 0.76
      if (avoid.every((a) => Math.abs(a - x) > 0.2)) break
    }
    return { id: nextId.current++, w, x, y: 0.14 + Math.random() * 0.3 }
  }

  /** a fresh sky for the current level */
  const newSet = (): Thing[] => {
    if (level === 3) {
      const n = COUNT_ROUNDS[round.current] ?? 3
      const w = OCEAN_WORDS[Math.floor(Math.random() * OCEAN_WORDS.length)]
      return Array.from({ length: n }, (_, i) => ({ id: nextId.current++, w, x: 0.1 + (0.8 * (i + 0.5)) / n, y: 0.14 + ((i * 37) % 30) / 100 }))
    }
    const a = spawn()
    let b = spawn([a.x])
    while (b.w.en === a.w.en) b = spawn([a.x])
    let d = spawn([a.x, b.x])
    while (d.w.en === a.w.en || d.w.en === b.w.en) d = spawn([a.x, b.x])
    const set = [a, b, d]
    if (level === 2) want.current = set[Math.floor(Math.random() * 3)].w.en
    return set
  }

  // things in the sky at the start
  useEffect(() => {
    if (done) return
    setThings(newSet())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const restY = box.h * WATER - dH * 0.45
  const leap = async (tx: number, ty: number, aimed?: Thing) => {
    let target = aimed
    const el = dolphin.current
    if (!el || busy.current) return
    busy.current = true
    setTapped(true)
    const x0 = restX * box.w
    const dx = tx - x0
    const dy = Math.min(ty - restY, -dSize * 0.9)
    const f = Math.abs(dx) < 4 ? facing : dx > 0 ? 1 : -1
    setFacing(f)
    playPop()
    const r = -38 * f
    const anim = el.animate(
      [
        { transform: 'translate(0px, 0px) rotate(0deg)' },
        { transform: `translate(${dx * 0.25}px, ${dy * 0.78}px) rotate(${r}deg)`, offset: 0.25 },
        { transform: `translate(${dx * 0.5}px, ${dy}px) rotate(0deg)`, offset: 0.5 },
        { transform: `translate(${dx * 0.75}px, ${dy * 0.78}px) rotate(${-r}deg)`, offset: 0.75 },
        { transform: `translate(${dx}px, 0px) rotate(${-r * 1.4}deg)` },
      ],
      { duration: 1100, easing: 'ease-in-out' },
    )
    await wait(520)
    const wrongPick = !!target && level === 2 && target.w.en !== want.current
    if (wrongPick) target = undefined
    if (target && alive.current) {
      playBubble()
      playSparkle()
      setThings((l) => l.filter((t) => t.id !== target.id))
      const pid = nextId.current++
      setPops((p) => [...p, { id: pid, x: target.x * box.w, y: target.y * box.h, t: target.w.en }])
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 1400)
      if (level === 3) void speak(COUNT_WORDS[Math.min(inRound.current, COUNT_WORDS.length - 1)])
      else void speak(target.w.en + '!')
    }
    await anim.finished.catch(() => {})
    if (!alive.current) return
    // keep the new place without a flash: move the element, then drop the animation
    const nx = Math.min(0.92, Math.max(0.08, (x0 + dx) / box.w))
    el.style.left = `${nx * box.w}px`
    anim.cancel()
    setRestX(nx)
    playSplash()
    const did = nextId.current++
    setDrops((d) => [...d, { id: did, x: nx * box.w, y: box.h * WATER }])
    setTimeout(() => setDrops((d) => d.filter((q) => q.id !== did)), 900)
    busy.current = false
    if (wrongPick && aimed) {
      // level 2, wrong thing: it wobbles, Splash asks again
      playBoing()
      setWobble(aimed.id)
      setTimeout(() => setWobble(null), 700)
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current) void speak(catchLine(want.current).en, { interrupt: false })
      return
    }
    if (target) {
      const n = caught + 1
      setCaught(n)
      if (level !== 3 || n % 2 === 0) onStar()
      if (n >= GOAL) {
        playSparkle()
        await wait(700)
        if (alive.current) void onSay(SPLASH_LINES.done.en, SPLASH_LINES.done.vi)
      } else if (level === 1) {
        setTimeout(() => alive.current && setThings((l) => (l.length < Math.min(3, GOAL - n) ? [...l, spawn(l.map((t) => t.x))] : l)), 500)
      } else if (level === 2) {
        await wait(700)
        if (!alive.current) return
        setThings(newSet())
        await wait(300)
        if (alive.current) void speak(catchLine(want.current).en)
      } else {
        inRound.current++
        if (inRound.current >= (COUNT_ROUNDS[round.current] ?? 3)) {
          inRound.current = 0
          round.current++
          await wait(900)
          if (!alive.current) return
          playSparkle()
          void speak(target.w.en + '!')
          await wait(1200)
          if (alive.current) setThings(newSet())
        }
      }
    }
  }

  const bubbles = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: (i * 17 + 5) % 100, d: i * 0.7, s: 6 + (i % 3) * 5 })), [])
  const sky = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 23) % 60, d: (i % 6) * 0.4 })), [])

  return (
    <Screen>
      <TopBar
        onBack={onBack}
        stars={stars}
        middle={
          <div className="flex items-center gap-0.5">
            {Array.from({ length: GOAL }, (_, i) => (
              <span key={i} className={`${c ? 'text-lg' : 'text-3xl'} ${i < caught ? '' : 'opacity-25 grayscale'}`}>
                🐬
              </span>
            ))}
          </div>
        }
      />
      {done ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-3 text-center">
          <Splash size={c ? 150 : 260} cheer />
          <div className={`font-black drop-shadow-[0_0_20px_rgba(56,189,248,0.8)] ${c ? 'text-3xl' : 'text-6xl'}`}>Splash is so happy!</div>
          <div className={`font-semibold text-sky-200 ${c ? 'text-base' : 'text-2xl'}`}>Splash vui quá! Con được {GOAL} ngôi sao ⭐</div>
          <div className="flex gap-3">
            <button onClick={() => { playPop(); round.current = 0; inRound.current = 0; setCaught(0) }} className={`rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
              ▶ AGAIN
            </button>
            <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
              BACK
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={area}
          data-testid="ocean"
          className="relative flex-1 touch-none overflow-hidden"
          onPointerDown={(e) => {
            if (e.target !== e.currentTarget) return
            const r = area.current!.getBoundingClientRect()
            void leap(e.clientX - r.left, Math.min(e.clientY - r.top, restY - dSize))
          }}
        >
          {sky.map((s, i) => (
            <span key={i} className="animate-twinkle pointer-events-none absolute h-1 w-1 rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />
          ))}
          <div className="pointer-events-none absolute right-[6%] top-[6%] h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fefce8,#e2e8f0_45%,#94a3b8)] shadow-[0_0_40px_rgba(255,255,230,0.5)] md:h-24 md:w-24" />

          {/* things to catch */}
          {things.map((t, i) => (
            <button
              key={t.id}
              data-testid="ocean-thing"
              data-word={t.w.en}
              onPointerDown={(e) => {
                e.stopPropagation()
                void leap(t.x * box.w, t.y * box.h, t)
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: t.x * box.w, top: t.y * box.h, minWidth: 64, minHeight: 64 }}
            >
              <span
                className={`${wobble === t.id ? 'animate-wiggle' : 'animate-float'} flex items-center justify-center rounded-full border-2 border-white/50 bg-sky-200/15 shadow-[inset_0_0_18px_rgba(186,230,253,0.5)]`}
                style={{ width: c ? 70 : 108, height: c ? 70 : 108, animationDelay: `${i * 0.5}s`, fontSize: c ? 38 : 60 }}
              >
                {t.w.emoji}
              </span>
              {!tapped && i === 0 && <span className="animate-float pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-4xl">👆</span>}
            </button>
          ))}

          {/* word pops */}
          {pops.map((p) => (
            <div key={p.id} className="animate-word-pop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-4 py-1 font-black text-sky-700 shadow-xl" style={{ left: p.x, top: p.y, fontSize: c ? 20 : 34 }}>
              {p.t}!
            </div>
          ))}

          {/* the ocean */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: `${WATER * 100 - 3}%` }}>
            <svg className="animate-waves-slow absolute left-0 top-0 h-10 w-[200%] opacity-60" viewBox="0 0 1200 60" preserveAspectRatio="none">
              <path d={WAVE} fill="#38bdf8" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 top-5 bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-950" />
            {bubbles.map((b, i) => (
              <span key={i} className="animate-bubble absolute bottom-0 rounded-full border border-white/60 bg-white/10" style={{ left: `${b.x}%`, width: b.s, height: b.s, animationDelay: `${b.d}s` }} />
            ))}
            <span className="animate-fish absolute top-[45%] text-3xl" style={{ animationDelay: '-3s' }}>🐠</span>
            <span className="animate-fish absolute top-[70%] text-2xl" style={{ animationDuration: '22s', animationDelay: '-11s' }}>🐟</span>
            <span className="animate-fish absolute top-[58%] text-4xl opacity-70" style={{ animationDuration: '30s', animationDelay: '-20s' }}>🐳</span>
          </div>

          {/* Splash */}
          <div ref={dolphin} className="pointer-events-none absolute z-10" style={{ left: restX * box.w, top: restY, marginLeft: -dSize / 2, width: dSize }}>
            <div style={{ transform: `scaleX(${facing})` }}>
              <Splash size={dSize} helmet={false} />
            </div>
          </div>
          {/* front wave over Splash's belly */}
          <svg className="animate-waves pointer-events-none absolute left-0 z-20 h-8 w-[200%]" style={{ top: `calc(${WATER * 100}% - 6px)` }} viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d={WAVE} fill="#0ea5e9" opacity="0.9" />
          </svg>

          {drops.map((d) =>
            Array.from({ length: 10 }, (_, k) => (
              <span
                key={`${d.id}-${k}`}
                className="animate-droplet pointer-events-none absolute z-30 rounded-full bg-sky-200"
                style={{ left: d.x, top: d.y, width: 9, height: 9, ['--dx' as string]: `${Math.cos((k / 10) * Math.PI) * 70}px`, ['--dy' as string]: `${-30 - Math.sin((k / 10) * Math.PI) * 70}px` }}
              />
            )),
          )}
        </div>
      )}
    </Screen>
  )
}
