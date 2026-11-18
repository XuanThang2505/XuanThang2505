/**
 * Reusable 3D effect pieces that the vocabulary cards switch on:
 * particle swarms, a cartoon rocket, Jupiter's moons, the storm marker, sparkle stars.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cached, latLonToVec3, makeGlowTexture, makeStarSpikeTexture } from '../utils/textures'

export type Getter = () => number
const noRaycast = () => null

export const glowTex = () => cached('glow', () => makeGlowTexture())
export const spikeTex = () => cached('spike', () => makeStarSpikeTexture())

// ---------------------------------------------------------------- particles
export type SwarmKind = 'dust' | 'rays' | 'ice' | 'wind' | 'snow'

interface SwarmConfig {
  count: number
  size: number
  color: string
  blending: THREE.Blending
}

const SWARM: Record<SwarmKind, SwarmConfig> = {
  dust: { count: 1600, size: 0.06, color: '#f0a26a', blending: THREE.AdditiveBlending },
  rays: { count: 900, size: 0.12, color: '#ffd27a', blending: THREE.AdditiveBlending },
  ice: { count: 900, size: 0.07, color: '#e6f4ff', blending: THREE.AdditiveBlending },
  wind: { count: 140 * 8, size: 0.05, color: '#dff0ff', blending: THREE.AdditiveBlending },
  snow: { count: 700, size: 0.07, color: '#cfe8ff', blending: THREE.AdditiveBlending },
}

/**
 * A particle swarm whose brightness follows `level()` (0..1).
 * `baseline` keeps a few particles visible even when the effect is idle.
 */
export function Swarm({ kind, level, baseline = 0 }: { kind: SwarmKind; level: Getter; baseline?: number }) {
  const cfg = SWARM[kind]
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)

  const data = useMemo(() => {
    const n = cfg.count
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const r = new Float32Array(n)
    const a = new Float32Array(n) // longitude / angle
    const b = new Float32Array(n) // latitude
    const s = new Float32Array(n) // speed
    const ph = new Float32Array(n) // phase
    for (let i = 0; i < n; i++) {
      ph[i] = Math.random() * Math.PI * 2
      a[i] = Math.random() * Math.PI * 2
      switch (kind) {
        case 'dust':
          r[i] = 1.02 + Math.random() * 0.22
          b[i] = (Math.random() - 0.5) * 1.6
          s[i] = 0.4 + Math.random() * 0.8
          break
        case 'rays':
          r[i] = 1 + Math.random() * 2.6
          b[i] = Math.asin(Math.random() * 2 - 1)
          s[i] = 0.5 + Math.random() * 0.9
          break
        case 'ice':
          r[i] = 1.3 + Math.random() * 0.95
          b[i] = (Math.random() - 0.5) * 0.03
          s[i] = 0.1 + Math.random() * 0.12
          break
        case 'wind': {
          const streak = Math.floor(i / 8)
          const bands = [-0.9, -0.55, -0.25, 0.1, 0.4, 0.75]
          b[i] = bands[streak % bands.length] + (Math.sin(streak * 12.9898) * 0.5) * 0.12
          a[i] = (Math.sin(streak * 78.233) * 0.5 + 0.5) * Math.PI * 2 - (i % 8) * 0.035
          s[i] = 1.2 + (streak % 5) * 0.25
          r[i] = 1.035
          break
        }
        case 'snow':
          r[i] = 1.1 + Math.random() * 1.2
          b[i] = Math.asin(Math.random() * 2 - 1)
          s[i] = 0.08 + Math.random() * 0.15
          break
      }
    }
    return { pos, col, r, a, b, s, ph }
  }, [cfg.count, kind])

  const base = useMemo(() => new THREE.Color(cfg.color), [cfg.color])

  useFrame((state, dt) => {
    const L = Math.max(baseline, level())
    const pts = pointsRef.current
    if (!pts) return
    pts.visible = L > 0.005
    if (!pts.visible) return
    const t = state.clock.elapsedTime
    const { pos, col, r, a, b, s, ph } = data
    const n = cfg.count
    dt = Math.min(dt, 0.05)
    for (let i = 0; i < n; i++) {
      let x = 0
      let y = 0
      let z = 0
      let bright = L
      switch (kind) {
        case 'dust': {
          a[i] += s[i] * dt * (0.6 + 2.2 * L)
          const lat = b[i] + Math.sin(t * 0.7 + ph[i]) * 0.12
          const rr = r[i] + Math.sin(t * 1.3 + ph[i]) * 0.03
          const cl = Math.cos(lat)
          x = Math.cos(a[i]) * cl * rr
          y = Math.sin(lat) * rr
          z = Math.sin(a[i]) * cl * rr
          bright *= 0.5 + 0.5 * Math.sin(ph[i] + t)
          break
        }
        case 'rays': {
          r[i] += s[i] * dt * 1.4
          if (r[i] > 3.6) r[i] = 1
          const cl = Math.cos(b[i])
          x = Math.cos(a[i]) * cl * r[i]
          y = Math.sin(b[i]) * r[i]
          z = Math.sin(a[i]) * cl * r[i]
          bright *= 1 - (r[i] - 1) / 2.6
          break
        }
        case 'ice': {
          a[i] += s[i] * dt
          x = Math.cos(a[i]) * r[i]
          y = b[i]
          z = Math.sin(a[i]) * r[i]
          const tw = Math.max(0, Math.sin(t * (2 + s[i] * 20) + ph[i]))
          bright *= 0.15 + 1.6 * tw ** 6
          break
        }
        case 'wind': {
          a[i] += s[i] * dt * (1 + 2 * L)
          const cl = Math.cos(b[i])
          x = Math.cos(a[i]) * cl * r[i]
          y = Math.sin(b[i]) * r[i]
          z = Math.sin(a[i]) * cl * r[i]
          bright *= 1 - (i % 8) / 8
          break
        }
        case 'snow': {
          r[i] -= s[i] * dt
          a[i] += dt * 0.3
          if (r[i] < 1.03) r[i] = 2.3
          const cl = Math.cos(b[i])
          x = Math.cos(a[i]) * cl * r[i]
          y = Math.sin(b[i]) * r[i]
          z = Math.sin(a[i]) * cl * r[i]
          bright *= 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + ph[i]))
          break
        }
      }
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      col[i * 3] = base.r * bright
      col[i * 3 + 1] = base.g * bright
      col[i * 3 + 2] = base.b * bright
    }
    const g = pts.geometry
    g.attributes.position.needsUpdate = true
    g.attributes.color.needsUpdate = true
  })

  return (
    <points ref={pointsRef} raycast={noRaycast} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={cfg.size}
        map={glowTex()}
        vertexColors
        transparent
        depthWrite={false}
        blending={cfg.blending}
        sizeAttenuation
      />
    </points>
  )
}

// ---------------------------------------------------------------- rocket
/** Cartoon rocket that loops around the planet while `level()` > 0. */
export function Rocket({ level, time }: { level: Getter; time: Getter }) {
  const holder = useRef<THREE.Group>(null)
  const rocket = useRef<THREE.Group>(null)
  const flame = useRef<THREE.Mesh>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const L = level()
    const g = rocket.current
    if (!g || !holder.current) return
    g.visible = L > 0.01
    if (!g.visible) return
    const t = time()
    const R = 1.55
    const ang = t * 1.9
    g.position.set(Math.cos(ang) * R, Math.sin(ang * 2) * 0.12, -Math.sin(ang) * R)
    tmp.set(-Math.sin(ang), Math.cos(ang * 2) * 0.12, -Math.cos(ang)).add(g.position)
    holder.current.localToWorld(tmp)
    g.lookAt(tmp)
    g.scale.setScalar(0.22 * L)
    if (flame.current) {
      const f = 0.8 + Math.sin(state.clock.elapsedTime * 40) * 0.2
      flame.current.scale.set(f, f * (1 + Math.random() * 0.3), f)
    }
  })

  return (
    <group ref={holder} rotation={[0.35, 0, 0.15]}>
      <group ref={rocket}>
        {/* built along +Y, rotated so +Y points along +Z (direction of travel) */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.34, 1.3, 24]} />
            <meshStandardMaterial color="#f4f6fb" metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <coneGeometry args={[0.3, 0.6, 24]} />
            <meshStandardMaterial color="#ff4d4d" roughness={0.4} emissive="#ff2020" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0.25, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 24]} />
            <meshStandardMaterial color="#58c8ff" emissive="#2aa8ff" emissiveIntensity={0.8} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, -0.5, 0]}>
              <boxGeometry args={[0.06, 0.45, 0.85]} />
              <meshStandardMaterial color="#ff4d4d" roughness={0.4} />
            </mesh>
          ))}
          <mesh ref={flame} position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.22, 0.7, 16]} />
            <meshBasicMaterial color="#ffb02e" transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- moons
const GALILEAN = [
  { r: 1.5, size: 0.1, color: '#f0d65a', speed: 1.2 }, // Io
  { r: 1.85, size: 0.09, color: '#e6dccb', speed: 0.9 }, // Europa
  { r: 2.25, size: 0.14, color: '#a89c8a', speed: 0.6 }, // Ganymede
  { r: 2.65, size: 0.13, color: '#7a6e62', speed: 0.42 }, // Callisto
]

export function Moons({ level }: { level: Getter }) {
  const group = useRef<THREE.Group>(null)
  const moons = useRef<(THREE.Mesh | null)[]>([])
  const orbits = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state) => {
    const L = level()
    if (!group.current) return
    group.current.visible = L > 0.01
    if (!group.current.visible) return
    const t = state.clock.elapsedTime
    GALILEAN.forEach((m, i) => {
      const mesh = moons.current[i]
      if (mesh) {
        const a = t * m.speed + i * 1.7
        mesh.position.set(Math.cos(a) * m.r, 0, -Math.sin(a) * m.r)
        mesh.scale.setScalar(Math.max(0.001, L))
      }
      const o = orbits.current[i]
      if (o) (o.material as THREE.MeshBasicMaterial).opacity = 0.12 * L
    })
  })

  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      {GALILEAN.map((m, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              moons.current[i] = el
            }}
          >
            <sphereGeometry args={[m.size, 32, 16]} />
            <meshStandardMaterial color={m.color} roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={noRaycast}
            ref={(el) => {
              orbits.current[i] = el
            }}
          >
            <ringGeometry args={[m.r - 0.004, m.r + 0.004, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- storm marker
/** Pulsing rings around Jupiter's Great Red Spot. Must be a child of the rotating body. */
export function StormMarker({ lat, lon, level }: { lat: number; lon: number; level: Getter }) {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const matrix = useMemo(() => {
    const n = latLonToVec3(lat, lon).normalize()
    const east = new THREE.Vector3(0, 1, 0).cross(n).normalize()
    const north = new THREE.Vector3().crossVectors(n, east)
    const m = new THREE.Matrix4().makeBasis(east, north, n)
    m.setPosition(n.clone().multiplyScalar(1.012))
    return m
  }, [lat, lon])

  useFrame((state) => {
    const L = level()
    if (!group.current) return
    group.current.visible = L > 0.01
    const t = state.clock.elapsedTime
    rings.current.forEach((r, i) => {
      if (!r) return
      const p = (t * 0.8 + i / 3) % 1
      r.scale.setScalar(0.6 + p * 1.2)
      ;(r.material as THREE.MeshBasicMaterial).opacity = L * (1 - p)
      r.rotation.z = t * (i % 2 ? -1 : 1)
    })
  })

  return (
    <group ref={group} matrixAutoUpdate={false} matrix={matrix}>
      <group scale={[0.36, 0.18, 0.18]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            raycast={noRaycast}
            ref={(el) => {
              rings.current[i] = el
            }}
          >
            <torusGeometry args={[1, 0.06, 8, 64]} />
            <meshBasicMaterial color="#ffdd88" transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- glow sprite
export function GlowSprite({
  color,
  scale,
  opacity = 1,
  spikes = false,
  spriteRef,
}: {
  color: string
  scale: number
  opacity?: number
  spikes?: boolean
  spriteRef?: React.Ref<THREE.Sprite>
}) {
  return (
    <sprite ref={spriteRef} scale={[scale, scale, 1]} raycast={noRaycast}>
      <spriteMaterial
        map={spikes ? spikeTex() : glowTex()}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  )
}
