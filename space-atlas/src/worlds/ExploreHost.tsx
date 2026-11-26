/** Loads the explore screens on demand (one small chunk, only when the child opens one). */
import type { Say } from '../games/ui'
import type { WorldId } from '../data/worldsData'
import { SurfaceWorld } from './SurfaceWorld'
import { AgePanel, Passport, PlanetBuilder } from './ExplorePanels'
import { TonightSky } from './TonightSky'

export type ExploreKind = 'age' | 'passport' | 'builder' | 'sky'
export type Explore = { kind: 'land'; id: WorldId } | { kind: ExploreKind }

export default function ExploreHost({ explore, stars, onClose, onStar, onSay }: { explore: Explore; stars: number; onClose: () => void; onStar: () => void; onSay: Say }) {
  const p = { stars, onBack: onClose, onStar, onSay }
  if (explore.kind === 'land') return <SurfaceWorld id={explore.id} onBack={onClose} onStar={onStar} onSay={onSay} />
  if (explore.kind === 'age') return <AgePanel {...p} />
  if (explore.kind === 'passport') return <Passport {...p} />
  if (explore.kind === 'builder') return <PlanetBuilder {...p} />
  return <TonightSky {...p} />
}
