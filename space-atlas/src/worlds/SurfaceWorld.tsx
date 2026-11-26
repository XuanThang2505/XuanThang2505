/**
 * Standing on a planet: sky, Sun size, ground (or a floating station on the giant planets),
 * weather, things to tap, a gravity jump with Cosmo, thermometer, day length and passport stamp.
 * Pure SVG/CSS (the 3D scene is paused meanwhile) – smooth and cool on iPad.
 */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { PHOTOS, WORLD_LINES, WORLDS, worldInfo, type WorldId } from '../data/worldsData'
import { BackButton, wait, type Say } from '../games/ui'
import { playBoing, playBubble, playPop, playSparkle, playWhoosh } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo } from '../story/Cosmo'
import { MeAstronaut } from '../me/MeAstronaut'
import { CaptainStar } from '../hero/CaptainStar'
import { passport } from './stores'

const Postcard = lazy(() => import('./Postcard').then((m) => ({ default: m.Postcard })))

function Weather({ kind, c }: { kind: string; c: boolean }) {
  // a handful of CSS particles only (transform/opacity animations = cheap)
  const n = c ? 14 : 22
  const bits = useMemo(() => Array.from({ length: n }, (_, i) => ({ x: (i * 47) % 100, d: (i % 7) * 0.45, s: 0.7 + (i % 3) * 0.3 })), [n])
  if (kind === 'none' || kind === 'clouds') return null
  if (kind === 'storm')
    return <div className="animate-lightning pointer-events-none absolute left-[20%] top-[30%] h-40 w-40 rounded-full bg-yellow-100/0" />
  const glyph: Record<string, string> = { dust: '•', rain: '💧', ice: '❄️', wind: '〰️', diamonds: '💎', acid: '•' }
  const color: Record<string, string> = { dust: '#fdba74', acid: '#fde047' }
  return (
    <>
      {bits.map((b, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute top-0 ${kind === 'dust' || kind === 'wind' ? 'animate-blow' : 'animate-fall'}`}
          style={{ left: `${b.x}%`, animationDelay: `${b.d}s`, fontSize: (kind === 'dust' || kind === 'acid' ? 28 : 18) * b.s, color: color[kind], opacity: kind === 'diamonds' ? 0.9 : 0.75 }}
        >
          {glyph[kind]}
        </span>
      ))}
    </>
  )
}

function Thermometer({ t, c }: { t: number; c: boolean }) {
  const pct = Math.max(0.04, Math.min(1, (t + 220) / 700))
  const hot = t > 60
  const cold = t < -20
  return (
    <div className={`flex items-center gap-1.5 rounded-2xl bg-slate-900/80 ${c ? 'px-2 py-1' : 'px-3 py-2'}`}>
      <div className="relative h-12 w-4 overflow-hidden rounded-full border-2 border-white/70 bg-white/20 md:h-16">
        <div className={`absolute inset-x-0 bottom-0 ${hot ? 'bg-red-500' : cold ? 'bg-sky-400' : 'bg-emerald-400'}`} style={{ height: `${pct * 100}%` }} />
      </div>
      <div>
        <b className={`block font-black ${c ? 'text-lg' : 'text-2xl'}`}>{t > 0 ? '+' : ''}{t}°C</b>
        <small className={`block font-bold ${hot ? 'text-red-300' : cold ? 'text-sky-200' : 'text-emerald-200'} ${c ? 'text-[10px]' : 'text-xs'}`}>
          {hot ? '🔥 HOT · Nóng' : cold ? '🥶 COLD · Lạnh' : '😊 NICE · Dễ chịu'}
        </small>
      </div>
    </div>
  )
}

export function SurfaceWorld({ id, onBack, onStar, onSay }: { id: WorldId; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const w = WORLDS[id]
  const planet = worldInfo(id)
  const photos = PHOTOS[id] ?? []
  const [photo, setPhoto] = useState<number | null>(null)
  const cosmo = useRef<HTMLDivElement>(null)
  const [card, setCard] = useState<(typeof w.features)[number] | null>(null)
  const [stamp, setStamp] = useState(false)
  const [tv, setTv] = useState(false)
  const [post, setPost] = useState(false)
  const [jumping, setJumping] = useState(false)
  const alive = useRef(true)
  const giant = !w.ground
  const [info, setInfo] = useState(!c)
  /**
   * Keep tappable things out from under the panels: the facts column (left) and the action
   * buttons (right) cover the upper part of the screen; the ground is free.
   */
  const place = (x: number, y: number) => {
    if (y >= 0.6) return { x: 0.08 + x * 0.84, y }
    const left = info ? (c ? 0.42 : 0.3) : 0.06
    const right = c ? 0.32 : 0.17
    return { x: left + x * (1 - left - right), y: Math.max(y, c ? 0.22 : 0.15) }
  }

  useEffect(() => {
    alive.current = true
    playWhoosh()
    void (async () => {
      await wait(900)
      if (!alive.current) return
      await onSay(w.hello.en, w.hello.vi)
      if (giant && alive.current) await onSay(WORLD_LINES.noGround.en, WORLD_LINES.noGround.vi)
      if (!alive.current) return
      if (!passport.get().stamps.includes(id)) {
        passport.set({ stamps: [...passport.get().stamps, id] })
        setStamp(true)
        playSparkle()
        onStar()
        void onSay(WORLD_LINES.stamp.en, WORLD_LINES.stamp.vi)
        setTimeout(() => alive.current && setStamp(false), 3500)
      }
    })()
    return () => {
      alive.current = false
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  /** Jump height follows real gravity: 1/g (capped so Cosmo stays on screen). */
  const jump = async () => {
    const el = cosmo.current
    if (!el || jumping) return
    setJumping(true)
    playBoing()
    void speak(WORLD_LINES.jump.en)
    const h = Math.min(L.h * 0.55, (c ? 70 : 110) / w.gravity)
    const dur = Math.min(3200, 700 * Math.sqrt(1 / w.gravity) + 200)
    const a = el.animate(
      [
        { transform: 'translateY(0) scaleY(0.9)' },
        { transform: `translateY(${-h}px) scaleY(1.05)`, offset: 0.5, easing: 'ease-in' },
        { transform: 'translateY(0) scaleY(0.92)' },
      ],
      { duration: dur, easing: 'ease-out' },
    )
    await a.finished.catch(() => {})
    if (!alive.current) return
    setJumping(false)
    if (w.gravity < 0.6) void onSay(WORLD_LINES.floaty.en, WORLD_LINES.floaty.vi)
    else if (w.gravity > 1.5) void onSay(WORLD_LINES.heavy.en, WORLD_LINES.heavy.vi)
  }

  const tapFeature = (f: (typeof w.features)[number]) => {
    playBubble()
    void speak(f.en + '!')
    setCard(f)
  }

  const sun = (c ? 70 : 120) * Math.max(0.25, Math.sqrt(w.sunScale))
  return (
    <div data-testid="surface" className="absolute inset-0 z-30 overflow-hidden font-nunito text-white" style={{ background: `linear-gradient(180deg, ${w.sky[0]}, ${w.sky[1]})` }}>
      {/* Sun: its size shows how near or far the planet is */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          right: '12%',
          top: '9%',
          width: sun,
          height: sun,
          background: 'radial-gradient(circle, #fffbe6 0%, #fde047 45%, #f59e0b 100%)',
          boxShadow: `0 0 ${sun * 0.8}px ${sun * 0.25}px rgba(253,224,71,0.55)`,
          opacity: id === 'venus' ? 0.45 : 1,
        }}
      />
      {/* Saturn's rings arching across the sky */}
      {id === 'saturn' && (
        <div className="pointer-events-none absolute left-[-20%] right-[-20%] top-[14%] h-[60%] rounded-[50%] border-t-[18px] border-amber-100/60" style={{ boxShadow: 'inset 0 14px 0 -4px rgba(253,230,138,0.35)' }} />
      )}
      {/* Uranus: the Sun goes round in a circle (it lies on its side) */}
      {id === 'uranus' && <div className="pointer-events-none absolute right-[9%] top-[5%] h-36 w-36 rounded-full border-2 border-dashed border-white/40 md:h-52 md:w-52" />}
      {w.skyThings.map((s, i) => (
        <span key={i} className="pointer-events-none absolute" style={{ left: `${place(s.x, s.y).x * 100}%`, top: `${place(s.x, s.y).y * 100}%`, fontSize: (c ? 44 : 70) * s.size }}>
          {s.emoji}
        </span>
      ))}
      {/* cloud bands for the giants, the yellow haze of Venus */}
      {(giant || id === 'venus') && (
        <div className="animate-drift pointer-events-none absolute inset-x-[-10%] top-[45%] h-[40%] opacity-70" style={{ background: `repeating-linear-gradient(175deg, ${w.sky[0]}55 0 22px, transparent 22px 60px)` }} />
      )}
      <Weather kind={w.weather} c={c} />

      {/* ground or floating station */}
      {w.ground ? (
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={w.ground[0]} />
              <stop offset="1" stopColor={w.ground[1]} />
            </linearGradient>
          </defs>
          <path d="M0 30 C 60 10, 110 40, 170 26 C 230 12, 290 38, 340 22 C 370 14, 390 20, 400 24 V100 H0 Z" fill={`url(#g-${id})`} />
          {id === 'mercury' && (
            <g fill="#374151" opacity="0.6">
              <ellipse cx="80" cy="60" rx="26" ry="7" />
              <ellipse cx="250" cy="75" rx="34" ry="8" />
              <ellipse cx="350" cy="55" rx="16" ry="5" />
            </g>
          )}
          {id === 'earth' && <path d="M300 40 C 330 36, 370 40, 400 38 V100 H280 Z" fill="#0ea5e9" />}
        </svg>
      ) : (
        <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-6 w-[min(60vw,420px)] -translate-x-1/2 rounded-full border-4 border-slate-300 bg-slate-500 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute -bottom-10 left-1/2 h-10 w-3 -translate-x-1/2 bg-slate-400" />
          <div className="animate-flame absolute -bottom-16 left-1/2 h-8 w-6 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200 to-orange-500" />
        </div>
      )}

      {/* things to tap */}
      {w.features.map((f) => {
        const pos = place(f.x, f.y)
        const rover = f.en === 'ROVER'
        return (
          <button
            key={f.en}
            data-testid={`feature-${f.en}`}
            onClick={() => tapFeature(f)}
            className={`absolute -translate-y-1/2 active:scale-90 ${rover ? 'animate-rover left-0' : '-translate-x-1/2'}`}
            style={{ left: rover ? 0 : `${pos.x * 100}%`, top: `${pos.y * 100}%`, fontSize: c ? 44 : 72, minWidth: 56, minHeight: 56 }}
          >
            <span className={`block ${rover ? '' : 'animate-float'}`}>{f.emoji}</span>
          </button>
        )
      })}
      {id === 'earth' && (
        <div className="animate-swim pointer-events-none absolute bottom-[6%] right-[6%] text-5xl md:text-7xl">🐬</div>
      )}

      {/* Cosmo stands here – tap to jump */}
      <button
        data-testid="jump"
        onClick={() => void jump()}
        className="absolute left-[34%] -translate-x-1/2"
        style={{ bottom: giant ? 'calc(8% + 22px)' : '20%' }}
        aria-label="Jump"
      >
        <div ref={cosmo}>
          <MeAstronaut size={c ? 110 : 180} float={false} />
        </div>
      </button>
      {/* Cosmo keeps the child company */}
      <div className="pointer-events-none absolute left-[52%]" style={{ bottom: giant ? 'calc(8% + 22px)' : '20%' }}>
        <Cosmo size={c ? 56 : 90} fly={giant} />
      </div>

      {/* top bar */}
      <div className={`absolute inset-x-0 top-0 flex items-start ${c ? 'gap-2 p-2' : 'gap-3 p-3'}`} style={{ paddingTop: `max(${c ? 8 : 12}px, env(safe-area-inset-top))`, paddingLeft: 'max(8px, env(safe-area-inset-left))' }}>
        <BackButton onBack={onBack} label="SPACE" />
        <div className={`rounded-2xl bg-slate-900/80 font-black ${c ? 'px-3 py-1 text-base' : 'px-5 py-2 text-3xl'}`}>
          {planet.englishName}
          <small className={`block font-bold text-sky-200 ${c ? 'text-[10px]' : 'text-sm'}`}>{planet.vietnameseName}</small>
        </div>
      </div>

      {/* facts column (folds into one button on phones) */}
      {c && (
        <button data-testid="world-info" onClick={() => (playPop(), setInfo(!info))} className="absolute left-2 top-[64px] rounded-full bg-slate-900/85 px-3 text-xs font-black shadow-lg" style={{ minHeight: 44, paddingLeft: 'max(12px, env(safe-area-inset-left))' }}>
          🌡️ {w.tempC}°C · ℹ️ {info ? '▲' : '▼'}
        </button>
      )}
      {info && (
      <div className={`absolute left-2 flex flex-col ${c ? 'top-[116px] gap-1.5' : 'top-24 gap-3'}`} style={{ paddingLeft: 'env(safe-area-inset-left)' }}>
        <Thermometer t={w.tempC} c={c} />
        <div className={`rounded-2xl bg-slate-900/80 ${c ? 'px-2 py-1' : 'px-3 py-2'}`}>
          <b className={`block font-black ${c ? 'text-xs' : 'text-base'}`}>🕐 1 day: {w.day.en}</b>
          <small className={`block font-semibold text-sky-200 ${c ? 'text-[10px]' : 'text-xs'}`}>{w.day.vi}</small>
          <b className={`mt-1 block font-black ${c ? 'text-xs' : 'text-base'}`}>📅 1 year: {w.year.en}</b>
          <small className={`block font-semibold text-sky-200 ${c ? 'text-[10px]' : 'text-xs'}`}>{w.year.vi}</small>
        </div>
        <div className={`rounded-2xl bg-slate-900/80 ${c ? 'px-2 py-1' : 'px-3 py-2'}`}>
          <b className={`block font-black ${c ? 'text-xs' : 'text-base'}`}>🦘 Gravity ×{w.gravity}</b>
          <small className={`block font-semibold text-sky-200 ${c ? 'text-[10px]' : 'text-xs'}`}>{w.gravity < 0.6 ? 'Nhảy cao hơn Trái Đất!' : w.gravity > 1.5 ? 'Nặng hơn, khó nhảy!' : 'Gần giống Trái Đất'}</small>
        </div>
      </div>
      )}

      {/* action buttons */}
      <div className={`absolute right-2 flex flex-col items-end ${c ? 'top-[56px] gap-1.5' : 'top-24 gap-3'}`} style={{ paddingRight: 'env(safe-area-inset-right)' }}>
        {[
          { k: 'jump', icon: '🦘', en: 'JUMP', on: () => void jump() },
          { k: 'tv', icon: '📺', en: 'WEATHER', on: () => { playPop(); setTv(true); void onSay(w.report.en, w.report.vi) } },
          { k: 'post', icon: '📮', en: 'POSTCARD', on: () => { playPop(); setPost(true) } },
          ...(photos.length ? [{ k: 'photo', icon: '📷', en: 'REAL PHOTO', on: () => { playSparkle(); setPhoto(0); void onSay(WORLD_LINES.realPhoto.en, WORLD_LINES.realPhoto.vi) } }] : []),
        ].map((b) => (
          <button key={b.k} data-testid={`world-${b.k}`} onClick={b.on} className={`flex items-center gap-1.5 rounded-full bg-slate-900/85 font-black shadow-lg active:scale-90 ${c ? 'px-3 text-xs' : 'px-4 py-1 text-base'}`} style={{ minHeight: 44 }}>
            <span className={c ? 'text-xl' : 'text-2xl'}>{b.icon}</span>
            {b.en}
          </button>
        ))}
      </div>

      {card && (
        <button onClick={() => setCard(null)} data-testid="world-card" className={`animate-word-pop absolute inset-x-3 bottom-3 mx-auto flex max-w-xl items-center rounded-3xl bg-white/95 text-left text-slate-900 shadow-2xl ${c ? 'gap-2 p-2' : 'gap-4 p-4'}`}>
          <span className={c ? 'text-5xl' : 'text-7xl'}>{card.emoji}</span>
          <span>
            <b className={`block font-black ${c ? 'text-xl' : 'text-3xl'}`}>{card.en}</b>
            <span className={`block font-bold text-sky-700 ${c ? 'text-sm' : 'text-lg'}`}>{card.vi}</span>
            <span className={`block font-semibold text-slate-600 ${c ? 'text-xs' : 'text-base'}`}>{card.fact}</span>
          </span>
        </button>
      )}

      {stamp && (
        <div className="animate-word-pop pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 rotate-[-12deg] rounded-2xl border-[6px] border-rose-500 bg-white/90 px-6 py-3 text-center font-black text-rose-600 shadow-2xl">
          <div className={c ? 'text-2xl' : 'text-4xl'}>VISITED ✓</div>
          <div className={c ? 'text-base' : 'text-xl'}>{planet.englishName}</div>
        </div>
      )}

      {tv && (
        <button onClick={() => setTv(false)} data-testid="weather-tv" className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className={`animate-word-pop relative rounded-[2rem] border-[10px] border-slate-700 bg-gradient-to-b from-sky-700 to-blue-950 shadow-2xl ${c ? 'w-[92vw] p-3' : 'w-[640px] p-6'}`}>
            <div className="absolute -top-4 left-4 rounded-md bg-rose-600 px-3 py-0.5 text-sm font-black">● SPACE WEATHER</div>
            <div className="flex items-center gap-4">
              <CaptainStar size={c ? 110 : 180} />
              <div className="text-left">
                <div className={`font-black ${c ? 'text-base' : 'text-2xl'}`}>{w.report.en}</div>
                <div className={`mt-1 font-semibold text-sky-200 ${c ? 'text-xs' : 'text-base'}`}>{w.report.vi}</div>
                <div className="mt-2 flex gap-3 text-3xl md:text-5xl">
                  <span>{w.tempC > 60 ? '🔥' : w.tempC < -20 ? '🥶' : '🌤️'}</span>
                  <span>{{ none: '☀️', dust: '🌪️', rain: '🌦️', clouds: '☁️', storm: '⛈️', ice: '❄️', wind: '💨', diamonds: '💎', acid: '☁️' }[w.weather]}</span>
                  <b className="text-2xl md:text-4xl">{w.tempC}°C</b>
                </div>
              </div>
            </div>
          </div>
        </button>
      )}

      {photo !== null && photos[photo] && (
        <div data-testid="real-photo" className="absolute inset-0 z-50 overflow-hidden bg-black" onClick={() => setPhoto(null)}>
          <img src={photos[photo].file} alt={photos[photo].en} className="animate-kenburns absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-x-3 bottom-3 mx-auto max-w-2xl rounded-3xl bg-black/70 text-left ${c ? 'p-2' : 'p-4'}`}>
            <div className={`font-black ${c ? 'text-base' : 'text-2xl'}`}>📷 {photos[photo].en}</div>
            <div className={`font-semibold text-sky-200 ${c ? 'text-xs' : 'text-lg'}`}>{photos[photo].vi}</div>
            <div className="mt-1 text-[10px] font-semibold text-white/60">{photos[photo].credit}</div>
          </div>
          <div className="absolute right-3 top-3 flex gap-2" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            {photos.length > 1 && (
              <button
                data-testid="photo-next"
                onClick={(e) => {
                  e.stopPropagation()
                  playPop()
                  setPhoto((photo + 1) % photos.length)
                }}
                className="rounded-full bg-white/90 px-4 font-black text-slate-900"
                style={{ minHeight: 48 }}
              >
                ▶ NEXT
              </button>
            )}
            <button className="rounded-full bg-slate-800/90 px-4 font-black" style={{ minHeight: 48 }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {post && (
        <Suspense fallback={null}>
          <Postcard id={id} onClose={() => setPost(false)} onSay={onSay} />
        </Suspense>
      )}
    </div>
  )
}
