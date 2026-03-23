/**
 * spatial-api.ts
 * Live zoning lookups for Australian state planning portals.
 * NSW: ePlanning API (layer intersect) — fully wired
 * VIC: MapShare Victoria ArcGIS — fully wired
 * QLD / WA / SA: structured stubs, fall back to council-data.ts
 */

export interface LiveZoneData {
  source: 'nsw-eplan' | 'vic-vicplan' | 'qld-spatial' | 'wa-landgate' | 'sa-planssa' | 'fallback'
  zoneCode: string        // e.g. "R2", "GRZ", "LDR"
  zoneName: string        // e.g. "Low Density Residential"
  fsr: string | null      // e.g. "0.5:1" or null
  maxHeight: number | null // metres
  minLotSize: number | null // sqm
  lep: string | null      // e.g. "Waverley LEP 2012"
  kdrPermitted: boolean | null
  notes: string[]
}

export interface GeoPoint {
  lat: number
  lng: number
}

// ─── Geocoder (Nominatim, free, no key required) ─────────────────────────────

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  try {
    const q = encodeURIComponent(address + ', Australia')
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=au`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KDRGuide/1.0 (kdr-guide.vercel.app)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

// ─── NSW ePlanning API ────────────────────────────────────────────────────────

const NSW_EPLAN_URL = 'https://api.apps1.nsw.gov.au/planning/viewersf/V1/ePlanningApi/layerintersect'

interface NSWEpiLayer {
  EpiName?: string
  EpiType?: string
  LandZoneCode?: string
  LandZone?: string
  FSR?: string
  MaxBuildingHeight?: string
  MinLotSize?: string
  [key: string]: unknown
}

function parseMetres(val: string | undefined): number | null {
  if (!val) return null
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

function nswZonePermitKDR(code: string): boolean | null {
  const upper = code.toUpperCase()
  // Residential zones where KDR is typically permitted
  if (['R1', 'R2', 'R3', 'R4', 'R5'].includes(upper)) return true
  // Rural village
  if (upper === 'RU5') return true
  // Environmental / rural / industrial — not applicable
  if (upper.startsWith('E') || upper.startsWith('RU') || upper.startsWith('IN') || upper.startsWith('SP')) return false
  // Business zones — generally no KDR
  if (upper.startsWith('B') || upper.startsWith('MU')) return false
  return null
}

export async function getNSWZoning(lat: number, lng: number): Promise<LiveZoneData | null> {
  try {
    const url = `${NSW_EPLAN_URL}?layers=epi&x=${lng}&y=${lat}&pageSize=1`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'KDRGuide/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()

    // Response shape: { "Epi": [ { EpiName, LandZoneCode, LandZone, FSR, MaxBuildingHeight, MinLotSize, ... } ] }
    const layers: NSWEpiLayer[] = data?.Epi || data?.EpiLayer || data?.epi || []
    if (!layers.length) return null

    // Prefer LEP over SEPP entries
    const lep = layers.find((l) => l.EpiType === 'LEP' || l.EpiName?.toLowerCase().includes('local')) || layers[0]

    const zoneCode = String(lep.LandZoneCode || lep.ZoneCode || '')
    const zoneName = String(lep.LandZone || lep.ZoneName || '')

    const fsr = lep.FSR || lep.FloorSpaceRatio ? String(lep.FSR || lep.FloorSpaceRatio) : null
    const maxHeight = parseMetres(lep.MaxBuildingHeight as string | undefined)
    const minLotSize = parseMetres(lep.MinLotSize as string | undefined)

    const notes: string[] = []
    if (lep.EpiName) notes.push(`Planning instrument: ${lep.EpiName}`)

    return {
      source: 'nsw-eplan',
      zoneCode,
      zoneName,
      fsr,
      maxHeight,
      minLotSize,
      lep: (lep.EpiName as string) || null,
      kdrPermitted: zoneCode ? nswZonePermitKDR(zoneCode) : null,
      notes,
    }
  } catch {
    return null
  }
}

// ─── VIC VicPlan (MapShare ArcGIS) ───────────────────────────────────────────
// Zone layer: https://services6.arcgis.com/GB33F62SbDxJjwEL/arcgis/rest/services/Vicplan_Zone/FeatureServer/0

const VIC_ZONE_URL =
  'https://services6.arcgis.com/GB33F62SbDxJjwEL/arcgis/rest/services/Vicplan_Zone/FeatureServer/0/query'

const VIC_OVERLAY_URL =
  'https://services6.arcgis.com/GB33F62SbDxJjwEL/arcgis/rest/services/Vicplan_Overlay/FeatureServer/0/query'

interface VicFeature {
  attributes: {
    ZONE_CODE?: string
    ZONE_DESC?: string
    SCHEDULE?: string
    [key: string]: unknown
  }
}

function vicZonePermitKDR(code: string): boolean | null {
  const upper = code.toUpperCase()
  // General, Neighbourhood, Residential Growth, Mixed Use — KDR permitted
  if (['GRZ', 'NRZ', 'RGZ', 'MUZ', 'TZ', 'RLZ'].some(z => upper.startsWith(z))) return true
  // Low Density, Rural Living — typically single dwellings
  if (['LDRZ', 'RLZ'].some(z => upper.startsWith(z))) return true
  // Industrial / commercial / green wedge — no KDR
  if (['IN', 'C1', 'C2', 'CA', 'GWZ', 'GWAR', 'GWAZ'].some(z => upper.startsWith(z))) return false
  if (['PUZ', 'PPRZ', 'FZ', 'RCZ', 'EMZ'].some(z => upper.startsWith(z))) return false
  return null
}

export async function getVICZoning(lat: number, lng: number): Promise<LiveZoneData | null> {
  try {
    const geomParam = encodeURIComponent(JSON.stringify({ x: lng, y: lat }))
    const params = `geometry=${geomParam}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&f=json`
    const url = `${VIC_ZONE_URL}?${params}`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'KDRGuide/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const features: VicFeature[] = data?.features || []
    if (!features.length) return null

    const attr = features[0].attributes
    const zoneCode = String(attr.ZONE_CODE || attr.ZoneCode || '')
    const zoneName = String(attr.ZONE_DESC || attr.ZoneName || attr.ZONE_DESC_SHORT || '')

    return {
      source: 'vic-vicplan',
      zoneCode,
      zoneName,
      fsr: null,  // VIC doesn't have FSR in the zone layer; it's in overlays
      maxHeight: null,
      minLotSize: null,
      lep: null,
      kdrPermitted: zoneCode ? vicZonePermitKDR(zoneCode) : null,
      notes: [],
    }
  } catch {
    return null
  }
}

// ─── QLD / WA / SA stubs (structured for future) ─────────────────────────────

export async function getQLDZoning(_lat: number, _lng: number): Promise<LiveZoneData | null> {
  // TODO: QLD Spatial Services — https://spatial-gis.information.qld.gov.au
  return null
}

export async function getWAZoning(_lat: number, _lng: number): Promise<LiveZoneData | null> {
  // TODO: Landgate SLIP — https://services.slip.wa.gov.au
  return null
}

export async function getSAZoning(_lat: number, _lng: number): Promise<LiveZoneData | null> {
  // TODO: PlanSA — https://www.sailis.sa.gov.au
  return null
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Given a street address (or suburb) and state, returns live zone data.
 * Returns null if geocoding fails or the state has no live API yet.
 */
export async function getLiveZoning(address: string, state: string): Promise<LiveZoneData | null> {
  const coords = await geocodeAddress(address)
  if (!coords) return null

  const s = state.toUpperCase()
  try {
    switch (s) {
      case 'NSW': return await getNSWZoning(coords.lat, coords.lng)
      case 'VIC': return await getVICZoning(coords.lat, coords.lng)
      case 'QLD': return await getQLDZoning(coords.lat, coords.lng)
      case 'WA':  return await getWAZoning(coords.lat, coords.lng)
      case 'SA':  return await getSAZoning(coords.lat, coords.lng)
      default:    return null
    }
  } catch {
    return null
  }
}
