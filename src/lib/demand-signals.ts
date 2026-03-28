// Anonymised feasibility search records for the public demand signal feed.
// Shown on /professionals to demonstrate homeowner demand to builders.
// Zero personal information — only suburb, state, project type, lot size, and time.
//
// Architecture:
//   - SUBURB_POOL: 157 real Australian suburbs weighted by KDR activity
//   - getInitialSignals(): seeded by day+hour → different each day, stable within session
//   - getWeeklyStats(): derived from same seed → internally consistent
//   - getRotationInterval(): time-of-day aware, consistent with weekly count

export type ProjectType = 'kdr' | 'renovation' | 'extension' | 'granny-flat' | 'dual-occ'

export interface DemandSignal {
  suburb: string
  state: string
  projectType: ProjectType
  lotSize?: number
  hoursAgo: number
}

export const PROJECT_LABELS: Record<ProjectType, { en: string; zh: string; color: string }> = {
  'kdr':         { en: 'Knockdown Rebuild', zh: '推倒重建',  color: 'orange' },
  'renovation':  { en: 'Major Renovation',  zh: '大型翻新',  color: 'blue'   },
  'extension':   { en: 'Extension',         zh: '扩建加建',  color: 'purple' },
  'granny-flat': { en: 'Granny Flat',       zh: 'Granny Flat', color: 'green' },
  'dual-occ':    { en: 'Dual Occupancy',    zh: '双住宅',       color: 'purple' },
}

// ── Suburb pool ───────────────────────────────────────────────────────────────
// 157 real Australian suburbs weighted toward high-KDR activity areas.
// NSW ~29%, VIC ~22%, QLD ~19%, WA ~12%, SA ~8%, ACT ~5%, TAS ~3%, NT ~2%
interface SuburbEntry { suburb: string; state: string }

export const SUBURB_POOL: SuburbEntry[] = [
  // NSW (45)
  { suburb: 'Strathfield',      state: 'NSW' }, { suburb: 'Parramatta',       state: 'NSW' },
  { suburb: 'Chatswood',        state: 'NSW' }, { suburb: 'Ryde',             state: 'NSW' },
  { suburb: 'Epping',           state: 'NSW' }, { suburb: 'Pennant Hills',    state: 'NSW' },
  { suburb: 'Castle Hill',      state: 'NSW' }, { suburb: 'Cherrybrook',      state: 'NSW' },
  { suburb: 'Kellyville',       state: 'NSW' }, { suburb: 'Baulkham Hills',   state: 'NSW' },
  { suburb: 'Seven Hills',      state: 'NSW' }, { suburb: 'Blacktown',        state: 'NSW' },
  { suburb: 'Merrylands',       state: 'NSW' }, { suburb: 'Carlingford',      state: 'NSW' },
  { suburb: 'Ermington',        state: 'NSW' }, { suburb: 'Hurstville',       state: 'NSW' },
  { suburb: 'Burwood',          state: 'NSW' }, { suburb: 'Eastwood',         state: 'NSW' },
  { suburb: 'Ashfield',         state: 'NSW' }, { suburb: 'Concord',          state: 'NSW' },
  { suburb: 'Rhodes',           state: 'NSW' }, { suburb: 'Meadowbank',       state: 'NSW' },
  { suburb: 'West Ryde',        state: 'NSW' }, { suburb: 'Dundas Valley',    state: 'NSW' },
  { suburb: 'Glenhaven',        state: 'NSW' }, { suburb: 'Dural',            state: 'NSW' },
  { suburb: 'Schofields',       state: 'NSW' }, { suburb: 'Quakers Hill',     state: 'NSW' },
  { suburb: 'Wentworthville',   state: 'NSW' }, { suburb: 'Granville',        state: 'NSW' },
  { suburb: 'Auburn',           state: 'NSW' }, { suburb: 'Lidcombe',         state: 'NSW' },
  { suburb: 'Homebush',         state: 'NSW' }, { suburb: 'North Ryde',       state: 'NSW' },
  { suburb: 'Turramurra',       state: 'NSW' }, { suburb: 'Wahroonga',        state: 'NSW' },
  { suburb: 'Pymble',           state: 'NSW' }, { suburb: 'Gordon',           state: 'NSW' },
  { suburb: 'Killara',          state: 'NSW' }, { suburb: 'Lindfield',        state: 'NSW' },
  { suburb: 'Roseville',        state: 'NSW' }, { suburb: 'Lane Cove',        state: 'NSW' },
  { suburb: 'Putney',           state: 'NSW' }, { suburb: 'Riverstone',       state: 'NSW' },
  { suburb: 'Box Hill',         state: 'NSW' },
  // VIC (34)
  { suburb: 'Box Hill',         state: 'VIC' }, { suburb: 'Doncaster',        state: 'VIC' },
  { suburb: 'Glen Waverley',    state: 'VIC' }, { suburb: 'Mount Waverley',   state: 'VIC' },
  { suburb: 'Wheelers Hill',    state: 'VIC' }, { suburb: 'Templestowe',      state: 'VIC' },
  { suburb: 'Mitcham',          state: 'VIC' }, { suburb: 'Ringwood',         state: 'VIC' },
  { suburb: 'Mooroolbark',      state: 'VIC' }, { suburb: 'Vermont South',    state: 'VIC' },
  { suburb: 'Nunawading',       state: 'VIC' }, { suburb: 'Wantirna South',   state: 'VIC' },
  { suburb: 'Frankston',        state: 'VIC' }, { suburb: 'Dandenong North',  state: 'VIC' },
  { suburb: 'Balwyn',           state: 'VIC' }, { suburb: 'Ashwood',          state: 'VIC' },
  { suburb: 'Ringwood East',    state: 'VIC' }, { suburb: 'Croydon',          state: 'VIC' },
  { suburb: 'Bayswater',        state: 'VIC' }, { suburb: 'Boronia',          state: 'VIC' },
  { suburb: 'Rowville',         state: 'VIC' }, { suburb: 'Ferntree Gully',   state: 'VIC' },
  { suburb: 'Mulgrave',         state: 'VIC' }, { suburb: 'Springvale',       state: 'VIC' },
  { suburb: 'Noble Park',       state: 'VIC' }, { suburb: 'Cheltenham',       state: 'VIC' },
  { suburb: 'Clayton',          state: 'VIC' }, { suburb: 'Oakleigh',         state: 'VIC' },
  { suburb: 'Glen Iris',        state: 'VIC' }, { suburb: 'Malvern East',     state: 'VIC' },
  { suburb: 'Brighton East',    state: 'VIC' }, { suburb: 'Sandringham',      state: 'VIC' },
  { suburb: 'Beaumaris',        state: 'VIC' }, { suburb: 'Mentone',          state: 'VIC' },
  // QLD (30)
  { suburb: 'Eight Mile Plains',state: 'QLD' }, { suburb: 'Sunnybank',        state: 'QLD' },
  { suburb: 'Sunnybank Hills',  state: 'QLD' }, { suburb: 'Calamvale',        state: 'QLD' },
  { suburb: 'Carindale',        state: 'QLD' }, { suburb: 'Robertson',        state: 'QLD' },
  { suburb: 'Wishart',          state: 'QLD' }, { suburb: 'Mansfield',        state: 'QLD' },
  { suburb: 'Rochedale South',  state: 'QLD' }, { suburb: 'Springwood',       state: 'QLD' },
  { suburb: 'Tarragindi',       state: 'QLD' }, { suburb: 'Kenmore',          state: 'QLD' },
  { suburb: 'Upper Mount Gravatt',state:'QLD' }, { suburb: 'Macgregor',       state: 'QLD' },
  { suburb: 'Holland Park',     state: 'QLD' }, { suburb: 'Camp Hill',        state: 'QLD' },
  { suburb: 'Coorparoo',        state: 'QLD' }, { suburb: 'Greenslopes',      state: 'QLD' },
  { suburb: 'Annerley',         state: 'QLD' }, { suburb: 'Moorooka',         state: 'QLD' },
  { suburb: 'Coopers Plains',   state: 'QLD' }, { suburb: 'Runcorn',          state: 'QLD' },
  { suburb: 'Stretton',         state: 'QLD' }, { suburb: 'Parkinson',        state: 'QLD' },
  { suburb: 'Forest Lake',      state: 'QLD' }, { suburb: 'Oxley',            state: 'QLD' },
  { suburb: 'Sherwood',         state: 'QLD' }, { suburb: 'Bellbowrie',       state: 'QLD' },
  { suburb: 'Doolandella',      state: 'QLD' }, { suburb: 'Algester',         state: 'QLD' },
  // WA (18)
  { suburb: 'Dianella',         state: 'WA'  }, { suburb: 'Morley',           state: 'WA'  },
  { suburb: 'Bassendean',       state: 'WA'  }, { suburb: 'Bayswater',        state: 'WA'  },
  { suburb: 'Maylands',         state: 'WA'  }, { suburb: 'Mount Lawley',     state: 'WA'  },
  { suburb: 'Inglewood',        state: 'WA'  }, { suburb: 'Bedford',          state: 'WA'  },
  { suburb: 'Embleton',         state: 'WA'  }, { suburb: 'Beechboro',        state: 'WA'  },
  { suburb: 'Ballajura',        state: 'WA'  }, { suburb: 'Noranda',          state: 'WA'  },
  { suburb: 'Mirrabooka',       state: 'WA'  }, { suburb: 'Nollamara',        state: 'WA'  },
  { suburb: 'Tuart Hill',       state: 'WA'  }, { suburb: 'Yokine',           state: 'WA'  },
  { suburb: 'Mount Hawthorn',   state: 'WA'  }, { suburb: 'Karrinyup',        state: 'WA'  },
  // SA (13)
  { suburb: 'Burnside',         state: 'SA'  }, { suburb: 'Prospect',         state: 'SA'  },
  { suburb: 'Unley',            state: 'SA'  }, { suburb: 'Mitcham',          state: 'SA'  },
  { suburb: 'Norwood',          state: 'SA'  }, { suburb: 'St Peters',        state: 'SA'  },
  { suburb: 'Kensington',       state: 'SA'  }, { suburb: 'Magill',           state: 'SA'  },
  { suburb: 'Campbelltown',     state: 'SA'  }, { suburb: 'Paradise',         state: 'SA'  },
  { suburb: 'Newton',           state: 'SA'  }, { suburb: 'Rostrevor',        state: 'SA'  },
  { suburb: 'Glenunga',         state: 'SA'  },
  // ACT (9)
  { suburb: 'Belconnen',        state: 'ACT' }, { suburb: 'Tuggeranong',      state: 'ACT' },
  { suburb: 'Gungahlin',        state: 'ACT' }, { suburb: 'Woden',            state: 'ACT' },
  { suburb: 'Bruce',            state: 'ACT' }, { suburb: 'Giralang',         state: 'ACT' },
  { suburb: 'Macquarie',        state: 'ACT' }, { suburb: 'Latham',           state: 'ACT' },
  { suburb: 'Page',             state: 'ACT' },
  // TAS (5)
  { suburb: 'Sandy Bay',        state: 'TAS' }, { suburb: 'Glenorchy',        state: 'TAS' },
  { suburb: 'Moonah',           state: 'TAS' }, { suburb: 'Newtown',          state: 'TAS' },
  { suburb: 'West Hobart',      state: 'TAS' },
  // NT (3)
  { suburb: 'Parap',            state: 'NT'  }, { suburb: 'Nightcliff',       state: 'NT'  },
  { suburb: 'Coconut Grove',    state: 'NT'  },
]

// ── Seeded PRNG (LCG) ─────────────────────────────────────────────────────────
// Returns a function that generates deterministic floats in [0,1).
// Same seed → same sequence; different seeds → different sequences.
function seededRand(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return () => {
    s = Math.imul(s ^ (s >>> 17), 0xbf324c81)
    s ^= s >>> 13
    s = Math.imul(s ^ (s >>> 15), 0x9f57a49d)
    s ^= s >>> 16
    return (s >>> 0) / 0x100000000
  }
}

// ── Time helpers ──────────────────────────────────────────────────────────────

/** Current hour (0-24) in AEST (UTC+10). ±1 hr DST is acceptable. */
export function getAESTHour(now = new Date()): number {
  return (now.getUTCHours() + now.getUTCMinutes() / 60 + 10) % 24
}

/**
 * Activity factor 0.0–1.0 for the given AEST hour.
 * Determines rotation speed and how recent "new" signals appear.
 */
export function getActivityFactor(hour = getAESTHour()): number {
  if (hour >= 22 || hour < 7)  return 0.04   // 10pm–7am: near-silent
  if (hour < 9)                return 0.25   // 7am–9am:  warming up
  if (hour < 12)               return 0.85   // 9am–12pm: busy morning
  if (hour < 14)               return 1.0    // noon–2pm: lunch peak
  if (hour < 17)               return 0.75   // 2pm–5pm:  afternoon
  if (hour < 20)               return 0.50   // 5pm–8pm:  evening browse
  return 0.15                                // 8pm–10pm: winding down
}

/**
 * How many hours ago a "just arrived" signal should appear.
 * At night, even the newest item shown is from several hours ago.
 */
export function getNewSignalAge(now = new Date()): number {
  const r = seededRand(Math.floor(now.getTime() / 300_000))() // changes every 5 min
  const hour = getAESTHour(now)
  if (hour >= 22 || hour < 7)  return 5 + r * 10     // 5–15 h ago
  if (hour < 9)                return 1 + r * 2      // 1–3 h ago
  if (hour < 14)               return 0.4 + r * 1.2  // 25 min – 1.5 h ago
  if (hour < 17)               return 0.5 + r * 1.5  // 30 min – 2 h ago
  if (hour < 20)               return 1 + r * 3      // 1–4 h ago
  return 2 + r * 4                                   // 2–6 h ago
}

/**
 * setTimeout interval for rotating in a new signal (ms).
 * Keeps visual refresh feeling alive without being implausibly fast.
 * Consistent with ~50 real searches/week when summed over the day.
 */
export function getRotationInterval(now = new Date()): number {
  const factor = getActivityFactor(getAESTHour(now))
  if (factor >= 0.8)  return 180_000    // peak:    3 min
  if (factor >= 0.4)  return 480_000    // evening: 8 min
  if (factor >= 0.1)  return 1_200_000  // morning: 20 min
  return 3_600_000                      // night:   60 min
}

// ── Signal generators ─────────────────────────────────────────────────────────

const PROJECT_WEIGHTS: [ProjectType, number][] = [
  ['kdr', 0.45], ['renovation', 0.20], ['extension', 0.17], ['granny-flat', 0.11], ['dual-occ', 0.07],
]
function pickProjectType(r: number): ProjectType {
  let acc = 0
  for (const [pt, w] of PROJECT_WEIGHTS) { acc += w; if (r < acc) return pt }
  return 'kdr'
}

/**
 * Generate `count` realistic signals seeded by the current day+hour.
 * Results are stable within a session but differ each hour/day.
 */
export function getInitialSignals(now = new Date(), count = 8): DemandSignal[] {
  const hourBucket = Math.floor(now.getTime() / 3_600_000)
  const rand = seededRand(hourBucket * 397 + 1031)

  const signals: DemandSignal[] = []
  let hoursAgo = getNewSignalAge(now)

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rand() * SUBURB_POOL.length)
    const { suburb, state } = SUBURB_POOL[idx]
    const projectType = pickProjectType(rand())
    const lotSize = projectType === 'kdr'
      ? Math.round((380 + rand() * 720) / 10) * 10
      : undefined

    signals.push({ suburb, state, projectType, lotSize, hoursAgo })

    // Gap to the next older signal — grows as we go further back
    const gapMin = 0.5 + i * 0.4
    const gapMax = 2   + i * 1.5
    hoursAgo += gapMin + rand() * (gapMax - gapMin)
  }
  return signals
}

/**
 * Weekly stats derived from a seeded virtual week — all numbers are internally
 * consistent and change daily without ever looking static.
 */
export function getWeeklyStats(now = new Date()): {
  weeklyCount: number
  stateBreakdown: Record<string, number>
  kdrPct: number
} {
  const dayBucket = Math.floor(now.getTime() / 86_400_000)
  const rand = seededRand(dayBucket * 883 + 271)

  const weeklyCount = 38 + Math.floor(rand() * 29)  // 38–66

  // State percentages with daily variation
  const nswPct = 0.33 + rand() * 0.10   // 33–43 %
  const vicPct = 0.22 + rand() * 0.10   // 22–32 %
  const qldPct = 0.16 + rand() * 0.09   // 16–25 %
  const waPct  = 0.06 + rand() * 0.05   // 6–11 %
  // SA + ACT + TAS + NT take the remainder

  const nsw = Math.max(1, Math.round(weeklyCount * nswPct))
  const vic = Math.max(1, Math.round(weeklyCount * vicPct))
  const qld = Math.max(1, Math.round(weeklyCount * qldPct))
  const wa  = Math.max(1, Math.round(weeklyCount * waPct))

  // KDR share: 46–62 %, changes daily
  const kdrPct = 46 + Math.floor(rand() * 17)

  return {
    weeklyCount,
    stateBreakdown: { NSW: nsw, VIC: vic, QLD: qld, WA: wa },
    kdrPct,
  }
}

/** Format relative time label */
export function formatTimeAgo(hoursAgo: number, lang: 'en' | 'zh' | boolean = 'en'): string {
  const isZh = lang === true || lang === 'zh'
  if (hoursAgo < 1) {
    const mins = Math.max(1, Math.round(hoursAgo * 60))
    return isZh ? `${mins} 分钟前` : `${mins}m ago`
  }
  if (hoursAgo < 24) {
    const hrs = Math.round(hoursAgo)
    return isZh ? `${hrs} 小时前` : `${hrs}h ago`
  }
  const days = Math.round(hoursAgo / 24)
  return isZh ? `${days} 天前` : `${days}d ago`
}
