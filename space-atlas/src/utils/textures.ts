/**
 * Procedural, seamless planet textures painted on <canvas>.
 * They are used whenever a real photo texture is not available, so the
 * app always looks rich and colourful – even fully offline.
 *
 * Noise is sampled in 3D on the sphere surface, so there is no seam at
 * the date line and no pinching at the poles.
 */
import * as THREE from 'three'
import type { PlanetId } from '../data/planetsData'

// ---------------------------------------------------------------- noise
function makePerlin(seed: number) {
  const p = new Uint8Array(512)
  const perm = new Uint8Array(256)
  for (let i = 0; i < 256; i++) perm[i] = i
  let s = seed >>> 0
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255]

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (t: number, a: number, b: number) => a + t * (b - a)
  const grad = (h: number, x: number, y: number, z: number) => {
    const hh = h & 15
    const u = hh < 8 ? x : y
    const v = hh < 4 ? y : hh === 12 || hh === 14 ? x : z
    return ((hh & 1) === 0 ? u : -u) + ((hh & 2) === 0 ? v : -v)
  }
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)
    const u = fade(x)
    const v = fade(y)
    const w = fade(z)
    const A = p[X] + Y
    const AA = p[A] + Z
    const AB = p[A + 1] + Z
    const B = p[X + 1] + Y
    const BA = p[B] + Z
    const BB = p[B + 1] + Z
    return lerp(
      w,
      lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
      lerp(
        v,
        lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
        lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1)),
      ),
    )
  }
}

type Noise3 = (x: number, y: number, z: number) => number

function fbm(n: Noise3, x: number, y: number, z: number, octaves = 5, lac = 2, gain = 0.5) {
  let amp = 0.5
  let f = 1
  let sum = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * n(x * f, y * f, z * f)
    f *= lac
    amp *= gain
  }
  return sum
}

// ---------------------------------------------------------------- helpers
type RGB = [number, number, number]

const hex = (h: string): RGB => {
  const v = parseInt(h.replace('#', ''), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

function newCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function toTexture(canvas: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = 8
  t.wrapS = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

/**
 * Iterate over every pixel of an equirectangular canvas with sphere coordinates.
 * Coordinates match THREE.SphereGeometry UVs.
 */
function paint(
  w: number,
  h: number,
  fn: (x: number, y: number, z: number, lat: number, lon: number) => RGB | [number, number, number, number],
) {
  const canvas = newCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let j = 0; j < h; j++) {
    const lat = (0.5 - (j + 0.5) / h) * Math.PI
    const cl = Math.cos(lat)
    const sy = Math.sin(lat)
    for (let i = 0; i < w; i++) {
      const lon = ((i + 0.5) / w) * Math.PI * 2
      const x = -Math.cos(lon) * cl
      const z = Math.sin(lon) * cl
      const c = fn(x, sy, z, lat, lon)
      const k = (j * w + i) * 4
      d[k] = c[0]
      d[k + 1] = c[1]
      d[k + 2] = c[2]
      d[k + 3] = c.length === 4 ? c[3] : 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Convert lat/lon (radians) to a point on a unit sphere (THREE.SphereGeometry convention). */
export function latLonToVec3(lat: number, lon: number, r = 1) {
  return new THREE.Vector3(-Math.cos(lon) * Math.cos(lat) * r, Math.sin(lat) * r, Math.sin(lon) * Math.cos(lat) * r)
}

/** Build a smooth colour lookup along latitude from band stops [latitude 0..1 (N→S), colour]. */
function bandLookup(stops: [number, string][], size: number, n: Noise3, fine: number) {
  const lut: RGB[] = []
  const cols = stops.map(([t, c]) => [t, hex(c)] as [number, RGB])
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1)
    let k = 0
    while (k < cols.length - 2 && t > cols[k + 1][0]) k++
    const [t0, c0] = cols[k]
    const [t1, c1] = cols[k + 1]
    let c = mix(c0, c1, smooth(0, 1, (t - t0) / (t1 - t0)))
    // fine pin-stripes
    const s = n(t * 60, 0.5, 0.5) * fine
    c = [c[0] * (1 + s), c[1] * (1 + s), c[2] * (1 + s)]
    lut.push(c)
  }
  return lut
}

// ---------------------------------------------------------------- planets
export function makeMarsTextures(w = 1024, h = 512) {
  const n = makePerlin(11)
  const n2 = makePerlin(29)
  const dark = hex('#4a2213')
  const rust = hex('#a8482a')
  const light = hex('#d88a5a')
  const sand = hex('#e6b088')
  const ice = hex('#f4efe8')
  const heights = new Float32Array(w * h)
  let idx = 0
  const map = paint(w, h, (x, y, z, lat) => {
    const hgt = fbm(n, x * 2.2 + 5, y * 2.2, z * 2.2, 6)
    const albedo = fbm(n2, x * 1.3, y * 1.3, z * 1.3, 4)
    const craters = Math.abs(fbm(n, x * 9, y * 9, z * 9, 3))
    heights[idx++] = hgt + craters * 0.25
    let c = mix(rust, light, smooth(-0.25, 0.35, hgt))
    c = mix(c, sand, smooth(0.15, 0.45, hgt) * 0.5)
    c = mix(c, dark, smooth(0.0, 0.25, -albedo) * 0.85)
    const shade = 0.9 + craters * 0.35
    c = [c[0] * shade, c[1] * shade, c[2] * shade]
    const cap = smooth(1.2, 1.32, Math.abs(lat) + fbm(n, x * 6, y * 6, z * 6, 3) * 0.12)
    c = mix(c, ice, cap)
    return c
  })
  const bump = newCanvas(w, h)
  const bctx = bump.getContext('2d')!
  const bimg = bctx.createImageData(w, h)
  for (let i = 0; i < w * h; i++) {
    const v = Math.max(0, Math.min(255, (heights[i] * 0.9 + 0.5) * 255))
    bimg.data[i * 4] = bimg.data[i * 4 + 1] = bimg.data[i * 4 + 2] = v
    bimg.data[i * 4 + 3] = 255
  }
  bctx.putImageData(bimg, 0, 0)
  return { map: toTexture(map), bump: toTexture(bump, false) }
}

/** Great Red Spot centre (radians) – also used to place the STORM marker. */
export const JUPITER_SPOT = { lat: -0.38, lon: 4.1 }

export function makeJupiterTexture(w = 1024, h = 512) {
  const n = makePerlin(7)
  const lut = bandLookup(
    [
      [0.0, '#8c8478'],
      [0.12, '#a89a86'],
      [0.2, '#d8c8aa'],
      [0.27, '#a87850'],
      [0.31, '#e8dcc2'],
      [0.36, '#b98a60'],
      [0.4, '#f1e6cf'],
      [0.45, '#d2b48a'],
      [0.5, '#efe2c6'],
      [0.55, '#9a6440'],
      [0.6, '#c28a5c'],
      [0.64, '#efe0c0'],
      [0.7, '#b07a52'],
      [0.75, '#e6d6b4'],
      [0.82, '#b8a48a'],
      [0.9, '#9a8c7a'],
      [1.0, '#7e766c'],
    ],
    1024,
    n,
    0.06,
  )
  const spot = hex('#c4532c')
  const spotRim = hex('#f0d9b8')
  return toTexture(
    paint(w, h, (x, y, z, lat, lon) => {
      const turb = fbm(n, x * 3, y * 9, z * 3, 5) * 0.035 + fbm(n, x * 14, y * 30, z * 14, 3) * 0.008
      const t = clamp01(0.5 - lat / Math.PI + turb)
      let c = lut[Math.floor(t * 1023)]
      const shade = 0.94 + fbm(n, x * 6 + 3, y * 18, z * 6, 3) * 0.18
      c = [c[0] * shade, c[1] * shade, c[2] * shade]
      // Great Red Spot
      let dl = lon - JUPITER_SPOT.lon
      if (dl > Math.PI) dl -= Math.PI * 2
      if (dl < -Math.PI) dl += Math.PI * 2
      const d = Math.sqrt((dl / 0.32) ** 2 + ((lat - JUPITER_SPOT.lat) / 0.13) ** 2)
      if (d < 1.6) {
        const swirl = Math.sin(d * 9 + Math.atan2(lat - JUPITER_SPOT.lat, dl) * 2) * 0.08
        c = mix(c, spotRim, smooth(1.6, 1.15, d) * 0.6)
        c = mix(c, spot, smooth(1.1, 0.4, d + swirl))
      }
      return c
    }),
  )
}

export function makeSaturnTexture(w = 1024, h = 512) {
  const n = makePerlin(3)
  const lut = bandLookup(
    [
      [0.0, '#8a8a7a'],
      [0.1, '#b8aa84'],
      [0.22, '#d9c38e'],
      [0.32, '#e9d6a6'],
      [0.4, '#d6b77c'],
      [0.47, '#f1e2b8'],
      [0.53, '#efdcae'],
      [0.6, '#cfae74'],
      [0.68, '#e6d0a0'],
      [0.78, '#cdb27e'],
      [0.9, '#a89470'],
      [1.0, '#8c8270'],
    ],
    1024,
    n,
    0.05,
  )
  return toTexture(
    paint(w, h, (x, y, z, lat) => {
      const turb = fbm(n, x * 3, y * 10, z * 3, 4) * 0.015
      const t = clamp01(0.5 - lat / Math.PI + turb)
      const c = lut[Math.floor(t * 1023)]
      const shade = 0.96 + fbm(n, x * 8, y * 20, z * 8, 2) * 0.1
      return [c[0] * shade, c[1] * shade, c[2] * shade]
    }),
  )
}

/** Radial strip for Saturn's rings: u = inner → outer edge. RGBA. */
export function makeSaturnRingTexture(w = 1024) {
  const n = makePerlin(5)
  const canvas = newCanvas(w, 8)
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(w, 8)
  const inner = 1.24
  const outer = 2.27
  for (let i = 0; i < w; i++) {
    const r = inner + (i / (w - 1)) * (outer - inner)
    let a = 0
    let c: RGB = hex('#d8c49c')
    if (r < 1.53) {
      a = 0.18 + 0.1 * smooth(1.24, 1.5, r) // C ring – faint
      c = hex('#8f8070')
    } else if (r < 1.95) {
      a = 0.85 // B ring – bright
      c = mix(hex('#e9d8b4'), hex('#cdb48a'), smooth(1.53, 1.95, r))
    } else if (r < 2.03) {
      a = 0.05 // Cassini division
      c = hex('#544a3c')
    } else {
      a = 0.62 // A ring
      c = hex('#cbb894')
      if (Math.abs(r - 2.214) < 0.008) a = 0.08 // Encke gap
    }
    const fine = n(r * 80, 0.3, 0.7) * 0.35 + n(r * 300, 0.1, 0.2) * 0.2
    a = clamp01(a * (1 + fine))
    const lum = 1 + fine * 0.4
    a *= smooth(inner, inner + 0.03, r) * smooth(outer, outer - 0.02, r)
    for (let j = 0; j < 8; j++) {
      const k = (j * w + i) * 4
      img.data[k] = Math.min(255, c[0] * lum)
      img.data[k + 1] = Math.min(255, c[1] * lum)
      img.data[k + 2] = Math.min(255, c[2] * lum)
      img.data[k + 3] = a * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export const SATURN_RING = { inner: 1.24, outer: 2.27 }

export function makeNeptuneTexture(w = 1024, h = 512) {
  const n = makePerlin(19)
  const lut = bandLookup(
    [
      [0.0, '#2a49a8'],
      [0.15, '#3a63d0'],
      [0.3, '#4f7ff0'],
      [0.42, '#3e6ee6'],
      [0.5, '#5b8cf5'],
      [0.6, '#3964d8'],
      [0.72, '#4a78ea'],
      [0.85, '#2f52b8'],
      [1.0, '#1f3a90'],
    ],
    1024,
    n,
    0.04,
  )
  const darkSpot = hex('#162a78')
  const white = hex('#eef4ff')
  return toTexture(
    paint(w, h, (x, y, z, lat, lon) => {
      const turb = fbm(n, x * 3, y * 8, z * 3, 4) * 0.02
      const t = clamp01(0.5 - lat / Math.PI + turb)
      let c = lut[Math.floor(t * 1023)]
      const shade = 0.95 + fbm(n, x * 5, y * 12, z * 5, 3) * 0.12
      c = [c[0] * shade, c[1] * shade, c[2] * shade]
      // Great Dark Spot
      let dl = lon - 2.2
      if (dl > Math.PI) dl -= Math.PI * 2
      if (dl < -Math.PI) dl += Math.PI * 2
      const d = Math.sqrt((dl / 0.28) ** 2 + ((lat + 0.35) / 0.12) ** 2)
      c = mix(c, darkSpot, smooth(1.0, 0.3, d) * 0.85)
      // Bright methane cloud streaks (stretched noise)
      const streak = fbm(n, x * 1.5 + 9, y * 14, z * 1.5, 4)
      c = mix(c, white, smooth(0.18, 0.38, streak) * 0.75)
      // companion cloud next to the dark spot
      const d2 = Math.sqrt(((dl - 0.05) / 0.2) ** 2 + ((lat + 0.5) / 0.04) ** 2)
      c = mix(c, white, smooth(1, 0.2, d2) * 0.8)
      return c
    }),
  )
}

/** Transparent fast-moving cloud streak layer for Neptune's WIND effect. */
export function makeStreakTexture(w = 1024, h = 512) {
  const n = makePerlin(41)
  return toTexture(
    paint(w, h, (x, y, z) => {
      const s = fbm(n, x * 2 + 4, y * 22, z * 2, 4)
      const a = smooth(0.12, 0.4, s)
      return [240, 248, 255, a * 230]
    }),
  )
}

/** Offline fallback for Earth if the photo textures fail to load. */
export function makeEarthFallback(w = 1024, h = 512) {
  const n = makePerlin(2)
  const ocean = hex('#0f3d8a')
  const shallow = hex('#2a7ad1')
  const green = hex('#3f7d3a')
  const desert = hex('#c9a66b')
  const snow = hex('#f5f8ff')
  const specCanvas = newCanvas(w, h)
  const sctx = specCanvas.getContext('2d')!
  const sImg = sctx.createImageData(w, h)
  let i = 0
  const map = paint(w, h, (x, y, z, lat) => {
    const hgt = fbm(n, x * 1.8, y * 1.8, z * 1.8, 6)
    const land = hgt > 0.04
    const v = land ? 0 : 255
    sImg.data[i * 4] = sImg.data[i * 4 + 1] = sImg.data[i * 4 + 2] = v
    sImg.data[i * 4 + 3] = 255
    i++
    let c: RGB
    if (!land) c = mix(ocean, shallow, smooth(-0.1, 0.04, hgt))
    else c = mix(green, desert, smooth(0.15, 0.5, 1 - Math.abs(Math.abs(lat) - 0.4) * 3) * 0.7)
    return mix(c, snow, smooth(1.15, 1.3, Math.abs(lat)))
  })
  sctx.putImageData(sImg, 0, 0)
  const n2 = makePerlin(8)
  const clouds = paint(w, h, (x, y, z) => {
    const v = smooth(0.05, 0.35, fbm(n2, x * 2.5, y * 4, z * 2.5, 5))
    return [255, 255, 255, v * 255]
  })
  const lights = newCanvas(4, 4)
  const lctx = lights.getContext('2d')!
  lctx.fillStyle = '#000'
  lctx.fillRect(0, 0, 4, 4)
  return {
    day: toTexture(map),
    specular: toTexture(specCanvas, false),
    clouds: toTexture(clouds),
    lights: toTexture(lights),
  }
}

// ---------------------------------------------------------------- sprites
/** Soft round glow used for corona, particles and sparkles. */
export function makeGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 256) {
  const c = newCanvas(size, size)
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.6)'))
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Four-point "twinkle" star with diffraction spikes. */
export function makeStarSpikeTexture(size = 512) {
  const c = newCanvas(size, size)
  const ctx = c.getContext('2d')!
  const m = size / 2
  const g = ctx.createRadialGradient(m, m, 0, m, m, m * 0.35)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'lighter'
  for (const angle of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
    const long = angle === 0 || angle === Math.PI / 2
    ctx.save()
    ctx.translate(m, m)
    ctx.rotate(angle)
    const len = long ? m : m * 0.55
    const lg = ctx.createLinearGradient(-len, 0, len, 0)
    lg.addColorStop(0, 'rgba(255,230,180,0)')
    lg.addColorStop(0.5, 'rgba(255,250,235,0.95)')
    lg.addColorStop(1, 'rgba(255,230,180,0)')
    ctx.fillStyle = lg
    ctx.beginPath()
    ctx.moveTo(-len, 0)
    ctx.lineTo(0, long ? -6 : -3)
    ctx.lineTo(len, 0)
    ctx.lineTo(0, long ? 6 : 3)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// ---------------------------------------------------------------- cache
const cache = new Map<string, unknown>()
export function cached<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key) as T
}

export function proceduralMap(id: PlanetId) {
  switch (id) {
    case 'mars':
      return cached('mars', () => makeMarsTextures()).map
    case 'jupiter':
      return cached('jupiter', () => makeJupiterTexture())
    case 'saturn':
      return cached('saturn', () => makeSaturnTexture())
    case 'neptune':
      return cached('neptune', () => makeNeptuneTexture())
    default:
      return null
  }
}
