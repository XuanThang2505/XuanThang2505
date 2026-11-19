/**
 * Memory Pairs (ages 5–6): flip cards to find two of the same planet.
 * Every flip says the planet's name, so the game doubles as listening practice.
 * Level 1 = 4 pairs, level 2 = 6 pairs. No losing: a mismatch just turns back over.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { GAME_LINES, PLANET_MAP, PLANET_ORDER, type PlanetId } from '../data/planetsData'
import { playBoing, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { PlanetBall2D } from './PlanetBall2D'
import { QuestionButton, Screen, shuffle, TopBar, type Say } from './ui'

const PAIRS = [4, 6]
const ALL: PlanetId[] = ['sun', ...PLANET_ORDER]

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

export function MemoryPairs({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const { w, h } = useViewport()
  const [level, setLevel] = useState(0)
  const [round, setRound] = useState(0)
  const pairs = PAIRS[level]
  const deck = useMemo(() => {
    const picks = shuffle(ALL).slice(0, pairs)
    return shuffle([...picks, ...picks])
  }, [pairs, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<PlanetId[]>([])
  const busy = useRef(false)
  const alive = useRef(true)
  const done = found.length === pairs

  useEffect(() => {
    alive.current = true
    setOpen([])
    setFound([])
    busy.current = false
    const t = setTimeout(() => alive.current && onSay(GAME_LINES.findPairs.en, GAME_LINES.findPairs.vi), 600)
    return () => clearTimeout(t)
  }, [deck, onSay])
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )
  useEffect(() => {
    if (!done) return
    playSparkle()
    onStar()
    onStar()
    if (level > 0) onStar()
    const t = setTimeout(() => alive.current && onSay(GAME_LINES.youDidIt.en, GAME_LINES.youDidIt.vi), 900)
    return () => clearTimeout(t)
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps -- once per finished board

  const flip = async (i: number) => {
    const id = deck[i]
    if (busy.current || open.includes(i) || found.includes(id) || done) return
    playPop()
    void speak(PLANET_MAP[id].englishName + '!')
    if (open.length === 0) {
      setOpen([i])
      return
    }
    const first = open[0]
    setOpen([first, i])
    busy.current = true
    if (deck[first] === id) {
      await new Promise((r) => setTimeout(r, 700))
      if (!alive.current) return
      playSparkle()
      setFound((f) => [...f, id])
      setOpen([])
      busy.current = false
      if (found.length + 1 < pairs) void speak(GAME_LINES.match.en)
    } else {
      await new Promise((r) => setTimeout(r, 1300))
      if (!alive.current) return
      playBoing()
      setOpen([])
      busy.current = false
    }
  }

  const next = () => {
    stopSpeaking()
    playPop()
    setLevel(Math.min(level + 1, PAIRS.length - 1))
    setRound((r) => r + 1)
  }

  // grid that fits the screen
  const cols = 4
  const rowsN = Math.ceil((pairs * 2) / cols)
  const top = 110
  const card = Math.min((w - 60) / cols - 16, (h - top - 30) / rowsN - 16, 190)

  return (
    <Screen>
      <TopBar
        onBack={onBack}
        stars={stars}
        middle={<QuestionButton icon="🃏" en={GAME_LINES.findPairs.en} vi={`Tìm ${pairs} cặp giống nhau`} onSay={onSay} />}
      />
      {done ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex gap-2">
            {found.map((id) => (
              <span key={id} className="animate-word-pop">
                <PlanetBall2D id={id} size={70} />
              </span>
            ))}
          </div>
          <div className="text-5xl font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">You did it!</div>
          <div className="text-xl font-semibold text-sky-200">Giỏi quá! Con tìm được {pairs} cặp</div>
          <div className="text-4xl">{'⭐'.repeat(level > 0 ? 3 : 2)}</div>
          <div className="mt-2 flex gap-4">
            <button onClick={next} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
              NEXT ▶
            </button>
            <button onClick={onBack} className="rounded-full border border-white/20 bg-slate-800/80 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
              BACK
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, ${card}px)` }}>
            {deck.map((id, i) => {
              const up = open.includes(i) || found.includes(id)
              const matched = found.includes(id)
              return (
                <button
                  key={`${round}-${i}`}
                  data-card={i}
                  data-planet={id}
                  onClick={() => void flip(i)}
                  className="relative [perspective:800px] active:scale-95"
                  style={{ width: card, height: card }}
                  aria-label={up ? PLANET_MAP[id].englishName : 'card'}
                >
                  <div
                    className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                    style={{ transform: up ? 'rotateY(180deg)' : 'none' }}
                  >
                    {/* back of the card */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-indigo-300/40 bg-gradient-to-br from-indigo-600 to-fuchsia-700 text-5xl shadow-xl [backface-visibility:hidden]">
                      ✨
                    </div>
                    {/* face */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-slate-900 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                        matched ? 'border-amber-300 shadow-amber-400/40' : 'border-white/20'
                      }`}
                    >
                      <PlanetBall2D id={id} size={card * 0.58} />
                      <span className="text-sm font-extrabold tracking-wide text-white">{PLANET_MAP[id].englishName}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Screen>
  )
}
