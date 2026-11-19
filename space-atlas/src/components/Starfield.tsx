/**
 * Deep-space background: twinkling stars + a Milky Way band + soft nebula clouds.
 * `warp()` (0..1) speeds things up while flying between planets.
 */
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { glowTex } from './SpaceEffects'

const starVertex = /* glsl */ `
  attribute float aSize; attribute float aPhase; attribute vec3 aColor;
  uniform float uTime; uniform float uPixelRatio; uniform float uWarp;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.65 + 0.35 * sin(uTime * (1.0 + aPhase * 2.5) + aPhase * 30.0);
    vAlpha = tw * (1.0 + uWarp * 0.8);
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (1.0 + uWarp * 1.2);
  }
`
const starFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    gl_FragColor = vec4(vColor * vAlpha * a * 1.6, 1.0);
  }
`

function buildStars(count: number, band: boolean) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const phase = new Float32Array(count)
  const palette = band
    ? ['#cbb8ff', '#9fb6ff', '#ffd6f0', '#ffffff', '#b5d0ff']
    : ['#ffffff', '#cfe0ff', '#fff2d6', '#ffd29a', '#a8c4ff']
  const c = new THREE.Color()
  // The Milky Way lies in a tilted plane
  const bandQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.9, 0.3, 0.5))
  const v = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    const r = 450 + Math.random() * 150
    if (band) {
      const theta = Math.random() * Math.PI * 2
      // gaussian-ish thickness, denser in the middle
      const g = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22
      v.set(Math.cos(theta) * Math.cos(g), Math.sin(g), Math.sin(theta) * Math.cos(g)).applyQuaternion(bandQ)
    } else {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
    }
    v.multiplyScalar(r)
    pos.set([v.x, v.y, v.z], i * 3)
    c.set(palette[Math.floor(Math.random() * palette.length)])
    const bright = band ? 0.35 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5
    col.set([c.r * bright, c.g * bright, c.b * bright], i * 3)
    const big = Math.random() < (band ? 0.01 : 0.04)
    size[i] = band ? 1.2 + Math.random() * 1.8 : big ? 4 + Math.random() * 3 : 1.4 + Math.random() * 2.2
    phase[i] = Math.random()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  return { geometry: g, bandQ }
}

export function Starfield({ warp }: { warp: () => number }) {
  const gl = useThree((s) => s.gl)
  const group = useRef<THREE.Group>(null)
  const stars = useMemo(() => buildStars(6000, false), [])
  const milky = useMemo(() => buildStars(14000, true), [])
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) }, uWarp: { value: 0 } }),
    [gl],
  )

  // Soft nebula clouds sitting along the Milky Way band
  const nebulae = useMemo(() => {
    const colors = ['#5b3fa8', '#2c4fa8', '#a83f8f', '#3f7fa8', '#6a4fd0']
    return Array.from({ length: 16 }, (_, i) => {
      const theta = (i / 16) * Math.PI * 2 + Math.random() * 0.3
      const p = new THREE.Vector3(Math.cos(theta), (Math.random() - 0.5) * 0.15, Math.sin(theta))
        .applyQuaternion(milky.bandQ)
        .multiplyScalar(420)
      return { p, color: colors[i % colors.length], s: 120 + Math.random() * 160, o: 0.12 + Math.random() * 0.12 }
    })
  }, [milky.bandQ])

  useFrame((state, dt) => {
    const w = warp()
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uWarp.value = w
    if (group.current) group.current.rotation.y += dt * (0.004 + w * 0.6)
  })

  const mat = (
    <shaderMaterial
      vertexShader={starVertex}
      fragmentShader={starFragment}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  )

  return (
    <group ref={group}>
      <points geometry={stars.geometry} raycast={() => null} frustumCulled={false}>
        {mat}
      </points>
      <points geometry={milky.geometry} raycast={() => null} frustumCulled={false}>
        {mat}
      </points>
      {nebulae.map((n, i) => (
        <sprite key={i} position={n.p} scale={[n.s, n.s, 1]} raycast={() => null}>
          <spriteMaterial
            map={glowTex()}
            color={n.color}
            transparent
            opacity={n.o}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
