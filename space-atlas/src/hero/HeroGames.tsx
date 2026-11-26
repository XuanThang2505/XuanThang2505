/** Graduation, Shield throw, Hero suit and "What would a hero do?". */
import { useEffect, useMemo, useRef, useState } from 'react'
import { EMBLEMS, GRAD_LINES, HERO_LINES, KIND, loadHero, MISSIONS, saveHero, SUIT_LINES, THROW_LINES } from '../data/heroData'
import { PUZZLE_LINES } from '../data/planetsData'
import { shuffle, wait, type Say } from '../games/ui'
import { playBoing, playHeroTheme, playPop, playPow, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { CaptainStar, ComicBurst } from './CaptainStar'
import { MeAstronaut } from '../me/MeAstronaut'
import { meStore } from '../me/meStore'
import { HERO_COLORS, setHeroStyle, useHeroStyle, type HeroStyle } from './heroStyle'
import { HeroBar, HeroScreen, useShieldThrow } from './shared'

interface P {
  stars: number
  onBack: () => void
  onStar: () => void
  onSay: Say
}

function useAlive() {
  const alive = useRef(true)
  useEffect(
    () => () => {
      alive.current = false
      stopSpeaking()
    },
    [],
  )
  return alive
}

function DoneBox({ title, sub, onAgain, onBack }: { title: string; sub: string; onAgain: () => void; onBack: () => void }) {
  const c = useLayout().compact
  useEffect(() => playHeroTheme(), [])
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/55 px-3 text-center">
      <ComicBurst text="HERO!" size={c ? 120 : 190} />
      <CaptainStar size={c ? 140 : 230} cheer />
      <div className={`font-black ${c ? 'text-3xl' : 'text-5xl'}`}>{title}</div>
      <div className={`font-semibold text-sky-100 ${c ? 'text-base' : 'text-xl'}`}>{sub}</div>
      <div className="mt-1 flex gap-3">
        <button onClick={onAgain} className={`rounded-full bg-gradient-to-r from-amber-400 to-orange-600 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
          ▶ AGAIN
        </button>
        <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
          BACK
        </button>
      </div>
    </div>
  )
}

// ================================================================ graduation (mission 5)
export function Graduation({ stars, onBack, onSay, onComplete }: P & { onComplete: () => void }) {
  const L = useLayout()
  const c = L.compact
  const [prog, setProg] = useState(loadHero)
  const [editing, setEditing] = useState(false)
  const bits = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 0.25, e: ['⭐', '🎉', '💙', '✨'][i % 4] })), [])
  useEffect(() => {
    playHeroTheme()
    onComplete()
    void (async () => {
      await wait(500)
      await onSay(GRAD_LINES.start.en, GRAD_LINES.start.vi)
      await onSay(HERO_LINES.youHero.en, HERO_LINES.youHero.vi)
    })()
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const name = prog.name || 'Little Hero'
  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-3xl'}`}>Hero school 🎖️</div>} />
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-3 pb-3">
        {bits.map((b, i) => (
          <span key={i} className="animate-confetti pointer-events-none absolute -top-8 text-3xl" style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}>
            {b.e}
          </span>
        ))}
        {/* the hero card, like a comic-book cover */}
        <div data-testid="hero-card" className={`animate-word-pop relative flex items-center rounded-[2rem] border-8 border-amber-300 bg-gradient-to-br from-sky-500 via-blue-700 to-indigo-900 shadow-[0_0_60px_rgba(251,191,36,0.45)] ${c ? 'gap-2 p-3' : 'gap-6 p-6'}`}>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-4 py-1 font-black tracking-widest text-white shadow-lg">SPACE GUARDIANS</div>
          {meStore.get().photo ? <MeAstronaut size={c ? 150 : 280} suit="hero" cheer /> : <CaptainStar size={c ? 140 : 260} cheer />}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={`font-black text-amber-200 ${c ? 'text-sm' : 'text-xl'}`}>HERO</div>
            {editing ? (
              <input
                autoFocus
                defaultValue={prog.name}
                maxLength={16}
                placeholder="Tên của bé"
                onBlur={(e) => {
                  // read the saved progress again: the graduation was just recorded by Hero HQ
                  const p = { ...loadHero(), name: e.target.value.trim() }
                  setProg(p)
                  saveHero(p)
                  setEditing(false)
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className={`w-48 rounded-xl px-3 py-1 text-center font-black text-slate-900 ${c ? 'text-lg' : 'text-3xl'}`}
              />
            ) : (
              <button onClick={() => setEditing(true)} className={`font-black drop-shadow ${c ? 'text-2xl' : 'text-5xl'}`}>
                {name} <span className="text-base opacity-70">✏️</span>
              </button>
            )}
            <div className="flex gap-1">
              {MISSIONS.slice(0, 4).map((m) => (
                <span key={m.id} className={`flex items-center justify-center rounded-full bg-amber-300 shadow ${c ? 'h-9 w-9 text-lg' : 'h-14 w-14 text-3xl'} ${prog.done.includes(m.id) ? '' : 'opacity-30 grayscale'}`}>
                  {m.icon}
                </span>
              ))}
            </div>
            <div className={`font-bold text-sky-100 ${c ? 'text-xs' : 'text-base'}`}>Heroes help · Heroes are kind</div>
          </div>
        </div>
        <div className={`mt-3 font-semibold text-sky-200 ${c ? 'text-xs' : 'text-base'}`}>Bố mẹ chạm vào tên để nhập tên của bé</div>
      </div>
    </HeroScreen>
  )
}

// ================================================================ shield throw (numbers)
const THROW_ROUNDS = 8
export function ShieldThrow({ stars, onBack, onStar, onSay }: P) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const area = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const { throwTo, node } = useShieldThrow()
  const [round, setRound] = useState(0)
  const [want, setWant] = useState(1)
  const [spots, setSpots] = useState<number[]>([1, 2, 3, 4, 5])
  const [burst, setBurst] = useState<{ x: number; y: number; k: number } | null>(null)
  const [popped, setPopped] = useState<number | null>(null)
  const [wobble, setWobble] = useState<number | null>(null)
  const [throwing, setThrowing] = useState(false)
  const busy = useRef(false)
  const done = round >= THROW_ROUNDS

  const ask = (n: number, first = false) => {
    setWant(n)
    void speak(THROW_LINES.hit[n - 1].en, { interrupt: !first })
  }
  useEffect(() => {
    if (done) return
    void (async () => {
      await wait(400)
      if (round === 0) await onSay(THROW_LINES.start.en, THROW_LINES.start.vi)
      if (alive.current) ask(1 + Math.floor(Math.random() * 5), true)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const pos = (i: number) => ({ x: 0.42 + (i % 3) * 0.2 + (i > 2 ? 0.1 : 0), y: i > 2 ? 0.62 : 0.28 })

  const hit = async (n: number, e: React.PointerEvent) => {
    if (busy.current || !area.current || !hero.current) return
    busy.current = true
    const a = area.current.getBoundingClientRect()
    const r = e.currentTarget.getBoundingClientRect()
    const to = { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 }
    const h = hero.current.getBoundingClientRect()
    setThrowing(true)
    setTimeout(() => alive.current && setThrowing(false), 900)
    await throwTo({ x: h.left - a.left + h.width * 0.4, y: h.top - a.top + h.height * 0.5 }, to)
    if (!alive.current) return
    if (n !== want) {
      playBoing()
      setWobble(n)
      setTimeout(() => setWobble(null), 600)
      await speak(PUZZLE_LINES.tryAgain.en)
      if (alive.current) void speak(THROW_LINES.hit[want - 1].en, { interrupt: false })
      busy.current = false
      return
    }
    playPow()
    setBurst({ ...to, k: Date.now() })
    setPopped(n)
    onStar()
    void speak(['One!', 'Two!', 'Three!', 'Four!', 'Five!'][n - 1])
    await wait(1100)
    if (!alive.current) return
    setBurst(null)
    setPopped(null)
    setSpots(shuffle([1, 2, 3, 4, 5]))
    busy.current = false
    const r2 = round + 1
    setRound(r2)
    if (r2 < THROW_ROUNDS) ask(1 + Math.floor(Math.random() * 5))
  }

  const ball = c ? 64 : 110
  return (
    <HeroScreen>
      <HeroBar
        onBack={onBack}
        stars={stars}
        middle={
          <button onClick={() => void speak(THROW_LINES.hit[want - 1].en)} className={`flex items-center gap-2 rounded-full bg-white/95 font-black text-slate-900 shadow-xl ${c ? 'px-3 py-1 text-base' : 'px-6 py-2 text-3xl'}`}>
            🛡️ {want} <span className="text-base">🔊</span>
          </button>
        }
      />
      <div ref={area} data-testid="throw-area" className="relative flex-1 overflow-hidden">
        <div ref={hero} className="pointer-events-none absolute bottom-[8%] left-[3%]">
          <CaptainStar size={c ? 130 : 230} shield={!throwing} />
        </div>
        {spots.map((n, i) => (
          <button
            key={n}
            data-testid={`target-${n}`}
            onPointerDown={(e) => void hit(n, e)}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/70 font-black text-white shadow-[inset_0_0_25px_rgba(255,255,255,0.4)] transition-all duration-500 ${
              popped === n ? 'scale-0 opacity-0' : ''
            } ${wobble === n ? 'animate-wiggle' : 'animate-float'}`}
            style={{
              left: `${pos(i).x * 100}%`,
              top: `${pos(i).y * 100}%`,
              width: ball,
              height: ball,
              fontSize: ball * 0.5,
              background: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8'][n - 1],
              animationDelay: `${i * 0.35}s`,
            }}
          >
            {n}
          </button>
        ))}
        {burst && (
          <div key={burst.k} className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: burst.x, top: burst.y }}>
            <ComicBurst text={['POW!', 'BAM!', 'ZOOM!'][round % 3]} size={c ? 110 : 170} />
          </div>
        )}
        {node(c ? 56 : 90)}
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {Array.from({ length: THROW_ROUNDS }, (_, i) => (
            <span key={i} className={`h-3 w-3 rounded-full ${i < round ? 'bg-amber-400' : 'bg-white/25'}`} />
          ))}
        </div>
      </div>
      {done && <DoneBox title="Super throw!" sub={`Con ném trúng ${THROW_ROUNDS} lần!`} onAgain={() => setRound(0)} onBack={onBack} />}
    </HeroScreen>
  )
}

// ================================================================ hero suit
export function HeroSuit({ stars, onBack, onStar, onSay }: P) {
  const L = useLayout()
  const c = L.compact
  const st = useHeroStyle()
  const [pose, setPose] = useState(0)
  const changes = useRef(0)
  useEffect(() => {
    const t = setTimeout(() => void onSay(SUIT_LINES.start.en, SUIT_LINES.start.vi), 450)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])
  const pick = (s: Partial<HeroStyle>, word: string) => {
    playPop()
    setHeroStyle(s)
    void speak(word + '!')
    if (++changes.current % 4 === 0 && changes.current <= 12) onStar()
  }
  const chip = c ? 40 : 60
  const colors = (key: 'suit' | 'cape' | 'mask' | 'shield', title: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>{title}</div>
      <div className={`flex flex-wrap justify-center ${c ? 'gap-1' : 'gap-2'}`}>
        {HERO_COLORS.map((col, i) => (
          <button
            key={col.en}
            aria-label={`${key} ${col.en}`}
            data-testid={`${key}-${col.en}`}
            onClick={() => pick({ [key]: i } as Partial<HeroStyle>, col.en)}
            className={`rounded-full border-4 shadow active:scale-90 ${st[key] === i ? 'scale-110 border-white' : 'border-white/20'}`}
            style={{ width: chip, height: chip, background: `radial-gradient(circle at 35% 35%, ${col.main}, ${col.dark})` }}
          />
        ))}
      </div>
    </div>
  )
  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Hero suit 🦸</div>} />
      <div className={`flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3 ${L.portrait ? 'flex-col gap-2' : c ? 'gap-4' : 'gap-12'}`}>
        <div className="relative flex flex-col items-center">
          {pose > 0 && (
            <div key={pose} className="pointer-events-none absolute -top-6 right-0 z-10">
              <ComicBurst text="HERO!" size={c ? 80 : 130} />
            </div>
          )}
          <CaptainStar key={pose} size={L.portrait ? Math.min(L.h * 0.3, 300) : c ? 170 : 340} cheer={pose > 0} />
        </div>
        <div className={`flex flex-col items-center ${c ? 'gap-1.5' : 'gap-4'}`}>
          {colors('suit', 'SUIT · Bộ đồ')}
          {colors('cape', 'CAPE · Áo choàng')}
          {colors('mask', 'MASK · Mặt nạ')}
          {colors('shield', 'SHIELD · Khiên')}
          <div className="flex flex-col items-center gap-1">
            <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>EMBLEM · Biểu tượng</div>
            <div className={`flex ${c ? 'gap-1.5' : 'gap-3'}`}>
              {EMBLEMS.map((e) => (
                <button
                  key={e.id}
                  data-testid={`emblem-${e.id}`}
                  onClick={() => pick({ emblem: e.id }, e.en)}
                  className={`flex items-center justify-center rounded-2xl border-4 bg-white/5 active:scale-90 ${st.emblem === e.id ? 'border-white bg-white/15' : 'border-white/20'}`}
                  style={{ width: chip * 1.15, height: chip * 1.15, fontSize: chip * 0.55 }}
                >
                  {e.icon}
                </button>
              ))}
            </div>
          </div>
          <button
            data-testid="hero-pose"
            onClick={() => {
              playHeroTheme()
              setPose((p) => p + 1)
              void speak(HERO_LINES.youHero.en)
            }}
            className={`animate-breathe mt-1 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-sky-500 font-black text-white shadow-xl active:scale-95 ${c ? 'px-6 py-2 text-lg' : 'px-10 py-4 text-3xl'}`}
          >
            💥 HERO POSE!
          </button>
        </div>
      </div>
    </HeroScreen>
  )
}

// ================================================================ what would a hero do?
export function KindChoices({ stars, onBack, onStar, onSay }: P) {
  const L = useLayout()
  const c = L.compact
  const alive = useAlive()
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(0)
  const [faded, setFaded] = useState(false)
  const [cheer, setCheer] = useState(false)
  const busy = useRef(false)
  const k = KIND[i % KIND.length]
  const goodFirst = useMemo(() => Math.random() < 0.5, [i])
  const done = i >= KIND.length

  useEffect(() => {
    if (done) return
    setFaded(false)
    setCheer(false)
    busy.current = false
    const t = setTimeout(() => void onSay(k.q.en, k.q.vi), i === 0 ? 600 : 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, done])

  const choose = async (good: boolean) => {
    if (busy.current) return
    if (!good) {
      playBoing()
      setFaded(true)
      await onSay(HERO_LINES.tryHero.en, HERO_LINES.tryHero.vi)
      return
    }
    busy.current = true
    playSparkle()
    setCheer(true)
    onStar()
    setHearts((h) => h + 1)
    await speak(k.good.en)
    if (!alive.current) return
    await onSay(HERO_LINES.heroDo.en, HERO_LINES.heroDo.vi)
    if (!alive.current) return
    await wait(500)
    if (alive.current) setI(i + 1)
  }

  const card = (good: boolean) => {
    const a = good ? k.good : k.bad
    return (
      <button
        key={good ? 'g' : 'b'}
        data-testid={good ? 'kind-good' : 'kind-bad'}
        onClick={() => void choose(good)}
        className={`flex flex-col items-center justify-center rounded-[2rem] border-4 bg-white/95 text-slate-900 shadow-xl transition active:scale-95 ${
          !good && faded ? 'scale-90 opacity-30' : ''
        } ${good && cheer ? 'animate-word-pop border-amber-400' : 'border-white/40'} ${c ? 'w-36 gap-1 p-2' : 'w-64 gap-2 p-5'}`}
      >
        <span className={c ? 'text-5xl' : 'text-8xl'}>{a.icon}</span>
        <b className={`font-black leading-tight ${c ? 'text-sm' : 'text-2xl'}`}>{a.en}</b>
        <small className={`font-semibold text-slate-500 ${c ? 'text-[11px]' : 'text-base'}`}>{a.vi}</small>
      </button>
    )
  }

  return (
    <HeroScreen>
      <HeroBar
        onBack={onBack}
        stars={stars}
        middle={
          <div className="flex gap-0.5">
            {KIND.map((_, j) => (
              <span key={j} className={`${c ? 'text-lg' : 'text-3xl'} ${j < hearts ? '' : 'opacity-25 grayscale'}`}>
                💙
              </span>
            ))}
          </div>
        }
      />
      {!done && (
        <div className={`flex flex-1 flex-col items-center justify-center px-3 pb-3 ${c ? 'gap-2' : 'gap-6'}`}>
          <div className={`flex items-center ${c ? 'gap-2' : 'gap-6'}`}>
            <CaptainStar size={c ? 90 : 170} cheer={cheer} />
            <div className={c ? 'text-6xl' : 'text-9xl'}>{k.scene}</div>
          </div>
          <button onClick={() => void onSay(k.q.en, k.q.vi)} className={`rounded-3xl bg-slate-900/90 text-center shadow-xl ${c ? 'px-3 py-2' : 'px-8 py-4'}`}>
            <b className={`block font-black ${c ? 'text-base' : 'text-3xl'}`}>{k.q.en} 🔊</b>
            <small className={`block font-semibold text-sky-200 ${c ? 'text-xs' : 'text-lg'}`}>{k.q.vi}</small>
          </button>
          <div className={`flex ${c ? 'gap-3' : 'gap-8'}`}>{goodFirst ? [card(true), card(false)] : [card(false), card(true)]}</div>
        </div>
      )}
      {done && (
        <DoneBox
          title="You are a hero!"
          sub="Con luôn giúp đỡ và tốt bụng 💙"
          onAgain={() => {
            setHearts(0)
            setI(0)
          }}
          onBack={onBack}
        />
      )}
    </HeroScreen>
  )
}
