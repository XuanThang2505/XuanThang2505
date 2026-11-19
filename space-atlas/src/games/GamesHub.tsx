/**
 * PLAY menu and the voice-led games. Stars earned are saved on the device.
 *
 *  - Put planets home (3+): drag planets onto their shadows       → PlanetsHome.tsx
 *  - Which planet? (4+): hear a question, tap one of 3 planets
 *  - Line up! (4+): tap the 8 planets in order from the Sun
 *
 * Kid rules everywhere: no losing, no timer, everything is spoken, a wrong tap just
 * says "Try again!" and (after two misses) the right answer starts to glow.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { GAME_LINES, PLANET_MAP, PLANET_ORDER, PUZZLE_LINES, QUIZ, type PlanetId } from '../data/planetsData'
import { playBoing, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { PlanetBall2D } from './PlanetBall2D'
import { PlanetsHome } from './PlanetsHome'

type Say = (en: string, vi?: string) => void
type Game = 'menu' | 'home' | 'quiz' | 'order'

const STARS_KEY = 'space-atlas-stars'
export function loadStars() {
  try {
    return parseInt(localStorage.getItem(STARS_KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}
export function saveStars(n: number) {
  try {
    localStorage.setItem(STARS_KEY, String(n))
  } catch {
    /* private mode – fine */
  }
}

function shuffle<T>(a: T[]) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- shared bits
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_30%_30%,#24185e_0%,#0a0d2c_55%,#03040f_100%)] font-nunito text-white">
      {children}
    </div>
  )
}

function TopBar({ onBack, middle, stars }: { onBack: () => void; middle: React.ReactNode; stars: number }) {
  return (
    <div className="flex items-center gap-3 p-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <button
        onClick={onBack}
        aria-label="Back"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-2xl font-black shadow-lg active:scale-90"
      >
        ✕
      </button>
      <div className="flex min-w-0 flex-1 justify-center">{middle}</div>
      <div className="shrink-0 rounded-full bg-amber-400/90 px-4 py-2 text-xl font-black text-slate-900 shadow-lg">⭐ {stars}</div>
    </div>
  )
}

function QuestionButton({ icon, en, vi, onSay }: { icon: string; en: string; vi: string; onSay: Say }) {
  return (
    <button
      onClick={() => onSay(en, vi)}
      className="flex max-w-full items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/75 px-5 py-3 text-left shadow-xl backdrop-blur active:scale-95"
    >
      <span className="text-4xl">{icon}</span>
      <span className="min-w-0">
        <b className="block text-2xl font-extrabold leading-tight md:text-3xl">{en}</b>
        <small className="block text-base font-semibold text-slate-300">{vi}</small>
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-xl">🔊</span>
    </button>
  )
}

function Done({ title, sub, stars, onAgain, onBack }: { title: string; sub: string; stars: number; onAgain: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="animate-word-pop text-6xl">{'⭐'.repeat(Math.max(1, Math.min(stars, 5)))}</div>
      <div className="text-5xl font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{title}</div>
      <div className="text-xl font-semibold text-sky-200">{sub}</div>
      <div className="mt-4 flex gap-4">
        <button onClick={onAgain} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
          ▶ AGAIN
        </button>
        <button onClick={onBack} className="rounded-full border border-white/20 bg-slate-800/80 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
          BACK
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- menu
function Menu({ stars, onPick, onClose, onSay }: { stars: number; onPick: (g: Game) => void; onClose: () => void; onSay: Say }) {
  useEffect(() => {
    const t = setTimeout(() => onSay(GAME_LINES.letsPlay.en, GAME_LINES.letsPlay.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])
  const cards: { g: Game; icon: string; en: string; vi: string; age: string; cls: string }[] = [
    { g: 'home', icon: '🧩', en: 'Put planets home', vi: 'Kéo hành tinh về nhà', age: '3+', cls: 'from-fuchsia-500 to-indigo-600' },
    { g: 'quiz', icon: '🎯', en: 'Which planet?', vi: 'Nghe câu hỏi và chọn', age: '4+', cls: 'from-amber-400 to-orange-600' },
    { g: 'order', icon: '🔢', en: 'Line up!', vi: 'Xếp 8 hành tinh theo thứ tự', age: '4+', cls: 'from-emerald-400 to-teal-600' },
  ]
  return (
    <Screen>
      <TopBar onBack={onClose} stars={stars} middle={<div className="text-4xl font-black">Let's play!</div>} />
      <div className="flex flex-1 flex-wrap items-center justify-center gap-5 p-4">
        {cards.map((c) => (
          <button
            key={c.g}
            onClick={() => {
              playPop()
              onPick(c.g)
            }}
            className={`relative flex h-56 w-60 flex-col items-center justify-center gap-2 rounded-[2rem] bg-gradient-to-br ${c.cls} p-4 text-center shadow-2xl active:scale-95 lg:h-64 lg:w-72`}
          >
            <span className="absolute right-4 top-3 rounded-full bg-black/25 px-2 text-sm font-extrabold">{c.age}</span>
            <span className="text-7xl">{c.icon}</span>
            <b className="text-2xl font-black leading-tight">{c.en}</b>
            <small className="text-base font-semibold text-white/85">{c.vi}</small>
          </button>
        ))}
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------- quiz
function Quiz({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => shuffle(QUIZ).slice(0, 5), [round])
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState<PlanetId[]>([])
  const [right, setRight] = useState<PlanetId | null>(null)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState(false)
  const alive = useRef(true)
  const busy = useRef(false)
  const q = questions[qi]

  const options = useMemo(() => {
    const others = PLANET_ORDER.concat('sun' as PlanetId).filter((p) => p !== q[3])
    return shuffle([q[3], ...shuffle(others).slice(0, 2)])
  }, [q])

  useEffect(() => {
    alive.current = true
    busy.current = false
    setWrong([])
    setRight(null)
    const t = setTimeout(() => alive.current && onSay(q[1], q[2]), qi === 0 ? 700 : 300)
    return () => clearTimeout(t)
  }, [q, qi, onSay])
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )

  const pick = async (p: PlanetId) => {
    if (busy.current || wrong.includes(p)) return
    if (p === q[3]) {
      busy.current = true
      setRight(p)
      playSparkle()
      if (wrong.length === 0) {
        setEarned((e) => e + 1)
        onStar()
      }
      await speak(PLANET_MAP[p].englishName + '!')
      if (!alive.current) return
      const praise = [...PUZZLE_LINES.praise, GAME_LINES.super][Math.floor(Math.random() * 4)]
      await speak(praise.en, { interrupt: false })
      if (!alive.current) return
      await wait(400)
      if (!alive.current) return
      if (qi + 1 < questions.length) setQi(qi + 1)
      else {
        setDone(true)
        playSparkle()
        onSay(GAME_LINES.youDidIt.en, GAME_LINES.youDidIt.vi)
      }
    } else {
      setWrong((w) => [...w, p])
      playBoing()
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current && !busy.current) void speak(q[1], { interrupt: false })
    }
  }

  const again = () => {
    stopSpeaking()
    setQi(0)
    setEarned(0)
    setDone(false)
    setRound((r) => r + 1)
  }

  return (
    <Screen>
      <TopBar
        onBack={onBack}
        stars={stars}
        middle={
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <span key={i} className={`h-4 w-4 rounded-full ${done || i < qi ? 'bg-amber-400' : i === qi ? 'bg-white' : 'bg-white/25'}`} />
            ))}
          </div>
        }
      />
      {done ? (
        <Done title="You did it!" sub={`Giỏi quá! Con được ${earned} ngôi sao`} stars={earned} onAgain={again} onBack={onBack} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-6">
          <QuestionButton icon={q[0]} en={q[1]} vi={q[2]} onSay={onSay} />
          <div className="flex flex-wrap justify-center gap-6">
            {options.map((p) => {
              const bad = wrong.includes(p)
              const good = right === p
              // after two misses the answer glows, so nobody gets stuck
              const hint = wrong.length >= 2 && p === q[3] && !good
              return (
                <button
                  key={p + qi + round}
                  onClick={() => void pick(p)}
                  className={`relative flex w-52 flex-col items-center gap-3 rounded-[2rem] border-4 bg-slate-900/60 p-5 shadow-xl transition active:scale-95 lg:w-60 ${
                    good ? 'scale-110 border-amber-300 bg-amber-400/25' : bad ? 'border-transparent opacity-40' : hint ? 'animate-pulse border-amber-300' : 'border-white/10'
                  } ${bad ? 'animate-wiggle' : ''}`}
                >
                  <PlanetBall2D id={p} size={120} />
                  <span className="text-xl font-extrabold tracking-wide">{PLANET_MAP[p].englishName}</span>
                  {good && <span className="animate-word-pop absolute -right-3 -top-3 text-5xl">⭐</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Screen>
  )
}

// ---------------------------------------------------------------- line up
function LineUp({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const order = PLANET_ORDER
  const [round, setRound] = useState(0)
  const [pool, setPool] = useState(() => shuffle(order))
  const [placed, setPlaced] = useState<PlanetId[]>([])
  const [bad, setBad] = useState<PlanetId | null>(null)
  const [misses, setMisses] = useState(0)
  const [done, setDone] = useState(false)
  const alive = useRef(true)
  const next = order[placed.length]

  useEffect(() => {
    alive.current = true
    const t = setTimeout(() => alive.current && onSay(GAME_LINES.lineUp.en, GAME_LINES.lineUp.vi), 700)
    return () => clearTimeout(t)
  }, [round, onSay])
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )

  const pick = async (p: PlanetId) => {
    if (done) return
    if (p === next) {
      playSparkle()
      const now = [...placed, p]
      setPlaced(now)
      setPool((pl) => pl.filter((x) => x !== p))
      setMisses(0)
      setBad(null)
      await speak(PLANET_MAP[p].englishName + '!')
      if (now.length === order.length && alive.current) {
        setDone(true)
        onStar()
        onStar()
        await speak('Eight planets go around the Sun!')
        if (alive.current) void speak(GAME_LINES.youDidIt.en, { interrupt: false })
      }
    } else {
      setBad(p)
      setMisses((m) => m + 1)
      playBoing()
      setTimeout(() => setBad(null), 500)
      void speak(PUZZLE_LINES.tryAgain.en)
    }
  }

  const again = () => {
    stopSpeaking()
    setPool(shuffle(order))
    setPlaced([])
    setMisses(0)
    setDone(false)
    setRound((r) => r + 1)
  }

  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<QuestionButton icon="🔢" en={GAME_LINES.lineUp.en} vi="Chạm theo thứ tự từ Mặt Trời ra xa" onSay={onSay} />} />
      {/* the line: Sun + 8 numbered seats */}
      <div className="mx-3 flex items-center gap-1 rounded-[2rem] border border-white/10 bg-slate-900/50 p-3 md:gap-2">
        <PlanetBall2D id="sun" size={64} />
        {order.map((_, i) => (
          <div
            key={i}
            className={`flex aspect-square flex-1 items-center justify-center rounded-full border-2 border-dashed ${
              placed[i] ? 'border-transparent' : i === placed.length ? 'animate-pulse border-amber-300' : 'border-white/25'
            }`}
          >
            {placed[i] ? (
              <span className="animate-word-pop">
                <PlanetBall2D id={placed[i]} size={52} />
              </span>
            ) : (
              <span className="text-2xl font-black text-white/50">{i + 1}</span>
            )}
          </div>
        ))}
      </div>
      {done ? (
        <Done title="You did it!" sub="Giỏi quá! Tám hành tinh quay quanh Mặt Trời" stars={2} onAgain={again} onBack={onBack} />
      ) : (
        <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-4 p-4">
          {pool.map((p) => (
            <button
              key={p + round}
              onClick={() => void pick(p)}
              className={`flex w-36 flex-col items-center gap-2 rounded-3xl border-4 bg-slate-900/60 p-3 shadow-xl active:scale-95 lg:w-40 ${
                bad === p ? 'animate-wiggle border-rose-400' : misses >= 2 && p === next ? 'animate-pulse border-amber-300' : 'border-white/10'
              }`}
            >
              <PlanetBall2D id={p} size={84} />
              <span className="text-base font-extrabold tracking-wide">{PLANET_MAP[p].englishName}</span>
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}

// ---------------------------------------------------------------- hub
export function GamesHub({
  stars,
  onStar,
  onClose,
  onSay,
}: {
  stars: number
  onStar: () => void
  onClose: (to3D: boolean) => void
  onSay: Say
}) {
  const [game, setGame] = useState<Game>('menu')
  const go = (g: Game) => {
    stopSpeaking()
    setGame(g)
  }
  if (game === 'home')
    return <PlanetsHome onExit={(to3D) => (to3D ? onClose(true) : go('menu'))} onSay={onSay} onWin={() => [0, 1, 2].forEach(onStar)} />
  if (game === 'quiz') return <Quiz stars={stars} onBack={() => go('menu')} onStar={onStar} onSay={onSay} />
  if (game === 'order') return <LineUp stars={stars} onBack={() => go('menu')} onStar={onStar} onSay={onSay} />
  return <Menu stars={stars} onPick={go} onClose={() => onClose(false)} onSay={onSay} />
}
