import { useCallback, useEffect, useRef, useState } from 'react'
import { SolarScene } from './components/SolarScene'
import { IPadHUD } from './components/IPadHUD'
import { WelcomeScreen } from './components/WelcomeScreen'
import { GamesHub, loadStars, saveStars } from './games/GamesHub'
import type { ActiveEffect } from './components/PlanetMesh'
import { COUNT_STEP, effectDuration, lessonFor, PLANET_MAP, PLANET_ORDER, type ViewId, type VocabWord } from './data/planetsData'
import {
  hasVietnameseVoice,
  preloadVoiceClips,
  setSpeechRate,
  speakBilingual,
  speakSequence,
  stopSpeaking,
  unlockSpeech,
  type SpeechRate,
} from './utils/speech'
import { preloadProceduralTextures } from './utils/textures'
import { playArrive, playBoing, playPop, playSparkle, playWhoosh, startMusic, stopMusic, unlockAudio } from './utils/soundEffects'

export interface Settings {
  rate: SpeechRate
  autoRotate: boolean
  music: boolean
  vietnameseVoice: boolean
}

const SETTINGS_KEY = 'space-atlas-settings'
const DEFAULT_SETTINGS: Settings = { rate: 'normal', autoRotate: true, music: true, vietnameseVoice: false }

function loadSettings(): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [planetId, setPlanetId] = useState<ViewId>('system')
  const [flying, setFlying] = useState(true)
  const [effect, setEffect] = useState<ActiveEffect | null>(null)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [compareOn, setCompareOn] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const [stars, setStars] = useState(loadStars)
  const addStar = useCallback(() => setStars((n) => n + 1), [])
  useEffect(() => saveStars(stars), [stars])
  const [bounce, setBounce] = useState(0)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [viVoice, setViVoice] = useState(false)
  const wordTimer = useRef<number | null>(null)
  const planet = lessonFor(planetId)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSpeechRate(settings.rate)
  }, [settings])

  useEffect(() => {
    if (started && settings.music) startMusic()
    else stopMusic()
  }, [started, settings.music])

  const say = useCallback((en: string, vi?: string) => {
    void speakBilingual(en, vi, settingsRef.current.vietnameseVoice)
  }, [])

  const handleStart = useCallback(() => {
    // Everything here runs inside the tap → iOS unlocks audio + speech.
    void unlockAudio()
    unlockSpeech()
    playWhoosh()
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
    try {
      if (el.requestFullscreen) void el.requestFullscreen().catch(() => {})
      else el.webkitRequestFullscreen?.()
    } catch {
      /* not supported – fine */
    }
    setStarted(true)
    preloadProceduralTextures()
    void preloadVoiceClips()
    setTimeout(() => setViVoice(hasVietnameseVoice()), 800)
  }, [])

  const handleArrive = useCallback(
    (id: ViewId) => {
      setFlying(false)
      playArrive()
      setBounce((b) => b + 1)
      const p = lessonFor(id)
      setTimeout(() => say(p.englishName + '!', p.vietnameseName), 150)
    },
    [say],
  )

  const handleSelectPlanet = useCallback(
    (id: ViewId) => {
      if (id === planetId) {
        playPop()
        setBounce((b) => b + 1)
        say(planet.englishName + '!', planet.vietnameseName)
        return
      }
      stopSpeaking()
      playWhoosh()
      setFlying(true)
      setEffect(null)
      setActiveWord(null)
      setCompareOn(false)
      setPlanetId(id)
    },
    [planetId, planet, say],
  )

  const handleSpeakName = useCallback(() => {
    setBounce((b) => b + 1)
    say(planet.englishName + '!', planet.vietnameseName)
  }, [planet, say])

  const handleSpeakPhrase = useCallback(() => {
    say(planet.englishPhrase, planet.vietnameseSub)
  }, [planet, say])

  const handlePlanetTap = useCallback(() => {
    if (flying) return
    playBoing()
    handleSpeakName()
  }, [flying, handleSpeakName])

  const handleVocab = useCallback(
    (w: VocabWord) => {
      if (flying) return
      playSparkle()
      setEffect({ name: w.effect, key: Date.now() })
      setActiveWord(w.word)
      if (w.effect === 'countPlanets') {
        // "Mercury, Venus, Earth…" in step with the planets lighting up
        void speakSequence(
          PLANET_ORDER.map((id) => PLANET_MAP[id].englishName + '!'),
          COUNT_STEP,
        )
      } else {
        say(w.word + '!', w.vi)
      }
      if (wordTimer.current) window.clearTimeout(wordTimer.current)
      wordTimer.current = window.setTimeout(() => setActiveWord(null), effectDuration(w.effect) * 1000)
    },
    [flying, say],
  )

  const handleToggleCompare = useCallback(() => {
    if (flying || !('compare' in planet)) return
    playPop()
    if (!compareOn) say(planet.compare.en, planet.compare.vi)
    setCompareOn(!compareOn)
  }, [flying, compareOn, planet, say])

  const openGames = useCallback(() => {
    playPop()
    stopSpeaking()
    setEffect(null)
    setActiveWord(null)
    setCompareOn(false)
    setGamesOpen(true)
  }, [])

  const closeGames = useCallback(
    (to3D: boolean) => {
      playPop()
      stopSpeaking()
      setGamesOpen(false)
      if (to3D) handleSelectPlanet('system')
    },
    [handleSelectPlanet],
  )

  return (
    <div className="relative h-[100dvh] w-screen touch-none select-none overflow-hidden bg-[#050818] font-nunito">
      <SolarScene
        viewId={planetId}
        started={started}
        effect={effect}
        compareOn={compareOn}
        autoRotate={settings.autoRotate}
        onArrive={handleArrive}
        onPlanetTap={handlePlanetTap}
        onSelectPlanet={handleSelectPlanet}
        paused={gamesOpen}
      />

      {started && gamesOpen && <GamesHub stars={stars} onStar={addStar} onClose={closeGames} onSay={say} />}

      {started && !gamesOpen && (
        <IPadHUD
          planet={planet}
          currentId={planetId}
          flying={flying}
          nameBounceKey={bounce}
          activeWord={activeWord}
          compareOn={compareOn}
          settings={settings}
          hasViVoice={viVoice}
          onSpeakName={handleSpeakName}
          onSpeakPhrase={handleSpeakPhrase}
          onVocab={handleVocab}
          onToggleCompare={handleToggleCompare}
          onSelectPlanet={handleSelectPlanet}
          onOpenGames={openGames}
          stars={stars}
          onFact={say}
          onSettingsChange={setSettings}
        />
      )}

      <WelcomeScreen onStart={handleStart} leaving={started} />

      <div className="rotate-hint pointer-events-none absolute inset-x-0 top-1/3 z-50 flex-col items-center font-nunito text-white">
        <div className="animate-wiggle text-6xl">📱↻</div>
        <div className="mt-2 rounded-full bg-slate-900/80 px-4 py-2 text-lg font-bold">Xoay ngang iPad nhé! · Turn sideways</div>
      </div>
    </div>
  )
}
