/**
 * First screen. The big button is the user gesture iOS Safari needs
 * to unlock AudioContext + speechSynthesis.
 */
export function WelcomeScreen({ onStart, leaving }: { onStart: () => void; leaving: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(40,30,110,0.55),rgba(5,8,24,0.85))] font-nunito transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mb-2 flex gap-4 text-5xl md:text-6xl">
        <span className="animate-float">🪐</span>
        <span className="animate-float [animation-delay:0.4s]">🌍</span>
        <span className="animate-float [animation-delay:0.8s]">☀️</span>
        <span className="animate-float [animation-delay:1.2s]">🔴</span>
      </div>
      <h1 className="text-center text-5xl font-black tracking-wide text-white drop-shadow-[0_0_24px_rgba(120,170,255,0.8)] md:text-6xl">
        Space Atlas
      </h1>
      <p className="mt-2 text-center text-xl font-bold text-sky-200">Learn English with the planets! · Cùng khám phá vũ trụ</p>
      <button
        onClick={onStart}
        className="mt-10 flex items-center gap-4 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 px-12 py-6 text-3xl font-black text-white shadow-[0_0_50px_rgba(255,150,60,0.6)] animate-breathe active:scale-95 md:text-4xl"
      >
        <span className="text-5xl">🚀</span>
        <span className="flex flex-col items-start leading-none">
          <span>TAP TO FLY</span>
          <span className="mt-1 text-xl font-extrabold text-white/90">BẮT ĐẦU</span>
        </span>
      </button>
      <p className="absolute bottom-6 text-sm font-semibold text-white/40">🔊 Bật âm lượng iPad và tắt chế độ im lặng</p>
    </div>
  )
}
