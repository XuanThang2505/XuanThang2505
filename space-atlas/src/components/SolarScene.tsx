/**
 * The 3D stage: starry sky, one planet at a time, kid-safe orbit controls,
 * GSAP "rocket flight" between planets and the SIZE COMPARE layout.
 */
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import gsap from 'gsap'
import { PLANET_MAP, type PlanetId } from '../data/planetsData'
import { CompanionBody, PlanetMesh, SUN_DIR, type ActiveEffect } from './PlanetMesh'
import { Starfield } from './Starfield'
import { allProcedural, subscribeProcedural } from '../utils/textures'

/** Upload procedural textures to the GPU as soon as the worker delivers them (no hitch later). */
function TextureWarmup() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const done = new Set<string>()
    const upload = () =>
      allProcedural().forEach((t) => {
        if (done.has(t.uuid)) return
        done.add(t.uuid)
        gl.initTexture(t)
      })
    upload()
    return subscribeProcedural(upload)
  }, [gl])
  return null
}

export interface SolarSceneProps {
  planetId: PlanetId
  started: boolean
  effect: ActiveEffect | null
  compareOn: boolean
  autoRotate: boolean
  onArrive: (id: PlanetId) => void
  onPlanetTap: () => void
}

const FRONT = new THREE.Vector3(0, 0.22, 1).normalize()

function SceneContent({ planetId, started, effect, compareOn, autoRotate, onArrive, onPlanetTap }: SolarSceneProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const controls = useRef<OrbitControlsImpl>(null)
  const stage = useRef<THREE.Group>(null)
  const layout = useRef<THREE.Group>(null)
  const planetSlot = useRef<THREE.Group>(null)
  const companionSlot = useRef<THREE.Group>(null)
  const warp = useRef(0)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const introDone = useRef(false)
  const shownRef = useRef<PlanetId>(planetId)
  const targetRef = useRef<PlanetId>(planetId)
  const onArriveRef = useRef(onArrive)
  onArriveRef.current = onArrive
  const [shownId, setShownId] = useState<PlanetId>(planetId)
  const [flying, setFlying] = useState(true)
  const planet = PLANET_MAP[shownId]

  const setCamDistance = useCallback(
    (d: number) => {
      camera.position.copy(FRONT).multiplyScalar(d)
      camera.lookAt(0, 0, 0)
    },
    [camera],
  )

  const arrive = useCallback(
    (id: PlanetId, timeline: gsap.core.Timeline) => {
      const p = PLANET_MAP[id]
      const proxy = { d: p.camera.distance * 7 }
      timeline.call(() => {
        shownRef.current = id
        setShownId(id)
        setCamDistance(proxy.d)
        controls.current?.target.set(0, 0, 0)
      })
      timeline.to(proxy, {
        d: p.camera.distance,
        duration: 1.7,
        ease: 'power3.out',
        onUpdate: () => setCamDistance(proxy.d),
      })
      if (stage.current) {
        timeline.fromTo(stage.current.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.5)' }, '<0.15')
      }
      timeline.to(warp, { current: 0, duration: 1.3, ease: 'power2.out' }, '<')
      timeline.to(camera, { fov: 45, duration: 1.3, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, '<')
      timeline.call(() => {
        setFlying(false)
        onArriveRef.current(id)
      })
    },
    [camera, setCamDistance],
  )

  // First flight, right after the welcome screen.
  useEffect(() => {
    if (!started || introDone.current) return
    introDone.current = true
    tl.current?.kill()
    const t = gsap.timeline()
    warp.current = 1
    camera.fov = 62
    camera.updateProjectionMatrix()
    arrive(planetId, t)
    tl.current = t
  }, [started, planetId, arrive, camera])

  // Flying from one planet to the next.
  useEffect(() => {
    if (!introDone.current || planetId === targetRef.current) return
    targetRef.current = planetId
    tl.current?.kill()
    setFlying(true)
    const t = gsap.timeline()
    if (stage.current) t.to(stage.current.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5, ease: 'power2.in' }, 0)
    t.to(warp, { current: 1, duration: 0.5, ease: 'power2.in' }, 0)
    t.to(camera, { fov: 62, duration: 0.5, onUpdate: () => camera.updateProjectionMatrix() }, 0)
    arrive(planetId, t)
    tl.current = t
  }, [planetId, arrive, camera])

  useEffect(() => () => void tl.current?.kill(), [])

  // Bring the camera to the front when comparing, so "left/right" reads correctly.
  useEffect(() => {
    if (!compareOn || flying) return
    const start = camera.position.clone()
    const end = FRONT.clone().multiplyScalar(PLANET_MAP[shownRef.current].camera.distance)
    const p = { t: 0 }
    const tween = gsap.to(p, {
      t: 1,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.position.lerpVectors(start, end, p.t)
        camera.lookAt(0, 0, 0)
      },
    })
    return () => void tween.kill()
  }, [compareOn, flying, camera])

  // SIZE COMPARE layout (see README for the maths).
  const compare = useMemo(() => {
    const ph = planet.id === 'saturn' ? 2.27 : 1
    const r = planet.compare.radiusKm / planet.radiusKm
    const rVis = Math.max(r, 0.035)
    const gap = planet.id === 'sun' ? 0.9 : 0.35
    const W = 2 * ph + gap + 2 * rVis
    return {
      r: rVis,
      planetX: -W / 2 + ph,
      compX: W / 2 - rVis,
      scale: Math.min(1, (planet.camera.distance * 0.62) / W),
      kind: planet.compare.name === 'MOON' ? ('MOON' as const) : ('EARTH' as const),
    }
  }, [planet])

  useFrame((_, dt) => {
    const on = compareOn && !flying
    const damp = THREE.MathUtils.damp
    if (layout.current) {
      layout.current.scale.setScalar(damp(layout.current.scale.x, on ? compare.scale : 1, 4, dt))
      // nudge left so the vocab cards on the right never cover the companion
      layout.current.position.x = damp(layout.current.position.x, on ? -planet.camera.distance * 0.08 : 0, 4, dt)
    }
    if (planetSlot.current) planetSlot.current.position.x = damp(planetSlot.current.position.x, on ? compare.planetX : 0, 4, dt)
    if (companionSlot.current) {
      const c = companionSlot.current
      c.position.x = damp(c.position.x, on ? compare.compX : compare.compX + 8, 3.5, dt)
      c.scale.setScalar(damp(c.scale.x, on ? compare.r : 0.0001, 4, dt))
      c.visible = c.scale.x > 0.002
    }
  })

  return (
    <>
      <TextureWarmup />
      <Starfield warp={() => warp.current} />
      <ambientLight intensity={0.14} />
      <hemisphereLight args={['#9db8ff', '#1a0f2e', 0.12]} />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(10)} intensity={2.8} color="#fff6ea" />

      <group ref={stage} scale={0.001}>
        <group ref={layout}>
          <group ref={planetSlot}>
            <PlanetMesh key={shownId} planet={planet} effect={effect} autoRotate={autoRotate} onTap={onPlanetTap} />
          </group>
          <group ref={companionSlot} position={[8, 0, 0]} scale={0.0001}>
            <CompanionBody key={compare.kind} kind={compare.kind} />
            {compareOn && !flying && (
              <Html center position={[0, -1.3, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <div className="mt-16 whitespace-nowrap rounded-full bg-sky-500/90 px-3 py-1 font-nunito text-lg font-extrabold text-white shadow-lg">
                  ⬆ {compare.kind}
                </div>
              </Html>
            )}
          </group>
        </group>
      </group>

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        minDistance={flying ? 0.1 : planet.camera.min}
        maxDistance={flying ? 1000 : planet.camera.max}
        enabled={!flying}
        autoRotate={autoRotate && !flying && !compareOn}
        autoRotateSpeed={0.35}
      />
    </>
  )
}

export function SolarScene(props: SolarSceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ fov: 62, near: 0.05, far: 2000, position: [0, 6, 30] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#050818']} />
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.75} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
