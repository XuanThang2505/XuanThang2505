/**
 * Puzzle level 1 – "Put planets home" (ages 3+).
 *
 * The Sun sits on the left with eight orbits. Each orbit shows the dark "shadow" of its planet.
 * The child drags planets from the tray into their shadows.
 *
 * Kid rules: no losing, no timer, no reading needed (everything is spoken), big pieces that
 * snap in when dropped close, pieces can never leave the screen, and a wrong drop simply
 * floats back to the tray. Finishing makes all planets spin round the Sun as a reward.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PLANET_MAP, PLANET_ORDER, PUZZLE_LINES, type PlanetId } from '../data/planetsData'
import { playBoing, playPop, playSparkle } from '../utils/soundEffects'
import { useLayout } from '../utils/useLayout'
import { PlanetBall2D } from './PlanetBall2D'
import { topBarHeight } from './ui'

type Pid = Exclude<PlanetId, 'sun'>

/** Piece diameter as a share of screen height (not to scale – big enough for small fingers). */
const SIZE: Record<Pid, number> = {
  mercury: 0.07,
  venus: 0.09,
  earth: 0.095,
  mars: 0.08,
  jupiter: 0.16,
  saturn: 0.13,
  uranus: 0.11,
  neptune: 0.105,
}
/** Vertical spread of the shadows along their orbits (-1 top … 1 bottom). */
const SPREAD = [-0.55, 0.6, -0.85, 0.35, -0.6, 0.75, -0.35, 0.5]

function shuffled<T>(a: T[]) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

interface Drag {
  id: Pid
  pointerId: number
  x: number
  y: number
  startX: number
  startY: number
  moved: boolean
}

export function PlanetsHome({
  onExit,
  onSay,
  onWin,
}: {
  onExit: (to3D: boolean) => void
  onSay: (en: string, vi?: string) => void
  /** called once per finished round (the hub gives 3 stars) */
  onWin?: () => void
}) {
  const { w, h, compact, portrait } = useLayout()
  /** reference length for sizes: the screen height, or (upright) about the width */
  const unit = portrait ? Math.min(w * 0.9, h * 0.55) : h
  /** a piece is never smaller than a fingertip */
  const minPiece = compact ? 48 : 40
  const pieceSize = useCallback((id: Pid) => Math.max(SIZE[id] * unit, minPiece), [unit, minPiece])
  const [round, setRound] = useState(0)
  const [placed, setPlaced] = useState<Partial<Record<Pid, boolean>>>({})
  const [drag, setDrag] = useState<Drag | null>(null)
  const [wrongId, setWrongId] = useState<Pid | null>(null)
  const [hintId, setHintId] = useState<Pid | null>(null)
  const praiseIdx = useRef(0)
  const lastAction = useRef(performance.now())
  const ids = PLANET_ORDER as Pid[]
  const done = ids.every((id) => placed[id])

  // ---------------------------------------------------------------- layout (pixels)
  // Landscape: the Sun on the left, the orbits run to the right, the tray is a strip at the bottom.
  // Portrait:  the Sun at the top, the orbits run downwards, the tray is a block at the bottom.
  const layout = useMemo(() => {
    const barH = topBarHeight(compact)
    const trayH = portrait ? Math.min(Math.max(h * 0.22, 130), compact ? 220 : 300) : h * 0.2
    const trayTop = h - trayH
    const slots = {} as Record<Pid, { x: number; y: number; r: number; size: number }>
    let sunR: number
    let sun: { x: number; y: number }
    if (portrait) {
      sunR = w * 0.4
      sun = { x: w / 2, y: barH * 0.1 - sunR * 0.35 }
      const rMin = sunR + w * 0.1
      const rMax = trayTop - sun.y - 40
      const step = (rMax - rMin) / 7
      const maxDx = w * 0.34
      ids.forEach((id, i) => {
        const r = rMin + i * step
        const dx = Math.max(-r * 0.9, Math.min(r * 0.9, SPREAD[i] * maxDx))
        const size = pieceSize(id)
        const x = Math.max(size / 2 + 8, Math.min(w - size / 2 - 8, sun.x + dx))
        slots[id] = { x, y: sun.y + Math.sqrt(r * r - dx * dx), r, size }
      })
    } else {
      sunR = trayTop * 0.45
      sun = { x: -sunR * 0.45, y: trayTop * 0.5 }
      // distances from the Sun's centre: first orbit just outside the Sun, last one keeps
      // Neptune's whole shadow on screen
      const rMin = sunR + w * 0.07
      const rMax = w - (compact ? 40 : h * 0.09) - sun.x
      const step = (rMax - rMin) / 7
      const maxDy = trayTop * 0.36
      ids.forEach((id, i) => {
        const r = rMin + i * step
        const dy = Math.max(-r * 0.9, Math.min(r * 0.9, SPREAD[i] * maxDy))
        const size = pieceSize(id)
        const x = sun.x + Math.sqrt(r * r - dy * dy)
        slots[id] = { x: Math.min(x, w - size / 2 - 12), y: sun.y + dy, r, size }
      })
    }
    return { trayTop, trayH, sunR, sun, slots }
  }, [w, h, ids, portrait, compact, pieceSize])

  // a new shuffle every round
  const trayOrder = useMemo(() => shuffled(ids), [round, ids])
  // one row if it fits, otherwise two (phones held upright)
  const trayRows = useMemo(() => {
    const need = trayOrder.reduce((a, id) => a + pieceSize(id) * (id === 'saturn' ? 2.15 : 1), 0) + 8 * (trayOrder.length + 1)
    return need > w - 24 ? 2 : 1
  }, [trayOrder, pieceSize, w])
  /** Size of a piece while it sits in the tray (Saturn's ring makes it twice as wide as the ball). */
  const traySize = useCallback((id: Pid) => Math.min(pieceSize(id), (layout.trayH / trayRows) * 0.8), [pieceSize, layout.trayH, trayRows])
  const trayPos = useMemo(() => {
    const pos = {} as Record<Pid, { x: number; y: number }>
    const perRow = Math.ceil(trayOrder.length / trayRows)
    for (let r = 0; r < trayRows; r++) {
      const rowIds = trayOrder.slice(r * perRow, (r + 1) * perRow)
      const widths = rowIds.map((id) => traySize(id) * (id === 'saturn' ? 2.15 : 1))
      const gap = Math.max(6, (w - 24 - widths.reduce((a, b) => a + b, 0)) / (rowIds.length + 1))
      const y = layout.trayTop + (layout.trayH / trayRows) * (r + 0.5)
      let x = 12 + gap
      rowIds.forEach((id, i) => {
        pos[id] = { x: x + widths[i] / 2, y }
        x += widths[i] + gap
      })
    }
    return pos
  }, [trayOrder, trayRows, w, layout.trayTop, layout.trayH, traySize])

  // ---------------------------------------------------------------- voice
  useEffect(() => {
    const t = setTimeout(() => onSay(PUZZLE_LINES.start.en, PUZZLE_LINES.start.vi), 500)
    return () => clearTimeout(t)
  }, [round, onSay])

  useEffect(() => {
    if (!done) return
    playSparkle()
    onWin?.()
    const t = setTimeout(() => onSay(PUZZLE_LINES.done.en, PUZZLE_LINES.done.vi), 600)
    return () => clearTimeout(t)
  }, [done, onSay]) // eslint-disable-line react-hooks/exhaustive-deps -- onWin once per round

  // Gentle hint after 8 s without success: one planet hops, its shadow glows.
  useEffect(() => {
    if (done) return
    const iv = setInterval(() => {
      if (drag || performance.now() - lastAction.current < 8000) return
      const left = ids.filter((id) => !placed[id])
      if (!left.length) return
      setHintId(left[Math.floor(Math.random() * left.length)])
      lastAction.current = performance.now()
      setTimeout(() => setHintId(null), 3500)
    }, 1000)
    return () => clearInterval(iv)
  }, [done, drag, placed, ids])

  // ---------------------------------------------------------------- dragging
  const edge = 28
  const clampX = (x: number) => Math.max(edge, Math.min(w - edge, x))
  const clampY = (y: number) => Math.max(edge, Math.min(h - edge, y))

  const onDown = (id: Pid) => (e: React.PointerEvent) => {
    if (placed[id] || drag) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    lastAction.current = performance.now()
    setHintId(null)
    playPop()
    setDrag({ id, pointerId: e.pointerId, x: trayPos[id].x, y: trayPos[id].y, startX: e.clientX, startY: e.clientY, moved: false })
    // say the planet's name the moment it is picked up – that is the learning moment
    onSay(PLANET_MAP[id].englishName + '!', PLANET_MAP[id].vietnameseName)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8
    setDrag({ ...drag, x: clampX(e.clientX), y: clampY(e.clientY), moved })
  }

  const onUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return
      const { id, x, y } = drag
      setDrag(null)
      lastAction.current = performance.now()
      if (!drag.moved) return
      const slot = layout.slots[id]
      const snap = Math.max(unit * 0.11, slot.size * 0.9, 40)
      if (Math.hypot(x - slot.x, y - slot.y) < snap) {
        setPlaced((p) => ({ ...p, [id]: true }))
        playSparkle()
        const left = ids.filter((k) => !placed[k] && k !== id).length
        if (left > 0) {
          const pr = PUZZLE_LINES.praise[praiseIdx.current++ % PUZZLE_LINES.praise.length]
          setTimeout(() => onSay(pr.en, pr.vi), 350)
        }
        return
      }
      // dropped on another planet's shadow → friendly "try again", piece floats home
      const other = ids.find((k) => k !== id && !placed[k] && Math.hypot(x - layout.slots[k].x, y - layout.slots[k].y) < layout.slots[k].size)
      if (other) {
        playBoing()
        setWrongId(id)
        setTimeout(() => setWrongId(null), 700)
        onSay(PUZZLE_LINES.tryAgain.en, PUZZLE_LINES.tryAgain.vi)
      }
    },
    [drag, layout, unit, ids, placed, onSay],
  )

  const restart = () => {
    playPop()
    setPlaced({})
    setRound((r) => r + 1)
  }

  // ---------------------------------------------------------------- render
  const { sun, sunR, slots, trayTop, trayH } = layout
  const draggingId = drag?.moved ? drag.id : null

  return (
    <div
      className="absolute inset-0 z-30 overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,#1b1450_0%,#070a22_55%,#03040f_100%)] font-nunito"
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* stars */}
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: STARS_BG, backgroundSize: '220px 220px' }} />

      {/* orbits */}
      <svg className="pointer-events-none absolute inset-0" width={w} height={h}>
        {ids.map((id) => (
          <circle
            key={id}
            cx={sun.x}
            cy={sun.y}
            r={slots[id].r}
            fill="none"
            stroke={done ? 'rgba(125,211,252,0.55)' : 'rgba(255,255,255,0.18)'}
            strokeWidth={done ? 3 : 2}
            strokeDasharray={done ? undefined : '2 8'}
          />
        ))}
      </svg>

      {/* the Sun */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left: sun.x - sunR,
          top: sun.y - sunR,
          width: sunR * 2,
          height: sunR * 2,
          background: 'radial-gradient(circle at 60% 45%, #fff7c2 0%, #ffd34d 30%, #ff8a1f 65%, #c23d00 100%)',
          boxShadow: `0 0 ${sunR * 0.5}px ${sunR * 0.12}px rgba(255,160,40,0.55)`,
        }}
      />

      {/* shadows ("homes") */}
      {ids.map((id) => {
        const s = slots[id]
        const glow = draggingId === id || hintId === id
        return (
          <div
            key={id}
            data-slot={id}
            className={`pointer-events-none absolute rounded-full transition-all duration-300 ${glow ? 'animate-pulse' : ''}`}
            style={{
              left: s.x - s.size / 2,
              top: s.y - s.size / 2,
              width: s.size,
              height: s.size,
              background: 'rgba(0,0,0,0.55)',
              opacity: done ? 0 : 1,
              border: `${glow ? 4 : 2}px dashed ${glow ? '#fbbf24' : 'rgba(255,255,255,0.45)'}`,
              boxShadow: glow ? '0 0 24px 6px rgba(251,191,36,0.55)' : 'none',
            }}
          />
        )
      })}

      {/* tray */}
      <div className="pointer-events-none absolute inset-x-3 rounded-[2rem] border border-white/10 bg-slate-900/60" style={{ top: trayTop, bottom: 8 }} />

      {/* planets */}
      {ids.map((id) => {
        const s = slots[id]
        const isDrag = drag?.id === id
        const pos = placed[id] ? { x: s.x, y: s.y } : isDrag ? { x: drag.x, y: drag.y } : trayPos[id]
        const size = placed[id] ? s.size : isDrag ? s.size * 1.15 : traySize(id)
        const orbiting = done
        return (
          <div
            key={id + round}
            data-piece={id}
            onPointerDown={onDown(id)}
            className={`absolute select-none ${isDrag ? 'z-20' : 'z-10'} ${hintId === id && !placed[id] ? 'animate-float' : ''} ${
              wrongId === id ? 'animate-wiggle' : ''
            }`}
            style={{
              left: pos.x - size / 2,
              top: pos.y - size / 2,
              width: size,
              height: size,
              touchAction: 'none',
              cursor: placed[id] ? 'default' : 'grab',
              transition: isDrag ? 'none' : 'left 0.45s cubic-bezier(.34,1.56,.64,1), top 0.45s cubic-bezier(.34,1.56,.64,1), width 0.3s, height 0.3s',
              filter: isDrag ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.6))' : undefined,
              transformOrigin: `${sun.x - pos.x + size / 2}px ${sun.y - pos.y + size / 2}px`,
              // reward: every planet sways along its own orbit (inner ones faster), never off screen
              animation: orbiting ? `orbit-${id} ${1.2 + PLANET_ORDER.indexOf(id) * 0.35}s ease-in-out infinite alternate` : undefined,
            }}
          >
            <PlanetBall2D id={id} size={size} />
            {placed[id] && !done && (
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/70 px-2 text-xs font-extrabold text-white">
                {PLANET_MAP[id].englishName}
              </span>
            )}
          </div>
        )
      })}

      {/* the reward swing: towards the middle of the screen, a few degrees along the orbit */}
      <style>
        {ids
          .map((id) => {
            // swing towards the middle line of the screen (above/below the Sun's row, or left/right of its column)
            const side = portrait ? (slots[id].x < sun.x ? -1 : 1) : slots[id].y < sun.y ? 1 : -1
            const deg = side * Math.min(7, (unit * 0.12 * 180) / (Math.PI * slots[id].r))
            return `@keyframes orbit-${id} { from { transform: rotate(0deg) } to { transform: rotate(${deg.toFixed(2)}deg) } }`
          })
          .join('\n')}
      </style>

      {/* top bar */}
      <div
        className={`absolute flex items-center rounded-3xl border border-white/10 bg-slate-900/75 backdrop-blur-md ${compact ? 'gap-2 px-2.5 py-1' : 'gap-3 px-4 py-2'}`}
        style={{ left: 'max(12px, env(safe-area-inset-left))', top: 'max(8px, env(safe-area-inset-top))' }}
      >
        <span className={compact ? 'text-2xl' : 'text-3xl'}>🧩</span>
        <div className="leading-tight">
          <div className={`font-extrabold tracking-wide text-white ${compact ? 'text-sm' : 'text-xl'}`}>PUT PLANETS HOME</div>
          {!(compact && portrait) && <div className={`font-semibold text-slate-300 ${compact ? 'text-[11px]' : 'text-sm'}`}>{PUZZLE_LINES.start.vi}</div>}
        </div>
        <button
          onClick={() => onSay(PUZZLE_LINES.start.en, PUZZLE_LINES.start.vi)}
          aria-label="Listen"
          style={{ width: compact ? 44 : 48, height: compact ? 44 : 48 }}
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-xl shadow-lg active:scale-90"
        >
          🔊
        </button>
      </div>
      <button
        onClick={() => onExit(false)}
        aria-label="Close puzzle"
        style={{ width: compact ? 44 : 56, height: compact ? 44 : 56, right: 'max(12px, env(safe-area-inset-right))', top: 'max(8px, env(safe-area-inset-top))' }}
        className="absolute flex items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-2xl font-black text-white shadow-lg active:scale-90"
      >
        ✕
      </button>

      {done && (
        <div className="absolute inset-x-0 flex items-center justify-center gap-3" style={{ top: trayTop, height: trayH }}>
          <button
            onClick={restart}
            className={`animate-word-pop rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 font-black text-white shadow-xl active:scale-95 ${compact ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}
          >
            🔄 AGAIN
          </button>
          <button
            onClick={() => onExit(true)}
            className={`animate-word-pop rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 font-black text-white shadow-xl active:scale-95 ${compact ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}
          >
            🪐 SEE IN 3D
          </button>
        </div>
      )}
      {done && <Confetti />}
    </div>
  )
}

const STARS_BG = [
  'radial-gradient(1.5px 1.5px at 20px 30px, #fff, transparent)',
  'radial-gradient(1px 1px at 80px 120px, #cde, transparent)',
  'radial-gradient(1.5px 1.5px at 150px 60px, #fff, transparent)',
  'radial-gradient(1px 1px at 190px 180px, #fde, transparent)',
  'radial-gradient(1px 1px at 110px 200px, #fff, transparent)',
].join(',')

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.6,
        color: ['#fbbf24', '#38bdf8', '#f472b6', '#34d399', '#a78bfa'][i % 5],
        size: 8 + Math.random() * 10,
        star: i % 3 === 0,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-[-5%] animate-confetti"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: b.star ? 'transparent' : b.color,
            color: b.color,
            fontSize: b.size * 1.6,
            borderRadius: 3,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        >
          {b.star ? '★' : ''}
        </span>
      ))}
    </div>
  )
}
