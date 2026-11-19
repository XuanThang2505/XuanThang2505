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
import { MemoryPairs } from './MemoryPairs'
import { PlanetJigsaw } from './PlanetJigsaw'
import { PlanetsHome } from './PlanetsHome'
import { NewStickerPopup, StickerBook, stickersUnlocked } from './StickerBook'
import { Done, QuestionButton, Screen, shuffle, TopBar, wait } from './ui'

import type { Say } from './ui'
type Game = 'menu' | 'home' | 'quiz' | 'order' | 'jigsaw' | 'memory' | 'stickers'

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
    { g: 'jigsaw', icon: '🖼️', en: 'Planet jigsaw', vi: 'Ghép ảnh hành tinh', age: '4+', cls: 'from-sky-400 to-blue-700' },
    { g: 'memory', icon: '🃏', en: 'Memory pairs', vi: 'Lật thẻ tìm cặp', age: '5+', cls: 'from-rose-400 to-pink-700' },
  ]
  return (
    <Screen>
      <TopBar
        onBack={onClose}
        stars={stars}
        middle={
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black">Let's play!</div>
            <button
              onClick={() => {
                playPop()
                onPick('stickers')
              }}
              className="flex items-center gap-2 rounded-full border-2 border-amber-300/70 bg-gradient-to-r from-indigo-500 to-fuchsia-600 px-4 py-2 text-lg font-black shadow-lg active:scale-95"
            >
              🌟 MY STICKERS <span className="rounded-full bg-black/25 px-2 text-base">{stickersUnlocked(stars)}</span>
            </button>
          </div>
        }
      />
      <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-4 p-3">
        {cards.map((c) => (
          <button
            key={c.g}
            onClick={() => {
              playPop()
              onPick(c.g)
            }}
            className={`relative flex h-44 w-56 flex-col items-center justify-center gap-1 rounded-[2rem] bg-gradient-to-br ${c.cls} p-3 text-center shadow-2xl active:scale-95 lg:h-56 lg:w-72`}
          >
            <span className="absolute right-4 top-3 rounded-full bg-black/25 px-2 text-sm font-extrabold">{c.age}</span>
            <span className="text-6xl lg:text-7xl">{c.icon}</span>
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
  const [popup, setPopup] = useState<number | null>(null)
  const seen = useRef(stickersUnlocked(stars))
  // a new sticker earned while playing → celebrate it (after the game's own voice line)
  useEffect(() => {
    const now = stickersUnlocked(stars)
    if (now > seen.current) {
      const idx = now - 1
      seen.current = now
      // wait for the name + fun fact that the game is saying first
      const t = setTimeout(() => setPopup(idx), 5200)
      return () => clearTimeout(t)
    }
  }, [stars])
  const go = (g: Game) => {
    stopSpeaking()
    setGame(g)
  }
  const back = () => go('menu')
  let screen: React.ReactNode
  if (game === 'home') screen = <PlanetsHome onExit={(to3D) => (to3D ? onClose(true) : back())} onSay={onSay} onWin={() => [0, 1, 2].forEach(onStar)} />
  else if (game === 'quiz') screen = <Quiz stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'order') screen = <LineUp stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'jigsaw') screen = <PlanetJigsaw stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'memory') screen = <MemoryPairs stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'stickers') screen = <StickerBook stars={stars} onBack={back} onSay={onSay} />
  else screen = <Menu stars={stars} onPick={go} onClose={() => onClose(false)} onSay={onSay} />
  return (
    <>
      {screen}
      {popup !== null && <NewStickerPopup index={popup} onClose={() => setPopup(null)} />}
    </>
  )
}
