/**
 * Captain Star & the Space Guardians – an original space superhero (brave, kind, carries a
 * glowing star-shaped shield). Heroes here only protect and help: no fighting.
 */

export type L = { en: string; vi: string }

export const HERO_LINES = {
  intro: { en: 'I am Captain Star! Heroes help, and heroes are kind!', vi: 'Mình là Đội trưởng Ngôi Sao! Anh hùng luôn giúp đỡ và tốt bụng!' },
  team: { en: "Let's go, Space Guardians!", vi: 'Xuất phát nào, Đội Vệ binh Vũ trụ!' },
  missionDone: { en: 'Mission complete!', vi: 'Hoàn thành nhiệm vụ!' },
  heroDo: { en: "That's what heroes do!", vi: 'Anh hùng là như thế đó!' },
  tryHero: { en: 'Hmm. What would a hero do?', vi: 'Hừm, anh hùng sẽ làm gì nhỉ?' },
  youHero: { en: 'You are a hero!', vi: 'Con là một anh hùng!' },
}

// ---------------------------------------------------------------- missions
export const MISSIONS = [
  { id: 'meteor', icon: '☄️', en: 'Meteor storm', vi: 'Mưa thiên thạch' },
  { id: 'ocean', icon: '🐬', en: 'Save Splash', vi: 'Cứu Splash' },
  { id: 'satellite', icon: '🛰️', en: 'Fix the satellite', vi: 'Sửa vệ tinh' },
  { id: 'lights', icon: '💡', en: 'Moon base lights', vi: 'Thắp đèn Mặt Trăng' },
  { id: 'graduation', icon: '🎖️', en: 'Hero school', vi: 'Tốt nghiệp anh hùng' },
] as const
export type MissionId = (typeof MISSIONS)[number]['id']

export const METEOR_LINES = {
  start: { en: 'Meteors are coming! Stop them with the shield!', vi: 'Thiên thạch đang bay tới! Dùng khiên chặn lại nào!' },
  big: { en: 'Stop the big one!', vi: 'Chặn viên to!' },
  small: { en: 'Stop the small one!', vi: 'Chặn viên nhỏ!' },
}
export const OCEAN_LINES = {
  start: { en: 'Oh no! Splash is stuck! Pick up the trash!', vi: 'Ôi không! Splash bị mắc kẹt! Nhặt rác nào!' },
  fish: { en: 'Not the fish! Fish live here.', vi: 'Không phải con cá! Cá sống ở đây mà.' },
  free: { en: 'Splash is free! Thank you!', vi: 'Splash được tự do rồi! Cảm ơn con!' },
}
export const TRASH = [
  { emoji: '🧴', en: 'BOTTLE', vi: 'Cái chai' },
  { emoji: '🥫', en: 'CAN', vi: 'Cái lon' },
  { emoji: '🛍️', en: 'BAG', vi: 'Túi ni lông' },
]
export const SHAPES = [
  { id: 'circle', en: 'CIRCLE', find: { en: 'Find the circle!', vi: 'Tìm hình tròn!' } },
  { id: 'square', en: 'SQUARE', find: { en: 'Find the square!', vi: 'Tìm hình vuông!' } },
  { id: 'triangle', en: 'TRIANGLE', find: { en: 'Find the triangle!', vi: 'Tìm hình tam giác!' } },
  { id: 'star', en: 'STAR', find: { en: 'Find the star!', vi: 'Tìm hình ngôi sao!' } },
] as const
export type ShapeId = (typeof SHAPES)[number]['id']
export const SATELLITE_LINES = {
  start: { en: "Let's fix the satellite with Cosmo!", vi: 'Cùng Cosmo sửa vệ tinh nào!' },
  fixed: { en: 'The satellite works again!', vi: 'Vệ tinh chạy lại rồi!' },
}
export const LIGHTS = [
  { en: 'BLUE', color: '#38bdf8', on: { en: 'Turn on the blue light!', vi: 'Bật đèn màu xanh dương!' } },
  { en: 'RED', color: '#f87171', on: { en: 'Turn on the red light!', vi: 'Bật đèn màu đỏ!' } },
  { en: 'GREEN', color: '#4ade80', on: { en: 'Turn on the green light!', vi: 'Bật đèn màu xanh lá!' } },
  { en: 'YELLOW', color: '#facc15', on: { en: 'Turn on the yellow light!', vi: 'Bật đèn màu vàng!' } },
  { en: 'PURPLE', color: '#c084fc', on: { en: 'Turn on the purple light!', vi: 'Bật đèn màu tím!' } },
]
export const LIGHTS_LINES = {
  start: { en: 'The Moon base is dark! Turn on the lights!', vi: 'Căn cứ Mặt Trăng tối om! Bật đèn lên nào!' },
  lit: { en: 'The Moon base is bright!', vi: 'Căn cứ sáng rực rồi!' },
}
export const GRAD_LINES = {
  start: { en: 'Hero school graduation!', vi: 'Lễ tốt nghiệp trường anh hùng!' },
}

// ---------------------------------------------------------------- shield throw
export const THROW_LINES = {
  start: { en: 'Throw the shield!', vi: 'Ném khiên nào!' },
  hit: [
    { en: 'Hit number one!', vi: 'Ném trúng số một!' },
    { en: 'Hit number two!', vi: 'Ném trúng số hai!' },
    { en: 'Hit number three!', vi: 'Ném trúng số ba!' },
    { en: 'Hit number four!', vi: 'Ném trúng số bốn!' },
    { en: 'Hit number five!', vi: 'Ném trúng số năm!' },
  ],
}

// ---------------------------------------------------------------- hero suit
export const SUIT_LINES = { start: { en: 'Make your hero suit!', vi: 'Làm bộ đồ anh hùng của con!' } }
export const EMBLEMS = [
  { id: 'star', icon: '⭐', en: 'STAR' },
  { id: 'dolphin', icon: '🐬', en: 'DOLPHIN' },
  { id: 'rocket', icon: '🚀', en: 'ROCKET' },
  { id: 'bolt', icon: '⚡', en: 'LIGHTNING' },
  { id: 'heart', icon: '💙', en: 'HEART' },
] as const
export type EmblemId = (typeof EMBLEMS)[number]['id']
export const SUIT_PARTS = { cape: 'CAPE', mask: 'MASK', shield: 'SHIELD' }

// ---------------------------------------------------------------- what would a hero do?
export const KIND = [
  { q: { en: 'Your friend fell down. What do you do?', vi: 'Bạn con bị ngã. Con sẽ làm gì?' }, scene: '🧒💥', good: { icon: '🤝', en: 'Help my friend up.', vi: 'Đỡ bạn dậy.' }, bad: { icon: '😆', en: 'Laugh at my friend.', vi: 'Cười bạn.' } },
  { q: { en: 'Your friend is sad.', vi: 'Bạn con đang buồn.' }, scene: '🧒😢', good: { icon: '🤗', en: 'Give a big hug.', vi: 'Ôm bạn thật chặt.' }, bad: { icon: '🚶', en: 'Walk away.', vi: 'Bỏ đi chỗ khác.' } },
  { q: { en: 'You have two cookies. Your friend has none.', vi: 'Con có hai cái bánh, bạn không có cái nào.' }, scene: '🍪🍪', good: { icon: '🍪', en: 'Share a cookie.', vi: 'Chia bạn một cái.' }, bad: { icon: '😋', en: 'Eat them all.', vi: 'Ăn hết một mình.' } },
  { q: { en: 'There is trash on the beach.', vi: 'Có rác trên bãi biển.' }, scene: '🏖️🥤', good: { icon: '🗑️', en: 'Pick it up.', vi: 'Nhặt bỏ vào thùng rác.' }, bad: { icon: '🙈', en: 'Leave it there.', vi: 'Để mặc nó.' } },
  { q: { en: 'Your little friend wants to play too.', vi: 'Em nhỏ cũng muốn chơi cùng.' }, scene: '👶🧸', good: { icon: '🧸', en: 'Play together.', vi: 'Cùng chơi chung.' }, bad: { icon: '🙅', en: 'Say no.', vi: 'Không cho chơi.' } },
  { q: { en: 'Oops! You broke a toy.', vi: 'Ối! Con làm hỏng đồ chơi.' }, scene: '🧸💔', good: { icon: '🙏', en: 'Say sorry.', vi: 'Xin lỗi.' }, bad: { icon: '🫣', en: 'Hide it.', vi: 'Giấu đi.' } },
]

// ---------------------------------------------------------------- progress
const KEY = 'space-atlas-hero'
export interface HeroProgress {
  done: MissionId[]
  name: string
  seenIntro: boolean
}
export function loadHero(): HeroProgress {
  try {
    return { done: [], name: '', seenIntro: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { done: [], name: '', seenIntro: false }
  }
}
export function saveHero(p: HeroProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* private mode */
  }
}

/** Every English line of the hero part (for the voice recorder script). */
export function heroTexts(): string[] {
  const out: string[] = []
  const add = (l: L) => out.push(l.en)
  ;[HERO_LINES, METEOR_LINES, OCEAN_LINES, SATELLITE_LINES, LIGHTS_LINES, GRAD_LINES, SUIT_LINES].forEach((g) => Object.values(g).forEach(add))
  add(THROW_LINES.start)
  THROW_LINES.hit.forEach(add)
  SHAPES.forEach((s) => (add(s.find), out.push(s.en + '!')))
  LIGHTS.forEach((l) => (add(l.on), out.push(l.en + '!')))
  TRASH.forEach((t) => out.push(t.en + '!'))
  EMBLEMS.forEach((e) => out.push(e.en + '!'))
  Object.values(SUIT_PARTS).forEach((p) => out.push(p + '!'))
  KIND.forEach((k) => (add(k.q), add(k.good), add(k.bad)))
  MISSIONS.forEach((m) => out.push(m.en))
  return out
}
export function heroViTexts(): string[] {
  const out: string[] = []
  const add = (l: { vi: string }) => out.push(l.vi)
  ;[HERO_LINES, METEOR_LINES, OCEAN_LINES, SATELLITE_LINES, LIGHTS_LINES, GRAD_LINES, SUIT_LINES].forEach((g) => Object.values(g).forEach(add))
  add(THROW_LINES.start)
  THROW_LINES.hit.forEach(add)
  SHAPES.forEach((s) => add(s.find))
  LIGHTS.forEach((l) => add(l.on))
  TRASH.forEach(add)
  KIND.forEach((k) => (add(k.q), add(k.good), add(k.bad)))
  MISSIONS.forEach(add)
  return out
}
