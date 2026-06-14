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
  /** true only when the geocoder matched a specific house/building — a
   *  suburb-only match lands on an arbitrary coordinate (often a park or
   *  school) and must never be treated as the user's parcel. */
  precise?: boolean
}

// ─── Geocoder (cached, with fallback — free, no key required) ─────────────────
// Nominatim rate-limits hard (and can block a server IP under load), so we cache
// successes in-memory per warm instance and fall back to Photon (also OSM-based,
// independent host) when Nominatim is unavailable. Failures are NOT cached so the
// next request can recover.

const geocodeCache = new Map<string, GeoPoint>()

async function geocodeNominatim(q: string): Promise<GeoPoint | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=au&addressdetails=1`, {
      headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    const d = data[0]
    // precise ⇢ the geocoder matched an actual HOUSE NUMBER. Type checks alone
    // are too loose: a made-up address can fuzzy-match a station/large building
    // and we'd report a 40,000㎡ railway parcel as "your lot".
    return {
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
      precise: Boolean(d.address?.house_number),
    }
  } catch { return null }
}

async function geocodePhoton(q: string): Promise<GeoPoint | null> {
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${q}&limit=1`, {
      headers: { 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const f = data?.features?.[0]
    const coords = f?.geometry?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return null
    // Same house-number requirement as Nominatim — osm_key 'building' alone
    // matches stations/POIs and must not count as parcel-level precision.
    return { lat: coords[1], lng: coords[0], precise: Boolean(f?.properties?.housenumber) }
  } catch { return null }
}

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const key = address.trim().toLowerCase()
  const cached = geocodeCache.get(key)
  if (cached) return cached
  const q = encodeURIComponent(address + ', Australia')
  const point = (await geocodeNominatim(q)) || (await geocodePhoton(q))
  if (point) geocodeCache.set(key, point)
  return point
}

// ─── NSW official address geocoder (GURAS Address Points) ────────────────────
// OSM house-number coverage in Australia is patchy, so street addresses often
// geocode only to street level and we lose the parcel lookup. The NSW Spatial
// Services Geocoded Addressing Theme holds EVERY NSW house number — exact,
// free, and the point sits on the actual lot. Returns precise:true on a match.

const NSW_ADDR_URL =
  'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query'

export async function geocodeNSWAddress(raw: string): Promise<GeoPoint | null> {
  try {
    let s = raw.toUpperCase().replace(/[^A-Z0-9\/\- ]+/g, ' ').replace(/\s+/g, ' ').trim()
    s = s.replace(/\b(NSW|NEW SOUTH WALES|AUSTRALIA)\b/g, ' ').replace(/\b\d{4}\b\s*$/, '').replace(/\s+/g, ' ').trim()
    // "5/12 Smith St" → use the street number 12; "Unit 5 12 Smith St" likewise
    const m = s.match(/^(?:UNIT\s+\d+[A-Z]?\s+|\d+[A-Z]?\s*\/\s*)?(\d+[A-Z]?(?:-\d+[A-Z]?)?)\s+([A-Z'\-]{2,})\s*(.*)$/)
    if (!m) return null
    const hn = m[1]
    const firstWord = m[2]
    const rest = (m[3] || '').trim()
    const where = `housenumber='${hn}' AND address LIKE '${hn} ${firstWord}%'`
    const url = `${NSW_ADDR_URL}?where=${encodeURIComponent(where)}&outFields=address&returnGeometry=true&outSR=4326&resultRecordCount=10&f=json`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const feats: { attributes?: { address?: string }; geometry?: { x?: number; y?: number } }[] = data?.features || []
    if (!feats.length) return null
    let best = feats[0]
    if (feats.length > 1 && rest) {
      // Disambiguate by how many remaining input words (suburb etc.) appear
      const tokens = rest.split(' ').filter(w => w.length > 1)
      let bestScore = -1
      for (const f of feats) {
        const addr = String(f.attributes?.address || '')
        const score = tokens.filter(t => addr.includes(t)).length
        if (score > bestScore) { bestScore = score; best = f }
      }
      if (bestScore < 1) return null // several candidates, none matches the suburb — don't guess
    }
    const g = best.geometry
    if (typeof g?.x !== 'number' || typeof g?.y !== 'number') return null
    return { lat: g.y, lng: g.x, precise: true }
  } catch { return null }
}

// ─── NSW EPI Primary Planning Layers (ArcGIS) ───────────────────────────────
// The live ArcGIS service behind the NSW Planning Portal Spatial Viewer. The old
// ePlanningApi/layerintersect endpoint was retired (now 404s), which silently
// nulled all zoning. We point-intersect each layer for the official LEP controls.

const NSW_EPI_MAPSERVER =
  'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer'
const NSW_EPI_LAYERS = { heritage: 0, fsr: 1, zoning: 2, lotSize: 4, height: 5 } as const

async function nswEpiQuery(layerId: number, lat: number, lng: number, timeoutMs: number): Promise<Record<string, unknown> | null> {
  const url = `${NSW_EPI_MAPSERVER}/${layerId}/query?geometry=${lng},${lat}` +
    `&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects` +
    `&outFields=*&returnGeometry=false&f=json`
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.features?.[0]?.attributes ?? null
  } catch { return null }
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
  // Zone is the must-have; height / min-lot / FSR / heritage are best-effort
  // enrichment, each independently point-intersected against its EPI layer.
  const [zoneA, heightA, lotA, fsrA, heritageA] = await Promise.all([
    nswEpiQuery(NSW_EPI_LAYERS.zoning, lat, lng, 8000),
    nswEpiQuery(NSW_EPI_LAYERS.height, lat, lng, 6000),
    nswEpiQuery(NSW_EPI_LAYERS.lotSize, lat, lng, 6000),
    nswEpiQuery(NSW_EPI_LAYERS.fsr, lat, lng, 6000),
    nswEpiQuery(NSW_EPI_LAYERS.heritage, lat, lng, 6000),
  ])

  if (!zoneA) return null
  const zoneCode = String(zoneA.SYM_CODE || '').trim()
  if (!zoneCode) return null
  const zoneName = String(zoneA.LAY_CLASS || '').trim()
  const lep = (zoneA.EPI_NAME as string) || null

  const maxHeight = typeof heightA?.MAX_B_H_M === 'number'
    ? heightA.MAX_B_H_M as number
    : parseMetres(heightA?.LAY_CLASS as string | undefined)
  const minLotSize = typeof lotA?.LOT_SIZE === 'number'
    ? lotA.LOT_SIZE as number
    : parseMetres(lotA?.LAY_CLASS as string | undefined)
  // FSR layer carries the ratio in a FSR field or the LAY_CLASS string ("0.5:1")
  const fsrRaw = fsrA?.FSR ?? fsrA?.LAY_CLASS ?? null
  const fsr = fsrRaw != null ? String(fsrRaw) : null

  const notes: string[] = []
  if (lep) notes.push(`Planning instrument: ${lep}`)

  // Heritage overlay — a returned feature means the address sits in a HCA / item
  let heritageFlag = false
  if (heritageA) {
    heritageFlag = true
    const hName = String(heritageA.LAY_CLASS || heritageA.H_NAME || heritageA.ITEM_NAME || '').trim()
    notes.push(hName
      ? `⚠️ Heritage overlay: ${hName} — CDC not available, DA required`
      : '⚠️ Heritage item / Conservation Area — CDC not available, DA required')
  }
  if (heritageFlag && zoneCode && nswZonePermitKDR(zoneCode)) {
    notes.push('CDC pathway blocked by heritage overlay — Development Application (DA) required')
  }

  return {
    source: 'nsw-eplan',
    zoneCode,
    zoneName,
    fsr,
    maxHeight,
    minLotSize,
    lep,
    kdrPermitted: nswZonePermitKDR(zoneCode),
    notes,
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

// ─── NSW Cadastre: real parcel area + lot id ──────────────────────────────────
// Layer 9 "Lot" of the NSW DCDB. Point-intersect returns the registered lot,
// incl. planlotarea (registered area, units in planlotareaunits) and lotidstring.

export interface ParcelData {
  source: 'nsw-cadastre'
  areaSqm: number | null   // registered lot area in square metres
  lotId: string | null     // e.g. "2//DP1001738"
  frontageM: number | null // TODO: derive from geometry + road layer (not yet wired)
}

const NSW_CADASTRE_LOT_URL =
  'https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Cadastre/MapServer/9/query'

// Local equirectangular projection → shoelace area in m² (accurate at parcel scale).
function ringAreaSqm(ring: number[][]): number {
  if (!ring || ring.length < 4) return 0
  const lat0 = (ring.reduce((s, p) => s + p[1], 0) / ring.length) * Math.PI / 180
  const mLng = 111320 * Math.cos(lat0)
  const mLat = 110540
  const pts = ring.map(([x, y]) => [x * mLng, y * mLat])
  let a = 0
  for (let i = 0; i < pts.length - 1; i++) {
    a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
  }
  return Math.abs(a) / 2
}

export async function getNSWParcel(lat: number, lng: number): Promise<ParcelData | null> {
  try {
    const url = `${NSW_CADASTRE_LOT_URL}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=planlotarea,planlotareaunits,lotidstring&returnGeometry=true&outSR=4326&f=json`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AusBuildCircle/1.0 (ausbuildcircle.com)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const feat = data?.features?.[0]
    if (!feat) return null
    const a: Record<string, unknown> = feat.attributes || {}
    // 1) Registered area if present (planlotareaunits is usually "Meters" = m²)
    let areaSqm: number | null = typeof a.planlotarea === 'number' ? a.planlotarea : null
    const units = String(a.planlotareaunits ?? '').toLowerCase()
    if (areaSqm != null && units.includes('hect')) areaSqm = areaSqm * 10000 // hectares → m²
    // 2) Fall back to geometry — many older DP lots have no registered area field
    if (areaSqm == null) {
      const rings = (feat.geometry?.rings ?? []) as number[][][]
      if (rings.length) areaSqm = ringAreaSqm(rings[0])
    }
    return {
      source: 'nsw-cadastre',
      areaSqm: areaSqm != null ? Math.round(areaSqm) : null,
      lotId: a.lotidstring ? String(a.lotidstring) : null,
      frontageM: null,
    }
  } catch {
    return null
  }
}

/**
 * Geocode ONCE, then fetch zoning + parcel in parallel.
 * Real parcel area is currently NSW-only; other states return parcel: null.
 */
export async function getLiveSite(
  address: string,
  state: string,
): Promise<{ zone: LiveZoneData | null; parcel: ParcelData | null }> {
  const s = state.toUpperCase()
  // NSW: try the official GURAS address point first — it knows every house
  // number (OSM often doesn't) and the point sits on the actual parcel.
  let coords: GeoPoint | null = null
  if (s === 'NSW') {
    const key = 'nswaddr:' + address.trim().toLowerCase()
    coords = geocodeCache.get(key) ?? null
    if (!coords) {
      coords = await geocodeNSWAddress(address)
      if (coords) geocodeCache.set(key, coords)
    }
  }
  if (!coords) coords = await geocodeAddress(address)
  if (!coords) return { zone: null, parcel: null }
  const zoneP: Promise<LiveZoneData | null> = (async () => {
    try {
      // Live zoning is point-exact — only meaningful for a real street address.
      // A suburb-only geocode is an arbitrary centroid that often lands on a
      // road/park/CBD parcel (SP2 Infrastructure, MU1 Mixed Use…), which would
      // wrongly tell a normal residential suburb that building is "not permitted".
      // Suburb-level reports must use council-typical zoning instead, so suppress
      // the centroid's live zone here (symmetric with the parcel guard below).
      if (!coords.precise) return null
      switch (s) {
        case 'NSW': return await getNSWZoning(coords.lat, coords.lng)
        case 'VIC': return await getVICZoning(coords.lat, coords.lng)
        case 'QLD': return await getQLDZoning(coords.lat, coords.lng)
        case 'WA':  return await getWAZoning(coords.lat, coords.lng)
        case 'SA':  return await getSAZoning(coords.lat, coords.lng)
        default:    return null
      }
    } catch { return null }
  })()
  const parcelP: Promise<ParcelData | null> = (async () => {
    try {
      // Parcel facts only make sense for a street-level address. A suburb-only
      // geocode is an arbitrary centroid — often a park, school or reserve —
      // and reporting that parcel (e.g. 40,000㎡) as "your lot" is badly wrong.
      if (!coords.precise) return null
      return s === 'NSW' ? await getNSWParcel(coords.lat, coords.lng) : null
    } catch { return null }
  })()
  // Guard each sub-query independently so a slow zoning lookup can't discard a
  // ready parcel result (or vice-versa).
  const SUB_TIMEOUT = 7000
  const [zone, parcel] = await Promise.all([
    Promise.race([zoneP, new Promise<LiveZoneData | null>(r => setTimeout(() => r(null), SUB_TIMEOUT))]),
    Promise.race([parcelP, new Promise<ParcelData | null>(r => setTimeout(() => r(null), SUB_TIMEOUT))]),
  ])
  return { zone, parcel }
}
