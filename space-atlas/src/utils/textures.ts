/**
 * Texture helpers: Saturn's rings, Earth fallback, glow sprites, and the
 * worker-backed store for procedural planet maps (see proceduralPixels.ts).
 * They are used whenever a real photo texture is not available, so the
 * app always looks rich and colourful – even fully offline.
 *
 * Noise is sampled in 3D on the sphere surface, so there is no seam at
 * the date line and no pinching at the poles.
 */
import * as THREE from 'three'

import { clamp01, fbm, hex, makePerlin, mix, paintAll, smooth, type Pixels, type ProceduralKey, type RGB } from './proceduralPixels'
export { JUPITER_SPOT } from './proceduralPixels'

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

// ---------------------------------------------------------------- planets
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

// ---------------------------------------------------------------- procedural planet maps (worker)
type Listener = () => void
const ready = new Map<ProceduralKey, THREE.DataTexture>()
const listeners = new Set<Listener>()
let started = false

function toDataTexture(px: Pixels, srgb: boolean) {
  const t = new THREE.DataTexture(px.data, px.w, px.h, THREE.RGBAFormat)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

function store(key: ProceduralKey, px: Pixels) {
  ready.set(key, toDataTexture(px, key !== 'marsBump'))
  listeners.forEach((l) => l())
}

/**
 * Paint all procedural planet maps in a Web Worker so flights stay smooth.
 * Safe to call many times. Falls back to the main thread if workers are unavailable.
 */
export function preloadProceduralTextures() {
  if (started) return
  started = true
  try {
    const worker = new Worker(new URL('./textureWorker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<{ key: ProceduralKey; px: Pixels } | { done: true }>) => {
      if ('done' in e.data) worker.terminate()
      else store(e.data.key, e.data.px)
    }
    worker.onerror = () => {
      worker.terminate()
      paintOnMainThread()
    }
  } catch {
    paintOnMainThread()
  }
}

function paintOnMainThread() {
  setTimeout(() => paintAll((k, px) => !ready.has(k) && store(k, px)), 50)
}

export function allProcedural() {
  return [...ready.values()]
}

export function getProcedural(key: ProceduralKey) {
  return ready.get(key) ?? null
}

export function subscribeProcedural(l: Listener) {
  listeners.add(l)
  return () => void listeners.delete(l)
}
