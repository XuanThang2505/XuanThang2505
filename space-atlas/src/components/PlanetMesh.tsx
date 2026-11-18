/**
 * Photoreal-ish planet bodies + the 3D side of every vocabulary effect.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { EFFECT_DURATION, type EffectName, type PlanetData } from '../data/planetsData'
import {
  cached,
  JUPITER_SPOT,
  latLonToVec3,
  getProcedural,
  makeEarthFallback,
  makeSaturnRingTexture,
  preloadProceduralTextures,
  SATURN_RING,
  subscribeProcedural,
} from '../utils/textures'
import type { ProceduralKey } from '../utils/proceduralPixels'
import { GlowSprite, Moons, Rocket, StormMarker, Swarm, type Getter } from './SpaceEffects'

/** Direction *towards* the Sun for lighting every planet. */
export const SUN_DIR = new THREE.Vector3(-4, 1.2, 3).normalize()

export interface ActiveEffect {
  name: EffectName
  key: number
}

const noRaycast = () => null
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Returns getters: level(name) = 0..1 envelope, time(name) = seconds since start. */
function useEffectClock(effect: ActiveEffect | null) {
  const clock = useThree((s) => s.clock)
  const start = useRef(-1000)
  const name = useRef<EffectName | null>(null)
  useEffect(() => {
    if (effect) {
      start.current = clock.elapsedTime
      name.current = effect.name
    } else {
      name.current = null
    }
  }, [effect, clock])
  const time = useCallback((n: EffectName) => (name.current === n ? clock.elapsedTime - start.current : -1), [clock])
  const level = useCallback(
    (n: EffectName) => {
      const t = time(n)
      if (t < 0 || t > EFFECT_DURATION) return 0
      return smoothstep(0, 0.5, t) * (1 - smoothstep(EFFECT_DURATION - 1.2, EFFECT_DURATION, t))
    },
    [time],
  )
  return { level, time }
}

// ---------------------------------------------------------------- procedural maps (painted in a worker)
function useProcedural(key: ProceduralKey | null) {
  useEffect(() => preloadProceduralTextures(), [])
  return useSyncExternalStore(subscribeProcedural, () => (key ? getProcedural(key) : null))
}

// ---------------------------------------------------------------- textures from files
const loaded = new Map<string, THREE.Texture>()
function useFileTexture(url: string | undefined, srgb = true) {
  const [state, setState] = useState<{ tex: THREE.Texture | null; failed: boolean }>(() => ({
    tex: url ? loaded.get(url) ?? null : null,
    failed: false,
  }))
  useEffect(() => {
    if (!url) return
    if (loaded.has(url)) {
      setState({ tex: loaded.get(url)!, failed: false })
      return
    }
    let alive = true
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
        t.anisotropy = 8
        loaded.set(url, t)
        if (alive) setState({ tex: t, failed: false })
      },
      undefined,
      () => alive && setState({ tex: null, failed: true }),
    )
    return () => {
      alive = false
    }
  }, [url, srgb])
  return url ? state : { tex: null, failed: true }
}

// ---------------------------------------------------------------- atmosphere
const atmoVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const rimFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity; uniform vec3 uSunDir;
  varying vec3 vNormalW; varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float f = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    float lit = 0.35 + 0.65 * smoothstep(-0.5, 0.6, dot(N, uSunDir));
    gl_FragColor = vec4(uColor * f * uIntensity * lit, 1.0);
  }
`
const haloFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity; uniform vec3 uSunDir;
  varying vec3 vNormalW; varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float f = pow(smoothstep(0.0, 0.5, -dot(N, V)), 2.4);
    float lit = 0.4 + 0.6 * smoothstep(-0.6, 0.6, dot(-N, uSunDir));
    gl_FragColor = vec4(uColor * f * uIntensity * lit * 0.8, 1.0);
  }
`

function Atmosphere({ color, glow, base = 1, size = 1 }: { color: string; glow: Getter; base?: number; size?: number }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: base },
      uSunDir: { value: SUN_DIR },
    }),
    [color, base],
  )
  useFrame(() => {
    uniforms.uIntensity.value = base * (1 + glow() * 2.2)
  })
  return (
    <group scale={size}>
      <mesh scale={1.015} raycast={noRaycast}>
        <sphereGeometry args={[1, 64, 32]} />
        <shaderMaterial
          vertexShader={atmoVertex}
          fragmentShader={rimFragment}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.16} raycast={noRaycast}>
        <sphereGeometry args={[1, 64, 32]} />
        <shaderMaterial
          vertexShader={atmoVertex}
          fragmentShader={haloFragment}
          uniforms={uniforms}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- SUN
const SIMPLEX = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`
const sunVertex = /* glsl */ `
  varying vec3 vPos; varying vec3 vNormalW; varying vec3 vPosW;
  void main() {
    vPos = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const sunFragment = /* glsl */ `
  uniform float uTime; uniform float uHeat;
  varying vec3 vPos; varying vec3 vNormalW; varying vec3 vPosW;
  ${SIMPLEX}
  void main() {
    vec3 p = vPos * 3.0;
    float t = uTime * (0.12 + 0.4 * uHeat);
    float n = snoise(p + vec3(t, -t, t)) * 0.5
            + snoise(p * 2.7 - vec3(t * 1.4)) * 0.3
            + snoise(p * 7.0 + vec3(t * 2.2)) * 0.2;
    float cells = n * 0.5 + 0.5;
    vec3 deep = vec3(0.80, 0.22, 0.02);
    vec3 mid  = vec3(1.00, 0.58, 0.10);
    vec3 hot  = vec3(1.00, 0.93, 0.60);
    vec3 col = mix(deep, mid, smoothstep(0.2, 0.6, cells));
    col = mix(col, hot, smoothstep(0.6, 0.95, cells));
    col = mix(col, vec3(1.0, 0.85, 0.45), uHeat * 0.35);
    vec3 V = normalize(cameraPosition - vPosW);
    float mu = max(dot(normalize(vNormalW), V), 0.0);
    col *= 0.5 + 0.65 * pow(mu, 0.45);
    col *= 1.0 + uHeat * 0.45;
    gl_FragColor = vec4(col, 1.0);
  }
`

function SunBody({ level, onTap, spin }: { level: (n: EffectName) => number; onTap: (e: ThreeEvent<MouseEvent>) => void; spin: Getter }) {
  const body = useRef<THREE.Mesh>(null)
  const corona = useRef<THREE.Sprite>(null)
  const outer = useRef<THREE.Sprite>(null)
  const spikes = useRef<THREE.Sprite>(null)
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHeat: { value: 0 } }), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const heat = level('sunHeat')
    const rays = level('sunRays')
    const star = level('sunStar')
    uniforms.uTime.value = t
    uniforms.uHeat.value = heat
    if (body.current) body.current.rotation.y += dt * spin() * (1 + heat * 4)
    if (group.current) group.current.scale.setScalar(1 - star * 0.45 + Math.sin(t * 6) * heat * 0.015)
    const pulse = 1 + Math.sin(t * 1.5) * 0.03
    if (corona.current) corona.current.scale.setScalar((2.9 + rays * 1.4 + heat * 0.6) * pulse)
    if (outer.current) {
      outer.current.scale.setScalar((4.6 + rays * 2.2) * pulse)
      outer.current.material.opacity = 0.22 + rays * 0.25
    }
    if (spikes.current) {
      spikes.current.visible = star > 0.01
      spikes.current.scale.setScalar(2 + star * 5 + Math.sin(t * 5) * 0.4 * star)
      spikes.current.material.rotation = t * 0.3
      spikes.current.material.opacity = star
    }
  })

  return (
    <group>
      <group ref={group}>
        <mesh ref={body} onClick={onTap}>
          <sphereGeometry args={[1, 96, 64]} />
          <shaderMaterial vertexShader={sunVertex} fragmentShader={sunFragment} uniforms={uniforms} />
        </mesh>
        <GlowSprite spriteRef={corona} color="#ffb04a" scale={2.9} opacity={0.8} />
        <GlowSprite spriteRef={outer} color="#ff6a10" scale={4.6} opacity={0.22} />
      </group>
      <GlowSprite spriteRef={spikes} color="#fff4d0" scale={4} spikes opacity={0} />
      <Swarm kind="rays" level={() => level('sunRays')} baseline={0.12} />
    </group>
  )
}

// ---------------------------------------------------------------- EARTH
const earthVertex = atmoVertex.replace('void main() {', 'varying vec2 vUv;\n  void main() {\n    vUv = uv;')
const earthFragment = /* glsl */ `
  uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D specMap;
  uniform vec3 uSunDir; uniform float uOcean; uniform float uNight; uniform float uTime;
  varying vec3 vNormalW; varying vec3 vPosW; varying vec2 vUv;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndl = dot(N, uSunDir);
    float dayF = smoothstep(-0.2, 0.3, ndl);
    vec3 day = texture2D(dayMap, vUv).rgb;
    float ocean = texture2D(specMap, vUv).r;
    vec3 lights = texture2D(nightMap, vUv).rgb;
    float dim = 1.0 - 0.85 * uNight;
    vec3 col = day * (0.06 + 1.1 * max(ndl, 0.0)) * dim;
    vec3 R = reflect(-uSunDir, N);
    float spec = pow(max(dot(R, V), 0.0), 120.0) * ocean * dayF * dim;
    col += vec3(1.0, 0.95, 0.85) * spec * 0.25;
    float wave = 0.6 + 0.4 * sin(uTime * 2.5 + vUv.x * 90.0 + sin(vUv.y * 25.0 + uTime) * 1.2);
    col = mix(col, vec3(0.05, 0.6, 1.0) * (0.7 + 0.6 * wave), ocean * uOcean * 0.8);
    float nightF = clamp(1.0 - dayF + uNight, 0.0, 1.0);
    col += lights * vec3(1.0, 0.75, 0.4) * nightF * (1.3 + uNight * 2.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col += vec3(0.3, 0.6, 1.0) * fres * 0.5 * (0.2 + dayF);
    gl_FragColor = vec4(col, 1.0);
  }
`

// Vietnam ≈ 16°N, 106°E. Texture u=0 is longitude -180°.
const VIETNAM = { lat: THREE.MathUtils.degToRad(16), lon: ((106 + 180) / 360) * Math.PI * 2 }
const VIETNAM_START_ROT = Math.PI / 2 - VIETNAM.lon - 0.3

/** "Bé ở đây!" – a little glowing pin on Vietnam that fades out on the far side. */
function VietnamPin() {
  const dot = useRef<THREE.Mesh>(null)
  const label = useRef<HTMLDivElement>(null)
  const pos = useMemo(() => latLonToVec3(VIETNAM.lat, VIETNAM.lon, 1.005), [])
  const world = useMemo(() => new THREE.Vector3(), [])
  const normal = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, clock }) => {
    if (!dot.current) return
    dot.current.getWorldPosition(world)
    normal.copy(world).normalize()
    const facing = normal.dot(camera.position.clone().sub(world).normalize())
    const o = THREE.MathUtils.smoothstep(facing, 0.1, 0.45)
    dot.current.scale.setScalar(0.022 * (1 + Math.sin(clock.elapsedTime * 4) * 0.25))
    if (label.current) label.current.style.opacity = String(o)
  })
  return (
    <group position={pos}>
      <mesh ref={dot} raycast={noRaycast}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
      </mesh>
      <Html center style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
        <div ref={label} className="-translate-y-6 whitespace-nowrap rounded-full bg-red-500/90 px-2 py-0.5 font-nunito text-sm font-extrabold text-white shadow transition-opacity">
          📍 Việt Nam
        </div>
      </Html>
    </group>
  )
}

function EarthBody({ level, onTap, spin }: { level: (n: EffectName) => number; onTap: (e: ThreeEvent<MouseEvent>) => void; spin: Getter }) {
  const day = useFileTexture('./textures/earth_atmos_2048.jpg')
  const night = useFileTexture('./textures/earth_lights_2048.png')
  const spec = useFileTexture('./textures/earth_specular_2048.jpg', false)
  const cloudsTex = useFileTexture('./textures/earth_clouds_1024.png')
  const anyFailed = day.failed || night.failed || spec.failed || cloudsTex.failed
  const fallback = useMemo(() => (anyFailed ? cached('earthFallback', () => makeEarthFallback()) : null), [anyFailed])

  const maps = {
    day: day.tex ?? fallback?.day ?? null,
    night: night.tex ?? fallback?.lights ?? null,
    spec: spec.tex ?? fallback?.specular ?? null,
    clouds: cloudsTex.tex ?? fallback?.clouds ?? null,
  }
  const ready = !!(maps.day && maps.night && maps.spec)

  const uniforms = useMemo(
    () => ({
      dayMap: { value: null as THREE.Texture | null },
      nightMap: { value: null as THREE.Texture | null },
      specMap: { value: null as THREE.Texture | null },
      uSunDir: { value: SUN_DIR },
      uOcean: { value: 0 },
      uNight: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  )
  uniforms.dayMap.value = maps.day
  uniforms.nightMap.value = maps.night
  uniforms.specMap.value = maps.spec

  const body = useRef<THREE.Mesh>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const cloudMat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uOcean.value = level('highlightOcean')
    uniforms.uNight.value = level('toggleCityLights')
    const s = spin()
    if (body.current) body.current.rotation.y += dt * s
    const boost = level('boostClouds')
    if (clouds.current) {
      clouds.current.rotation.y += dt * (s * 1.25 + boost * 0.9)
      clouds.current.scale.setScalar(1.012 + boost * 0.02)
    }
    if (cloudMat.current) {
      cloudMat.current.opacity = 0.85 * (1 - level('toggleCityLights') * 0.7) + boost * 0.15
      cloudMat.current.emissiveIntensity = boost * 0.35
    }
  })

  return (
    <group>
      <mesh ref={body} onClick={onTap} rotation={[0, VIETNAM_START_ROT, 0]}>
        <sphereGeometry args={[1, 128, 64]} />
        <VietnamPin />
        {ready ? (
          <shaderMaterial vertexShader={earthVertex} fragmentShader={earthFragment} uniforms={uniforms} />
        ) : (
          <meshStandardMaterial color="#2a6fd0" roughness={0.6} />
        )}
      </mesh>
      {maps.clouds && (
        <mesh ref={clouds} scale={1.012} raycast={noRaycast}>
          <sphereGeometry args={[1, 96, 48]} />
          <meshStandardMaterial
            ref={cloudMat}
            map={maps.clouds}
            alphaMap={maps.clouds}
            transparent
            depthWrite={false}
            roughness={1}
            emissive="#ffffff"
            emissiveIntensity={0}
          />
        </mesh>
      )}
      <Atmosphere color="#4aa8ff" glow={() => level('boostClouds') * 0.4 + level('highlightOcean') * 0.4} base={1.1} />
    </group>
  )
}

// ---------------------------------------------------------------- MARS / JUPITER / SATURN / NEPTUNE
function SaturnRings({ level }: { level: (n: EffectName) => number }) {
  const tex = useMemo(() => cached('saturnRing', () => makeSaturnRingTexture()), [])
  const geom = useMemo(() => {
    const g = new THREE.RingGeometry(SATURN_RING.inner, SATURN_RING.outer, 192, 1)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      uv.setXY(i, (v.length() - SATURN_RING.inner) / (SATURN_RING.outer - SATURN_RING.inner), 0.5)
    }
    return g
  }, [])
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const group = useRef<THREE.Group>(null)

  useFrame((state, dt) => {
    const shine = level('ringShine')
    const t = state.clock.elapsedTime
    mats.current.forEach((m, i) => {
      if (!m) return
      m.emissiveIntensity = 0.18 + shine * (0.9 + Math.sin(t * 6 + i) * 0.3)
    })
    if (group.current) {
      // RING: tilt the rings towards the viewer so they are easy to see
      group.current.rotation.x = -Math.PI / 2 + shine * 0.45
      group.current.rotation.z += dt * (0.02 + level('fastSpin') * 1.5)
    }
  })

  const layers = [
    { y: 0, scale: 1, opacity: 1 },
    { y: 0.006, scale: 0.995, opacity: 0.45 },
    { y: -0.006, scale: 1.004, opacity: 0.35 },
  ]

  return (
    <group ref={group} rotation={[-Math.PI / 2, 0, 0]}>
      {layers.map((l, i) => (
        <mesh key={i} geometry={geom} position={[0, 0, l.y]} scale={l.scale} raycast={noRaycast} renderOrder={1}>
          <meshStandardMaterial
            ref={(el) => {
              mats.current[i] = el
            }}
            map={tex}
            emissiveMap={tex}
            emissive="#fff1d0"
            emissiveIntensity={0.18}
            transparent
            opacity={l.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Great Red Spot position in the Solar System Scope photo map (measured from the image). */
const PHOTO_JUPITER_SPOT = { lat: -0.353, lon: 2.3 }

function GenericPlanet({
  planet,
  level,
  time,
  onTap,
  spin,
}: {
  planet: PlanetData
  level: (n: EffectName) => number
  time: (n: EffectName) => number
  onTap: (e: ThreeEvent<MouseEvent>) => void
  spin: Getter
}) {
  const id = planet.id
  const file = useFileTexture(planet.textureUrl)
  const procedural = useProcedural(id === 'mars' || id === 'jupiter' || id === 'saturn' || id === 'neptune' ? id : null)
  const map = file.tex ?? procedural
  const bump = useProcedural(id === 'mars' && !file.tex ? 'marsBump' : null)
  const streaks = useProcedural(id === 'neptune' ? 'streaks' : null)

  const body = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const spinGroup = useRef<THREE.Group>(null)
  const scaleGroup = useRef<THREE.Group>(null)
  const streakRef = useRef<THREE.Mesh>(null)
  const streakMat = useRef<THREE.MeshStandardMaterial>(null)

  const glow = useCallback(() => {
    switch (id) {
      case 'mars':
        return level('redGlow') + level('dustStorm') * 0.4
      case 'neptune':
        return level('blueGlow') + level('frostSnow') * 0.5
      case 'saturn':
        return level('ringShine') * 0.3
      case 'jupiter':
        return level('redSpotStorm') * 0.3
      default:
        return 0
    }
  }, [id, level])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    let speed = spin()
    if (id === 'saturn') speed *= 1 + level('fastSpin') * 14
    if (id === 'neptune') speed *= 1 + level('windStreaks') * 2
    const storm = id === 'jupiter' ? level('redSpotStorm') : 0
    if (spinGroup.current) {
      const g = spinGroup.current
      if (storm > 0.01) {
        // STORM: turn the Great Red Spot to face the child
        const spot = file.tex ? PHOTO_JUPITER_SPOT : JUPITER_SPOT
        const v = latLonToVec3(spot.lat, spot.lon)
        const camAz = Math.atan2(state.camera.position.x, state.camera.position.z)
        let target = camAz - Math.atan2(v.x, v.z)
        target += Math.round((g.rotation.y - target) / (Math.PI * 2)) * Math.PI * 2
        g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 3 * storm, dt)
      } else {
        g.rotation.y += dt * speed
      }
    }

    if (scaleGroup.current && id === 'jupiter') {
      const big = level('growBig')
      const wobble = Math.sin(time('growBig') * 9) * 0.04 * big
      scaleGroup.current.scale.setScalar(1 + big * 0.3 + wobble)
    }

    const m = mat.current
    if (m) {
      if (id === 'mars') {
        m.emissive.set('#ff2a00')
        m.emissiveIntensity = level('redGlow') * (0.45 + Math.sin(t * 5) * 0.12)
      } else if (id === 'neptune') {
        const blue = level('blueGlow')
        const cold = level('frostSnow')
        m.emissive.setRGB(0.15 + cold * 0.6, 0.35 + cold * 0.55, 1)
        m.emissiveIntensity = blue * (0.45 + Math.sin(t * 4) * 0.1) + cold * 0.35
      } else if (id === 'jupiter') {
        m.emissive.set('#ff7a3c')
        m.emissiveIntensity = level('redSpotStorm') * 0.12
      }
    }
    if (streakRef.current && streakMat.current) {
      const w = level('windStreaks')
      streakRef.current.rotation.y += dt * (0.12 + w * 1.6)
      streakMat.current.opacity = 0.22 + w * 0.7
    }
  })

  return (
    <group>
      <group ref={scaleGroup}>
        <group ref={spinGroup}>
          <mesh ref={body} onClick={onTap}>
            <sphereGeometry args={[1, 128, 64]} />
            <meshStandardMaterial
              // re-create the material when a texture arrives so the shader gets USE_MAP
              key={(map?.uuid ?? 'none') + (bump?.uuid ?? '')}
              ref={mat}
              color={map ? '#ffffff' : planet.atmosphere}
              map={map ?? undefined}
              bumpMap={bump ?? undefined}
              bumpScale={bump ? 3 : 0}
              roughness={id === 'mars' ? 0.95 : 0.85}
              metalness={0}
              emissive="#000000"
            />
          </mesh>
          {id === 'jupiter' && (
            <StormMarker
              lat={(file.tex ? PHOTO_JUPITER_SPOT : JUPITER_SPOT).lat}
              lon={(file.tex ? PHOTO_JUPITER_SPOT : JUPITER_SPOT).lon}
              level={() => level('redSpotStorm')}
            />
          )}
        </group>
        {streaks && (
          <mesh ref={streakRef} scale={1.006} raycast={noRaycast}>
            <sphereGeometry args={[1, 96, 48]} />
            <meshStandardMaterial ref={streakMat} map={streaks} transparent opacity={0.22} depthWrite={false} roughness={1} />
          </mesh>
        )}
        <Atmosphere color={planet.atmosphere} glow={glow} base={id === 'mars' ? 0.7 : id === 'neptune' ? 0.9 : 0.5} />
      </group>

      {id === 'saturn' && (
        <>
          <SaturnRings level={level} />
          <Swarm kind="ice" level={() => level('iceSparkle')} baseline={0.18} />
        </>
      )}
      {id === 'mars' && (
        <>
          <Rocket level={() => level('rocketFly')} time={() => time('rocketFly')} />
          <Swarm kind="dust" level={() => level('dustStorm')} />
        </>
      )}
      {id === 'jupiter' && <Moons level={() => level('showMoons')} />}
      {id === 'neptune' && (
        <>
          <Swarm kind="wind" level={() => level('windStreaks')} />
          <Swarm kind="snow" level={() => level('frostSnow')} />
        </>
      )}
    </group>
  )
}

// ---------------------------------------------------------------- public component
export function PlanetMesh({
  planet,
  effect,
  autoRotate,
  onTap,
}: {
  planet: PlanetData
  effect: ActiveEffect | null
  autoRotate: boolean
  onTap: () => void
}) {
  const { level, time } = useEffectClock(effect)
  const spin = useCallback(() => (autoRotate ? planet.spin : planet.spin * 0.15), [autoRotate, planet.spin])
  const handleTap = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      // Ignore taps that were really a swipe to rotate.
      if (e.delta < 12) onTap()
    },
    [onTap],
  )

  return (
    <group rotation={[0, 0, THREE.MathUtils.degToRad(-planet.tilt)]}>
      {planet.id === 'sun' && <SunBody level={level} onTap={handleTap} spin={spin} />}
      {planet.id === 'earth' && <EarthBody level={level} onTap={handleTap} spin={spin} />}
      {planet.id !== 'sun' && planet.id !== 'earth' && (
        <GenericPlanet planet={planet} level={level} time={time} onTap={handleTap} spin={spin} />
      )}
    </group>
  )
}

/** Small companion body used by SIZE COMPARE (Earth, or the Moon when viewing Earth). */
export function CompanionBody({ kind }: { kind: 'EARTH' | 'MOON' }) {
  const day = useFileTexture(kind === 'EARTH' ? './textures/earth_atmos_2048.jpg' : undefined)
  const moonBump = useProcedural(kind === 'MOON' ? 'marsBump' : null)
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3
  })
  return (
    <mesh ref={ref} raycast={noRaycast}>
      <sphereGeometry args={[1, 64, 32]} />
      {kind === 'EARTH' ? (
        <meshStandardMaterial key={day.tex?.uuid ?? 'none'} map={day.tex ?? undefined} color={day.tex ? '#ffffff' : '#3b7fe0'} roughness={0.7} emissiveMap={day.tex ?? undefined} emissive="#ffffff" emissiveIntensity={0.45} />
      ) : (
        <meshStandardMaterial key={moonBump?.uuid ?? 'none'} color="#c9c6c0" bumpMap={moonBump ?? undefined} bumpScale={2} roughness={1} />
      )}
    </mesh>
  )
}
