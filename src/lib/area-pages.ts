/**
 * Programmatic /areas pages — derivation layer.
 *
 * STRICTLY READ-ONLY by design: everything here is computed at build time from
 * the static council dataset. These pages must never call /api/feasibility
 * (crawlers would fire LLM calls and pollute analytics/cache) and never touch
 * the database. Adding a suburb = adding one entry to SUBURB_TO_COUNCIL.
 */
import { COUNCIL_DATA, SUBURB_TO_COUNCIL, type CouncilPolicy } from './council-data'

export interface Area {
  suburb: string      // display name, e.g. 'Castle Hill'
  slug: string        // 'castle-hill'
  state: string       // 'NSW'
  stateSlug: string   // 'nsw'
  council: CouncilPolicy
}

const titleCase = (s: string) =>
  s.split(' ').map(w => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')

export const AREAS: Area[] = Object.keys(SUBURB_TO_COUNCIL)
  .filter(key => key !== 'cbd') // 'CBD' makes no sense as a standalone area page
  .flatMap(key => {
    const lga = SUBURB_TO_COUNCIL[key]
    const council = COUNCIL_DATA.find(c => c.lga === lga)
    if (!council) return []
    return [{
      suburb: titleCase(key),
      slug: key.replace(/\s+/g, '-'),
      state: council.state,
      stateSlug: council.state.toLowerCase(),
      council,
    }]
  })

export function getArea(stateSlug: string, slug: string): Area | null {
  const ss = stateSlug.toLowerCase()
  const s = slug.toLowerCase()
  return AREAS.find(a => a.stateSlug === ss && a.slug === s) || null
}

/** Other suburbs under the same council — internal linking. */
export function nearbyAreas(area: Area, limit = 10): Area[] {
  return AREAS
    .filter(a => a.council.lga === area.council.lga && a.council.state === area.state && a.slug !== area.slug)
    .slice(0, limit)
}

export const STATES_IN_AREAS: string[] = [...new Set(AREAS.map(a => a.state))]
