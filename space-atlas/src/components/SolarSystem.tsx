/**
 * Solar System overview: the Sun in the middle and the eight planets going round it.
 *
 * True to life: planet order, every planet spins and orbits the same way, and farther
 * planets go round more slowly (real orbital periods, played back at square-root speed so
 * Neptune still visibly moves). Squeezed for an iPad: sizes and distances are not to scale.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { myPlanet, sim } from '../worlds/stores'
import { MY_PLANET_SURFACES } from '../data/worldsData'
import * as THREE from 'three'
import {
  ASTEROID_BELT,
  COUNT_STEP,
  ORBITS,
  PLANET_MAP,
  PLANET_ORDER,
  SUN_OVERVIEW_SIZE,
  type PlanetId,
} from '../data/planetsData'
import { OverviewContext, PlanetMesh, SunDirContext, useEffectClock, type ActiveEffect } from './PlanetMesh'
import { glowTex } from './SpaceEffects'

/**
 * How the overview is squeezed for the shape of the screen. Landscape uses the true layout;
 * an upright phone/tablet gets bigger bodies on slightly tighter orbits, otherwise Earth would
 * be a speck (the system is wide, an upright screen is narrow).
 */
export interface OverviewFit {
  portrait: boolean
  orbitScale: number
  bodyScale: number
  sunScale: number
  /** Distance from the centre to the farthest thing we draw (for camera fitting) */
  halfExtent: number
  radius: (r: number) => number
}

export function overviewFit(aspect: number): OverviewFit {
  const portrait = aspect < 0.95
  const orbitScale = portrait ? 0.75 : 1
  const bodyScale = portrait ? 2 : 1
  const sunScale = 1 + (bodyScale - 1) * 0.35
  const innerGap = (bodyScale - 1) * 1.0
  const radius = (r: number) => r * orbitScale + innerGap
  return {
    portrait,
    orbitScale,
    bodyScale,
    sunScale,
    halfExtent: radius(ORBITS.neptune.radius) + ORBITS.neptune.size * bodyScale + 1.2,
    radius,
  }
}

/** Seconds for Earth to go round once at normal speed. */
const EARTH_YEAR_SECONDS = 14
const noRaycast = () => null

function periodSeconds(years: number) {
  return EARTH_YEAR_SECONDS * Math.sqrt(years)
}

function OrbitLine({ radius, glow, highlight }: { radius: number; glow: () => number; highlight: () => number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((state) => {
    if (!mat.current) return
    const g = glow()
    const h = highlight()
    mat.current.opacity = 0.16 + g * (0.45 + Math.sin(state.clock.elapsedTime * 2) * 0.06) + h * 0.5
    mat.current.color.setRGB(1 - g * 0.6, 1 - g * 0.15, 1)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
      <ringGeometry args={[radius - 0.025, radius + 0.025, 256]} />
      <meshBasicMaterial ref={mat} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function AsteroidBelt({ speed, fit }: { speed: () => number; fit: OverviewFit }) {
  const ref = useRef<THREE.Points>(null)
  const geom = useMemo(() => {
    const n = 1800
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = fit.radius(ASTEROID_BELT.inner + Math.random() * (ASTEROID_BELT.outer - ASTEROID_BELT.inner))
      pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.25, Math.sin(a) * r], i * 3)
      c.set(['#9c8f80', '#b8a994', '#7d7268'][i % 3]).multiplyScalar(0.6 + Math.random() * 0.5)
      col.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [fit])
  useFrame((_, dt) => {
    // belt ≈ 4.6-year period
    if (ref.current) ref.current.rotation.y += (dt * speed() * Math.PI * 2) / periodSeconds(4.6)
  })
  return (
    <points ref={ref} geometry={geom} raycast={noRaycast}>
      <pointsMaterial size={0.07} map={glowTex()} vertexColors transparent depthWrite={false} sizeAttenuation />
    </points>
  )
}

/** Real moons, tiny and cheap (low-poly spheres): Moon, Phobos & Deimos, the four Galilean moons, Titan. */
const MOONS: Partial<Record<Exclude<PlanetId, 'sun'>, { r: number; size: number; period: number; color: string }[]>> = {
  earth: [{ r: 2.1, size: 0.27, period: 5, color: '#d1d5db' }],
  mars: [
    { r: 1.8, size: 0.12, period: 2, color: '#a8a29e' },
    { r: 2.5, size: 0.09, period: 4, color: '#a8a29e' },
  ],
  jupiter: [
    { r: 1.5, size: 0.09, period: 2, color: '#fde047' },
    { r: 1.8, size: 0.08, period: 3.2, color: '#f5f5f4' },
    { r: 2.2, size: 0.12, period: 5, color: '#a8a29e' },
    { r: 2.6, size: 0.11, period: 8, color: '#57534e' },
  ],
  saturn: [{ r: 2.9, size: 0.12, period: 7, color: '#fb923c' }],
}
const moonGeo = new THREE.SphereGeometry(1, 14, 10)

function OverviewMoons({ id, bodySize, simTime }: { id: Exclude<PlanetId, 'sun'>; bodySize: number; simTime: React.MutableRefObject<number> }) {
  const list = MOONS[id]
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(() => {
    list?.forEach((m, i) => {
      const a = (simTime.current / m.period) * Math.PI * 2 + i * 1.7
      refs.current[i]?.position.set(Math.cos(a) * m.r * bodySize, Math.sin(a * 0.5) * 0.05, -Math.sin(a) * m.r * bodySize)
    })
  })
  if (!list) return null
  return (
    <>
      {list.map((m, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} geometry={moonGeo} scale={Math.max(0.06, m.size * bodySize)} raycast={noRaycast}>
          <meshStandardMaterial color={m.color} roughness={1} />
        </mesh>
      ))}
    </>
  )
}

/** A comet on a long, tilted ellipse. Its tail always points AWAY from the Sun and grows near it (true!). */
function Comet({ speed, fit, onTap }: { speed: () => number; fit: OverviewFit; onTap: () => void }) {
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Points>(null)
  const M = useRef(2.6)
  const N = 48
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    const col = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const f = 1 - i / N
      col.set([0.6 * f + 0.2, 0.85 * f + 0.1, 1 * f], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  const a = fit.radius(12)
  const e = 0.78
  const b = a * Math.sqrt(1 - e * e)
  const tilt = 0.35
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    M.current += (Math.min(dt, 0.1) * speed() * Math.PI * 2) / 40
    // Kepler: E - e sin E = M (fast near the Sun, slow far away)
    let E = M.current
    for (let k = 0; k < 4; k++) E -= (E - e * Math.sin(E) - M.current) / (1 - e * Math.cos(E))
    const x = a * (Math.cos(E) - e)
    const z = b * Math.sin(E)
    tmp.set(x, Math.sin(tilt) * z * 0.4, z * Math.cos(tilt)).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.9)
    head.current?.position.copy(tmp)
    const r = tmp.length()
    const len = Math.min(5, 9 / Math.max(r, 1.5)) // longer tail near the Sun
    const away = tmp.clone().normalize()
    const pos = geom.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < N; i++) {
      const t = (i / N) * len
      pos.setXYZ(i, tmp.x + away.x * t + Math.sin(i * 1.7) * 0.04 * t, tmp.y + away.y * t, tmp.z + away.z * t + Math.cos(i * 2.3) * 0.04 * t)
    }
    pos.needsUpdate = true
  })
  return (
    <>
      <points ref={tail} geometry={geom} raycast={noRaycast} frustumCulled={false}>
        <pointsMaterial size={0.22} map={glowTex()} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <group ref={head}>
        <sprite scale={[0.9, 0.9, 1]} raycast={noRaycast}>
          <spriteMaterial map={glowTex()} color="#e0f2fe" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <mesh
          onClick={(ev) => {
            ev.stopPropagation()
            onTap()
          }}
        >
          <sphereGeometry args={[0.7, 8, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </group>
    </>
  )
}

/** The child's own planet (built in "My planet"), orbiting between Uranus and Neptune. */
function MyPlanetOrbit({ simTime, fit, labelsOn, onTap }: { simTime: React.MutableRefObject<number>; fit: OverviewFit; labelsOn: boolean; onTap: () => void }) {
  const p = myPlanet.use()
  const holder = useRef<THREE.Group>(null)
  const r = fit.radius(17.25)
  const tex = useMemo(() => {
    const s = MY_PLANET_SURFACES.find((x) => x.id === p.surface) ?? MY_PLANET_SURFACES[0]
    const cv = document.createElement('canvas')
    cv.width = 256
    cv.height = 128
    const g = cv.getContext('2d')!
    g.fillStyle = s.colors[0]
    g.fillRect(0, 0, 256, 128)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 40; i++) {
      g.fillStyle = s.colors[1 + (i % 2)]
      g.beginPath()
      g.ellipse(rnd() * 256, 16 + rnd() * 96, 6 + rnd() * 22, 4 + rnd() * 12, 0, 0, Math.PI * 2)
      g.fill()
    }
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [p.surface])
  useFrame(() => {
    const a = 1.3 + (simTime.current * Math.PI * 2) / periodSeconds(120)
    holder.current?.position.set(Math.cos(a) * r, 0, -Math.sin(a) * r)
    if (holder.current) holder.current.rotation.y += 0.004
  })
  if (!p.made) return null
  const size = (0.4 + p.size * 0.15) * fit.bodyScale
  return (
    <group ref={holder}>
      <mesh
        scale={size}
        onClick={(ev) => {
          ev.stopPropagation()
          onTap()
        }}
      >
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      {p.rings && (
        <mesh rotation={[-Math.PI / 2 + 0.4, 0, 0]} scale={size} raycast={noRaycast}>
          <ringGeometry args={[1.4, 2.1, 48]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      {Array.from({ length: p.moons }, (_, i) => (
        <mesh key={i} geometry={moonGeo} scale={size * 0.18} position={[Math.cos(i * 2.1) * size * 2.4, 0.1, Math.sin(i * 2.1) * size * 2.4]} raycast={noRaycast}>
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      ))}
      {labelsOn && (
        <Html center position={[0, size + 0.55, 0]} zIndexRange={[9, 0]}>
          <button onClick={onTap} className="whitespace-nowrap rounded-full border border-amber-200/60 bg-fuchsia-600/90 px-3 py-0.5 font-nunito text-sm font-extrabold text-white shadow-lg">
            ⭐ {p.name}
          </button>
        </Html>
      )}
    </group>
  )
}

function OrbitingPlanet({
  id,
  simTime,
  autoRotate,
  highlight,
  onSelect,
  labelsOn,
  fit,
  minHit,
}: {
  id: Exclude<PlanetId, 'sun'>
  simTime: React.MutableRefObject<number>
  autoRotate: boolean
  highlight: () => number
  onSelect: (id: PlanetId) => void
  labelsOn: boolean
  fit: OverviewFit
  minHit: number
}) {
  const o = ORBITS[id]
  const orbitR = fit.radius(o.radius)
  const bodySize = o.size * fit.bodyScale
  const planet = PLANET_MAP[id]
  const holder = useRef<THREE.Group>(null)
  const scaler = useRef<THREE.Group>(null)
  const label = useRef<HTMLButtonElement>(null)
  // Each planet gets its own "towards the Sun" vector so its day side faces the Sun.
  const sunDir = useMemo(() => new THREE.Vector3(1, 0, 0), [])

  useFrame(() => {
    const angle = o.start + (simTime.current * Math.PI * 2) / periodSeconds(o.periodYears)
    const x = Math.cos(angle) * orbitR
    const z = -Math.sin(angle) * orbitR // counter-clockwise seen from above, like the real Solar System
    holder.current?.position.set(x, 0, z)
    sunDir.set(-x, 0, -z).normalize()
    const h = highlight()
    scaler.current?.scale.setScalar(bodySize * (1 + h * 0.6))
    if (label.current) {
      label.current.style.transform = `scale(${1 + h * 0.35})`
      label.current.style.background = h > 0.05 ? 'rgba(251,191,36,0.95)' : 'rgba(15,23,42,0.75)'
      label.current.style.color = h > 0.05 ? '#0f172a' : '#ffffff'
    }
  })

  return (
    <group ref={holder}>
      <group ref={scaler} scale={bodySize}>
        <SunDirContext.Provider value={sunDir}>
          <PlanetMesh planet={planet} effect={null} autoRotate={autoRotate} onTap={() => onSelect(id)} />
        </SunDirContext.Provider>
      </group>
      <OverviewMoons id={id} bodySize={bodySize} simTime={simTime} />
      {/* invisible, larger tap target: small fingers + small planets */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta < 12) onSelect(id)
        }}
      >
        <sphereGeometry args={[Math.max(0.75, bodySize * 1.4, minHit), 16, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {labelsOn && (
        <Html center position={[0, bodySize * (id === 'saturn' ? 1.3 : 1) + 0.55, 0]} zIndexRange={[9, 0]}>
          <button
            ref={label}
            onClick={() => onSelect(id)}
            className="whitespace-nowrap rounded-full border border-white/20 px-2.5 py-0.5 font-nunito text-sm font-extrabold tracking-wide text-white shadow-lg transition-colors"
            style={{ background: 'rgba(15,23,42,0.75)' }}
          >
            {planet.englishName}
          </button>
        </Html>
      )}
    </group>
  )
}

export function SolarSystem({
  effect,
  autoRotate,
  labelsOn,
  onSelect,
  fit,
  minHit,
  timeScale = 1,
  onExtra,
}: {
  /** cosmic time machine: 1 = normal, bigger = faster years */
  timeScale?: number
  /** the comet or the child's planet was tapped */
  onExtra?: (what: 'comet' | 'myplanet') => void
  effect: ActiveEffect | null
  autoRotate: boolean
  labelsOn: boolean
  onSelect: (id: PlanetId) => void
  fit: OverviewFit
  /** smallest world-space tap radius that is still ~22 px on screen */
  minHit: number
}) {
  const { level, time } = useEffectClock(effect)
  const simTime = useRef(0)
  const speed = () => (autoRotate ? 1 : 0.25) * (1 + level('speedUp') * 7) * timeScale

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1) * speed()
    simTime.current += step
    sim.earthYears += step / EARTH_YEAR_SECONDS
  })

  /** During PLANETS counting, planet i lights up while its name is spoken. */
  const highlightFor = (i: number) => () => {
    const L = level('countPlanets')
    if (L <= 0) return 0
    const t = time('countPlanets') - i * COUNT_STEP
    return t >= 0 && t < COUNT_STEP ? Math.sin((t / COUNT_STEP) * Math.PI) : 0
  }

  return (
    <OverviewContext.Provider value={true}>
      <group scale={SUN_OVERVIEW_SIZE * fit.sunScale}>
        <PlanetMesh planet={PLANET_MAP.sun} effect={null} autoRotate={autoRotate} onTap={() => onSelect('sun')} />
      </group>
      {labelsOn && (
        <Html center position={[0, SUN_OVERVIEW_SIZE * fit.sunScale + 0.7, 0]} zIndexRange={[9, 0]}>
          <button
            onClick={() => onSelect('sun')}
            className="whitespace-nowrap rounded-full border border-amber-200/40 bg-amber-500/85 px-3 py-0.5 font-nunito text-sm font-extrabold tracking-wide text-white shadow-lg"
          >
            SUN
          </button>
        </Html>
      )}
      {PLANET_ORDER.map((id, i) => (
        <OrbitLine key={id} radius={fit.radius(ORBITS[id as Exclude<PlanetId, 'sun'>].radius)} glow={() => level('orbitGlow')} highlight={highlightFor(i)} />
      ))}
      <AsteroidBelt speed={speed} fit={fit} />
      <Comet speed={speed} fit={fit} onTap={() => onExtra?.('comet')} />
      <MyPlanetOrbit simTime={simTime} fit={fit} labelsOn={labelsOn} onTap={() => onExtra?.('myplanet')} />
      {PLANET_ORDER.map((id, i) => (
        <OrbitingPlanet
          key={id}
          id={id as Exclude<PlanetId, 'sun'>}
          simTime={simTime}
          autoRotate={autoRotate}
          highlight={highlightFor(i)}
          onSelect={onSelect}
          labelsOn={labelsOn}
          fit={fit}
          minHit={minHit}
        />
      ))}
    </OverviewContext.Provider>
  )
}
