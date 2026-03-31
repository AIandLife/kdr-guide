/**
 * Tests for council data lookup functions.
 * Source: src/lib/council-data.ts
 */
import {
  COUNCIL_DATA,
  findCouncil,
  findCouncilBySuburb,
  STATE_COST_RANGES,
} from '@/lib/council-data'

describe('findCouncilBySuburb', () => {
  it('finds council for a known Sydney suburb (Bondi -> Waverley)', () => {
    const result = findCouncilBySuburb('Bondi')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Waverley')
    expect(result!.state).toBe('NSW')
  })

  it('finds council for a Melbourne suburb (Box Hill -> Whitehorse)', () => {
    const result = findCouncilBySuburb('Box Hill')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Whitehorse')
    expect(result!.state).toBe('VIC')
  })

  it('finds council for a Brisbane suburb (Fortitude Valley -> Brisbane)', () => {
    const result = findCouncilBySuburb('fortitude valley')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Brisbane')
    expect(result!.state).toBe('QLD')
  })

  it('finds council for a Perth suburb (Applecross -> Melville)', () => {
    const result = findCouncilBySuburb('Applecross')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Melville')
    expect(result!.state).toBe('WA')
  })

  it('ACT suburbs resolve correctly via suburbMap', () => {
    const result = findCouncilBySuburb('Canberra')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('ACT')
    expect(result!.lga).toBe('Canberra')
  })

  it('is case-insensitive', () => {
    const result = findCouncilBySuburb('BONDI')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Waverley')
  })

  it('trims whitespace', () => {
    const result = findCouncilBySuburb('  bondi  ')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Waverley')
  })

  it('returns null for unknown suburb', () => {
    const result = findCouncilBySuburb('Nowheresville')
    expect(result).toBeNull()
  })

  it('filters by state when provided', () => {
    const result = findCouncilBySuburb('Bondi', 'NSW')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('NSW')
  })

  it('returns null when suburb exists but state does not match', () => {
    // Bondi is in NSW, not VIC
    const result = findCouncilBySuburb('Bondi', 'VIC')
    expect(result).toBeNull()
  })

  it('handles state parameter case-insensitively', () => {
    const result = findCouncilBySuburb('Bondi', 'nsw')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('NSW')
  })
})

describe('findCouncil', () => {
  it('finds council by LGA name', () => {
    const result = findCouncil('Blacktown')
    expect(result).not.toBeNull()
    expect(result!.council).toBe('Blacktown City Council')
  })

  it('finds council by full council name', () => {
    const result = findCouncil('Canterbury-Bankstown Council')
    expect(result).not.toBeNull()
    expect(result!.lga).toBe('Canterbury-Bankstown')
  })

  it('is case-insensitive', () => {
    const result = findCouncil('blacktown')
    expect(result).not.toBeNull()
    expect(result!.council).toBe('Blacktown City Council')
  })

  it('supports partial match', () => {
    const result = findCouncil('Waverley')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('NSW')
  })

  it('returns null for non-existent council', () => {
    const result = findCouncil('Fictional Council')
    expect(result).toBeNull()
  })

  it('finds Melbourne City Council', () => {
    const result = findCouncil('Melbourne')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('VIC')
  })

  it('finds Darwin City Council', () => {
    const result = findCouncil('Darwin')
    expect(result).not.toBeNull()
    expect(result!.state).toBe('NT')
  })
})

describe('STATE_COST_RANGES', () => {
  const expectedStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT']

  it('contains all 8 Australian states/territories', () => {
    for (const state of expectedStates) {
      expect(STATE_COST_RANGES[state]).toBeDefined()
    }
  })

  it('each state has demolition and buildPerSqm ranges', () => {
    for (const state of expectedStates) {
      const range = STATE_COST_RANGES[state]
      expect(range.demolition).toHaveLength(2)
      expect(range.buildPerSqm).toHaveLength(2)
      // min should be less than max
      expect(range.demolition[0]).toBeLessThan(range.demolition[1])
      expect(range.buildPerSqm[0]).toBeLessThan(range.buildPerSqm[1])
    }
  })

  it('cost ranges are realistic (positive, reasonable bounds)', () => {
    for (const state of expectedStates) {
      const range = STATE_COST_RANGES[state]
      expect(range.demolition[0]).toBeGreaterThan(5000)
      expect(range.demolition[1]).toBeLessThan(100000)
      expect(range.buildPerSqm[0]).toBeGreaterThan(1000)
      expect(range.buildPerSqm[1]).toBeLessThan(10000)
    }
  })
})

describe('COUNCIL_DATA integrity', () => {
  it('has at least 40 councils', () => {
    expect(COUNCIL_DATA.length).toBeGreaterThanOrEqual(40)
  })

  it('covers all major states', () => {
    const states = new Set(COUNCIL_DATA.map(c => c.state))
    expect(states.has('NSW')).toBe(true)
    expect(states.has('VIC')).toBe(true)
    expect(states.has('QLD')).toBe(true)
    expect(states.has('WA')).toBe(true)
    expect(states.has('SA')).toBe(true)
    expect(states.has('ACT')).toBe(true)
    expect(states.has('TAS')).toBe(true)
    expect(states.has('NT')).toBe(true)
  })

  it('every council entry has required fields with valid types', () => {
    for (const c of COUNCIL_DATA) {
      expect(typeof c.state).toBe('string')
      expect(typeof c.council).toBe('string')
      expect(typeof c.lga).toBe('string')
      expect(typeof c.minLotSize).toBe('number')
      expect(c.minLotSize).toBeGreaterThan(0)
      expect(typeof c.maxHeight).toBe('number')
      expect(c.daTimelineWeeks).toHaveLength(2)
      expect(c.daTimelineWeeks[0]).toBeLessThanOrEqual(c.daTimelineWeeks[1])
      expect(['Low', 'Medium', 'High']).toContain(c.heritageRisk)
      expect(['Low', 'Medium', 'High']).toContain(c.floodRisk)
      expect(['Low', 'Medium', 'High']).toContain(c.bushfireRisk)
    }
  })
})
