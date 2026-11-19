/**
 * Planet Jigsaw (ages 4–5): rebuild a planet photo from big pieces.
 * Level 1 = 2 pieces, level 2 = 4 pieces, level 3 = 6 pieces, then new planets at 6.
 *
 * Kid rules: a faint picture on the board shows where things go, pieces snap in when
 * dropped close, a wrong spot just floats the piece back, nothing can leave the screen.
 * Finished planet → its name and a fun fact are spoken.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { FACTS, GAME_LINES, PLANET_MAP, PUZZLE_LINES, type PlanetId } from '../data/planetsData'
import { playBoing, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { TEXTURE_2D } from './PlanetBall2D'
import { QuestionButton, Screen, shuffle, TopBar, type Say } from './ui'

const LEVELS = [
  { cols: 2, rows: 1 },
  { cols: 2, rows: 2 },
  { cols: 3, rows: 2 },
]
const BODIES: PlanetId[] = ['earth', 'mars', 'jupiter', 'saturn', 'sun', 'neptune', 'venus', 'uranus', 'mercury']

// ---------------------------------------------------------------- picture of the planet
const pictureCache = new Map<PlanetId, string>()

/** Paint the planet as a shaded ball (Saturn with rings) on a square canvas → data URL. */
function paintPlanet(id: PlanetId, size = 640): Promise<string> {
  if (pictureCache.has(id)) return Promise.resolve(pictureCache.get(id)!)
  return new Promise((resolve) => {
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const m = size / 2
    const ringed = id === 'saturn'
    const r = ringed ? size * 0.3 : size * 0.45

    const ring = (front: boolean) => {
      if (!ringed) return
      ctx.save()
      ctx.translate(m, m)
      ctx.rotate(-0.28)
      ctx.beginPath()
      // back half above the planet, front half below it
      ctx.ellipse(0, 0, size * 0.47, size * 0.13, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
      ctx.lineWidth = size * 0.055
      ctx.strokeStyle = 'rgba(226,204,150,0.95)'
      ctx.stroke()
      ctx.lineWidth = size * 0.012
      ctx.strokeStyle = 'rgba(120,96,60,0.8)'
      ctx.stroke()
      ctx.restore()
    }

    const shade = () => {
      let g = ctx.createRadialGradient(m - r * 0.35, m - r * 0.35, r * 0.1, m, m, r)
      g.addColorStop(0, 'rgba(255,255,255,0.25)')
      g.addColorStop(0.5, 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(m, m, r, 0, Math.PI * 2)
      ctx.fill()
      g = ctx.createRadialGradient(m, m, r * 0.6, m, m, r)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = g
      ctx.fill()
    }

    const finish = () => {
      ring(true)
      const url = c.toDataURL('image/png')
      pictureCache.set(id, url)
      resolve(url)
    }

    ring(false)
    if (id === 'sun') {
      const g = ctx.createRadialGradient(m - r * 0.2, m - r * 0.2, r * 0.05, m, m, r)
      g.addColorStop(0, '#fff7c2')
      g.addColorStop(0.3, '#ffd34d')
      g.addColorStop(0.7, '#ff8a1f')
      g.addColorStop(1, '#c23d00')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(m, m, r, 0, Math.PI * 2)
      ctx.fill()
      finish()
      return
    }
    const img = new Image()
    img.onload = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(m, m, r, 0, Math.PI * 2)
      ctx.clip()
      // the middle half of the world map ≈ the side of the planet we see
      ctx.drawImage(img, img.width * 0.15, 0, img.width * 0.5, img.height, m - r, m - r, r * 2, r * 2)
      ctx.restore()
      shade()
      finish()
    }
    img.onerror = () => {
      ctx.fillStyle = PLANET_MAP[id].atmosphere
      ctx.beginPath()
      ctx.arc(m, m, r, 0, Math.PI * 2)
      ctx.fill()
      shade()
      finish()
    }
    img.src = TEXTURE_2D[id as Exclude<PlanetId, 'sun'>]
  })
}

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

interface Drag {
  i: number
  pointerId: number
  x: number
  y: number
  sx: number
  sy: number
  moved: boolean
}

export function PlanetJigsaw({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const { w, h } = useViewport()
  const [level, setLevel] = useState(0)
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(BODIES), [])
  const planet = order[round % order.length]
  const { cols, rows } = LEVELS[level]
  const n = cols * rows
  const [picture, setPicture] = useState<string | null>(null)
  const [placed, setPlaced] = useState<boolean[]>(() => Array(n).fill(false))
  const [drag, setDrag] = useState<Drag | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const trayOrder = useMemo(() => shuffle([...Array(n).keys()]), [n, round, level]) // eslint-disable-line react-hooks/exhaustive-deps
  const done = placed.length === n && placed.every(Boolean)
  const alive = useRef(true)

  useEffect(() => {
    let ok = true
    setPicture(null)
    void paintPlanet(planet).then((u) => ok && setPicture(u))
    return () => {
      ok = false
    }
  }, [planet])

  useEffect(() => {
    setPlaced(Array(n).fill(false))
  }, [n, round, level])

  useEffect(() => {
    alive.current = true
    const t = setTimeout(() => alive.current && onSay(GAME_LINES.buildPlanet.en, GAME_LINES.buildPlanet.vi), 600)
    return () => clearTimeout(t)
  }, [round, level, onSay])
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )

  // finished: name + one fun fact, stars by size of puzzle
  useEffect(() => {
    if (!done) return
    playSparkle()
    for (let k = 0; k <= level; k++) onStar()
    const fact = FACTS[planet][Math.floor(Math.random() * 4)]
    void (async () => {
      await speak(PLANET_MAP[planet].englishName + '!')
      if (alive.current) await speak(fact[1], { interrupt: false })
    })()
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps -- once per finished puzzle

  // ---------------------------------------------------------------- layout
  const top = 96
  const B = Math.min((h - top) * 0.82, w * 0.44)
  const board = { x: w * 0.05, y: top + (h - top - B) / 2 }
  const cw = B / cols
  const ch = B / rows
  const tray = { x: board.x + B + w * 0.05, y: top + 10, w: w - (board.x + B + w * 0.05) - 16, h: h - top - 26 }
  const tCols = Math.min(n, cols === 3 ? 2 : 2)
  const tRows = Math.ceil(n / tCols)
  const trayScale = Math.min(1, (tray.w / tCols) * 0.86 / cw, (tray.h / tRows) * 0.86 / ch)
  const cellCenter = (i: number) => ({ x: board.x + (i % cols) * cw + cw / 2, y: board.y + Math.floor(i / cols) * ch + ch / 2 })
  const trayCenter = (i: number) => {
    const k = trayOrder.indexOf(i)
    return { x: tray.x + ((k % tCols) + 0.5) * (tray.w / tCols), y: tray.y + (Math.floor(k / tCols) + 0.5) * (tray.h / tRows) }
  }

  // ---------------------------------------------------------------- dragging
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
  const onDown = (i: number) => (e: React.PointerEvent) => {
    if (placed[i] || drag || done) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    playPop()
    const c = trayCenter(i)
    setDrag({ i, pointerId: e.pointerId, x: c.x, y: c.y, sx: e.clientX, sy: e.clientY, moved: false })
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8
    const c = trayCenter(drag.i)
    setDrag({ ...drag, moved, x: clamp(c.x + e.clientX - drag.sx, 30, w - 30), y: clamp(c.y + e.clientY - drag.sy, 30, h - 30) })
  }
  const onUp = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    const { i, x, y, moved } = drag
    setDrag(null)
    if (!moved) return
    const target = cellCenter(i)
    if (Math.hypot(x - target.x, y - target.y) < Math.min(cw, ch) * 0.42) {
      playSparkle()
      setPlaced((p) => p.map((v, k) => (k === i ? true : v)))
      return
    }
    // dropped on the board but in the wrong cell → gentle "try again"
    if (x > board.x && x < board.x + B && y > board.y && y < board.y + B) {
      playBoing()
      setWrong(i)
      setTimeout(() => setWrong(null), 600)
      void speak(PUZZLE_LINES.tryAgain.en)
    }
  }

  const next = () => {
    stopSpeaking()
    playPop()
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setPlaced(Array(LEVELS[nl].cols * LEVELS[nl].rows).fill(false))
    setLevel(nl)
    setRound((r) => r + 1)
  }

  const pieceStyle = (i: number, scale: number): React.CSSProperties => ({
    width: cw * scale,
    height: ch * scale,
    backgroundImage: picture ? `url(${picture})` : undefined,
    backgroundSize: `${B * scale}px ${B * scale}px`,
    backgroundPosition: `${-(i % cols) * cw * scale}px ${-Math.floor(i / cols) * ch * scale}px`,
  })

  return (
    <Screen>
      <div className="absolute inset-0" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="absolute inset-x-0 top-0">
          <TopBar
            onBack={onBack}
            stars={stars}
            middle={
              <QuestionButton
                icon={['🧩', '🧩🧩', '🧩🧩🧩'][level]}
                en={GAME_LINES.buildPlanet.en}
                vi={`Ghép hành tinh · ${n} mảnh`}
                onSay={onSay}
              />
            }
          />
        </div>

        {/* board: faint picture + cell outlines */}
        <div
          data-board
          className={`absolute rounded-3xl transition-shadow duration-700 ${done ? 'shadow-[0_0_80px_20px_rgba(251,191,36,0.35)]' : ''}`}
          style={{ left: board.x, top: board.y, width: B, height: B, background: 'rgba(15,23,42,0.55)' }}
        >
          {picture && (
            <div className="absolute inset-0 rounded-3xl" style={{ backgroundImage: `url(${picture})`, backgroundSize: '100% 100%', opacity: done ? 0 : 0.16 }} />
          )}
          {!done &&
            [...Array(n).keys()].map((i) => (
              <div
                key={i}
                className="absolute border-2 border-dashed border-white/30"
                style={{ left: (i % cols) * cw, top: Math.floor(i / cols) * ch, width: cw, height: ch }}
              />
            ))}
        </div>

        {/* pieces */}
        {[...Array(n).keys()].map((i) => {
          const isDrag = drag?.i === i
          const onBoard = placed[i]
          const c = onBoard ? cellCenter(i) : isDrag ? { x: drag.x, y: drag.y } : trayCenter(i)
          const scale = onBoard ? 1 : isDrag ? 1 : trayScale
          return (
            <div
              key={`${round}-${level}-${i}`}
              data-piece={i}
              onPointerDown={onDown(i)}
              className={`absolute ${isDrag ? 'z-20' : 'z-10'} ${wrong === i ? 'animate-wiggle' : ''} ${
                onBoard ? '' : 'rounded-lg ring-2 ring-white/40'
              }`}
              style={{
                ...pieceStyle(i, scale),
                left: c.x - (cw * scale) / 2,
                top: c.y - (ch * scale) / 2,
                touchAction: 'none',
                cursor: onBoard ? 'default' : 'grab',
                // never the `background` shorthand here: it would wipe the image/position longhands
                backgroundColor: picture ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.1)',
                backgroundRepeat: 'no-repeat',
                transition: isDrag ? 'none' : 'left 0.4s cubic-bezier(.34,1.56,.64,1), top 0.4s cubic-bezier(.34,1.56,.64,1), width 0.3s, height 0.3s',
                filter: isDrag ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.6))' : undefined,
              }}
            />
          )
        })}

        {done && (
          <div className="absolute flex flex-col items-center gap-4" style={{ left: tray.x, top: tray.y, width: tray.w, height: tray.h, justifyContent: 'center' }}>
            <div className="animate-word-pop text-5xl font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{PLANET_MAP[planet].englishName}!</div>
            <div className="text-xl font-semibold text-sky-200">{PLANET_MAP[planet].vietnameseName}</div>
            <div className="text-4xl">{'⭐'.repeat(level + 1)}</div>
            <div className="mt-2 flex gap-3">
              <button onClick={next} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-7 py-4 text-2xl font-black shadow-xl active:scale-95">
                NEXT ▶
              </button>
              <button onClick={onBack} className="rounded-full border border-white/20 bg-slate-800/80 px-7 py-4 text-2xl font-black shadow-xl active:scale-95">
                BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </Screen>
  )
}
