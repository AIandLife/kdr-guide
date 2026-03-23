// Anonymised feasibility search records for the public demand signal feed.
// Shown on /professionals to demonstrate homeowner demand to builders.
// Zero personal information — only suburb, state, project type, lot size, and time.
//
// Seed data: realistic searches spread across the past 72 hours.
// When real Supabase is set up, this gets replaced by live DB queries.

export type ProjectType = 'kdr' | 'renovation' | 'extension' | 'granny-flat'

export interface DemandSignal {
  suburb: string
  state: string
  projectType: ProjectType
  lotSize?: number          // sqm, optional
  hoursAgo: number          // relative to "now" at page load
}

export const PROJECT_LABELS: Record<ProjectType, { en: string; zh: string; color: string }> = {
  'kdr':         { en: 'Knockdown Rebuild', zh: '推倒重建',  color: 'orange' },
  'renovation':  { en: 'Major Renovation',  zh: '大型翻新',  color: 'blue'   },
  'extension':   { en: 'Extension',         zh: '扩建加建',  color: 'purple' },
  'granny-flat': { en: 'Granny Flat',       zh: 'Granny Flat', color: 'green' },
}

// ~50 realistic seed records spread over the past 72 hours
export const SEED_SIGNALS: DemandSignal[] = [
  { suburb: 'Strathfield',     state: 'NSW', projectType: 'kdr',         lotSize: 556,  hoursAgo: 0.3  },
  { suburb: 'Box Hill',        state: 'VIC', projectType: 'kdr',         lotSize: 620,  hoursAgo: 0.8  },
  { suburb: 'Parramatta',      state: 'NSW', projectType: 'granny-flat', lotSize: 480,  hoursAgo: 1.2  },
  { suburb: 'Doncaster',       state: 'VIC', projectType: 'extension',                  hoursAgo: 1.7  },
  { suburb: 'Eight Mile Plains',state:'QLD', projectType: 'kdr',         lotSize: 700,  hoursAgo: 2.1  },
  { suburb: 'Chatswood',       state: 'NSW', projectType: 'renovation',  lotSize: 410,  hoursAgo: 2.6  },
  { suburb: 'Glen Waverley',   state: 'VIC', projectType: 'kdr',         lotSize: 640,  hoursAgo: 3.0  },
  { suburb: 'Kellyville',      state: 'NSW', projectType: 'granny-flat', lotSize: 900,  hoursAgo: 3.5  },
  { suburb: 'Sunnybank',       state: 'QLD', projectType: 'kdr',         lotSize: 608,  hoursAgo: 4.2  },
  { suburb: 'Balwyn',          state: 'VIC', projectType: 'extension',   lotSize: 550,  hoursAgo: 4.8  },
  { suburb: 'Hurstville',      state: 'NSW', projectType: 'kdr',         lotSize: 495,  hoursAgo: 5.3  },
  { suburb: 'Ryde',            state: 'NSW', projectType: 'renovation',                 hoursAgo: 6.0  },
  { suburb: 'Mount Waverley',  state: 'VIC', projectType: 'kdr',         lotSize: 680,  hoursAgo: 6.7  },
  { suburb: 'Calamvale',       state: 'QLD', projectType: 'granny-flat', lotSize: 750,  hoursAgo: 7.2  },
  { suburb: 'Cherrybrook',     state: 'NSW', projectType: 'extension',   lotSize: 1050, hoursAgo: 7.8  },
  { suburb: 'Templestowe',     state: 'VIC', projectType: 'kdr',         lotSize: 720,  hoursAgo: 8.5  },
  { suburb: 'Ermington',       state: 'NSW', projectType: 'granny-flat', lotSize: 530,  hoursAgo: 9.1  },
  { suburb: 'Springwood',      state: 'QLD', projectType: 'kdr',         lotSize: 650,  hoursAgo: 10.0 },
  { suburb: 'Epping',          state: 'NSW', projectType: 'renovation',  lotSize: 460,  hoursAgo: 10.8 },
  { suburb: 'Wheelers Hill',   state: 'VIC', projectType: 'kdr',         lotSize: 600,  hoursAgo: 11.5 },
  { suburb: 'Blacktown',       state: 'NSW', projectType: 'kdr',         lotSize: 560,  hoursAgo: 12.3 },
  { suburb: 'Wishart',         state: 'QLD', projectType: 'extension',                  hoursAgo: 13.0 },
  { suburb: 'Ashwood',         state: 'VIC', projectType: 'kdr',         lotSize: 590,  hoursAgo: 13.8 },
  { suburb: 'Carlingford',     state: 'NSW', projectType: 'granny-flat', lotSize: 670,  hoursAgo: 14.5 },
  { suburb: 'Carindale',       state: 'QLD', projectType: 'kdr',         lotSize: 720,  hoursAgo: 15.2 },
  { suburb: 'Ringwood',        state: 'VIC', projectType: 'renovation',  lotSize: 490,  hoursAgo: 16.0 },
  { suburb: 'Pennant Hills',   state: 'NSW', projectType: 'kdr',         lotSize: 840,  hoursAgo: 16.8 },
  { suburb: 'Sunnybank Hills', state: 'QLD', projectType: 'granny-flat',               hoursAgo: 17.5 },
  { suburb: 'Mooroolbark',     state: 'VIC', projectType: 'extension',   lotSize: 510,  hoursAgo: 18.3 },
  { suburb: 'Seven Hills',     state: 'NSW', projectType: 'kdr',         lotSize: 555,  hoursAgo: 19.0 },
  { suburb: 'Kenmore',         state: 'QLD', projectType: 'kdr',         lotSize: 800,  hoursAgo: 20.2 },
  { suburb: 'Frankston',       state: 'VIC', projectType: 'granny-flat', lotSize: 680,  hoursAgo: 21.0 },
  { suburb: 'Burwood',         state: 'NSW', projectType: 'renovation',                 hoursAgo: 21.8 },
  { suburb: 'Mansfield',       state: 'QLD', projectType: 'kdr',         lotSize: 620,  hoursAgo: 22.5 },
  { suburb: 'Nunawading',      state: 'VIC', projectType: 'kdr',         lotSize: 640,  hoursAgo: 23.3 },
  { suburb: 'Castle Hill',     state: 'NSW', projectType: 'extension',   lotSize: 960,  hoursAgo: 24.0 },
  { suburb: 'Rochedale South', state: 'QLD', projectType: 'granny-flat',               hoursAgo: 25.2 },
  { suburb: 'Vermont South',   state: 'VIC', projectType: 'kdr',         lotSize: 700,  hoursAgo: 26.0 },
  { suburb: 'Merrylands',      state: 'NSW', projectType: 'kdr',         lotSize: 480,  hoursAgo: 26.8 },
  { suburb: 'Bellbowrie',      state: 'QLD', projectType: 'renovation',  lotSize: 900,  hoursAgo: 27.5 },
  { suburb: 'Mitcham',         state: 'VIC', projectType: 'extension',                  hoursAgo: 28.3 },
  { suburb: 'Baulkham Hills',  state: 'NSW', projectType: 'granny-flat', lotSize: 780,  hoursAgo: 29.0 },
  { suburb: 'Robertson',       state: 'QLD', projectType: 'kdr',         lotSize: 650,  hoursAgo: 30.2 },
  { suburb: 'Wantirna South',  state: 'VIC', projectType: 'kdr',         lotSize: 610,  hoursAgo: 31.0 },
  { suburb: 'Eastwood',        state: 'NSW', projectType: 'renovation',  lotSize: 440,  hoursAgo: 32.5 },
  { suburb: 'Tarragindi',      state: 'QLD', projectType: 'granny-flat',               hoursAgo: 34.0 },
  { suburb: 'Dandenong North', state: 'VIC', projectType: 'kdr',         lotSize: 570,  hoursAgo: 36.2 },
  { suburb: 'Cherrybrook',     state: 'NSW', projectType: 'kdr',         lotSize: 920,  hoursAgo: 38.0 },
  { suburb: 'Upper Mount Gravatt',state:'QLD',projectType: 'extension',  lotSize: 680,  hoursAgo: 40.5 },
  { suburb: 'Ringwood East',   state: 'VIC', projectType: 'renovation',                 hoursAgo: 42.0 },
]

/** Format relative time label */
export function formatTimeAgo(hoursAgo: number, lang: 'en' | 'zh' | boolean = 'en'): string {
  const isZh = lang === true || lang === 'zh'
  if (hoursAgo < 1) {
    const mins = Math.round(hoursAgo * 60)
    return isZh ? `${mins} 分钟前` : `${mins}m ago`
  }
  if (hoursAgo < 24) {
    const hrs = Math.round(hoursAgo)
    return isZh ? `${hrs} 小时前` : `${hrs}h ago`
  }
  const days = Math.round(hoursAgo / 24)
  return isZh ? `${days} 天前` : `${days}d ago`
}
