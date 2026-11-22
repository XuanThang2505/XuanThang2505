/**
 * "Cosmo's Mission" – the story that gives the app a reason to come back.
 *
 * Cosmo, a little robot astronaut, crashes his rocket. Eight Star Crystals scatter over the
 * eight planets. The child visits each planet in order, learns the planet's words, answers one
 * question and wins a crystal. With all eight crystals the rocket flies home and the child
 * unlocks the whole Space Station.
 */
import { type PlanetId } from './planetsData'

export type StoryPlanet = Exclude<PlanetId, 'sun'>
export const STORY_PLANETS: StoryPlanet[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

export type Line = { en: string; vi: string }

export const STORY: {
  hello: Line
  tapWord: Line
  finale: Line
  intro: Record<StoryPlanet, Line>
  crystal: Line[]
} = {
  hello: {
    en: 'Hi! I am Cosmo! My rocket is broken. Help me find eight star crystals!',
    vi: 'Chào bạn! Mình là Cosmo! Tên lửa của mình bị hỏng. Giúp mình tìm tám viên pha lê nhé!',
  },
  tapWord: { en: 'Tap the word you hear!', vi: 'Chạm vào từ con nghe được!' },
  finale: {
    en: 'We did it! All eight crystals! Time to fly home!',
    vi: 'Mình làm được rồi! Đủ tám viên pha lê! Đến giờ bay về nhà!',
  },
  intro: {
    mercury: { en: 'First stop, Mercury! It is small and fast.', vi: 'Điểm dừng đầu tiên, Sao Thủy! Nhỏ và rất nhanh.' },
    venus: { en: 'Next, Venus! It is super hot.', vi: 'Tiếp theo, Sao Kim! Nóng kinh khủng.' },
    earth: { en: 'This is Earth, our home!', vi: 'Đây là Trái Đất, nhà của chúng ta!' },
    mars: { en: 'Now, Mars! The red planet.', vi: 'Giờ đến Sao Hỏa! Hành tinh đỏ.' },
    jupiter: { en: 'Wow, Jupiter is huge!', vi: 'Wow, Sao Mộc khổng lồ!' },
    saturn: { en: 'Look at the shiny rings of Saturn!', vi: 'Nhìn vòng sáng của Sao Thổ kìa!' },
    uranus: { en: 'Uranus spins on its side!', vi: 'Sao Thiên Vương quay nằm nghiêng!' },
    neptune: { en: 'Last stop, Neptune! It is deep blue.', vi: 'Điểm cuối, Sao Hải Vương! Xanh thẫm.' },
  },
  crystal: [
    { en: 'Crystal number one!', vi: 'Viên pha lê số một!' },
    { en: 'Crystal number two!', vi: 'Viên pha lê số hai!' },
    { en: 'Crystal number three!', vi: 'Viên pha lê số ba!' },
    { en: 'Crystal number four!', vi: 'Viên pha lê số bốn!' },
    { en: 'Crystal number five!', vi: 'Viên pha lê số năm!' },
    { en: 'Crystal number six!', vi: 'Viên pha lê số sáu!' },
    { en: 'Crystal number seven!', vi: 'Viên pha lê số bảy!' },
    { en: 'Crystal number eight!', vi: 'Viên pha lê số tám!' },
  ],
}

/** A weekly space event (the games menu shows this week's). The Geminids get a special card. */
export const WISH_LINES = {
  title: { en: 'Make a wish!', vi: 'Ước một điều nhé!' },
  catch: { en: 'Catch the shooting star!', vi: 'Bắt sao băng nào!' },
  done: { en: 'Your wishes will come true!', vi: 'Điều ước của con sẽ thành sự thật!' },
}

export const STATION_LINES = {
  title: { en: 'My space station!', vi: 'Trạm vũ trụ của con!' },
}

export function isGeminids(d = new Date()) {
  return d.getMonth() === 11 && d.getDate() >= 10 && d.getDate() <= 17
}

// ---------------------------------------------------------------- progress (saved on the device)
const KEY = 'space-atlas-story'
export interface StoryProgress {
  /** number of planets finished, 0..8 */
  done: number
  seenHello: boolean
  finished: boolean
}
export function loadStory(): StoryProgress {
  try {
    return { done: 0, seenHello: false, finished: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { done: 0, seenHello: false, finished: false }
  }
}
export function saveStory(p: StoryProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* private mode */
  }
}

// ---------------------------------------------------------------- Splash the dolphin + Rocket lab
export const SPLASH_LINES = {
  hello: { en: 'And this is Splash, my dolphin friend!', vi: 'Còn đây là Splash, bạn cá heo của mình!' },
  tap: { en: 'Tap to make Splash jump!', vi: 'Chạm để Splash nhảy lên nào!' },
  done: { en: 'Splash is so happy!', vi: 'Splash vui quá!' },
}

/** Things Splash catches in the Dolphin game – each one teaches a word. */
export const OCEAN_WORDS: { emoji: string; en: string; vi: string }[] = [
  { emoji: '🫧', en: 'BUBBLE', vi: 'Bong bóng' },
  { emoji: '🐠', en: 'FISH', vi: 'Con cá' },
  { emoji: '💧', en: 'WATER', vi: 'Nước' },
  { emoji: '🐚', en: 'SHELL', vi: 'Vỏ sò' },
  { emoji: '⭐', en: 'STAR', vi: 'Ngôi sao' },
  { emoji: '🌙', en: 'MOON', vi: 'Mặt Trăng' },
  { emoji: '🐙', en: 'OCTOPUS', vi: 'Bạch tuộc' },
  { emoji: '🦀', en: 'CRAB', vi: 'Con cua' },
  { emoji: '🐳', en: 'WHALE', vi: 'Cá voi' },
  { emoji: '🌊', en: 'WAVE', vi: 'Con sóng' },
]

export const ROCKET_LINES = {
  build: { en: 'Build your rocket!', vi: 'Con tự làm tên lửa nhé!' },
  count: [
    { en: 'Three!', vi: 'Ba!' },
    { en: 'Two!', vi: 'Hai!' },
    { en: 'One!', vi: 'Một!' },
    { en: 'Blast off!', vi: 'Phóng!' },
  ],
  trips: [
    { en: 'To the Moon!', vi: 'Bay tới Mặt Trăng!', dest: 'moon' as const },
    { en: 'To Mars!', vi: 'Bay tới Sao Hỏa!', dest: 'mars' as const },
    { en: 'To Saturn!', vi: 'Bay tới Sao Thổ!', dest: 'saturn' as const },
    { en: 'To the ocean planet!', vi: 'Bay về hành tinh đại dương!', dest: 'earth' as const },
  ],
}

export const ROCKET_COLORS: { en: string; vi: string; main: string; dark: string }[] = [
  { en: 'BLUE', vi: 'Xanh dương', main: '#38bdf8', dark: '#0369a1' },
  { en: 'GREEN', vi: 'Xanh lá', main: '#4ade80', dark: '#15803d' },
  { en: 'PURPLE', vi: 'Màu tím', main: '#c084fc', dark: '#7e22ce' },
  { en: 'RED', vi: 'Màu đỏ', main: '#f87171', dark: '#b91c1c' },
  { en: 'ORANGE', vi: 'Màu cam', main: '#fb923c', dark: '#c2410c' },
  { en: 'WHITE', vi: 'Màu trắng', main: '#f1f5f9', dark: '#64748b' },
]
export const ROCKET_PILOTS = [
  { id: 'robot', en: 'ROBOT', vi: 'Người máy' },
  { id: 'dolphin', en: 'DOLPHIN', vi: 'Cá heo' },
  { id: 'astronaut', en: 'ASTRONAUT', vi: 'Phi hành gia' },
] as const
export type PilotId = (typeof ROCKET_PILOTS)[number]['id']
export interface RocketDesign {
  color: number
  fins: number
  pilot: PilotId
}
const ROCKET_KEY = 'space-atlas-rocket'
export function loadRocket(): RocketDesign {
  try {
    return { color: 0, fins: 0, pilot: 'robot', ...JSON.parse(localStorage.getItem(ROCKET_KEY) ?? '{}') }
  } catch {
    return { color: 0, fins: 0, pilot: 'robot' }
  }
}
export function saveRocket(r: RocketDesign) {
  try {
    localStorage.setItem(ROCKET_KEY, JSON.stringify(r))
  } catch {
    /* private mode */
  }
}
