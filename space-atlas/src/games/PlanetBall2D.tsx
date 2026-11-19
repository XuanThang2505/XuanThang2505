/** A planet (or the Sun) drawn in 2D from its real photo, shaded like a ball. Used by the games. */
import { PLANET_MAP, type PlanetId } from '../data/planetsData'

export const TEXTURE_2D: Record<Exclude<PlanetId, 'sun'>, string> = {
  mercury: './textures/mercury.jpg',
  venus: './textures/venus.jpg',
  earth: './textures/earth_atmos_2048.jpg',
  mars: './textures/mars.jpg',
  jupiter: './textures/jupiter.jpg',
  saturn: './textures/saturn.jpg',
  uranus: './textures/uranus.jpg',
  neptune: './textures/neptune.jpg',
}

function Ring({ id, size, half }: { id: PlanetId; size: number; half: 'front' | 'back' }) {
  const uranus = id === 'uranus'
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%]"
      style={{
        width: uranus ? size * 0.32 : size * 2.1,
        height: uranus ? size * 1.7 : size * 0.6,
        transform: `translate(-50%, -50%) rotate(${uranus ? 0 : -16}deg)`,
        border: `${Math.max(2, size * (uranus ? 0.025 : 0.07))}px solid ${uranus ? 'rgba(200,250,255,0.6)' : 'rgba(232,211,160,0.9)'}`,
        clipPath: half === 'back' ? (uranus ? 'inset(0 50% 0 0)' : 'inset(0 0 50% 0)') : uranus ? 'inset(0 0 0 50%)' : 'inset(50% 0 0 0)',
      }}
    />
  )
}

export function PlanetBall2D({ id, size }: { id: PlanetId; size: number }) {
  const ring = id === 'saturn' || id === 'uranus'
  const isSun = id === 'sun'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {ring && <Ring id={id} size={size} half="back" />}
      <div
        className="absolute inset-0 rounded-full"
        style={
          isSun
            ? {
                background: 'radial-gradient(circle at 40% 38%, #fff7c2 0%, #ffd34d 30%, #ff8a1f 65%, #c23d00 100%)',
                boxShadow: `0 0 ${size * 0.35}px ${size * 0.06}px rgba(255,160,40,0.6)`,
              }
            : {
                backgroundImage: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%), url(${TEXTURE_2D[id]})`,
                backgroundSize: '100% 100%, 100% 100%, 200% 100%',
                backgroundPosition: 'center, center, 30% 50%',
                boxShadow: `0 0 ${size * 0.25}px ${PLANET_MAP[id].atmosphere}66`,
              }
        }
      />
      {ring && <Ring id={id} size={size} half="front" />}
    </div>
  )
}
