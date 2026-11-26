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
import { useLayout } from '../utils/useLayout'
import { PlanetBall2D } from './PlanetBall2D'
import { MemoryPairs } from './MemoryPairs'
import { PlanetJigsaw } from './PlanetJigsaw'
import { PlanetsHome } from './PlanetsHome'
import { NewStickerPopup, StickerBook, stickersUnlocked } from './StickerBook'
import { StoryMode } from '../story/StoryMode'
import { Station } from '../story/Station'
import { ShootingWish } from '../story/ShootingWish'
import { isGeminids, loadRocket, loadStory } from '../data/storyData'
import { RocketLab } from '../story/RocketLab'
import { DeepSea } from '../story/DeepSea'
import { HeroHQ } from '../hero/HeroHQ'
import { MeScreen } from '../me/MeScreen'
import { MeAstronaut } from '../me/MeAstronaut'
import { CaptainStar, StarShield } from '../hero/CaptainStar'
import { loadHero } from '../data/heroData'
import { RobotWorkshop } from '../story/RobotWorkshop'
import { DolphinGame } from '../story/DolphinGame'
import { RocketArt } from '../story/Rocket'
import { Cosmo, Splash } from '../story/Cosmo'
import { Done, QuestionButton, Screen, shuffle, TopBar, wait } from './ui'

import type { Say } from './ui'
type Game = 'menu' | 'home' | 'quiz' | 'order' | 'jigsaw' | 'memory' | 'stickers' | 'story' | 'station' | 'wish' | 'rocket' | 'dolphin' | 'sea' | 'workshop' | 'hero' | 'me'
/** Games with their own big celebrations: a new-sticker popup waits until the child is back in the menu. */
const CALM: Game[] = ['story', 'station', 'wish', 'rocket', 'dolphin', 'sea', 'workshop', 'hero', 'me']

import { loadStars, saveStars } from './stars'
export { loadStars, saveStars }

// ---------------------------------------------------------------- menu
function Menu({ stars, onPick, onClose, onSay }: { stars: number; onPick: (g: Game) => void; onClose: () => void; onSay: Say }) {
  const L = useLayout()
  const c0 = L.compact
  useEffect(() => {
    const t = setTimeout(() => onSay(GAME_LINES.letsPlay.en, GAME_LINES.letsPlay.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])
  const story = loadStory()
  const featured: { g: Game; art: React.ReactNode; en: string; vi: string; tag: string; cls: string }[] = [
    { g: 'me', art: <MeAstronaut size={c0 ? 74 : 120} float={false} />, en: 'Me in space', vi: 'Con là phi hành gia!', tag: 'NEW', cls: 'from-slate-300 via-sky-600 to-indigo-800' },
    {
      g: 'story',
      art: <Cosmo size={c0 ? 56 : 80} />,
      en: "Cosmo's mission",
      vi: story.finished ? 'Đã xong! Chơi lại nhé' : `Tìm pha lê · ${story.done}/8 💎`,
      tag: 'STORY',
      cls: 'from-sky-400 via-blue-600 to-indigo-800',
    },
    { g: 'rocket', art: <RocketArt design={loadRocket()} size={c0 ? 84 : 120} flame={0.6} />, en: 'Rocket lab', vi: 'Làm tên lửa và phóng!', tag: 'NEW', cls: 'from-cyan-400 via-sky-600 to-blue-900' },
    { g: 'dolphin', art: <Splash size={c0 ? 80 : 120} />, en: "Splash's ocean", vi: '3 cấp độ: bắt, nghe, đếm', tag: '3 LEVELS', cls: 'from-teal-300 via-cyan-600 to-blue-800' },
    { g: 'sea', art: <span className={c0 ? 'text-5xl' : 'text-7xl'}>🤿</span>, en: 'Deep sea dive', vi: 'Lặn tìm 14 con vật biển', tag: 'EXPLORE', cls: 'from-blue-400 via-indigo-700 to-slate-900' },
  ]
  const cards: { g: Game; icon: string; en: string; vi: string; age: string; cls: string }[] = [
    { g: 'workshop', icon: '🔧', en: 'Robot shop', vi: 'Trang trí Cosmo', age: 'NEW', cls: 'from-cyan-500 to-indigo-700' },
    { g: 'station', icon: '🛰️', en: 'My station', vi: 'Trang trí trạm', age: '3+', cls: 'from-violet-500 to-slate-700' },
    { g: 'wish', icon: '🌠', en: isGeminids() ? 'Geminids!' : 'Shooting stars', vi: isGeminids() ? 'Mưa sao băng' : 'Bắt sao băng', age: isGeminids() ? 'EVENT' : '3+', cls: 'from-yellow-400 to-rose-600' },
    { g: 'home', icon: '🧩', en: 'Planets home', vi: 'Kéo về nhà', age: '3+', cls: 'from-fuchsia-500 to-indigo-600' },
    { g: 'quiz', icon: '🎯', en: 'Which planet?', vi: 'Nghe và chọn', age: '4+', cls: 'from-amber-400 to-orange-600' },
    { g: 'order', icon: '🔢', en: 'Line up!', vi: 'Xếp thứ tự', age: '4+', cls: 'from-emerald-400 to-teal-600' },
    { g: 'jigsaw', icon: '🖼️', en: 'Jigsaw', vi: 'Ghép ảnh', age: '4+', cls: 'from-sky-400 to-blue-700' },
    { g: 'memory', icon: '🃏', en: 'Memory', vi: 'Lật thẻ', age: '5+', cls: 'from-rose-400 to-pink-700' },
  ]
  return (
    <Screen>
      <TopBar
        onBack={onClose}
        backLabel="SPACE"
        stars={stars}
        middle={
          <div className={`flex items-center ${c0 && L.portrait ? 'flex-col gap-1' : c0 ? 'gap-3' : 'gap-4'}`}>
            <div className={`font-black ${c0 ? 'text-2xl' : 'text-4xl'}`}>Let's play!</div>
            <button
              data-testid="stickers-button"
              onClick={() => {
                playPop()
                onPick('stickers')
              }}
              style={c0 ? { minHeight: 44 } : undefined}
              className={`flex items-center gap-2 rounded-full border-2 border-amber-300/70 bg-gradient-to-r from-indigo-500 to-fuchsia-600 font-black shadow-lg active:scale-95 ${
                c0 ? 'px-3 text-sm' : 'px-4 py-2 text-lg'
              }`}
            >
              🌟 MY STICKERS <span className="rounded-full bg-black/25 px-2 text-base">{stickersUnlocked(stars)}</span>
            </button>
          </div>
        }
      />
      <div className={`flex flex-1 flex-col items-center overflow-y-auto ${c0 ? 'gap-2 p-2' : 'gap-5 p-3'}`}>
        <div className={`my-auto flex w-full flex-col items-center ${c0 ? 'gap-2' : 'gap-5'}`}>
          {/* Captain Star banner */}
          <button
            data-testid="game-hero"
            onClick={() => {
              playPop()
              onPick('hero')
            }}
            className={`relative flex w-full max-w-[64rem] items-center overflow-hidden rounded-[2rem] border-4 border-amber-300/80 bg-gradient-to-r from-rose-600 via-blue-700 to-sky-500 text-left shadow-[0_10px_50px_rgba(251,191,36,0.35)] active:scale-[0.98] ${
              c0 ? 'h-[92px] gap-2 px-3' : 'h-36 gap-5 px-8'
            }`}
          >
            <span className="pointer-events-none absolute inset-0 opacity-20" style={{ background: 'repeating-conic-gradient(from 0deg at 15% 50%, #fff 0deg 6deg, transparent 6deg 20deg)' }} />
            <span className="relative shrink-0">
              <CaptainStar size={c0 ? 78 : 128} cheer />
            </span>
            <span className="relative min-w-0 flex-1">
              <b className={`block font-black italic leading-none tracking-wide drop-shadow ${c0 ? 'text-xl' : 'text-5xl'}`}>Captain Star</b>
              <small className={`block font-bold text-amber-100 ${c0 ? 'text-[11px] leading-tight' : 'text-xl'}`}>
                Siêu anh hùng vũ trụ · {loadHero().done.length}/5 nhiệm vụ 🎖️
              </small>
            </span>
            {!c0 && (
              <span className="relative shrink-0 animate-float">
                <StarShield size={90} />
              </span>
            )}
            <span className={`absolute rounded-full bg-amber-300 font-black text-rose-700 ${c0 ? 'right-2 top-1.5 px-1.5 text-[10px]' : 'right-5 top-3 px-3 text-base'}`}>HERO</span>
          </button>
          {/* the big adventures */}
          <div className={`flex flex-wrap justify-center ${c0 ? 'gap-2' : 'gap-5'}`}>
            {featured.map((f) => (
              <button
                data-testid={`game-${f.g}`}
                key={f.g}
                onClick={() => {
                  playPop()
                  onPick(f.g)
                }}
                className={`relative flex items-center overflow-hidden rounded-[2rem] border-2 border-white/25 bg-gradient-to-br ${f.cls} text-left shadow-[0_10px_40px_rgba(14,165,233,0.35)] active:scale-95 ${
                  c0 ? (L.portrait ? 'h-[84px] w-[340px] gap-2 px-3' : 'h-[96px] w-[calc(20vw-10px)] max-w-[180px] gap-1 px-1') : (L.portrait ? 'h-36 w-[26rem] gap-3 px-5' : 'h-40 w-[min(18.4vw,17rem)] gap-1 px-2')
                }`}
              >
                <span className={`absolute rounded-full bg-black/25 font-extrabold ${c0 ? 'right-2.5 top-2 px-1.5 text-[10px]' : 'right-4 top-3 px-2 text-sm'}`}>{f.tag}</span>
                <span className="flex shrink-0 items-center justify-center">{f.art}</span>
                <span className="min-w-0">
                  <b className={`block font-black leading-tight drop-shadow ${c0 ? 'text-[15px]' : 'text-xl'}`}>{f.en}</b>
                  <small className={`block font-semibold text-white/90 ${c0 ? 'text-[11px] leading-tight' : 'text-sm'}`}>{f.vi}</small>
                </span>
              </button>
            ))}
          </div>
          <div className={`flex flex-wrap justify-center ${c0 ? 'gap-2' : 'gap-3'}`}>
            {cards.map((c) => (
              <button
                data-testid={`game-${c.g}`}
                key={c.g}
                onClick={() => {
                  playPop()
                  onPick(c.g)
                }}
                className={`relative flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${c.cls} text-center shadow-xl active:scale-95 ${
                  c0 ? 'h-[84px] w-[96px] p-1' : 'h-28 w-32 gap-0 p-2'
                }`}
              >
                <span className={`absolute rounded-full bg-black/25 font-extrabold ${c0 ? 'right-1.5 top-1 px-1 text-[9px]' : 'right-2.5 top-2 px-1.5 text-[11px]'}`}>{c.age}</span>
                <span className={c0 ? 'text-3xl' : 'text-4xl'}>{c.icon}</span>
                <b className={`font-black leading-tight ${c0 ? 'text-[12px]' : 'text-base'}`}>{c.en}</b>
                <small className={`font-semibold text-white/85 ${c0 ? 'text-[10px] leading-tight' : 'text-sm'}`}>{c.vi}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------- quiz
function Quiz({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
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
        <div className={`flex flex-1 flex-col items-center justify-center px-3 ${L.compact ? 'gap-4 pb-2' : 'gap-8 pb-6'}`}>
          <QuestionButton icon={q[0]} en={q[1]} vi={q[2]} onSay={onSay} />
          <div className={`flex flex-wrap justify-center ${L.compact ? 'gap-3' : 'gap-6'}`}>
            {options.map((p) => {
              const bad = wrong.includes(p)
              const good = right === p
              // after two misses the answer glows, so nobody gets stuck
              const hint = wrong.length >= 2 && p === q[3] && !good
              return (
                <button
                  key={p + qi + round}
                  data-testid="quiz-option"
                  data-planet={p}
                  onClick={() => void pick(p)}
                  className={`relative flex flex-col items-center rounded-[2rem] border-4 bg-slate-900/60 shadow-xl transition active:scale-95 ${
                    L.compact ? (L.portrait ? 'w-[112px] gap-1 p-2' : 'w-[132px] gap-1 p-2') : 'w-52 gap-3 p-5 lg:w-60'
                  } ${
                    good ? 'scale-110 border-amber-300 bg-amber-400/25' : bad ? 'border-transparent opacity-40' : hint ? 'animate-pulse border-amber-300' : 'border-white/10'
                  } ${bad ? 'animate-wiggle' : ''}`}
                >
                  <PlanetBall2D id={p} size={L.compact ? (L.portrait ? 80 : 88) : 120} />
                  <span className={`font-extrabold tracking-wide ${L.compact ? 'text-[13px]' : 'text-xl'}`}>{PLANET_MAP[p].englishName}</span>
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
  const L = useLayout()
  const c = L.compact
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
      <div className={`mx-3 flex items-center rounded-[2rem] border border-white/10 bg-slate-900/50 ${c ? 'gap-1 p-1.5' : 'gap-1 p-3 md:gap-2'}`}>
        <PlanetBall2D id="sun" size={c ? 36 : 64} />
        {order.map((_, i) => (
          <div
            key={i}
            className={`flex aspect-square flex-1 items-center justify-center rounded-full border-2 border-dashed ${
              placed[i] ? 'border-transparent' : i === placed.length ? 'animate-pulse border-amber-300' : 'border-white/25'
            }`}
          >
            {placed[i] ? (
              <span className="animate-word-pop">
                <PlanetBall2D id={placed[i]} size={c ? (L.portrait ? 30 : 40) : 52} />
              </span>
            ) : (
              <span className={`font-black text-white/50 ${c ? 'text-sm' : 'text-2xl'}`}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>
      {done ? (
        <Done title="You did it!" sub="Giỏi quá! Tám hành tinh quay quanh Mặt Trời" stars={2} onAgain={again} onBack={onBack} />
      ) : (
        <div className={`flex flex-1 flex-wrap content-center items-center justify-center overflow-y-auto ${c ? 'gap-2 p-2' : 'gap-4 p-4'}`}>
          {pool.map((p) => (
            <button
              key={p + round}
              data-testid="lineup-option"
              data-planet={p}
              onClick={() => void pick(p)}
              className={`flex flex-col items-center rounded-3xl border-4 bg-slate-900/60 shadow-xl active:scale-95 ${
                c ? (L.portrait ? 'w-[88px] gap-0.5 p-1.5' : 'w-[100px] gap-0.5 p-1.5') : 'w-36 gap-2 p-3 lg:w-40'
              } ${
                bad === p ? 'animate-wiggle border-rose-400' : misses >= 2 && p === next ? 'animate-pulse border-amber-300' : 'border-white/10'
              }`}
            >
              <PlanetBall2D id={p} size={c ? (L.portrait ? 54 : 56) : 84} />
              <span className={`font-extrabold tracking-wide ${c ? 'text-[11px]' : 'text-base'}`}>{PLANET_MAP[p].englishName}</span>
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
  const [pending, setPending] = useState<number | null>(null)
  const seen = useRef(stickersUnlocked(stars))
  // a new sticker earned while playing → celebrate it (after the game's own voice line)
  useEffect(() => {
    const now = stickersUnlocked(stars)
    if (now > seen.current) {
      const idx = now - 1
      seen.current = now
      setPending(idx)
    }
  }, [stars])
  // classic games: wait for the name + fun fact being said first; the big adventures: wait until
  // the child is back in the menu, so the popup never interrupts a story or a launch
  useEffect(() => {
    if (pending === null || CALM.includes(game)) return
    const t = setTimeout(() => {
      setPopup(pending)
      setPending(null)
    }, game === 'menu' ? 700 : 5200)
    return () => clearTimeout(t)
  }, [pending, game])
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
  else if (game === 'story') screen = <StoryMode stars={stars} onBack={back} onStar={onStar} onSay={onSay} onOpenStation={() => go('station')} />
  else if (game === 'station') screen = <Station stars={stars} onBack={back} onSay={onSay} />
  else if (game === 'rocket') screen = <RocketLab stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'dolphin') screen = <DolphinGame stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'me') screen = <MeScreen stars={stars} onBack={back} onSay={onSay} />
  else if (game === 'hero') screen = <HeroHQ stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'sea') screen = <DeepSea stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'workshop') screen = <RobotWorkshop stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else if (game === 'wish') screen = <ShootingWish stars={stars} onBack={back} onStar={onStar} onSay={onSay} />
  else screen = <Menu stars={stars} onPick={go} onClose={() => onClose(false)} onSay={onSay} />
  return (
    <>
      {screen}
      {popup !== null && <NewStickerPopup index={popup} onClose={() => setPopup(null)} />}
    </>
  )
}
