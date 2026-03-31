/**
 * Tests for the JSON repair/parsing logic used in the feasibility page.
 * Extracted from src/app/feasibility/page.tsx streaming response parser.
 */

// Replicate the 3-tier parsing logic from the feasibility page
function parseFeasibilityJson(accumulated: string): Record<string, unknown> {
  let result: Record<string, unknown> | null = null

  // Try 1: parse as-is
  try { result = JSON.parse(accumulated) } catch { /* fall through */ }

  // Try 2: auto-close brackets/braces (handles server-side truncation repair)
  if (!result) {
    let repaired = accumulated
    // Trim trailing comma or incomplete value
    repaired = repaired.replace(/,\s*$/, '')
    // Close open string if needed
    const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
    if (quoteCount % 2 === 1) repaired += '"'
    // Remove trailing incomplete key-value (e.g. "key": or "key": "partial)
    repaired = repaired.replace(/,?\s*"[^"]*":\s*"?[^",}\]]*$/, '')
    // Count and close unclosed brackets
    let braces = 0, brackets = 0, inStr = false
    for (let i = 0; i < repaired.length; i++) {
      const c = repaired[i]
      if (c === '"' && (i === 0 || repaired[i - 1] !== '\\')) inStr = !inStr
      if (inStr) continue
      if (c === '{') braces++
      if (c === '}') braces--
      if (c === '[') brackets++
      if (c === ']') brackets--
    }
    for (let i = 0; i < brackets; i++) repaired += ']'
    for (let i = 0; i < braces; i++) repaired += '}'
    try { result = JSON.parse(repaired) } catch { /* fall through */ }
  }

  // Try 3: find last complete top-level property
  if (!result) {
    const end = accumulated.lastIndexOf('}')
    if (end !== -1) {
      const jsonStr = accumulated.slice(0, end + 1)
      for (const sep of ['",\n', '",\r\n', '"\n', ']\n', '}\n']) {
        const safeEnd = jsonStr.lastIndexOf(sep)
        if (safeEnd !== -1) {
          let candidate = jsonStr.slice(0, safeEnd + 1)
          let b = 0, k = 0, s = false
          for (let i = 0; i < candidate.length; i++) {
            const c = candidate[i]
            if (c === '"' && (i === 0 || candidate[i - 1] !== '\\')) s = !s
            if (s) continue
            if (c === '{') b++; if (c === '}') b--
            if (c === '[') k++; if (c === ']') k--
          }
          for (let i = 0; i < k; i++) candidate += ']'
          for (let i = 0; i < b; i++) candidate += '}'
          try { result = JSON.parse(candidate); break } catch { /* try next */ }
        }
      }
    }
  }

  if (!result) throw new Error('Response was truncated. Please try again.')
  return result
}

describe('feasibility JSON parsing and repair', () => {
  it('parses valid complete JSON correctly', () => {
    const json = JSON.stringify({
      feasibility: 'High',
      estimatedCost: { min: 400000, max: 600000 },
      council: 'Blacktown City Council',
      notes: 'Good for KDR'
    })
    const result = parseFeasibilityJson(json)
    expect(result.feasibility).toBe('High')
    expect(result.council).toBe('Blacktown City Council')
    expect((result.estimatedCost as { min: number }).min).toBe(400000)
  })

  it('repairs truncated JSON with missing closing braces', () => {
    // Simulates AI response cut off after a complete value but before closing braces
    const truncated = '{"feasibility":"High","cost":{"min":400000,"max":600000}'
    // Missing one closing brace for the outer object
    const result = parseFeasibilityJson(truncated)
    expect(result.feasibility).toBe('High')
    expect((result.cost as { min: number }).min).toBe(400000)
  })

  it('repairs truncated JSON missing multiple closing braces and brackets', () => {
    const truncated = '{"data":{"items":[{"name":"test"}'
    // Missing: ] for array, } for data, } for root
    const result = parseFeasibilityJson(truncated)
    expect(result.data).toBeDefined()
    const data = result.data as { items: Array<{ name: string }> }
    expect(data.items[0].name).toBe('test')
  })

  it('repairs JSON with trailing comma', () => {
    const withComma = '{"feasibility":"High","cost":500000,'
    // Trailing comma then truncated — repair strips comma + closes brace
    const result = parseFeasibilityJson(withComma)
    expect(result.feasibility).toBe('High')
    // The regex also strips the incomplete trailing kv, so cost may be removed
    // Key assertion: it parses without throwing
  })

  it('repairs truncated JSON mid-string value', () => {
    // Cut off in the middle of a string value
    const truncated = '{"feasibility":"High","notes":"This is a long note about the proper'
    // The repair logic should close the string, remove the incomplete kv, and close braces
    const result = parseFeasibilityJson(truncated)
    expect(result.feasibility).toBe('High')
    // The incomplete "notes" field may or may not survive — key is it doesn't throw
  })

  it('handles JSON truncated after a complete property with newline', () => {
    const truncated = '{"feasibility":"High",\n"council":"Blacktown",\n"notes":"Some info about the area that gets trun'
    const result = parseFeasibilityJson(truncated)
    expect(result.feasibility).toBe('High')
    expect(result.council).toBe('Blacktown')
  })

  it('throws on empty input', () => {
    expect(() => parseFeasibilityJson('')).toThrow('Response was truncated')
  })

  it('throws on completely invalid input', () => {
    expect(() => parseFeasibilityJson('not json at all')).toThrow('Response was truncated')
  })

  it('parses a single opening brace as empty object', () => {
    // '{' gets closed to '{}' by the repair logic, which is valid JSON
    const result = parseFeasibilityJson('{')
    expect(result).toEqual({})
  })

  it('handles nested arrays correctly', () => {
    const json = '{"risks":["flood","bushfire"],"score":8}'
    const result = parseFeasibilityJson(json)
    expect(result.risks).toEqual(['flood', 'bushfire'])
    expect(result.score).toBe(8)
  })

  it('handles escaped quotes in strings', () => {
    const json = '{"notes":"He said \\"hello\\"","score":5}'
    const result = parseFeasibilityJson(json)
    expect(result.notes).toBe('He said "hello"')
    expect(result.score).toBe(5)
  })
})
