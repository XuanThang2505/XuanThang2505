export type PlanetId = 'sun' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune'

export type EffectName =
  // Sun
  | 'sunRays'
  | 'sunHeat'
  | 'sunStar'
  // Earth
  | 'highlightOcean'
  | 'boostClouds'
  | 'toggleCityLights'
  // Mars
  | 'redGlow'
  | 'rocketFly'
  | 'dustStorm'
  // Jupiter
  | 'growBig'
  | 'redSpotStorm'
  | 'showMoons'
  // Saturn
  | 'ringShine'
  | 'iceSparkle'
  | 'fastSpin'
  // Neptune
  | 'blueGlow'
  | 'windStreaks'
  | 'frostSnow'

export interface VocabWord {
  word: string
  vi: string
  icon: string
  effect: EffectName
}

export interface PlanetData {
  id: PlanetId
  englishName: string
  syllables: string
  englishPhrase: string
  vietnameseName: string
  vietnameseSub: string
  vocabWords: VocabWord[]
  /** Real mean radius, used for SIZE COMPARE */
  radiusKm: number
  /** What the planet is compared with (Earth, or the Moon when we are on Earth) */
  compare: { name: string; radiusKm: number; en: string; vi: string }
  /** Optional real photo texture in /public/textures. Falls back to procedural. */
  textureUrl?: string
  /** Axial tilt in degrees (purely visual) */
  tilt: number
  /** Self-rotation speed (radians / second) */
  spin: number
  /** Fresnel atmosphere colour */
  atmosphere: string
  /** Camera framing */
  camera: { distance: number; min: number; max: number }
  /** CSS for the dock icon */
  dockGradient: string
}

const EARTH_KM = 6371

export const PLANETS: PlanetData[] = [
  {
    id: 'sun',
    englishName: 'SUN',
    syllables: 'SUN',
    englishPhrase: 'The Sun is a star!',
    vietnameseName: 'Mặt Trời',
    vietnameseSub: 'Ngôi sao khổng lồ cho chúng ta ánh sáng và hơi ấm',
    vocabWords: [
      { word: 'LIGHT', vi: 'Ánh sáng', icon: '💡', effect: 'sunRays' },
      { word: 'HOT', vi: 'Nóng', icon: '🔥', effect: 'sunHeat' },
      { word: 'STAR', vi: 'Ngôi sao', icon: '⭐', effect: 'sunStar' },
    ],
    radiusKm: 696340,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'The Sun is super big!',
      vi: 'Mặt Trời to gấp 109 lần Trái Đất',
    },
    tilt: 7,
    spin: 0.05,
    atmosphere: '#ffb347',
    camera: { distance: 4.1, min: 2.2, max: 9.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #fff7c2 0%, #ffd34d 30%, #ff8a1f 65%, #c23d00 100%)',
  },
  {
    id: 'earth',
    englishName: 'EARTH',
    syllables: 'EARTH',
    englishPhrase: 'Earth is our home!',
    vietnameseName: 'Trái Đất',
    vietnameseSub: 'Ngôi nhà xanh của chúng ta, có biển xanh và mây trắng',
    vocabWords: [
      { word: 'OCEAN', vi: 'Đại dương', icon: '🌊', effect: 'highlightOcean' },
      { word: 'CLOUD', vi: 'Đám mây', icon: '☁️', effect: 'boostClouds' },
      { word: 'NIGHT', vi: 'Ban đêm', icon: '🌙', effect: 'toggleCityLights' },
    ],
    radiusKm: EARTH_KM,
    compare: {
      name: 'MOON',
      radiusKm: 1737,
      en: 'The Moon is small!',
      vi: 'Mặt Trăng nhỏ hơn Trái Đất gần 4 lần',
    },
    textureUrl: './textures/earth_atmos_2048.jpg',
    tilt: 23.4,
    spin: 0.06,
    atmosphere: '#4aa8ff',
    camera: { distance: 3.9, min: 1.8, max: 8.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #bfe6ff 0%, #3b8be0 35%, #1d5a2c 60%, #0b2a63 100%)',
  },
  {
    id: 'mars',
    englishName: 'MARS',
    textureUrl: './textures/mars.jpg',
    syllables: 'MARS',
    englishPhrase: 'Mars is the red planet!',
    vietnameseName: 'Sao Hỏa',
    vietnameseSub: 'Hành tinh màu đỏ, đầy cát bụi và đá',
    vocabWords: [
      { word: 'RED', vi: 'Màu đỏ', icon: '🔴', effect: 'redGlow' },
      { word: 'ROCKET', vi: 'Tên lửa', icon: '🚀', effect: 'rocketFly' },
      { word: 'DUST', vi: 'Bụi cát', icon: '🌪️', effect: 'dustStorm' },
    ],
    radiusKm: 3390,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Mars is smaller than Earth!',
      vi: 'Sao Hỏa chỉ to bằng một nửa Trái Đất',
    },
    tilt: 25,
    spin: 0.11,
    atmosphere: '#ff8a5c',
    camera: { distance: 3.9, min: 1.8, max: 8.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #ffc9a3 0%, #e0703a 35%, #a83a18 70%, #4a1606 100%)',
  },
  {
    id: 'jupiter',
    englishName: 'JUPITER',
    textureUrl: './textures/jupiter.jpg',
    syllables: 'JU - PI - TER',
    englishPhrase: 'Jupiter is very big!',
    vietnameseName: 'Sao Mộc',
    vietnameseSub: 'Hành tinh lớn nhất, có cơn bão khổng lồ màu đỏ',
    vocabWords: [
      { word: 'BIG', vi: 'To lớn', icon: '🐘', effect: 'growBig' },
      { word: 'STORM', vi: 'Cơn bão', icon: '🌀', effect: 'redSpotStorm' },
      { word: 'MOON', vi: 'Mặt trăng', icon: '🌕', effect: 'showMoons' },
    ],
    radiusKm: 69911,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Jupiter is giant!',
      vi: 'Sao Mộc to gấp 11 lần Trái Đất',
    },
    tilt: 3,
    spin: 0.22,
    atmosphere: '#ffd9a8',
    camera: { distance: 4.1, min: 1.9, max: 9.0 },
    dockGradient:
      'repeating-linear-gradient(180deg, #f3dfc0 0 10%, #c9935c 10% 18%, #ead2a8 18% 28%, #a8683a 28% 34%), radial-gradient(circle at 35% 35%, #fff 0%, #000 100%)',
  },
  {
    id: 'saturn',
    englishName: 'SATURN',
    textureUrl: './textures/saturn.jpg',
    syllables: 'SAT - URN',
    englishPhrase: 'Saturn has shiny rings!',
    vietnameseName: 'Sao Thổ',
    vietnameseSub: 'Hành tinh có chiếc vòng băng lấp lánh',
    vocabWords: [
      { word: 'RING', vi: 'Chiếc vòng', icon: '💍', effect: 'ringShine' },
      { word: 'ICE', vi: 'Băng đá', icon: '🧊', effect: 'iceSparkle' },
      { word: 'SPIN', vi: 'Xoay tròn', icon: '🔄', effect: 'fastSpin' },
    ],
    radiusKm: 58232,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Saturn is very big too!',
      vi: 'Sao Thổ to gấp 9 lần Trái Đất',
    },
    tilt: 26.7,
    spin: 0.2,
    atmosphere: '#f5deb0',
    camera: { distance: 6.4, min: 3.0, max: 11.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #fff4d6 0%, #e8cf96 35%, #b8915a 70%, #5e4422 100%)',
  },
  {
    id: 'neptune',
    englishName: 'NEPTUNE',
    textureUrl: './textures/neptune.jpg',
    syllables: 'NEP - TUNE',
    englishPhrase: 'Neptune is blue and cold!',
    vietnameseName: 'Sao Hải Vương',
    vietnameseSub: 'Hành tinh xanh, xa và lạnh nhất, có gió rất mạnh',
    vocabWords: [
      { word: 'BLUE', vi: 'Màu xanh', icon: '💙', effect: 'blueGlow' },
      { word: 'WIND', vi: 'Gió', icon: '💨', effect: 'windStreaks' },
      { word: 'COLD', vi: 'Lạnh', icon: '❄️', effect: 'frostSnow' },
    ],
    radiusKm: 24622,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Neptune is bigger than Earth!',
      vi: 'Sao Hải Vương to gấp 4 lần Trái Đất',
    },
    tilt: 28,
    spin: 0.18,
    atmosphere: '#5a8dff',
    camera: { distance: 4.0, min: 1.9, max: 8.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #c4dcff 0%, #4f7ff0 35%, #2747b8 70%, #0b1550 100%)',
  },
]

export const PLANET_MAP: Record<PlanetId, PlanetData> = Object.fromEntries(
  PLANETS.map((p) => [p.id, p]),
) as Record<PlanetId, PlanetData>

/** How long each vocab effect plays (seconds) */
export const EFFECT_DURATION = 5
