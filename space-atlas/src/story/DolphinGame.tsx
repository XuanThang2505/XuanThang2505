/**
 * Splash's ocean: an ocean under the stars. Tap something in the sky and Splash the dolphin leaps
 * out of the water to catch it – every catch says an English word (BUBBLE, FISH, WHALE…).
 * No timer, no losing: tapping anywhere makes Splash jump.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { OCEAN_WORDS, SPLASH_LINES } from '../data/storyData'
import { Screen, TopBar, wait, type Say } from '../games/ui'
import { playBubble, playPop, playSparkle, playSplash } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Splash } from './Cosmo'

const GOAL = 8
const WATER = 0.66 // water surface, fraction of the play area's height

interface Thing {
  id: number
  w: (typeof OCEAN_WORDS)[number]
  x: number // 0..1
  y: number // 0..1 (sky part)
}

const WAVE = 'M0 30 ' + Array.from({ length: 8 }, (_, i) => `Q ${i * 150 + 75} ${i % 2 ? 58 : 2} ${(i + 1) * 150} 30`).join(' ') + ' V60 H0 Z'

export function DolphinGame({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
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
  const done = caught >= GOAL
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
    const t = setTimeout(() => void onSay(SPLASH_LINES.tap.en, SPLASH_LINES.tap.vi), 500)
    return () => {
      alive.current = false
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])

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

  // three things in the sky at the start
  useEffect(() => {
    if (done) return
    const a = spawn()
    const b = spawn([a.x])
    const d = spawn([a.x, b.x])
    setThings([a, b, d])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const restY = box.h * WATER - dH * 0.45
  const leap = async (tx: number, ty: number, target?: Thing) => {
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
    if (target && alive.current) {
      playBubble()
      playSparkle()
      setThings((l) => l.filter((t) => t.id !== target.id))
      const pid = nextId.current++
      setPops((p) => [...p, { id: pid, x: target.x * box.w, y: target.y * box.h, t: target.w.en }])
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 1400)
      void speak(target.w.en + '!')
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
    if (target) {
      const n = caught + 1
      setCaught(n)
      onStar()
      if (n >= GOAL) {
        playSparkle()
        await wait(700)
        if (alive.current) void onSay(SPLASH_LINES.done.en, SPLASH_LINES.done.vi)
      } else {
        setTimeout(() => alive.current && setThings((l) => (l.length < Math.min(3, GOAL - n) ? [...l, spawn(l.map((t) => t.x))] : l)), 500)
      }
    }
  }

  const bubbles = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: (i * 17 + 5) % 100, d: i * 0.7, s: 6 + (i % 3) * 5 })), [])
  const sky = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 23) % 60, d: (i % 6) * 0.4 })), [])

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
            <button onClick={() => { playPop(); setCaught(0) }} className={`rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
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
                className="animate-float flex items-center justify-center rounded-full border-2 border-white/50 bg-sky-200/15 shadow-[inset_0_0_18px_rgba(186,230,253,0.5)]"
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
