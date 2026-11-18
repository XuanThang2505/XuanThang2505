import { useCallback, useEffect, useRef, useState } from 'react'
import { SolarScene } from './components/SolarScene'
import { IPadHUD } from './components/IPadHUD'
import { WelcomeScreen } from './components/WelcomeScreen'
import type { ActiveEffect } from './components/PlanetMesh'
import { EFFECT_DURATION, PLANET_MAP, type PlanetId, type VocabWord } from './data/planetsData'
import { hasVietnameseVoice, setSpeechRate, speakBilingual, stopSpeaking, unlockSpeech, type SpeechRate } from './utils/speech'
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
  const [planetId, setPlanetId] = useState<PlanetId>('earth')
  const [flying, setFlying] = useState(true)
  const [effect, setEffect] = useState<ActiveEffect | null>(null)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [compareOn, setCompareOn] = useState(false)
  const [bounce, setBounce] = useState(0)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [viVoice, setViVoice] = useState(false)
  const wordTimer = useRef<number | null>(null)
  const planet = PLANET_MAP[planetId]
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
    setTimeout(() => setViVoice(hasVietnameseVoice()), 800)
  }, [])

  const handleArrive = useCallback(
    (id: PlanetId) => {
      setFlying(false)
      playArrive()
      setBounce((b) => b + 1)
      const p = PLANET_MAP[id]
      setTimeout(() => say(p.englishName + '!', p.vietnameseName), 150)
    },
    [say],
  )

  const handleSelectPlanet = useCallback(
    (id: PlanetId) => {
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
      say(w.word + '!', w.vi)
      if (wordTimer.current) window.clearTimeout(wordTimer.current)
      wordTimer.current = window.setTimeout(() => setActiveWord(null), EFFECT_DURATION * 1000)
    },
    [flying, say],
  )

  const handleToggleCompare = useCallback(() => {
    if (flying) return
    playPop()
    if (!compareOn) say(planet.compare.en, planet.compare.vi)
    setCompareOn(!compareOn)
  }, [flying, compareOn, planet, say])

  return (
    <div className="relative h-[100dvh] w-screen touch-none select-none overflow-hidden bg-[#050818] font-nunito">
      <SolarScene
        planetId={planetId}
        started={started}
        effect={effect}
        compareOn={compareOn}
        autoRotate={settings.autoRotate}
        onArrive={handleArrive}
        onPlanetTap={handlePlanetTap}
      />

      {started && (
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
