/**
 * "See it in my room": builds a small 3D planet and opens it in iOS AR Quick Look (USDZ).
 * Only offered where the browser supports <a rel="ar"> (Safari on iPhone / iPad).
 */
import * as THREE from 'three'
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js'
import { PLANET_MAP, type PlanetId } from '../data/planetsData'

export async function makePlanetUSDZ(id: Exclude<PlanetId, 'sun'>): Promise<Blob> {
  const p = PLANET_MAP[id]
  const scene = new THREE.Scene()
  const tex = await new THREE.TextureLoader().loadAsync((p.textureUrl ?? '').replace('./textures/', './textures/md/'))
  tex.colorSpace = THREE.SRGBColorSpace
  const planet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))
  planet.position.y = 0.3
  scene.add(planet)
  if (id === 'saturn' || id === 'uranus') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.33, id === 'saturn' ? 0.55 : 0.4, 64),
      new THREE.MeshStandardMaterial({ color: id === 'saturn' ? '#e8d3a0' : '#bff3ff', side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
    )
    ring.rotation.x = id === 'saturn' ? -Math.PI / 2 + 0.45 : 0.1
    ring.position.y = 0.3
    scene.add(ring)
  }
  const data = await new USDZExporter().parseAsync(scene)
  return new Blob([data], { type: 'model/vnd.usdz+zip' })
}

export async function openAR(id: Exclude<PlanetId, 'sun'>) {
  const blob = await makePlanetUSDZ(id)
  const a = document.createElement('a')
  a.rel = 'ar'
  a.href = URL.createObjectURL(blob)
  a.appendChild(document.createElement('img')) // AR Quick Look needs an <img> child
  a.click()
}
