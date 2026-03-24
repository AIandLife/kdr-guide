import { createClient } from '@supabase/supabase-js'

// Suburb pool lives server-side only — not in client bundle
const SUBURB_POOL = [
  { suburb: 'Strathfield', state: 'NSW' }, { suburb: 'Parramatta', state: 'NSW' },
  { suburb: 'Chatswood', state: 'NSW' }, { suburb: 'Ryde', state: 'NSW' },
  { suburb: 'Epping', state: 'NSW' }, { suburb: 'Castle Hill', state: 'NSW' },
  { suburb: 'Cherrybrook', state: 'NSW' }, { suburb: 'Kellyville', state: 'NSW' },
  { suburb: 'Baulkham Hills', state: 'NSW' }, { suburb: 'Blacktown', state: 'NSW' },
  { suburb: 'Carlingford', state: 'NSW' }, { suburb: 'Hurstville', state: 'NSW' },
  { suburb: 'Burwood', state: 'NSW' }, { suburb: 'Eastwood', state: 'NSW' },
  { suburb: 'Concord', state: 'NSW' }, { suburb: 'Rhodes', state: 'NSW' },
  { suburb: 'Turramurra', state: 'NSW' }, { suburb: 'Wahroonga', state: 'NSW' },
  { suburb: 'Pymble', state: 'NSW' }, { suburb: 'Gordon', state: 'NSW' },
  { suburb: 'Roseville', state: 'NSW' }, { suburb: 'Lane Cove', state: 'NSW' },
  { suburb: 'Box Hill', state: 'VIC' }, { suburb: 'Doncaster', state: 'VIC' },
  { suburb: 'Glen Waverley', state: 'VIC' }, { suburb: 'Mount Waverley', state: 'VIC' },
  { suburb: 'Wheelers Hill', state: 'VIC' }, { suburb: 'Templestowe', state: 'VIC' },
  { suburb: 'Mitcham', state: 'VIC' }, { suburb: 'Ringwood', state: 'VIC' },
  { suburb: 'Balwyn', state: 'VIC' }, { suburb: 'Croydon', state: 'VIC' },
  { suburb: 'Rowville', state: 'VIC' }, { suburb: 'Clayton', state: 'VIC' },
  { suburb: 'Glen Iris', state: 'VIC' }, { suburb: 'Brighton East', state: 'VIC' },
  { suburb: 'Eight Mile Plains', state: 'QLD' }, { suburb: 'Sunnybank', state: 'QLD' },
  { suburb: 'Sunnybank Hills', state: 'QLD' }, { suburb: 'Calamvale', state: 'QLD' },
  { suburb: 'Carindale', state: 'QLD' }, { suburb: 'Wishart', state: 'QLD' },
  { suburb: 'Tarragindi', state: 'QLD' }, { suburb: 'Kenmore', state: 'QLD' },
  { suburb: 'Camp Hill', state: 'QLD' }, { suburb: 'Coorparoo', state: 'QLD' },
  { suburb: 'Dianella', state: 'WA' }, { suburb: 'Morley', state: 'WA' },
  { suburb: 'Mount Lawley', state: 'WA' }, { suburb: 'Inglewood', state: 'WA' },
  { suburb: 'Maylands', state: 'WA' }, { suburb: 'Karrinyup', state: 'WA' },
  { suburb: 'Burnside', state: 'SA' }, { suburb: 'Prospect', state: 'SA' },
  { suburb: 'Unley', state: 'SA' }, { suburb: 'Norwood', state: 'SA' },
  { suburb: 'Belconnen', state: 'ACT' }, { suburb: 'Gungahlin', state: 'ACT' },
  { suburb: 'Sandy Bay', state: 'TAS' }, { suburb: 'Glenorchy', state: 'TAS' },
  { suburb: 'Parap', state: 'NT' }, { suburb: 'Nightcliff', state: 'NT' },
]

type ProjectType = 'kdr' | 'renovation' | 'extension' | 'granny-flat'

// Server-side seeded PRNG — never ships to client
function seededRand(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return () => {
    s = Math.imul(s ^ (s >>> 17), 0xbf324c81)
    s ^= s >>> 13
    s = Math.imul(s ^ (s >>> 15), 0x9f57a49d)
    s ^= s >>> 16
    return (s >>> 0) / 0x100000000
  }
}

function pickProjectType(r: number): ProjectType {
  if (r < 0.50) return 'kdr'
  if (r < 0.70) return 'renovation'
  if (r < 0.88) return 'extension'
  return 'granny-flat'
}

function getAESTHour(now: Date) {
  return (now.getUTCHours() + now.getUTCMinutes() / 60 + 10) % 24
}

function getActivityFactor(hour: number) {
  if (hour >= 22 || hour < 7) return 0.04
  if (hour < 9) return 0.25
  if (hour < 12) return 0.85
  if (hour < 14) return 1.0
  if (hour < 17) return 0.75
  if (hour < 20) return 0.50
  return 0.15
}

export async function GET() {
  const now = new Date()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch real searches from last 7 days (anonymised — no user_id)
  const since7d = new Date(now.getTime() - 7 * 86400_000).toISOString()
  const { data: realSearches } = await supabase
    .from('feasibility_searches')
    .select('suburb, state, lot_size, project_type, created_at')
    .gte('created_at', since7d)
    .order('created_at', { ascending: false })
    .limit(50)

  const real = (realSearches ?? []).map(r => ({
    suburb: r.suburb ?? 'Unknown',
    state: r.state ?? 'NSW',
    projectType: (r.project_type ?? 'kdr') as ProjectType,
    lotSize: r.lot_size ?? undefined,
    hoursAgo: (now.getTime() - new Date(r.created_at).getTime()) / 3_600_000,
    isReal: true,
  }))

  // Generate synthetic signals server-side to fill to 8 total
  const needed = Math.max(0, 8 - real.length)
  const hourBucket = Math.floor(now.getTime() / 3_600_000)
  const rand = seededRand(hourBucket * 397 + 1031)

  const hour = getAESTHour(now)
  const factor = getActivityFactor(hour)
  const baseHoursAgo = factor >= 0.8 ? 0.5 : factor >= 0.4 ? 1.5 : factor >= 0.1 ? 3 : 8

  const synthetic = []
  let hoursAgo = baseHoursAgo + rand() * 1.5

  for (let i = 0; i < needed; i++) {
    const { suburb, state } = SUBURB_POOL[Math.floor(rand() * SUBURB_POOL.length)]
    const pt = pickProjectType(rand())
    synthetic.push({
      suburb,
      state,
      projectType: pt,
      lotSize: pt === 'kdr' ? Math.round((380 + rand() * 720) / 10) * 10 : undefined,
      hoursAgo,
      isReal: false,
    })
    hoursAgo += 0.5 + rand() * 2 + i * 0.3
  }

  // Merge: real first (sorted newest), then synthetic
  const signals = [...real.slice(0, 8), ...synthetic].slice(0, 8)

  // Weekly stats: real count + synthetic base
  const realWeeklyCount = realSearches?.length ?? 0
  const dayBucket = Math.floor(now.getTime() / 86_400_000)
  const statsRand = seededRand(dayBucket * 883 + 271)
  const syntheticBase = 38 + Math.floor(statsRand() * 29)
  const weeklyCount = realWeeklyCount + syntheticBase

  // State breakdown: real + synthetic base
  const realByState: Record<string, number> = {}
  for (const s of realSearches ?? []) {
    if (s.state) realByState[s.state] = (realByState[s.state] ?? 0) + 1
  }
  const nswBase = Math.max(1, Math.round(syntheticBase * (0.33 + statsRand() * 0.10)))
  const vicBase = Math.max(1, Math.round(syntheticBase * (0.22 + statsRand() * 0.10)))
  const qldBase = Math.max(1, Math.round(syntheticBase * (0.16 + statsRand() * 0.09)))
  const waBase  = Math.max(1, Math.round(syntheticBase * (0.06 + statsRand() * 0.05)))

  const kdrPct = 46 + Math.floor(statsRand() * 17)

  return Response.json({
    signals,
    weeklyCount,
    stateBreakdown: {
      NSW: nswBase + (realByState['NSW'] ?? 0),
      VIC: vicBase + (realByState['VIC'] ?? 0),
      QLD: qldBase + (realByState['QLD'] ?? 0),
      WA:  waBase  + (realByState['WA']  ?? 0),
    },
    kdrPct,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
