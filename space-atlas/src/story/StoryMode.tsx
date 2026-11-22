/**
 * Cosmo's Mission: the story campaign. Map of 8 planets → chapter (intro, two word rounds,
 * one question) → crystal → next planet → finale. All voice-led, nothing can be lost.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { GAME_LINES, PLANET_MAP, PUZZLE_LINES, QUIZ, type PlanetId, type VocabWord } from '../data/planetsData'
import { loadStory, saveStory, STORY, STORY_PLANETS, type StoryProgress } from '../data/storyData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { QuestionButton, Screen, shuffle, TopBar, wait, type Say } from '../games/ui'
import { playBoing, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Bubble, Cosmo, Crystal } from './Cosmo'

interface Props {
  stars: number
  onBack: () => void
  onStar: () => void
  onSay: Say
  onOpenStation: () => void
}

const praiseLine = () => [...PUZZLE_LINES.praise, GAME_LINES.super][Math.floor(Math.random() * 4)]

export function StoryMode({ stars, onBack, onStar, onSay, onOpenStation }: Props) {
  const L = useLayout()
  const c = L.compact
  const [prog, setProg] = useState<StoryProgress>(loadStory)
  const [chapter, setChapter] = useState<number | null>(null)
  const [finale, setFinale] = useState(false)
  const alive = useRef(true)
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )

  const update = (p: StoryProgress) => {
    setProg(p)
    saveStory(p)
  }

  // Greeting the very first time
  useEffect(() => {
    if (prog.seenHello || chapter !== null) return
    const t = setTimeout(async () => {
      await onSay(STORY.hello.en, STORY.hello.vi)
      if (alive.current) update({ ...loadStory(), seenHello: true })
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const crystals = (
    <div className="flex items-center gap-0.5">
      {STORY_PLANETS.map((_, i) => (
        <Crystal key={i} size={c ? 22 : 38} dim={i >= prog.done} />
      ))}
    </div>
  )

  if (finale || (prog.finished && chapter === -1)) {
    return <Finale crystals={crystals} stars={stars} onBack={onBack} onSay={onSay} onStation={onOpenStation} />
  }

  if (chapter !== null && chapter >= 0) {
    return (
      <Chapter
        index={chapter}
        stars={stars}
        crystals={crystals}
        onExit={() => setChapter(null)}
        onStar={onStar}
        onSay={onSay}
        onDone={() => {
          const done = Math.max(prog.done, chapter + 1)
          const finished = done >= STORY_PLANETS.length
          update({ ...prog, done, finished, seenHello: true })
          if (finished) setFinale(true)
          else setChapter(null)
        }}
      />
    )
  }

  const next = Math.min(prog.done, STORY_PLANETS.length - 1)
  const ball = c ? (L.portrait ? 74 : 70) : 120
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={crystals} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-3 pb-3">
        <div className={`flex flex-wrap items-center justify-center ${c ? 'gap-x-3 gap-y-4' : 'gap-x-8 gap-y-8'}`} style={{ maxWidth: c ? 360 : 820 }}>
          {STORY_PLANETS.map((id, i) => {
            const isDone = i < prog.done
            const isNext = i === next && !prog.finished
            const locked = i > prog.done
            return (
              <button
                key={id}
                data-testid={`story-planet-${id}`}
                onClick={() => {
                  playPop()
                  if (locked) {
                    void speak(PLANET_MAP[STORY_PLANETS[next]].englishName + '!')
                    return
                  }
                  if (isDone) void speak(PLANET_MAP[id].englishName + '!')
                  if (isNext) setChapter(i)
                  else if (isDone) setChapter(i)
                }}
                className={`relative flex flex-col items-center active:scale-95 ${locked ? 'opacity-40' : ''} ${isNext ? 'animate-breathe' : ''}`}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {isNext && <span className={`absolute z-10 animate-float ${c ? '-top-6 text-2xl' : '-top-10 text-4xl'}`}>🚀</span>}
                <div className={isNext ? 'animate-glow-ring rounded-full' : ''}>
                  <PlanetBall2D id={id} size={ball} />
                </div>
                <span className={`mt-1 font-extrabold ${c ? 'text-[11px]' : 'text-base'}`}>{PLANET_MAP[id].englishName}</span>
                <span className="absolute -right-1 -top-1">{isDone ? <Crystal size={c ? 22 : 34} /> : locked ? <span className={c ? 'text-lg' : 'text-3xl'}>🔒</span> : null}</span>
              </button>
            )
          })}
        </div>
        <div className={`flex items-end ${c ? 'gap-2' : 'gap-5'}`}>
          <Cosmo size={c ? 76 : 140} />
          <Bubble
            compact={c}
            en={prog.finished ? 'Come back any time!' : prog.done === 0 ? 'Tap the glowing planet!' : `Crystal ${prog.done} of 8! Keep going!`}
            vi={prog.finished ? 'Con có thể quay lại chơi bất cứ lúc nào!' : prog.done === 0 ? 'Chạm vào hành tinh đang sáng!' : `Đã có ${prog.done}/8 viên pha lê! Đi tiếp nào!`}
            onTap={() => void onSay(prog.done === 0 ? STORY.hello.en : STORY.crystal[Math.max(0, prog.done - 1)].en)}
          />
        </div>
        {prog.finished && (
          <button
            onClick={() => {
              playPop()
              onOpenStation()
            }}
            className={`rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}
          >
            🛰️ MY SPACE STATION
          </button>
        )}
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------- one chapter (one planet)
type Step = 'intro' | 'word0' | 'word1' | 'quiz' | 'reward'

function Chapter({
  index,
  stars,
  crystals,
  onExit,
  onStar,
  onSay,
  onDone,
}: {
  index: number
  stars: number
  crystals: React.ReactNode
  onExit: () => void
  onStar: () => void
  onSay: Say
  onDone: () => void
}) {
  const L = useLayout()
  const c = L.compact
  const id = STORY_PLANETS[index]
  const planet = PLANET_MAP[id]
  const intro = STORY.intro[id]
  const [step, setStep] = useState<Step>('intro')
  const [wrong, setWrong] = useState<string[]>([])
  const [right, setRight] = useState<string | null>(null)
  const alive = useRef(true)
  const busy = useRef(false)
  const wordOrder = useMemo(() => shuffle(planet.vocabWords).slice(0, 2), [planet])
  const quizQ = useMemo(() => {
    const own = QUIZ.filter((q) => q[3] === id)
    return own[Math.floor(Math.random() * own.length)]
  }, [id])
  const quizOptions = useMemo(
    () => shuffle<PlanetId>([id, ...shuffle((['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'sun'] as PlanetId[]).filter((p) => p !== id)).slice(0, 2)]),
    [id],
  )
  const target: VocabWord | null = step === 'word0' ? wordOrder[0] : step === 'word1' ? wordOrder[1] : null

  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )

  // the script of each step
  useEffect(() => {
    alive.current = true
    busy.current = false
    setWrong([])
    setRight(null)
    let cancelled = false
    void (async () => {
      if (step === 'intro') {
        await wait(500)
        if (cancelled) return
        await onSay(intro.en, intro.vi)
        if (!cancelled) setStep('word0')
      } else if (target) {
        await wait(step === 'word0' ? 300 : 200)
        if (cancelled) return
        if (step === 'word0') await speak(STORY.tapWord.en)
        if (!cancelled) void speak(target.word + '!', { interrupt: step !== 'word0' })
      } else if (step === 'quiz') {
        await wait(300)
        if (!cancelled) void onSay(quizQ[1], quizQ[2])
      } else if (step === 'reward') {
        playSparkle()
        onStar()
        onStar()
        await wait(400)
        if (cancelled) return
        await onSay(STORY.crystal[index].en, STORY.crystal[index].vi)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const advance = async (to: Step) => {
    await speak(praiseLine().en, { interrupt: false })
    await wait(300)
    if (alive.current) setStep(to)
  }

  const pickWord = async (w: VocabWord) => {
    if (busy.current || !target || wrong.includes(w.word)) return
    if (w.word === target.word) {
      busy.current = true
      setRight(w.word)
      playSparkle()
      await speak(w.word + '!')
      if (alive.current) await advance(step === 'word0' ? 'word1' : 'quiz')
    } else {
      setWrong((x) => [...x, w.word])
      playBoing()
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current && !busy.current) void speak(target.word + '!', { interrupt: false })
    }
  }

  const pickPlanet = async (p: PlanetId) => {
    if (busy.current || wrong.includes(p)) return
    if (p === id) {
      busy.current = true
      setRight(p)
      playSparkle()
      await speak(PLANET_MAP[p].englishName + '!')
      if (alive.current) await advance('reward')
    } else {
      setWrong((x) => [...x, p])
      playBoing()
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current && !busy.current) void speak(quizQ[1], { interrupt: false })
    }
  }

  const bubbleLine =
    step === 'intro' ? intro : target ? STORY.tapWord : step === 'quiz' ? { en: quizQ[1], vi: quizQ[2] } : STORY.crystal[index]
  const stepNo = step === 'intro' ? 0 : step === 'word0' ? 1 : step === 'word1' ? 2 : step === 'quiz' ? 3 : 4

  return (
    <Screen>
      <TopBar onBack={onExit} stars={stars} middle={crystals} />
      <div className={`flex flex-1 flex-col items-center justify-center overflow-y-auto px-3 pb-3 ${c ? 'gap-3' : 'gap-6'}`}>
        {/* progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-3 w-3 rounded-full ${i < stepNo ? 'bg-amber-400' : i === stepNo ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>

        <div className={`flex items-end justify-center ${c ? 'gap-2' : 'gap-6'}`}>
          <div className="animate-drift">
            <PlanetBall2D id={id} size={step === 'reward' ? (c ? 80 : 160) : c ? 96 : 190} />
          </div>
          <Cosmo size={c ? 70 : 130} cheer={step === 'reward'} />
        </div>

        <Bubble compact={c} en={bubbleLine.en} vi={bubbleLine.vi} onTap={() => void onSay(bubbleLine.en, bubbleLine.vi)} />

        {target && (
          <div className={`flex justify-center ${c ? 'gap-3' : 'gap-6'}`}>
            {planet.vocabWords.map((w) => {
              const bad = wrong.includes(w.word)
              const good = right === w.word
              const hint = !right && wrong.length >= 2 && w.word === target.word
              return (
                <button
                  key={w.word}
                  data-testid={`story-word-${w.word}`}
                  onClick={() => void pickWord(w)}
                  className={`flex flex-col items-center justify-center rounded-3xl border-4 font-black shadow-xl transition active:scale-95 ${
                    c ? 'h-24 w-24' : 'h-40 w-40'
                  } ${good ? 'animate-word-pop border-emerald-300 bg-emerald-500/70' : bad ? 'border-rose-400/60 bg-slate-800/60 opacity-50' : 'border-white/30 bg-indigo-500/50'} ${hint ? 'animate-glow-ring' : ''}`}
                >
                  <span className={c ? 'text-4xl' : 'text-6xl'}>{w.icon}</span>
                  <span className={c ? 'text-sm' : 'text-xl'}>{w.word}</span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'quiz' && (
          <>
            <QuestionButton icon={quizQ[0]} en={quizQ[1]} vi={quizQ[2]} onSay={onSay} />
            <div className={`flex flex-wrap justify-center ${c ? 'gap-3' : 'gap-6'}`}>
              {quizOptions.map((p) => {
                const bad = wrong.includes(p)
                const good = right === p
                const hint = !right && wrong.length >= 2 && p === id
                return (
                  <button
                    key={p}
                    data-testid={`story-quiz-${p}`}
                    onClick={() => void pickPlanet(p)}
                    className={`rounded-full p-1 transition active:scale-90 ${bad ? 'opacity-30' : ''} ${good ? 'animate-word-pop' : ''} ${hint ? 'animate-glow-ring' : ''}`}
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <PlanetBall2D id={p} size={c ? 76 : 130} />
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 'reward' && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-word-pop">
              <Crystal size={c ? 90 : 150} />
            </div>
            <button
              data-testid="story-next"
              onClick={() => {
                playPop()
                onDone()
              }}
              className={`rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 font-black shadow-xl active:scale-95 ${c ? 'px-6 py-2.5 text-xl' : 'px-10 py-4 text-3xl'}`}
            >
              {index === STORY_PLANETS.length - 1 ? 'FLY HOME 🚀' : 'NEXT ▶'}
            </button>
          </div>
        )}
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------- the ending
function Finale({ crystals, stars, onBack, onSay, onStation }: { crystals: React.ReactNode; stars: number; onBack: () => void; onSay: Say; onStation: () => void }) {
  const c = useLayout().compact
  const [launched, setLaunched] = useState(false)
  useEffect(() => {
    playSparkle()
    const a = setTimeout(() => void onSay(STORY.finale.en, STORY.finale.vi), 400)
    const b = setTimeout(() => setLaunched(true), 3500)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
      stopSpeaking()
    }
  }, [onSay])
  const bits = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 0.25, e: ['⭐', '✨', '🎉', '💎'][i % 4] })), [])
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={crystals} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-3 text-center">
        {bits.map((b, i) => (
          <span key={i} className="animate-confetti pointer-events-none absolute -top-8 text-3xl" style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}>
            {b.e}
          </span>
        ))}
        <div className={`${launched ? 'animate-launch' : 'animate-float'} ${c ? 'text-7xl' : 'text-[140px]'} leading-none`}>🚀</div>
        <div className={`font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${c ? 'text-3xl' : 'text-6xl'}`}>You did it!</div>
        <div className={`font-semibold text-sky-200 ${c ? 'text-base' : 'text-2xl'}`}>Con đã giúp Cosmo bay về nhà! Con là Nhà thám hiểm vũ trụ 🌟</div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={onStation} className={`rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
            🛰️ MY SPACE STATION
          </button>
          <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
            BACK
          </button>
        </div>
      </div>
    </Screen>
  )
}
