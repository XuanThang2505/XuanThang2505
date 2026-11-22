/**
 * "My space station" – a calm, open-ended sandbox (no goals, no losing, nothing to finish).
 * Everything the child earns can be placed here: stickers, the planets saved in the story,
 * crystals and Cosmo. Drag to move, tap to hear the name, bin to remove. Saved on the device.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { PLANET_MAP, STICKERS, type PlanetId } from '../data/planetsData'
import { loadRocket, loadStory, STATION_LINES, STORY_PLANETS } from '../data/storyData'
import { RocketArt } from './Rocket'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { stickersUnlocked } from '../games/StickerBook'
import { Screen, TopBar, type Say } from '../games/ui'
import { playPop, playSparkle } from '../utils/soundEffects'
import { speak } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo, Crystal, Splash } from './Cosmo'

interface Item {
  id: number
  kind: 'sticker' | 'planet' | 'crystal' | 'cosmo' | 'splash' | 'rocket'
  key: string
  x: number
  y: number
}

const KEY = 'space-atlas-station'
function load(): Item[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function Station({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const [items, setItems] = useState<Item[]>(load)
  const [sel, setSel] = useState<number | null>(null)
  const area = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; moved: boolean; sx: number; sy: number } | null>(null)
  const nextId = useRef(items.reduce((m, i) => Math.max(m, i.id), 0) + 1)
  const story = useMemo(loadStory, [])
  const rocket = useMemo(loadRocket, [])
  const unlocked = stickersUnlocked(stars)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* private mode */
    }
  }, [items])
  useEffect(() => {
    const t = setTimeout(() => void onSay(STATION_LINES.title.en, STATION_LINES.title.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])

  const tray: { kind: Item['kind']; key: string; label: string }[] = [
    { kind: 'cosmo', key: 'cosmo', label: 'Cosmo' },
    { kind: 'splash', key: 'splash', label: 'Splash' },
    { kind: 'rocket', key: 'rocket', label: 'MY ROCKET' },
    { kind: 'crystal', key: 'crystal', label: 'STAR' },
    ...STORY_PLANETS.slice(0, story.done).map((p) => ({ kind: 'planet' as const, key: p, label: PLANET_MAP[p].englishName })),
    ...STICKERS.slice(0, unlocked).map((s) => ({ kind: 'sticker' as const, key: s.en, label: s.en })),
  ]

  const nameOf = (it: Item) => (it.kind === 'planet' ? PLANET_MAP[it.key as PlanetId].englishName : it.kind === 'sticker' ? it.key : it.kind === 'cosmo' ? 'ROBOT' : it.kind === 'splash' ? 'DOLPHIN' : it.kind === 'rocket' ? 'ROCKET' : 'STAR')

  const add = (t: (typeof tray)[number]) => {
    playPop()
    const it: Item = { id: nextId.current++, kind: t.kind, key: t.key, x: 20 + Math.random() * 60, y: 18 + Math.random() * 45 }
    setItems((l) => [...l, it])
    setSel(it.id)
    void speak(nameOf(it) + '!')
  }

  const down = (e: React.PointerEvent, it: Item) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { id: it.id, moved: false, sx: e.clientX, sy: e.clientY }
    // bring to front
    setItems((l) => [...l.filter((x) => x.id !== it.id), it])
  }
  const move = (e: React.PointerEvent) => {
    const d = drag.current
    const r = area.current?.getBoundingClientRect()
    if (!d || !r) return
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 8) d.moved = true
    if (!d.moved) return
    const x = Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.min(94, Math.max(6, ((e.clientY - r.top) / r.height) * 100))
    setItems((l) => l.map((i) => (i.id === d.id ? { ...i, x, y } : i)))
  }
  const up = (it: Item) => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) {
      setSel(it.id)
      playSparkle()
      void speak(nameOf(it) + '!')
    }
  }

  const size = c ? 56 : 96
  const sky = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 29) % 70, d: (i % 7) * 0.5, s: 2 + (i % 3) })), [])

  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-xl' : 'text-4xl'}`}>My space station 🛰️</div>} />
      <div ref={area} data-testid="station-area" className="relative flex-1 overflow-hidden touch-none" onPointerDown={(e) => e.target === e.currentTarget && setSel(null)}>
        {sky.map((s, i) => (
          <span key={i} className="animate-twinkle pointer-events-none absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
        {/* the station floor + window dome */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] rounded-t-[50%/40%] border-t-4 border-sky-300/40 bg-gradient-to-b from-slate-600 to-slate-800" />
        <div className="pointer-events-none absolute bottom-[18%] left-1/2 h-[34%] w-[72%] -translate-x-1/2 rounded-t-full border-4 border-sky-200/30 bg-sky-300/5" />
        {items.length === 0 && (
          <div className={`pointer-events-none absolute inset-x-0 top-[30%] text-center font-extrabold text-sky-100/80 ${c ? 'text-base' : 'text-2xl'}`}>
            Tap something below! 👇
            <small className="block text-sm font-semibold">Chạm vào đồ vật bên dưới để đặt vào trạm</small>
          </div>
        )}
        {items.map((it, i) => (
          <div
            key={it.id}
            data-testid="station-item"
            onPointerDown={(e) => down(e, it)}
            onPointerMove={move}
            onPointerUp={() => up(it)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none ${sel === it.id ? 'z-20' : ''}`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
          >
            <div className="animate-float" style={{ animationDelay: `${(i % 5) * 0.4}s` }}>
              {it.kind === 'planet' ? (
                <PlanetBall2D id={it.key as PlanetId} size={size} />
              ) : it.kind === 'crystal' ? (
                <Crystal size={size * 0.8} />
              ) : it.kind === 'cosmo' ? (
                <Cosmo size={size * 1.2} />
              ) : it.kind === 'splash' ? (
                <Splash size={size * 1.4} />
              ) : it.kind === 'rocket' ? (
                <RocketArt design={rocket} size={size * 1.8} flame={0.5} />
              ) : (
                <span style={{ fontSize: size * 0.8 }}>{STICKERS.find((s) => s.en === it.key)?.emoji}</span>
              )}
            </div>
            {sel === it.id && (
              <button
                aria-label="Remove"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  playPop()
                  setItems((l) => l.filter((x) => x.id !== it.id))
                  setSel(null)
                }}
                className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-xl shadow-lg active:scale-90"
              >
                🗑
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 gap-2 overflow-x-auto bg-slate-900/80 p-2 no-scrollbar" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {tray.map((t) => (
          <button
            key={t.kind + t.key}
            data-testid={`tray-${t.key}`}
            onClick={() => add(t)}
            style={{ minWidth: c ? 60 : 88, minHeight: c ? 60 : 88 }}
            className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-indigo-500/30 px-2 active:scale-90"
          >
            <span className="flex items-center justify-center" style={{ height: c ? 34 : 52 }}>
              {t.kind === 'planet' ? <PlanetBall2D id={t.key as PlanetId} size={c ? 32 : 48} /> : t.kind === 'crystal' ? <Crystal size={c ? 32 : 48} /> : t.kind === 'cosmo' ? <Cosmo size={c ? 30 : 46} wave={false} fly={false} /> : t.kind === 'splash' ? <Splash size={c ? 44 : 66} swim={false} /> : t.kind === 'rocket' ? <RocketArt design={rocket} size={c ? 34 : 52} /> : <span className={c ? 'text-3xl' : 'text-5xl'}>{STICKERS.find((s) => s.en === t.key)?.emoji}</span>}
            </span>
            <span className={`font-extrabold ${c ? 'text-[10px]' : 'text-xs'}`}>{t.label}</span>
          </button>
        ))}
        {items.length > 0 && (
          <button
            onClick={() => {
              playPop()
              setItems([])
              setSel(null)
            }}
            style={{ minWidth: c ? 60 : 88, minHeight: c ? 60 : 88 }}
            className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-500/20 px-2 active:scale-90"
          >
            <span className="text-2xl">🧹</span>
            <span className={`font-extrabold ${c ? 'text-[10px]' : 'text-xs'}`}>CLEAR</span>
          </button>
        )}
      </div>
    </Screen>
  )
}
