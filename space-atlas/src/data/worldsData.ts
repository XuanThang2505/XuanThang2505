/**
 * "Land on a planet": what it is like to stand there. Numbers are real (rounded for kids):
 * surface gravity vs Earth, typical temperature, length of a day and a year.
 * Giant planets have no ground – Cosmo stands on a floating station in the clouds.
 */
import type { PlanetId } from './planetsData'
export { PHOTOS } from './photosData'

export type WorldId = Exclude<PlanetId, 'sun'> | 'moon'
export type PlanetWorldId = Exclude<PlanetId, 'sun'>
export type L = { en: string; vi: string }

export interface World {
  id: WorldId
  sky: [string, string] // top, bottom
  ground: [string, string] | null // null = no surface (gas / ice giant)
  sunScale: number // how big the Sun looks compared with Earth's sky
  gravity: number // × Earth
  tempC: number
  day: L // length of one day there
  year: L
  weather: 'none' | 'dust' | 'rain' | 'clouds' | 'storm' | 'ice' | 'wind' | 'diamonds' | 'acid'
  skyThings: { emoji: string; x: number; y: number; size: number }[]
  features: { emoji: string; en: string; vi: string; fact: string; x: number; y: number }[]
  hello: L
  report: L // Captain Star's space weather report
}

export const WORLDS: Record<WorldId, World> = {
  moon: {
    id: 'moon',
    sky: ['#000000', '#0b1020'],
    ground: ['#a8a29e', '#57534e'],
    sunScale: 1,
    gravity: 0.17,
    tempC: 120,
    day: { en: 'About 29 Earth days', vi: 'Một ngày dài khoảng 29 ngày Trái Đất' },
    year: { en: '27 days around Earth', vi: 'Đi một vòng quanh Trái Đất mất 27 ngày' },
    weather: 'none',
    skyThings: [{ emoji: '🌍', x: 0.5, y: 0.14, size: 1.3 }],
    features: [
      { emoji: '👣', en: 'FOOTPRINT', vi: 'Dấu chân', fact: 'Trên Mặt Trăng không có gió, nên dấu chân phi hành gia vẫn còn đó!', x: 0.25, y: 0.82 },
      { emoji: '🧑‍🚀', en: 'ASTRONAUT', vi: 'Phi hành gia', fact: 'Năm 1969, con người lần đầu tiên bước lên Mặt Trăng.', x: 0.72, y: 0.74 },
      { emoji: '🕳️', en: 'CRATER', vi: 'Miệng hố', fact: 'Mặt Trăng có rất nhiều miệng hố. Ban ngày nóng 120°C, ban đêm lạnh -170°C!', x: 0.5, y: 0.88 },
    ],
    hello: { en: 'Welcome to the Moon! You can jump so high!', vi: 'Chào mừng đến Mặt Trăng! Con nhảy được rất cao!' },
    report: { en: 'Today on the Moon: no wind, no rain, and a black sky!', vi: 'Hôm nay trên Mặt Trăng: không gió, không mưa, bầu trời màu đen!' },
  },
  mercury: {
    id: 'mercury',
    sky: ['#020617', '#1e1b4b'],
    ground: ['#9ca3af', '#4b5563'],
    sunScale: 3,
    gravity: 0.38,
    tempC: 430,
    day: { en: '176 Earth days', vi: 'Một ngày dài 176 ngày Trái Đất' },
    year: { en: '88 days', vi: 'Một năm chỉ 88 ngày' },
    weather: 'none',
    skyThings: [],
    features: [
      { emoji: '🕳️', en: 'CRATER', vi: 'Miệng hố', fact: 'Sao Thủy có rất nhiều miệng hố do thiên thạch đâm vào.', x: 0.3, y: 0.8 },
      { emoji: '🧊', en: 'ICE', vi: 'Băng', fact: 'Trong hố tối ở hai cực, Sao Thủy vẫn có băng dù rất gần Mặt Trời!', x: 0.75, y: 0.85 },
    ],
    hello: { en: 'Welcome to Mercury! The Sun looks so big!', vi: 'Chào mừng đến Sao Thủy! Mặt Trời trông thật to!' },
    report: { en: 'Today on Mercury: super hot in the day, super cold at night!', vi: 'Hôm nay trên Sao Thủy: ban ngày nóng cháy, ban đêm lạnh buốt!' },
  },
  venus: {
    id: 'venus',
    sky: ['#ca8a04', '#fde68a'],
    ground: ['#b45309', '#78350f'],
    sunScale: 0.6,
    gravity: 0.9,
    tempC: 465,
    day: { en: 'Longer than its year!', vi: 'Một ngày còn dài hơn một năm!' },
    year: { en: '225 days', vi: 'Một năm 225 ngày' },
    weather: 'acid',
    skyThings: [],
    features: [
      { emoji: '🌋', en: 'VOLCANO', vi: 'Núi lửa', fact: 'Sao Kim có rất nhiều núi lửa.', x: 0.7, y: 0.72 },
      { emoji: '☁️', en: 'CLOUDS', vi: 'Mây', fact: 'Mây axit dày đặc giữ nhiệt, làm Sao Kim nóng nhất hệ Mặt Trời.', x: 0.25, y: 0.25 },
      { emoji: '🌅', en: 'SUNRISE', vi: 'Mặt Trời mọc', fact: 'Sao Kim quay ngược, nên Mặt Trời mọc ở hướng Tây!', x: 0.82, y: 0.3 },
    ],
    hello: { en: 'Welcome to Venus! It is so hot!', vi: 'Chào mừng đến Sao Kim! Nóng quá đi!' },
    report: { en: 'Today on Venus: very hot, with thick yellow clouds. Stay inside!', vi: 'Hôm nay trên Sao Kim: rất nóng, mây vàng dày đặc. Ở trong nhà nhé!' },
  },
  earth: {
    id: 'earth',
    sky: ['#38bdf8', '#e0f2fe'],
    ground: ['#22c55e', '#15803d'],
    sunScale: 1,
    gravity: 1,
    tempC: 15,
    day: { en: '24 hours', vi: 'Một ngày 24 giờ' },
    year: { en: '365 days', vi: 'Một năm 365 ngày' },
    weather: 'rain',
    skyThings: [{ emoji: '🌈', x: 0.62, y: 0.3, size: 2.4 }, { emoji: '🐦', x: 0.3, y: 0.2, size: 0.7 }],
    features: [
      { emoji: '🌊', en: 'OCEAN', vi: 'Đại dương', fact: 'Biển che phủ gần 3/4 Trái Đất.', x: 0.82, y: 0.82 },
      { emoji: '🌳', en: 'TREE', vi: 'Cây xanh', fact: 'Cây xanh tạo ra không khí cho chúng ta thở.', x: 0.2, y: 0.75 },
      { emoji: '🏠', en: 'HOME', vi: 'Nhà', fact: 'Trái Đất là hành tinh duy nhất có sự sống mà ta biết.', x: 0.42, y: 0.78 },
    ],
    hello: { en: 'Welcome home to Earth!', vi: 'Chào mừng về nhà, Trái Đất!' },
    report: { en: 'Today on Earth: sunny, with a little rain and a rainbow!', vi: 'Hôm nay trên Trái Đất: nắng, mưa nhẹ và có cầu vồng!' },
  },
  mars: {
    id: 'mars',
    sky: ['#d97706', '#fcd34d'],
    ground: ['#c2410c', '#7c2d12'],
    sunScale: 0.65,
    gravity: 0.38,
    tempC: -60,
    day: { en: '24 hours and 37 minutes', vi: 'Một ngày 24 giờ 37 phút' },
    year: { en: '687 days', vi: 'Một năm 687 ngày' },
    weather: 'dust',
    skyThings: [{ emoji: '🪨', x: 0.45, y: 0.12, size: 0.45 }, { emoji: '🪨', x: 0.6, y: 0.2, size: 0.3 }],
    features: [
      { emoji: '🚙', en: 'ROVER', vi: 'Xe tự hành', fact: 'Xe tự hành của con người đang lăn bánh trên Sao Hỏa.', x: 0.3, y: 0.8 },
      { emoji: '🗻', en: 'VOLCANO', vi: 'Núi lửa', fact: 'Núi Olympus trên Sao Hỏa là núi lửa cao nhất hệ Mặt Trời.', x: 0.75, y: 0.66 },
      { emoji: '🌇', en: 'SUNSET', vi: 'Hoàng hôn', fact: 'Hoàng hôn trên Sao Hỏa có màu xanh dương!', x: 0.8, y: 0.35 },
    ],
    hello: { en: 'Welcome to Mars! Everything is red!', vi: 'Chào mừng đến Sao Hỏa! Mọi thứ đều đỏ!' },
    report: { en: 'Today on Mars: cold and dusty, with a blue sunset!', vi: 'Hôm nay trên Sao Hỏa: lạnh, nhiều bụi, hoàng hôn màu xanh!' },
  },
  jupiter: {
    id: 'jupiter',
    sky: ['#92400e', '#fcd9a8'],
    ground: null,
    sunScale: 0.2,
    gravity: 2.5,
    tempC: -110,
    day: { en: '10 hours', vi: 'Một ngày chỉ 10 giờ' },
    year: { en: '12 years', vi: 'Một năm dài 12 năm' },
    weather: 'storm',
    skyThings: [
      { emoji: '🌕', x: 0.15, y: 0.15, size: 0.4 },
      { emoji: '🌕', x: 0.3, y: 0.1, size: 0.35 },
      { emoji: '🌕', x: 0.55, y: 0.14, size: 0.45 },
      { emoji: '🌕', x: 0.72, y: 0.08, size: 0.4 },
    ],
    features: [
      { emoji: '🌀', en: 'STORM', vi: 'Cơn bão', fact: 'Vết Đỏ Lớn là cơn bão to hơn cả Trái Đất!', x: 0.75, y: 0.45 },
      { emoji: '⚡', en: 'LIGHTNING', vi: 'Tia chớp', fact: 'Sao Mộc có những tia chớp rất mạnh trong mây.', x: 0.3, y: 0.42 },
    ],
    hello: { en: 'Welcome to Jupiter! There is no ground here!', vi: 'Chào mừng đến Sao Mộc! Ở đây không có mặt đất!' },
    report: { en: 'Today on Jupiter: a giant storm and lots of lightning!', vi: 'Hôm nay trên Sao Mộc: bão khổng lồ và nhiều tia chớp!' },
  },
  saturn: {
    id: 'saturn',
    sky: ['#a16207', '#fef3c7'],
    ground: null,
    sunScale: 0.12,
    gravity: 1.07,
    tempC: -140,
    day: { en: '11 hours', vi: 'Một ngày khoảng 11 giờ' },
    year: { en: '29 years', vi: 'Một năm dài 29 năm' },
    weather: 'clouds',
    skyThings: [{ emoji: '🟠', x: 0.2, y: 0.12, size: 0.4 }],
    features: [
      { emoji: '💍', en: 'RINGS', vi: 'Vành đai', fact: 'Vành đai Sao Thổ làm từ băng và đá.', x: 0.5, y: 0.25 },
      { emoji: '🛁', en: 'FLOAT', vi: 'Nổi', fact: 'Sao Thổ nhẹ hơn nước – nếu có bồn tắm đủ to, nó sẽ nổi!', x: 0.25, y: 0.55 },
    ],
    hello: { en: 'Welcome to Saturn! Look at the rings in the sky!', vi: 'Chào mừng đến Sao Thổ! Nhìn vành đai trên trời kìa!' },
    report: { en: 'Today on Saturn: cold and windy, with beautiful rings!', vi: 'Hôm nay trên Sao Thổ: lạnh, nhiều gió, vành đai rất đẹp!' },
  },
  uranus: {
    id: 'uranus',
    sky: ['#0e7490', '#a5f3fc'],
    ground: null,
    sunScale: 0.08,
    gravity: 0.89,
    tempC: -195,
    day: { en: '17 hours', vi: 'Một ngày 17 giờ' },
    year: { en: '84 years', vi: 'Một năm dài 84 năm' },
    weather: 'ice',
    skyThings: [],
    features: [
      { emoji: '↪️', en: 'SIDEWAYS', vi: 'Nằm nghiêng', fact: 'Sao Thiên Vương nằm nghiêng, mỗi mùa kéo dài khoảng 21 năm!', x: 0.7, y: 0.3 },
      { emoji: '🧊', en: 'ICE', vi: 'Băng', fact: 'Sao Thiên Vương là hành tinh băng khổng lồ, rất lạnh.', x: 0.3, y: 0.5 },
    ],
    hello: { en: 'Welcome to Uranus! It is very cold!', vi: 'Chào mừng đến Sao Thiên Vương! Lạnh lắm!' },
    report: { en: 'Today on Uranus: icy cold. Winter lasts twenty-one years!', vi: 'Hôm nay trên Sao Thiên Vương: lạnh buốt. Mùa đông dài 21 năm!' },
  },
  neptune: {
    id: 'neptune',
    sky: ['#1e3a8a', '#60a5fa'],
    ground: null,
    sunScale: 0.05,
    gravity: 1.14,
    tempC: -200,
    day: { en: '16 hours', vi: 'Một ngày 16 giờ' },
    year: { en: '165 years', vi: 'Một năm dài 165 năm' },
    weather: 'diamonds',
    skyThings: [],
    features: [
      { emoji: '💨', en: 'WIND', vi: 'Gió', fact: 'Sao Hải Vương có gió mạnh nhất hệ Mặt Trời.', x: 0.3, y: 0.4 },
      { emoji: '💎', en: 'DIAMONDS', vi: 'Kim cương', fact: 'Các nhà khoa học nghĩ sâu bên trong có mưa kim cương!', x: 0.72, y: 0.55 },
    ],
    hello: { en: 'Welcome to Neptune! Hold on, it is so windy!', vi: 'Chào mừng đến Sao Hải Vương! Bám chắc nhé, gió mạnh lắm!' },
    report: { en: 'Today on Neptune: the strongest winds, and maybe diamond rain!', vi: 'Hôm nay trên Sao Hải Vương: gió mạnh nhất, có thể có mưa kim cương!' },
  },
}

/** Name + picture for every place you can land on (the Moon is not one of the eight planets). */
export function worldInfo(id: WorldId): { englishName: string; vietnameseName: string; textureUrl: string } {
  if (id === 'moon') return { englishName: 'MOON', vietnameseName: 'Mặt Trăng', textureUrl: './textures/moon.jpg' }
  const p = PLANET_INFO[id]
  return p
}
const PLANET_INFO: Record<PlanetWorldId, { englishName: string; vietnameseName: string; textureUrl: string }> = {
  mercury: { englishName: 'MERCURY', vietnameseName: 'Sao Thủy', textureUrl: './textures/mercury.jpg' },
  venus: { englishName: 'VENUS', vietnameseName: 'Sao Kim', textureUrl: './textures/venus.jpg' },
  earth: { englishName: 'EARTH', vietnameseName: 'Trái Đất', textureUrl: './textures/earth_atmos_2048.jpg' },
  mars: { englishName: 'MARS', vietnameseName: 'Sao Hỏa', textureUrl: './textures/mars.jpg' },
  jupiter: { englishName: 'JUPITER', vietnameseName: 'Sao Mộc', textureUrl: './textures/jupiter.jpg' },
  saturn: { englishName: 'SATURN', vietnameseName: 'Sao Thổ', textureUrl: './textures/saturn.jpg' },
  uranus: { englishName: 'URANUS', vietnameseName: 'Sao Thiên Vương', textureUrl: './textures/uranus.jpg' },
  neptune: { englishName: 'NEPTUNE', vietnameseName: 'Sao Hải Vương', textureUrl: './textures/neptune.jpg' },
}

export const WORLD_LINES = {
  land: { en: 'Landing!', vi: 'Hạ cánh!' },
  jump: { en: 'Jump!', vi: 'Nhảy nào!' },
  floaty: { en: 'So floaty!', vi: 'Nhẹ tênh!' },
  heavy: { en: 'So heavy!', vi: 'Nặng quá!' },
  stamp: { en: 'New stamp in your passport!', vi: 'Con có con dấu mới trong hộ chiếu!' },
  noGround: { en: 'No ground! Cosmo stands on a floating station.', vi: 'Không có mặt đất! Cosmo đứng trên trạm bay lơ lửng.' },
  passport: { en: 'My space passport!', vi: 'Hộ chiếu vũ trụ của con!' },
  realPhoto: { en: 'This is a real photo!', vi: 'Đây là ảnh thật đó!' },
  toMoon: { en: 'To the Moon!', vi: 'Bay tới Mặt Trăng!' },
  postcard: { en: 'A postcard from space!', vi: 'Bưu thiếp từ vũ trụ!' },
}

// ---------------------------------------------------------------- overview extras
export const OVERVIEW_LINES = {
  age: { en: 'How old are you on other planets?', vi: 'Con bao nhiêu tuổi trên các hành tinh khác?' },
  time: { en: 'Faster time!', vi: 'Thời gian chạy nhanh hơn!' },
  oneYear: { en: 'One year! Earth went around the Sun!', vi: 'Một năm! Trái Đất đã đi hết một vòng quanh Mặt Trời!' },
  comet: { en: 'COMET!', vi: 'Sao chổi!' },
  myPlanet: { en: 'MY PLANET!', vi: 'Hành tinh của con!' },
  buildPlanet: { en: 'Make your own planet!', vi: 'Tự tạo hành tinh của con!' },
}
/** Real year lengths in Earth days (for "your age on other planets"). */
export const YEAR_DAYS: Record<PlanetWorldId, number> = {
  mercury: 88,
  venus: 224.7,
  earth: 365.25,
  mars: 687,
  jupiter: 4333,
  saturn: 10759,
  uranus: 30687,
  neptune: 60190,
}

// ---------------------------------------------------------------- bedtime planetarium
export const BEDTIME: { id: PlanetWorldId | 'sun' | 'system'; line: L }[] = [
  { id: 'system', line: { en: "Let's take a quiet trip through space.", vi: 'Cùng đi một chuyến nhẹ nhàng qua vũ trụ nhé.' } },
  { id: 'sun', line: { en: 'The Sun keeps us warm and bright.', vi: 'Mặt Trời sưởi ấm và chiếu sáng cho chúng ta.' } },
  { id: 'mercury', line: { en: 'Little Mercury runs fast around the Sun.', vi: 'Sao Thủy bé nhỏ chạy thật nhanh quanh Mặt Trời.' } },
  { id: 'venus', line: { en: 'Venus shines in the evening sky.', vi: 'Sao Kim lấp lánh trên bầu trời buổi tối.' } },
  { id: 'earth', line: { en: 'Earth is our home. Good night, Earth.', vi: 'Trái Đất là nhà của chúng ta. Chúc Trái Đất ngủ ngon.' } },
  { id: 'mars', line: { en: 'Mars is sleeping under red dust.', vi: 'Sao Hỏa đang ngủ dưới lớp bụi đỏ.' } },
  { id: 'jupiter', line: { en: 'Big Jupiter hugs its many moons.', vi: 'Sao Mộc to lớn ôm các mặt trăng của mình.' } },
  { id: 'saturn', line: { en: 'Saturn spins its shiny rings.', vi: 'Sao Thổ xoay vành đai lấp lánh.' } },
  { id: 'uranus', line: { en: 'Uranus rolls slowly on its side.', vi: 'Sao Thiên Vương lăn chầm chậm.' } },
  { id: 'neptune', line: { en: 'Far away, blue Neptune says good night.', vi: 'Ở thật xa, Sao Hải Vương xanh chúc con ngủ ngon.' } },
  { id: 'system', line: { en: 'Good night, little astronaut. Sweet dreams.', vi: 'Chúc phi hành gia nhỏ ngủ ngon. Mơ đẹp nhé.' } },
]

// ---------------------------------------------------------------- my planet builder
export const MY_PLANET_SURFACES = [
  { id: 'ocean', icon: '🌊', en: 'OCEAN', colors: ['#0ea5e9', '#1d4ed8', '#22c55e'] },
  { id: 'lava', icon: '🌋', en: 'VOLCANO', colors: ['#f97316', '#7f1d1d', '#fde047'] },
  { id: 'ice', icon: '🧊', en: 'ICE', colors: ['#e0f2fe', '#7dd3fc', '#ffffff'] },
  { id: 'candy', icon: '🍭', en: 'CANDY', colors: ['#f472b6', '#c084fc', '#fde68a'] },
  { id: 'jungle', icon: '🌴', en: 'TREE', colors: ['#16a34a', '#065f46', '#a3e635'] },
] as const
export type SurfaceId = (typeof MY_PLANET_SURFACES)[number]['id']

export const SKY_LINES = {
  title: { en: "Tonight's sky!", vi: 'Bầu trời tối nay!' },
}

/** Every English line here (for the voice script) and every Vietnamese line (for the family recorder). */
export function worldTexts(): { en: string[]; vi: string[] } {
  const en: string[] = []
  const vi: string[] = []
  const add = (l: L) => (en.push(l.en), vi.push(l.vi))
  Object.values(WORLDS).forEach((w) => {
    add(w.hello)
    add(w.report)
    w.features.forEach((f) => en.push(f.en + '!'))
  })
  ;[WORLD_LINES, OVERVIEW_LINES, SKY_LINES].forEach((g) => Object.values(g).forEach(add))
  BEDTIME.forEach((b) => add(b.line))
  MY_PLANET_SURFACES.forEach((s) => en.push(s.en + '!'))
  en.push('RING!', 'MOON!')
  return { en, vi }
}
