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
