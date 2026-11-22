/**
 * The four Space Guardians missions (the fifth, graduation, is in Graduation.tsx).
 * Kid rules: no timer that can be lost, everything is spoken, wrong taps only wobble.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { LIGHTS, LIGHTS_LINES, METEOR_LINES, OCEAN_LINES, SATELLITE_LINES, SHAPES, TRASH, type ShapeId } from '../data/heroData'
import { PUZZLE_LINES } from '../data/planetsData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { shuffle, wait, type Say } from '../games/ui'
import { playBoing, playBubble, playPop, playPow, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo, Splash } from '../story/Cosmo'
import { CaptainStar, ComicBurst } from './CaptainStar'
import { HeroBar, HeroScreen, MissionComplete, useShieldThrow } from './shared'

interface MissionProps {
  stars: number
  onBack: () => void
  onStar: () => void
  onSay: Say
  onComplete: () => void
}

function useAlive() {
  const alive = useRef(true)
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )
  return alive
}

const center = (el: Element, area: Element) => {
  const r = el.getBoundingClientRect()
  const a = area.getBoundingClientRect()
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 }
}

function Dots({ n, done }: { n: number; done: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`h-3.5 w-3.5 rounded-full ${i < done ? 'bg-amber-400' : 'bg-white/25'}`} />
      ))}
    </div>
  )
}

// ================================================================ 1. meteor storm
const METEOR_ROUNDS = 6
export function MeteorMission({ stars, onBack, onStar, onSay, onComplete }: MissionProps) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const area = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const { throwTo, node } = useShieldThrow()
  const [round, setRound] = useState(0)
  const [want, setWant] = useState<'big' | 'small'>('big')
  const [meteors, setMeteors] = useState<{ id: number; big: boolean; x: number; falling: boolean }[]>([])
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null)
  const [wobble, setWobble] = useState<number | null>(null)
  const [shake, setShake] = useState(0)
  const busy = useRef(false)
  const nid = useRef(1)
  const done = round >= METEOR_ROUNDS

  const newRound = (r: number) => {
    const w = Math.random() < 0.5 ? 'big' : 'small'
    setWant(w)
    const left = Math.random() < 0.5
    const a = { id: nid.current++, big: true, x: left ? 0.3 : 0.7, falling: false }
    const b = { id: nid.current++, big: false, x: left ? 0.72 : 0.32, falling: false }
    setMeteors([a, b])
    requestAnimationFrame(() => requestAnimationFrame(() => setMeteors((m) => m.map((x) => ({ ...x, falling: true })))))
    void speak(w === 'big' ? METEOR_LINES.big.en : METEOR_LINES.small.en, { interrupt: r !== 0 })
  }

  useEffect(() => {
    void (async () => {
      await wait(400)
      await onSay(METEOR_LINES.start.en, METEOR_LINES.start.vi)
      if (alive.current) newRound(0)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = async (m: { id: number; big: boolean }, e: React.PointerEvent) => {
    if (busy.current || !area.current || !hero.current) return
    const ok = m.big === (want === 'big')
    if (!ok) {
      playBoing()
      setWobble(m.id)
      setTimeout(() => setWobble(null), 600)
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current) void speak(want === 'big' ? METEOR_LINES.big.en : METEOR_LINES.small.en, { interrupt: false })
      return
    }
    busy.current = true
    const to = center(e.currentTarget, area.current)
    await throwTo(center(hero.current, area.current), to)
    if (!alive.current) return
    playPow()
    setShake((s) => s + 1)
    setBurst({ id: m.id, ...to })
    setMeteors((l) => l.filter((x) => x.id !== m.id))
    onStar()
    void speak(m.big ? 'BIG!' : 'SMALL!')
    await wait(1100)
    if (!alive.current) return
    setBurst(null)
    busy.current = false
    const r = round + 1
    setRound(r)
    if (r < METEOR_ROUNDS) newRound(r)
    else onComplete()
  }

  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<Dots n={METEOR_ROUNDS} done={round} />} />
      <div ref={area} key={shake} className={`relative flex-1 overflow-hidden ${shake ? 'animate-screen-shake' : ''}`}>
        <div className="pointer-events-none absolute bottom-[-18%] left-1/2 -translate-x-1/2">
          <PlanetBall2D id="earth" size={c ? 220 : 380} />
        </div>
        {meteors.map((m) => (
          <button
            key={m.id}
            data-testid={`meteor-${m.big ? 'big' : 'small'}`}
            onPointerDown={(e) => void tap(m, e)}
            className="absolute -translate-x-1/2"
            style={{
              left: `${m.x * 100}%`,
              top: m.falling ? '52%' : '-14%',
              transition: m.falling ? 'top 9s linear' : 'none',
              minWidth: 64,
              minHeight: 64,
            }}
          >
            <span className={`relative block ${wobble === m.id ? 'animate-wiggle' : ''}`} style={{ fontSize: (m.big ? 2 : 1) * (c ? 44 : 70) }}>
              <span className="absolute -top-[60%] left-1/2 h-[90%] w-[45%] -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-500/80 to-transparent blur-sm" />
              <span className="relative">🪨</span>
            </span>
          </button>
        ))}
        {burst && (
          <div className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: burst.x, top: burst.y }}>
            <ComicBurst text="POW!" size={c ? 110 : 170} />
          </div>
        )}
        <div ref={hero} className="pointer-events-none absolute bottom-[6%] left-[4%]">
          <CaptainStar size={c ? 120 : 210} />
        </div>
        {node(c ? 60 : 96)}
      </div>
      {done && <MissionComplete onBack={onBack} onSay={onSay} sub="Trái Đất an toàn rồi! The Earth is safe!" />}
    </HeroScreen>
  )
}

// ================================================================ 2. save Splash (clean the ocean)
export function OceanMission({ stars, onBack, onStar, onSay, onComplete }: MissionProps) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const [finished, setFinished] = useState(false)
  const finish = () => {
    setFinished(true)
    onComplete()
  }
  const area = useRef<HTMLDivElement>(null)
  const bin = useRef<HTMLDivElement>(null)
  const items = useMemo(() => {
    const trash = [...TRASH, ...TRASH].map((t, i) => ({ id: `t${i}`, kind: 'trash' as const, t, emoji: t.emoji }))
    const fish = ['🐠', '🐟', '🐡'].map((e, i) => ({ id: `f${i}`, kind: 'fish' as const, t: null, emoji: e }))
    const spots = shuffle([
      [0.12, 0.2], [0.3, 0.12], [0.85, 0.18], [0.1, 0.55], [0.88, 0.5], [0.25, 0.78], [0.75, 0.8], [0.55, 0.88], [0.62, 0.1],
    ])
    return shuffle([...trash, ...fish]).map((it, i) => ({ ...it, x: spots[i][0], y: spots[i][1] }))
  }, [])
  const [gone, setGone] = useState<Set<string>>(new Set())
  const [wobble, setWobble] = useState<string | null>(null)
  const lastFish = useRef(0)
  const total = items.filter((i) => i.kind === 'trash').length
  const picked = [...gone].length
  const done = picked >= total

  useEffect(() => {
    const t = setTimeout(() => void onSay(OCEAN_LINES.start.en, OCEAN_LINES.start.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])

  const tap = async (it: (typeof items)[number], e: React.PointerEvent) => {
    if (gone.has(it.id) || !area.current || !bin.current) return
    if (it.kind === 'fish') {
      playBubble()
      setWobble(it.id)
      setTimeout(() => setWobble(null), 600)
      if (Date.now() - lastFish.current > 3000) {
        lastFish.current = Date.now()
        void onSay(OCEAN_LINES.fish.en, OCEAN_LINES.fish.vi)
      }
      return
    }
    playPop()
    const from = center(e.currentTarget, area.current)
    const to = center(bin.current, area.current)
    const el = e.currentTarget as HTMLElement
    el.animate(
      [
        { transform: 'translate(-50%,-50%) translate(0,0) scale(1)' },
        { transform: `translate(-50%,-50%) translate(${(to.x - from.x) / 2}px, ${(to.y - from.y) / 2 - 80}px) scale(1.1)`, offset: 0.5 },
        { transform: `translate(-50%,-50%) translate(${to.x - from.x}px, ${to.y - from.y}px) scale(0.2)` },
      ],
      { duration: 650, easing: 'ease-in', fill: 'forwards' },
    )
    void speak(it.t!.en + '!')
    await wait(650)
    if (!alive.current) return
    playSparkle()
    onStar()
    const next = new Set(gone).add(it.id)
    setGone(next)
    if (next.size >= total) {
      await wait(800)
      if (!alive.current) return
      await onSay(OCEAN_LINES.free.en, OCEAN_LINES.free.vi)
      if (alive.current) finish()
    }
  }

  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<Dots n={total} done={picked} />} />
      <div ref={area} className="relative flex-1 overflow-hidden bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-950">
        {/* Splash in the net */}
        <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
          <div className={done ? 'animate-float' : 'animate-wiggle'} style={{ animationIterationCount: done ? undefined : 'infinite', animationDuration: done ? undefined : '2.4s' }}>
            <Splash size={c ? 150 : 260} cheer={done} />
          </div>
          {!done && (
            <svg className="absolute inset-[-12%] transition-opacity duration-500" style={{ opacity: 1 - picked / total }} viewBox="0 0 100 100" preserveAspectRatio="none">
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i} stroke="#e2e8f0" strokeWidth="1.2" opacity="0.85">
                  <line x1={i * 12.5} y1="0" x2={i * 12.5 - 20} y2="100" />
                  <line x1={i * 12.5 - 20} y1="0" x2={i * 12.5} y2="100" />
                </g>
              ))}
            </svg>
          )}
        </div>
        {items.map((it, i) =>
          gone.has(it.id) ? null : (
            <button
              key={it.id}
              data-testid={it.kind === 'trash' ? 'trash' : 'fish'}
              onPointerDown={(e) => void tap(it, e)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, minWidth: 60, minHeight: 60 }}
            >
              <span className={`block ${wobble === it.id ? 'animate-wiggle' : i % 2 ? 'animate-drift' : 'animate-float'}`} style={{ fontSize: c ? 40 : 64, animationDelay: `${i * 0.3}s` }}>
                {it.emoji}
              </span>
            </button>
          ),
        )}
        <div ref={bin} className="pointer-events-none absolute bottom-3 right-3 flex flex-col items-center rounded-3xl bg-emerald-600/90 p-2 shadow-xl">
          <span className={c ? 'text-4xl' : 'text-6xl'}>♻️</span>
          <span className="text-xs font-black">{picked}/{total}</span>
        </div>
      </div>
      {finished && <MissionComplete onBack={onBack} onSay={onSay} sub="Biển sạch rồi, Splash được tự do! The ocean is clean!" />}
    </HeroScreen>
  )
}

// ================================================================ 3. fix the satellite (shapes)
function Shape({ id, size, fill, stroke, dash }: { id: ShapeId; size: number; fill: string; stroke?: string; dash?: boolean }) {
  const p = { fill, stroke: stroke ?? 'none', strokeWidth: 6, strokeDasharray: dash ? '10 8' : undefined, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {id === 'circle' && <circle cx="50" cy="50" r="40" {...p} />}
      {id === 'square' && <rect x="12" y="12" width="76" height="76" rx="6" {...p} />}
      {id === 'triangle' && <polygon points="50,8 94,88 6,88" {...p} />}
      {id === 'star' && (
        <polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38" {...p} />
      )}
    </svg>
  )
}
const SHAPE_COLOR: Record<ShapeId, string> = { circle: '#f87171', square: '#38bdf8', triangle: '#4ade80', star: '#facc15' }

export function SatelliteMission({ stars, onBack, onStar, onSay, onComplete }: MissionProps) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const [finished, setFinished] = useState(false)
  const finish = () => {
    setFinished(true)
    onComplete()
  }
  const order = useMemo(() => shuffle(SHAPES.map((s) => s.id)), [])
  const tray = useMemo(() => shuffle(SHAPES.map((s) => s.id)), [])
  const [step, setStep] = useState(0)
  const [fixed, setFixed] = useState<ShapeId[]>([])
  const [wobble, setWobble] = useState<ShapeId | null>(null)
  const busy = useRef(false)
  const want = order[step]
  const done = fixed.length >= SHAPES.length
  const findLine = (id: ShapeId) => SHAPES.find((s) => s.id === id)!.find

  useEffect(() => {
    void (async () => {
      await wait(400)
      await onSay(SATELLITE_LINES.start.en, SATELLITE_LINES.start.vi)
      if (alive.current) void onSay(findLine(order[0]).en, findLine(order[0]).vi)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = async (id: ShapeId) => {
    if (busy.current || fixed.includes(id)) return
    if (id !== want) {
      playBoing()
      setWobble(id)
      setTimeout(() => setWobble(null), 600)
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current) void speak(findLine(want).en, { interrupt: false })
      return
    }
    busy.current = true
    playSparkle()
    onStar()
    const nf = [...fixed, id]
    setFixed(nf)
    await speak(SHAPES.find((s) => s.id === id)!.en + '!')
    if (!alive.current) return
    busy.current = false
    if (nf.length >= SHAPES.length) {
      await wait(500)
      await onSay(SATELLITE_LINES.fixed.en, SATELLITE_LINES.fixed.vi)
      if (alive.current) finish()
    } else {
      setStep(step + 1)
      void onSay(findLine(order[step + 1]).en, findLine(order[step + 1]).vi)
    }
  }

  const slot = c ? 54 : 92
  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<Dots n={SHAPES.length} done={fixed.length} />} />
      <div className={`relative flex flex-1 flex-col items-center justify-center overflow-hidden ${c ? 'gap-3' : 'gap-8'}`}>
        <div className="flex items-center">
          {/* solar panels */}
          <div className="h-16 w-20 rounded-md border-2 border-sky-200/60 bg-[repeating-linear-gradient(90deg,#1e3a8a_0_10px,#2563eb_10px_20px)] md:h-28 md:w-40" />
          <div className="relative rounded-3xl border-4 border-slate-300 bg-slate-600 p-3 shadow-2xl md:p-5">
            <div className={`absolute -top-8 left-1/2 h-8 w-1.5 -translate-x-1/2 bg-slate-300 ${done ? '' : ''}`} />
            <div className={`absolute -top-12 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full ${done ? 'animate-glow-ring bg-emerald-400' : 'bg-rose-500'}`} />
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {SHAPES.map((s) => (
                <div key={s.id} className="flex items-center justify-center rounded-xl bg-slate-800/80 p-1">
                  {fixed.includes(s.id) ? (
                    <span className="animate-word-pop">
                      <Shape id={s.id} size={slot} fill={SHAPE_COLOR[s.id]} />
                    </span>
                  ) : (
                    <Shape id={s.id} size={slot} fill="transparent" stroke="#94a3b8" dash />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="h-16 w-20 rounded-md border-2 border-sky-200/60 bg-[repeating-linear-gradient(90deg,#1e3a8a_0_10px,#2563eb_10px_20px)] md:h-28 md:w-40" />
        </div>
        {done && (
          <div className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2">
            <ComicBurst text="ZAP!" size={c ? 100 : 150} color="#67e8f9" />
          </div>
        )}
        <div className={`flex items-end ${c ? 'gap-2' : 'gap-5'}`}>
          <Cosmo size={c ? 60 : 110} fly={false} />
          <div className={`flex ${c ? 'gap-2' : 'gap-4'}`}>
            {tray.map((id) => (
              <button
                key={id}
                data-testid={`shape-${id}`}
                disabled={fixed.includes(id)}
                onClick={() => void pick(id)}
                className={`rounded-2xl border-4 border-white/25 bg-white/10 p-1.5 shadow-lg active:scale-90 disabled:opacity-20 ${wobble === id ? 'animate-wiggle' : ''}`}
              >
                <Shape id={id} size={c ? 52 : 90} fill={SHAPE_COLOR[id]} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {finished && <MissionComplete onBack={onBack} onSay={onSay} sub="Vệ tinh chạy lại rồi! The satellite works!" />}
    </HeroScreen>
  )
}

// ================================================================ 4. Moon base lights (colours)
export function LightsMission({ stars, onBack, onStar, onSay, onComplete }: MissionProps) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const [finished, setFinished] = useState(false)
  const finish = () => {
    setFinished(true)
    onComplete()
  }
  const order = useMemo(() => shuffle(LIGHTS.map((_, i) => i)), [])
  const switches = useMemo(() => shuffle(LIGHTS.map((_, i) => i)), [])
  const [lit, setLit] = useState<number[]>([])
  const [wobble, setWobble] = useState<number | null>(null)
  const busy = useRef(false)
  const want = order[lit.length]
  const done = lit.length >= LIGHTS.length

  useEffect(() => {
    void (async () => {
      await wait(400)
      await onSay(LIGHTS_LINES.start.en, LIGHTS_LINES.start.vi)
      if (alive.current) void onSay(LIGHTS[order[0]].on.en, LIGHTS[order[0]].on.vi)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const press = async (i: number) => {
    if (busy.current || lit.includes(i)) return
    if (i !== want) {
      playBoing()
      setWobble(i)
      setTimeout(() => setWobble(null), 600)
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current) void speak(LIGHTS[want].on.en, { interrupt: false })
      return
    }
    busy.current = true
    playSparkle()
    onStar()
    const nl = [...lit, i]
    setLit(nl)
    await speak(LIGHTS[i].en + '!')
    if (!alive.current) return
    busy.current = false
    if (nl.length >= LIGHTS.length) {
      await wait(400)
      await onSay(LIGHTS_LINES.lit.en, LIGHTS_LINES.lit.vi)
      if (alive.current) finish()
    } else void onSay(LIGHTS[order[nl.length]].on.en, LIGHTS[order[nl.length]].on.vi)
  }

  const dome = c ? 56 : 100
  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<Dots n={LIGHTS.length} done={lit.length} />} />
      <div className={`relative flex flex-1 flex-col items-center justify-end overflow-hidden ${c ? 'gap-3 pb-3' : 'gap-8 pb-8'}`}>
        <div className="pointer-events-none absolute right-[8%] top-[8%]">
          <PlanetBall2D id="earth" size={c ? 60 : 110} />
        </div>
        {/* the base */}
        <div className={`relative flex items-end justify-center ${c ? 'gap-2' : 'gap-5'}`}>
          {LIGHTS.map((l, i) => {
            const on = lit.includes(i) || done
            return (
              <div key={l.en} className="flex flex-col items-center">
                <div
                  className="rounded-t-full border-4 border-slate-300 transition-all duration-700"
                  style={{
                    width: dome,
                    height: dome * 0.7,
                    background: on ? `radial-gradient(circle at 50% 70%, #fff, ${l.color} 55%, ${l.color}88)` : '#334155',
                    boxShadow: on ? `0 0 ${dome * 0.6}px ${l.color}` : 'none',
                  }}
                />
                <div className="h-3 bg-slate-400" style={{ width: dome * 1.1 }} />
              </div>
            )
          })}
        </div>
        <div className="h-4 w-full bg-gradient-to-b from-slate-400 to-slate-600" />
        <div className={`flex items-center ${c ? 'gap-2' : 'gap-5'}`}>
          <CaptainStar size={c ? 80 : 140} cheer={done} />
          {switches.map((i) => (
            <button
              key={i}
              data-testid={`light-${LIGHTS[i].en}`}
              aria-label={LIGHTS[i].en}
              onClick={() => void press(i)}
              className={`rounded-full border-4 shadow-xl active:scale-90 ${lit.includes(i) ? 'border-white' : 'border-white/30'} ${wobble === i ? 'animate-wiggle' : ''}`}
              style={{ width: c ? 52 : 86, height: c ? 52 : 86, background: `radial-gradient(circle at 35% 35%, #fff8, ${LIGHTS[i].color})` }}
            >
              <span className={c ? 'text-xl' : 'text-3xl'}>{lit.includes(i) ? '💡' : ''}</span>
            </button>
          ))}
        </div>
      </div>
      {finished && <MissionComplete onBack={onBack} onSay={onSay} sub="Căn cứ Mặt Trăng sáng rực! The Moon base is bright!" />}
    </HeroScreen>
  )
}
