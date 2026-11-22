/**
 * Rocket lab: build a rocket (colour, fins, pilot) – every choice says its English word –
 * then 3-2-1 BLAST OFF with shaking, smoke, flames and a trip to the Moon, Mars, Saturn or the
 * ocean planet. The design is saved and can be placed in the Space Station.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { loadRocket, ROCKET_COLORS, ROCKET_LINES, ROCKET_PILOTS, saveRocket, type RocketDesign } from '../data/storyData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { Screen, TopBar, wait, type Say } from '../games/ui'
import { playBeep, playPop, playRumble, playSparkle, playWhoosh } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo } from './Cosmo'
import { RocketArt } from './Rocket'
import { FlyGame } from './FlyGame'

type Phase = 'build' | 'count' | 'lift' | 'fly' | 'arrive' | 'game'

export function RocketLab({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const [design, setDesign] = useState<RocketDesign>(loadRocket)
  const [phase, setPhase] = useState<Phase>('build')
  const [count, setCount] = useState<number | null>(null)
  const [trip, setTrip] = useState(() => Math.floor(Math.random() * ROCKET_LINES.trips.length))
  const [smoke, setSmoke] = useState<{ id: number; dx: number; d: number }[]>([])
  const alive = useRef(true)

  useEffect(() => saveRocket(design), [design])
  useEffect(() => {
    alive.current = true
    const t = setTimeout(() => void onSay(ROCKET_LINES.build.en, ROCKET_LINES.build.vi), 450)
    return () => {
      alive.current = false
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])

  const pick = (d: Partial<RocketDesign>, word?: string) => {
    playPop()
    setDesign((x) => ({ ...x, ...d }))
    if (word) void speak(word + '!')
  }

  const launch = async () => {
    if (phase !== 'build') return
    stopSpeaking()
    setPhase('count')
    for (let i = 0; i < 4; i++) {
      if (!alive.current) return
      setCount(i)
      playBeep(i === 3)
      void speak(ROCKET_LINES.count[i].en, { interrupt: false })
      await wait(i === 3 ? 600 : 1000)
    }
    if (!alive.current) return
    setCount(null)
    setPhase('lift')
    playRumble()
    setSmoke(Array.from({ length: 22 }, (_, i) => ({ id: i, dx: (i % 2 ? 1 : -1) * (30 + Math.random() * 140), d: Math.random() * 0.6 })))
    await wait(1100)
    if (!alive.current) return
    setPhase('fly')
    playWhoosh()
    await wait(2300)
    if (!alive.current) return
    setPhase('arrive')
    playSparkle()
    onStar()
    const t = ROCKET_LINES.trips[trip]
    await wait(1200)
    if (alive.current) void onSay(t.en, t.vi)
  }

  const again = () => {
    playPop()
    setSmoke([])
    setTrip((t) => (t + 1) % ROCKET_LINES.trips.length)
    setPhase('build')
  }

  const H = L.h
  const rocketSize = Math.min(c ? H * 0.5 : H * 0.55, c ? 230 : 420)
  const streaks = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: (i * 41) % 100, d: (i % 7) * 0.1, h: 30 + (i % 4) * 30 })), [])
  const dest = ROCKET_LINES.trips[trip].dest
  // the planet we land on: fits the screen and leaves room for the caption + buttons
  const planetD = Math.min(rocketSize * 0.95, L.w * 0.7, L.h * 0.38)

  if (phase === 'game') return <FlyGame trip={trip} stars={stars} onStar={onStar} onSay={onSay} onBack={() => setPhase('build')} />

  // ------------------------------------------------ launch / flight scene
  if (phase !== 'build') {
    const flying = phase === 'fly'
    return (
      <Screen>
        <div data-testid="rocket-scene" className="relative flex-1 overflow-hidden">
          {/* sky gets darker as we climb */}
          <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${flying || phase === 'arrive' ? 'opacity-0' : 'opacity-100'} bg-gradient-to-b from-sky-700 via-sky-500 to-cyan-300`} />
          {(flying || phase === 'arrive') &&
            streaks.map((s, i) => (
              <span key={i} className="animate-star-fall absolute top-0 w-0.5 rounded-full bg-white/80" style={{ left: `${s.x}%`, height: phase === 'arrive' ? 3 : s.h, animationDelay: `${s.d}s`, animationDuration: phase === 'arrive' ? '6s' : '0.6s' }} />
            ))}
          {/* launch pad */}
          <div className={`absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-slate-500 to-slate-800 transition-transform duration-[1500ms] ${flying || phase === 'arrive' ? 'translate-y-full' : ''}`} />

          {/* destination */}
          {phase === 'arrive' && (
            <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
              <div className="animate-word-pop">
                {dest === 'moon' ? (
                  <div className="rounded-full bg-[radial-gradient(circle_at_35%_35%,#fefce8,#e2e8f0_45%,#64748b)] shadow-[0_0_60px_rgba(255,255,230,0.5)]" style={{ width: planetD, height: planetD }} />
                ) : (
                  <PlanetBall2D id={dest} size={planetD} />
                )}
              </div>
            </div>
          )}

          {/* the rocket */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-transform ease-in"
            style={{
              bottom: phase === 'arrive' ? `calc(42% + ${planetD / 2 - 6}px)` : '10%',
              transform: `translateX(-50%) translateY(${flying ? `-${H * 1.4}px` : '0'})`,
              transitionDuration: flying ? '2200ms' : '0ms',
            }}
          >
            <div className={phase === 'lift' || phase === 'count' ? (phase === 'lift' ? 'animate-shake' : '') : phase === 'arrive' ? 'animate-word-pop' : ''}>
              <RocketArt design={design} size={phase === 'arrive' ? rocketSize * 0.5 : rocketSize} flame={phase === 'count' ? 0.3 : phase === 'arrive' ? 0 : 1.2} />
            </div>
          </div>

          {phase === 'lift' &&
            smoke.map((s) => (
              <span
                key={s.id}
                className="animate-smoke absolute bottom-[10%] left-1/2 rounded-full bg-white/80"
                style={{ width: 60, height: 60, marginLeft: -30, animationDelay: `${s.d}s`, ['--dx' as string]: `${s.dx}px` }}
              />
            ))}

          {count !== null && (
            <div key={count} className="animate-count pointer-events-none absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.9)]" style={{ fontSize: count === 3 ? (c ? 54 : 110) : c ? 120 : 220 }}>
              {count === 3 ? 'BLAST OFF!' : 3 - count}
            </div>
          )}

          {phase === 'arrive' && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
              <div className={`rounded-3xl bg-white/95 px-5 py-2 text-center text-slate-900 shadow-2xl ${c ? '' : 'px-8 py-3'}`}>
                <b className={`block font-black ${c ? 'text-xl' : 'text-4xl'}`}>{ROCKET_LINES.trips[trip].en}</b>
                <small className={`font-semibold text-slate-500 ${c ? 'text-xs' : 'text-lg'}`}>{ROCKET_LINES.trips[trip].vi}</small>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  data-testid="fly-it"
                  onClick={() => {
                    playPop()
                    setPhase('game')
                  }}
                  className={`rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-black shadow-xl active:scale-95 ${c ? 'px-4 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}
                >
                  🕹️ FLY IT!
                </button>
                <button data-testid="rocket-again" onClick={again} className={`rounded-full bg-gradient-to-r from-amber-400 to-orange-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
                  🚀 AGAIN
                </button>
                <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
                  BACK
                </button>
              </div>
            </div>
          )}
        </div>
      </Screen>
    )
  }

  // ------------------------------------------------ the builder
  const chip = c ? 48 : 72
  const row = (title: string, children: React.ReactNode) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>{title}</div>
      <div className={`flex flex-wrap justify-center ${c ? 'gap-1.5' : 'gap-3'}`}>{children}</div>
    </div>
  )
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-xl' : 'text-4xl'}`}>Rocket lab 🚀</div>} />
      <div className={`flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3 ${L.portrait ? 'flex-col gap-3' : c ? 'gap-4' : 'gap-12'}`}>
        <div className="relative flex items-end">
          <div className="animate-float">
            <RocketArt design={design} size={L.portrait ? Math.min(H * 0.36, 380) : rocketSize} />
          </div>
          <div className="absolute -left-12 bottom-0 md:-left-20">
            <Cosmo size={c ? 54 : 96} fly={false} />
          </div>
        </div>
        <div className={`flex flex-col items-center ${c ? 'gap-2' : 'gap-5'}`}>
          {row(
            'COLOR · Màu',
            ROCKET_COLORS.map((col, i) => (
              <button
                key={col.en}
                data-testid={`color-${col.en}`}
                aria-label={col.en}
                onClick={() => pick({ color: i }, col.en)}
                className={`rounded-full border-4 shadow-lg active:scale-90 ${design.color === i ? 'scale-110 border-white' : 'border-white/20'}`}
                style={{ width: chip, height: chip, background: `radial-gradient(circle at 35% 35%, ${col.main}, ${col.dark})` }}
              />
            )),
          )}
          {row(
            'FINS · Cánh',
            [0, 1, 2].map((f) => (
              <button
                key={f}
                aria-label={`Fins ${f + 1}`}
                onClick={() => pick({ fins: f })}
                className={`flex items-center justify-center rounded-2xl border-4 bg-white/5 active:scale-90 ${design.fins === f ? 'border-white bg-white/15' : 'border-white/20'}`}
                style={{ width: chip * 1.2, height: chip * 1.2 }}
              >
                <RocketArt design={{ ...design, fins: f }} size={chip} />
              </button>
            )),
          )}
          {row(
            'PILOT · Phi công',
            ROCKET_PILOTS.map((p) => (
              <button
                key={p.id}
                data-testid={`pilot-${p.id}`}
                onClick={() => pick({ pilot: p.id }, p.en)}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 bg-white/5 font-extrabold active:scale-90 ${design.pilot === p.id ? 'border-white bg-white/15' : 'border-white/20'} ${c ? 'text-[10px]' : 'text-sm'}`}
                style={{ width: chip * 1.35, height: chip * 1.2 }}
              >
                <span className={c ? 'text-2xl' : 'text-4xl'}>{p.id === 'robot' ? '🤖' : p.id === 'dolphin' ? '🐬' : '🧑‍🚀'}</span>
                {p.en}
              </button>
            )),
          )}
          <button
            data-testid="launch"
            onClick={() => void launch()}
            className={`animate-breathe mt-1 rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-rose-500 font-black text-white shadow-[0_0_40px_rgba(251,146,60,0.6)] active:scale-95 ${c ? 'px-6 py-2.5 text-xl' : 'px-12 py-5 text-4xl'}`}
          >
            3·2·1 LAUNCH! 🚀
          </button>
          <button
            data-testid="fly-from-lab"
            onClick={() => {
              playPop()
              setPhase('game')
            }}
            className={`rounded-full border-2 border-white/30 bg-gradient-to-r from-cyan-500 to-blue-700 font-black shadow-lg active:scale-95 ${c ? 'px-5 py-2 text-base' : 'px-8 py-3 text-2xl'}`}
          >
            🕹️ FLY & CATCH STARS
          </button>
        </div>
      </div>
    </Screen>
  )
}
