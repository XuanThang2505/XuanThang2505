/**
 * First screen: Cosmo the robot and Splash the dolphin say hi over a little ocean.
 * The big button is the user gesture iOS Safari needs to unlock audio + speech.
 */
import { Cosmo, Splash } from '../story/Cosmo'
import { useLayout } from '../utils/useLayout'

const WAVE = 'M0 30 ' + Array.from({ length: 8 }, (_, i) => `Q ${i * 150 + 75} ${i % 2 ? 58 : 2} ${(i + 1) * 150} 30`).join(' ') + ' V60 H0 Z'

export function WelcomeScreen({ onStart, leaving }: { onStart: () => void; leaving: boolean }) {
  const L = useLayout()
  const c = L.compact
  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(20,60,140,0.6),rgba(5,8,24,0.9))] font-nunito transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* ocean at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%]">
        <svg className="animate-waves-slow absolute left-0 top-0 h-8 w-[200%] opacity-60" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d={WAVE} fill="#38bdf8" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 top-4 bg-gradient-to-b from-sky-500 to-blue-900" />
        <svg className="animate-waves absolute left-0 top-2 h-8 w-[200%]" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d={WAVE} fill="#0ea5e9" />
        </svg>
      </div>

      <div className={`flex items-end ${c ? 'gap-3' : 'gap-10'}`}>
        <Cosmo size={c ? 80 : 150} />
        <div className="flex flex-col items-center">
          <h1 className={`text-center font-black tracking-wide text-white drop-shadow-[0_0_24px_rgba(56,189,248,0.9)] ${c ? 'text-4xl' : 'text-6xl md:text-7xl'}`}>Space Atlas</h1>
          <p className={`mt-1 text-center font-bold text-sky-200 ${c ? 'text-sm' : 'text-xl'}`}>with Cosmo &amp; Splash · Cùng khám phá vũ trụ</p>
        </div>
        <Splash size={c ? 90 : 170} />
      </div>
      <button
        onClick={onStart}
        className={`animate-breathe flex items-center gap-4 rounded-full border-4 border-white/40 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 font-black text-white shadow-[0_0_50px_rgba(56,189,248,0.7)] active:scale-95 ${
          c ? 'mt-5 px-8 py-3 text-2xl' : 'mt-10 px-12 py-6 text-3xl md:text-4xl'
        }`}
      >
        <span className={c ? 'text-4xl' : 'text-5xl'}>🚀</span>
        <span className="flex flex-col items-start leading-none">
          <span>TAP TO FLY</span>
          <span className={`mt-1 font-extrabold text-white/90 ${c ? 'text-base' : 'text-xl'}`}>BẮT ĐẦU</span>
        </span>
      </button>
      <p className="absolute bottom-[17%] text-sm font-semibold text-white/50">🔊 Bật âm lượng iPad và tắt chế độ im lặng</p>
    </div>
  )
}
