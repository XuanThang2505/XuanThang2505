export type PlanetId = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
/** Everything the camera can visit: one body, or the whole Solar System overview. */
export type ViewId = PlanetId | 'system'

export type EffectName =
  // Sun
  | 'sunRays'
  | 'sunHeat'
  | 'sunStar'
  // Mercury
  | 'smallShrink'
  | 'mercuryFast'
  | 'rockOrbit'
  // Venus
  | 'venusHeat'
  | 'venusClouds'
  | 'venusBright'
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
  // Uranus
  | 'uranusRoll'
  | 'uranusRings'
  | 'uranusIce'
  // Solar System overview
  | 'orbitGlow'
  | 'speedUp'
  | 'countPlanets'

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
    id: 'mercury',
    englishName: 'MERCURY',
    textureUrl: './textures/mercury.jpg',
    syllables: 'MER - CU - RY',
    englishPhrase: 'Mercury is closest to the Sun!',
    vietnameseName: 'Sao Thủy',
    vietnameseSub: 'Hành tinh nhỏ nhất, gần Mặt Trời nhất và chạy nhanh nhất',
    vocabWords: [
      { word: 'SMALL', vi: 'Nhỏ bé', icon: '🐭', effect: 'smallShrink' },
      { word: 'FAST', vi: 'Nhanh', icon: '⚡', effect: 'mercuryFast' },
      { word: 'ROCK', vi: 'Đá', icon: '🪨', effect: 'rockOrbit' },
    ],
    radiusKm: 2440,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Mercury is very small!',
      vi: 'Sao Thủy chỉ to bằng một phần ba Trái Đất',
    },
    tilt: 0.03,
    spin: 0.05,
    atmosphere: '#b9b2a8',
    camera: { distance: 3.9, min: 1.8, max: 8.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #e8e4dc 0%, #a8a29a 40%, #6e6862 75%, #2e2b28 100%)',
  },
  {
    id: 'venus',
    englishName: 'VENUS',
    textureUrl: './textures/venus.jpg',
    syllables: 'VE - NUS',
    englishPhrase: 'Venus is very hot!',
    vietnameseName: 'Sao Kim',
    vietnameseSub: 'Hành tinh nóng nhất, có mây vàng dày đặc, sáng nhất trên bầu trời đêm',
    vocabWords: [
      { word: 'HOT', vi: 'Nóng', icon: '🔥', effect: 'venusHeat' },
      { word: 'CLOUD', vi: 'Đám mây', icon: '☁️', effect: 'venusClouds' },
      { word: 'BRIGHT', vi: 'Sáng chói', icon: '✨', effect: 'venusBright' },
    ],
    radiusKm: 6052,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Venus is like Earth!',
      vi: 'Sao Kim to gần bằng Trái Đất',
    },
    tilt: 177,
    spin: 0.04,
    atmosphere: '#ffd98a',
    camera: { distance: 3.9, min: 1.8, max: 8.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #fff3cf 0%, #f0cf86 35%, #c99a4a 70%, #6e4c1c 100%)',
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
    id: 'uranus',
    englishName: 'URANUS',
    textureUrl: './textures/uranus.jpg',
    syllables: 'U - RA - NUS',
    englishPhrase: 'Uranus spins on its side!',
    vietnameseName: 'Sao Thiên Vương',
    vietnameseSub: 'Hành tinh băng màu xanh ngọc, nằm nghiêng khi quay',
    vocabWords: [
      { word: 'SIDE', vi: 'Nằm nghiêng', icon: '↪️', effect: 'uranusRoll' },
      { word: 'RING', vi: 'Chiếc vòng', icon: '💍', effect: 'uranusRings' },
      { word: 'ICE', vi: 'Băng đá', icon: '🧊', effect: 'uranusIce' },
    ],
    radiusKm: 25362,
    compare: {
      name: 'EARTH',
      radiusKm: EARTH_KM,
      en: 'Uranus is bigger than Earth!',
      vi: 'Sao Thiên Vương to gấp 4 lần Trái Đất',
    },
    tilt: 97.8,
    spin: 0.16,
    atmosphere: '#9ff0f0',
    camera: { distance: 5.6, min: 2.4, max: 10.0 },
    dockGradient: 'radial-gradient(circle at 35% 35%, #e6ffff 0%, #9fe3e6 35%, #5fb8c2 70%, #1f5560 100%)',
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
/** Seconds between planet names while counting PLANETS in the overview */
export const COUNT_STEP = 1.3

export function effectDuration(name: EffectName) {
  return name === 'countPlanets' ? COUNT_STEP * 8 + 1.5 : EFFECT_DURATION
}

/** Order of the eight planets, used by the overview and by PLANETS counting. */
export const PLANET_ORDER: PlanetId[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

/**
 * Kid-friendly Solar System layout. Sizes and distances are squeezed so everything fits
 * on an iPad, but the ORDER and the "farther = slower" rule are true.
 * `periodYears` is the real orbital period; the overview plays it at sqrt speed.
 */
export const ORBITS: Record<Exclude<PlanetId, 'sun'>, { radius: number; size: number; periodYears: number; start: number }> = {
  mercury: { radius: 3.6, size: 0.34, periodYears: 0.241, start: 0.4 },
  venus: { radius: 4.9, size: 0.48, periodYears: 0.615, start: 2.1 },
  earth: { radius: 6.2, size: 0.5, periodYears: 1, start: 4.0 },
  mars: { radius: 7.5, size: 0.4, periodYears: 1.881, start: 5.5 },
  jupiter: { radius: 10.9, size: 1.05, periodYears: 11.86, start: 1.0 },
  saturn: { radius: 13.6, size: 0.85, periodYears: 29.46, start: 3.2 },
  uranus: { radius: 16.1, size: 0.65, periodYears: 84.0, start: 5.0 },
  neptune: { radius: 18.4, size: 0.63, periodYears: 164.8, start: 2.6 },
}
export const SUN_OVERVIEW_SIZE = 1.9
export const ASTEROID_BELT = { inner: 8.6, outer: 9.5 }

/** The overview lesson card (same shape the HUD uses for planets). */
export const SYSTEM_LESSON = {
  id: 'system' as const,
  englishName: 'SOLAR SYSTEM',
  syllables: 'SO - LAR  SYS - TEM',
  englishPhrase: 'Eight planets go around the Sun!',
  vietnameseName: 'Hệ Mặt Trời',
  vietnameseSub: '8 hành tinh quay quanh Mặt Trời. Càng xa thì quay càng chậm',
  vocabWords: [
    { word: 'ORBIT', vi: 'Quỹ đạo', icon: '⭕', effect: 'orbitGlow' },
    { word: 'FAST', vi: 'Nhanh hơn', icon: '⏩', effect: 'speedUp' },
    { word: 'PLANETS', vi: 'Các hành tinh', icon: '🔢', effect: 'countPlanets' },
  ] as VocabWord[],
  camera: { distance: 41, min: 14, max: 60 },
}
export type Lesson = PlanetData | typeof SYSTEM_LESSON

export function lessonFor(view: ViewId): Lesson {
  return view === 'system' ? SYSTEM_LESSON : PLANET_MAP[view]
}
