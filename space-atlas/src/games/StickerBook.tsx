/**
 * Sticker Book: every few stars unlocks a space sticker. Tapping a sticker says its
 * English name, so collecting rewards also teaches new words.
 */
import { useEffect } from 'react'
import { GAME_LINES, STARS_PER_STICKER, STICKERS } from '../data/planetsData'
import { playPop, playSparkle } from '../utils/soundEffects'
import { speak } from '../utils/speech'
import { Screen, TopBar, type Say } from './ui'

export function stickersUnlocked(stars: number) {
  return Math.min(STICKERS.length, Math.floor(stars / STARS_PER_STICKER))
}

export function StickerBook({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const unlocked = stickersUnlocked(stars)
  const toNext = unlocked < STICKERS.length ? STARS_PER_STICKER - (stars % STARS_PER_STICKER) : 0
  useEffect(() => {
    const t = setTimeout(() => onSay(GAME_LINES.myStickers.en, GAME_LINES.myStickers.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className="text-4xl font-black">My stickers 🌟</div>} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-4">
        <div className="grid grid-cols-6 gap-4">
          {STICKERS.map((st, i) => {
            const has = i < unlocked
            return (
              <button
                key={st.en}
                data-sticker={st.en}
                disabled={!has}
                onClick={() => {
                  playPop()
                  void speak(st.en + '!')
                }}
                className={`flex h-32 w-32 flex-col items-center justify-center rounded-3xl border-4 shadow-xl transition active:scale-95 lg:h-36 lg:w-36 ${
                  has ? 'border-amber-300/70 bg-gradient-to-br from-indigo-500/60 to-fuchsia-600/60' : 'border-dashed border-white/20 bg-slate-900/50'
                }`}
              >
                <span className={`text-6xl ${has ? '' : 'opacity-20 grayscale'}`}>{has ? st.emoji : '❔'}</span>
                <span className="mt-1 text-sm font-extrabold tracking-wide">{has ? st.en : `${(i + 1) * STARS_PER_STICKER} ⭐`}</span>
                {has && <span className="text-[11px] font-semibold text-white/75">{st.vi}</span>}
              </button>
            )
          })}
        </div>
        <div className="rounded-full bg-slate-900/70 px-5 py-2 text-lg font-bold text-sky-100">
          {toNext > 0 ? `Thêm ${toNext} ⭐ nữa để có hình dán mới!` : 'Con đã có đủ hình dán! 🎉'}
        </div>
      </div>
    </Screen>
  )
}

/** Big celebration when a new sticker is unlocked. */
export function NewStickerPopup({ index, onClose }: { index: number; onClose: () => void }) {
  const st = STICKERS[index]
  useEffect(() => {
    playSparkle()
    void (async () => {
      await speak(GAME_LINES.newSticker.en)
      await speak(st.en + '!', { interrupt: false })
    })()
  }, [st])
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-nunito text-white" onClick={onClose}>
      <div className="animate-word-pop flex flex-col items-center gap-2 rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-br from-indigo-600 to-fuchsia-700 px-14 py-8 shadow-[0_0_80px_20px_rgba(251,191,36,0.35)]">
        <div className="text-2xl font-black text-amber-200">NEW STICKER!</div>
        <div className="animate-wiggle text-[120px] leading-none">{st.emoji}</div>
        <div className="text-4xl font-black">{st.en}</div>
        <div className="text-lg font-semibold text-white/80">{st.vi}</div>
        <button className="mt-3 rounded-full bg-amber-400 px-8 py-3 text-2xl font-black text-slate-900 shadow-xl active:scale-95">OK 👍</button>
      </div>
    </div>
  )
}
