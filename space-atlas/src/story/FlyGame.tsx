/**
 * Rocket flight (level 2 of the Rocket lab): drag anywhere to steer the child's own rocket,
 * catch 12 falling stars, dodge the space rocks (a bump only wobbles – nothing is lost),
 * then land on the planet. It speeds up a little as the stars are caught.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { FLY_LINES } from '../data/moreData'
import { loadRocket, ROCKET_LINES } from '../data/storyData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { BackButton, Screen, type Say } from '../games/ui'
import { playBoing, playBubble, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { RocketArt } from './Rocket'

const GOAL = 12
interface Item {
  id: number
  kind: 'star' | 'rock'
  x: number // 0..1
  y: number // px
}

export function FlyGame({ trip, stars, onBack, onStar, onSay }: { trip: number; stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const area = useRef<HTMLDivElement>(null)
  const design = useMemo(loadRocket, [])
  const [items, setItems] = useState<Item[]>([])
  const [rx, setRx] = useState(0.5)
  const [got, setGot] = useState(0)
  const [bump, setBump] = useState(0)
  const [moved, setMoved] = useState(false)
  const [round, setRound] = useState(0)
  const target = useRef(0.5)
  const state = useRef({ items: [] as Item[], x: 0.5, got: 0, nextId: 1, lastSpawn: 0, lastOops: 0 })
  const done = got >= GOAL
  const dest = ROCKET_LINES.trips[trip % ROCKET_LINES.trips.length]
  const rocketH = c ? 120 : 190

  useEffect(() => {
    const t = setTimeout(() => void onSay(FLY_LINES.start.en, FLY_LINES.start.vi), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay, round])

  // game loop: 30 updates a second is plenty for falling stars, and half the work of 60
  useEffect(() => {
    if (done) return
    const st = state.current
    st.items = []
    st.got = 0
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || t - last < 31) return
      const dt = last ? Math.min((t - last) / 1000, 0.1) : 0.033
      last = t
      const el = area.current
      if (!el) return
      const W = el.clientWidth
      const H = el.clientHeight
      const speed = H * (0.22 + st.got * 0.012)
      // spawn
      if (t - st.lastSpawn > 750 - st.got * 15) {
        st.lastSpawn = t
        st.items.push({ id: st.nextId++, kind: Math.random() < 0.68 ? 'star' : 'rock', x: 0.08 + Math.random() * 0.84, y: -40 })
      }
      // steer towards the finger
      st.x += (target.current - st.x) * Math.min(1, dt * 9)
      const rocketY = H - rocketH * 0.55 - (c ? 24 : 40)
      const keep: Item[] = []
      for (const it of st.items) {
        it.y += speed * dt * (it.kind === 'rock' ? 0.85 : 1)
        const hit = Math.abs(it.x - st.x) * W < (c ? 42 : 60) && Math.abs(it.y - rocketY) < rocketH * 0.45
        if (hit && it.kind === 'star') {
          st.got++
          playBubble()
          if (st.got % 3 === 0) playSparkle()
          onStar()
          setGot(st.got)
          continue
        }
        if (hit && it.kind === 'rock') {
          playBoing()
          setBump((b) => b + 1)
          if (t - st.lastOops > 2500) {
            st.lastOops = t
            void speak(FLY_LINES.oops.en)
          }
          continue
        }
        if (it.y < H + 50) keep.push(it)
      }
      st.items = keep
      setItems([...keep])
      setRx(st.x)
      if (st.got >= GOAL) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [done, onStar, rocketH, c, round])

  useEffect(() => {
    if (!done) return
    playSparkle()
    const t = setTimeout(() => void onSay(dest.en, dest.vi), 900)
    return () => clearTimeout(t)
  }, [done, dest, onSay])

  const steer = (e: React.PointerEvent) => {
    const r = area.current?.getBoundingClientRect()
    if (!r) return
    target.current = Math.min(0.94, Math.max(0.06, (e.clientX - r.left) / r.width))
    if (!moved) setMoved(true)
  }

  const streaks = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ x: (i * 41) % 100, d: (i % 6) * 0.12, h: 20 + (i % 4) * 20 })), [])
  const W = area.current?.clientWidth ?? L.w

  return (
    <Screen>
      <div className={`flex items-center ${c ? 'gap-2 p-2' : 'gap-3 p-3'}`} style={{ paddingTop: `max(${c ? 8 : 12}px, env(safe-area-inset-top))` }}>
        <BackButton onBack={onBack} />
        <div className="mx-auto h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15" style={{ maxWidth: 420 }}>
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 transition-all" style={{ width: `${(got / GOAL) * 100}%` }} />
        </div>
        <div className={`shrink-0 rounded-full bg-amber-400/90 font-black text-slate-900 shadow-lg ${c ? 'px-3 py-1.5 text-base' : 'px-4 py-2 text-xl'}`}>⭐ {stars}</div>
      </div>
      <div ref={area} data-testid="fly-area" className="relative flex-1 touch-none overflow-hidden" onPointerDown={steer} onPointerMove={steer}>
        {!done &&
          streaks.map((s, i) => (
            <span key={i} className="animate-star-fall pointer-events-none absolute top-0 w-0.5 rounded-full bg-white/50" style={{ left: `${s.x}%`, height: s.h, animationDelay: `${s.d}s`, animationDuration: '1.2s' }} />
          ))}
        {items.map((it) => (
          <span key={it.id} data-testid={`fly-${it.kind}`} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: it.x * W, top: it.y, fontSize: c ? 38 : 56 }}>
            {it.kind === 'star' ? '⭐' : '🪨'}
          </span>
        ))}
        {done ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="animate-word-pop">
              {dest.dest === 'moon' ? (
                <div className="rounded-full bg-[radial-gradient(circle_at_35%_35%,#fefce8,#e2e8f0_45%,#64748b)]" style={{ width: c ? 150 : 260, height: c ? 150 : 260 }} />
              ) : (
                <PlanetBall2D id={dest.dest} size={c ? 150 : 260} />
              )}
            </div>
            <div className={`font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${c ? 'text-3xl' : 'text-5xl'}`}>{dest.en}</div>
            <div className={`font-semibold text-sky-200 ${c ? 'text-base' : 'text-xl'}`}>Con bắt được {GOAL} ngôi sao! {dest.vi}</div>
            <div className="flex gap-3">
              <button
                data-testid="fly-again"
                onClick={() => {
                  playPop()
                  setGot(0)
                  setItems([])
                  setRound((r) => r + 1)
                }}
                className={`rounded-full bg-gradient-to-r from-amber-400 to-orange-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}
              >
                🕹️ AGAIN
              </button>
              <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
                BACK
              </button>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute -translate-x-1/2" style={{ left: rx * W, bottom: c ? 24 : 40 }}>
            <div key={bump} className={bump ? 'animate-wiggle' : ''}>
              <RocketArt design={design} size={rocketH} flame={1} />
            </div>
          </div>
        )}
        {!moved && !done && (
          <div className={`pointer-events-none absolute inset-x-0 top-[30%] flex flex-col items-center font-black ${c ? 'text-base' : 'text-2xl'}`}>
            <span className="animate-float text-4xl">👆</span>
            Drag to steer · Kéo để lái tên lửa
          </div>
        )}
      </div>
    </Screen>
  )
}
