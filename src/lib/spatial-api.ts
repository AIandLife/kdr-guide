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
      headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com) (kdr-guide.vercel.app)' },
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
    // Query zone + heritage + flood + biodiversity overlays in parallel
    const [zoneRes, heritageRes, floodRes] = await Promise.allSettled([
      fetch(`${NSW_EPLAN_URL}?layers=epi&x=${lng}&y=${lat}&pageSize=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${NSW_EPLAN_URL}?layers=heritagemap&x=${lng}&y=${lat}&pageSize=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`${NSW_EPLAN_URL}?layers=nearmap_flood&x=${lng}&y=${lat}&pageSize=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
        signal: AbortSignal.timeout(5000),
      }),
    ])

    // Parse zone data
    if (zoneRes.status !== 'fulfilled' || !zoneRes.value.ok) return null
    const zoneData = await zoneRes.value.json()
    const layers: NSWEpiLayer[] = zoneData?.Epi || zoneData?.EpiLayer || zoneData?.epi || []
    if (!layers.length) return null

    const lep = layers.find((l) => l.EpiType === 'LEP' || l.EpiName?.toLowerCase().includes('local')) || layers[0]
    const zoneCode = String(lep.LandZoneCode || lep.ZoneCode || '')
    const zoneName = String(lep.LandZone || lep.ZoneName || '')
    const fsr = lep.FSR || lep.FloorSpaceRatio ? String(lep.FSR || lep.FloorSpaceRatio) : null
    const maxHeight = parseMetres(lep.MaxBuildingHeight as string | undefined)
    const minLotSize = parseMetres(lep.MinLotSize as string | undefined)

    const notes: string[] = []
    if (lep.EpiName) notes.push(`Planning instrument: ${lep.EpiName}`)

    // Parse heritage overlay — if any features returned, this address is in a HCA
    let heritageFlag = false
    let heritageNote = ''
    if (heritageRes.status === 'fulfilled' && heritageRes.value.ok) {
      try {
        const hData = await heritageRes.value.json()
        const hItems = hData?.HeritageMap || hData?.heritagemap || hData?.Heritage || []
        if (Array.isArray(hItems) && hItems.length > 0) {
          heritageFlag = true
          const item = hItems[0] as Record<string, unknown>
          const hName = item.HeritageItemName || item.HeritageName || item.NAME || ''
          heritageNote = hName
            ? `⚠️ Heritage overlay: ${hName} — CDC not available, DA required`
            : '⚠️ Heritage Conservation Area — CDC not available, DA required'
          notes.push(heritageNote)
        }
      } catch { /* non-critical */ }
    }

    // Parse flood overlay
    let floodFlag = false
    if (floodRes.status === 'fulfilled' && floodRes.value.ok) {
      try {
        const fData = await floodRes.value.json()
        const fItems = fData?.NearMapFlood || fData?.flood || fData?.Flood || []
        if (Array.isArray(fItems) && fItems.length > 0) {
          floodFlag = true
          notes.push('⚠️ Flood planning area — additional flood assessment required')
        }
      } catch { /* non-critical */ }
    }

    // CDC availability: not available in HCA or flood zones
    const cdcBlocked = heritageFlag || floodFlag
    if (cdcBlocked && zoneCode && nswZonePermitKDR(zoneCode)) {
      notes.push('CDC pathway blocked by overlays — Development Application (DA) required')
    }

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
    const queryParams = `geometry=${geomParam}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&f=json`

    // Query zone and overlays in parallel
    const [zoneRes, overlayRes] = await Promise.allSettled([
      fetch(`${VIC_ZONE_URL}?${queryParams}`, {
        headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${VIC_OVERLAY_URL}?${queryParams}`, {
        headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
        signal: AbortSignal.timeout(6000),
      }),
    ])

    if (zoneRes.status !== 'fulfilled' || !zoneRes.value.ok) return null
    const zoneData = await zoneRes.value.json()
    const features: VicFeature[] = zoneData?.features || []
    if (!features.length) return null

    const attr = features[0].attributes
    const zoneCode = String(attr.ZONE_CODE || attr.ZoneCode || '')
    const zoneName = String(attr.ZONE_DESC || attr.ZoneName || attr.ZONE_DESC_SHORT || '')

    const notes: string[] = []

    // Parse overlays — Heritage Overlay (HO), Design & Development Overlay (DDO), Vegetation Protection (VPO)
    let maxHeight: number | null = null
    if (overlayRes.status === 'fulfilled' && overlayRes.value.ok) {
      try {
        const oData = await overlayRes.value.json()
        const oFeatures: VicFeature[] = oData?.features || []
        for (const f of oFeatures) {
          const code = String(f.attributes.OVERLAY_CODE || f.attributes.CODE || '')
          const desc = String(f.attributes.OVERLAY_DESC || f.attributes.DESC || '')
          if (code.startsWith('HO')) {
            notes.push(`⚠️ Heritage Overlay (${code}) — Planning Permit required, heritage assessment needed`)
          } else if (code.startsWith('DDO')) {
            // DDO often specifies height limits
            const h = parseMetres(f.attributes.HEIGHT_LIMIT as string | undefined)
            if (h) { maxHeight = h; notes.push(`Design & Development Overlay (${code}): height limit ${h}m`) }
            else { notes.push(`Design & Development Overlay (${code}) applies — check height and setback controls`) }
          } else if (code.startsWith('VPO') || code.startsWith('SLO')) {
            notes.push(`⚠️ Vegetation/Landscape Overlay (${code}) — Arborist report likely required for tree removal`)
          } else if (code.startsWith('FO') || desc.toLowerCase().includes('flood')) {
            notes.push(`⚠️ Flood Overlay (${code}) — flood assessment required`)
          }
        }
      } catch { /* non-critical */ }
    }

    return {
      source: 'vic-vicplan',
      zoneCode,
      zoneName,
      fsr: null,
      maxHeight,
      minLotSize: null,
      lep: null,
      kdrPermitted: zoneCode ? vicZonePermitKDR(zoneCode) : null,
      notes,
    }
  } catch {
    return null
  }
}

// ─── QLD / WA / SA stubs (structured for future) ─────────────────────────────

// QLD Planning Atlas — zone lookup via ArcGIS feature service
const QLD_ZONE_URL =
  'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LocalGovernmentAreas/MapServer/0/query'

const QLD_PLANNING_URL =
  'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/SPQEnvelope/MapServer/0/query'

function qldZonePermitKDR(code: string): boolean | null {
  const upper = code.toUpperCase()
  // Low density, medium density, character residential — KDR permitted
  if (['LDR', 'MDR', 'LMR', 'MHR', 'CR', 'RES'].some(z => upper.startsWith(z))) return true
  // Rural residential
  if (upper.startsWith('RR') || upper.startsWith('RURALRES')) return true
  // Industrial / commercial / rural — no
  if (['IND', 'COM', 'RUR', 'ENV', 'OPEN', 'CONS'].some(z => upper.startsWith(z))) return false
  return null
}

export async function getQLDZoning(lat: number, lng: number): Promise<LiveZoneData | null> {
  try {
    const geomParam = encodeURIComponent(JSON.stringify({ x: lng, y: lat }))
    const params = `geometry=${geomParam}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`

    const res = await fetch(`${QLD_ZONE_URL}?${params}`, {
      headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const features = data?.features || []
    if (!features.length) return null

    const attr = features[0].attributes
    // QLD field names vary by council; try common patterns
    const zoneCode = String(
      attr.ZONE_CODE || attr.ZONECODE || attr.Zone_Code || attr.zone_code || attr.CODE || ''
    )
    const zoneName = String(
      attr.ZONE_DESC || attr.ZONEDESC || attr.Zone_Description || attr.DESCRIPTION || attr.NAME || ''
    )
    const lga = String(attr.LGA_NAME || attr.LGA || '')

    const notes: string[] = []
    if (lga) notes.push(`Local Government Area: ${lga}`)

    // QLD character residential overlay check
    if (zoneCode.toUpperCase().includes('CR') || zoneName.toLowerCase().includes('character')) {
      notes.push('⚠️ Character Residential zone — pre-1947 homes may be protected from demolition. Check with council before proceeding.')
    }

    return {
      source: 'qld-spatial',
      zoneCode,
      zoneName,
      fsr: null,
      maxHeight: null,
      minLotSize: null,
      lep: null,
      kdrPermitted: zoneCode ? qldZonePermitKDR(zoneCode) : null,
      notes,
    }
  } catch {
    return null
  }
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
