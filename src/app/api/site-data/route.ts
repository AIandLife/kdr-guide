import { NextRequest } from 'next/server'
import { getLiveSite } from '@/lib/spatial-api'

export const runtime = 'nodejs'
export const maxDuration = 20

/**
 * Fast, LLM-free lookup of live planning + cadastre facts for a block.
 * Used by the feasibility page to show real data the instant it's fetched,
 * in parallel with (and well before) the slow AI report. Degrades to { meta: null }.
 */
export async function POST(req: NextRequest) {
  try {
    const { suburb, state, address, lotSize } = await req.json()
    if (!state) return Response.json({ meta: null })

    const lookup = address || suburb
    if (!lookup) return Response.json({ meta: null })

    const site = await Promise.race([
      getLiveSite(lookup, state),
      new Promise<{ zone: null; parcel: null }>(resolve =>
        setTimeout(() => resolve({ zone: null, parcel: null }), 13000)),
    ])
    const zone = site.zone
    const parcel = site.parcel

    if (!zone && !parcel) return Response.json({ meta: null })

    const effLotSource: 'user' | 'cadastre' | null =
      lotSize ? 'user' : (parcel?.areaSqm ? 'cadastre' : null)

    return Response.json({
      meta: {
        source: zone?.source ?? null,
        zoneCode: zone?.zoneCode ?? null,
        zoneName: zone?.zoneName ?? null,
        fsr: zone?.fsr ?? null,
        maxHeight: zone?.maxHeight ?? null,
        minLotSize: zone?.minLotSize ?? null,
        lotAreaSqm: parcel?.areaSqm ?? null,
        lotId: parcel?.lotId ?? null,
        lotSource: effLotSource,
      },
    })
  } catch {
    return Response.json({ meta: null })
  }
}
