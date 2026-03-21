import Anthropic from '@anthropic-ai/sdk'
import { findCouncilBySuburb, findCouncil, STATE_COST_RANGES } from '@/lib/council-data'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { suburb, state, lotSize, lang = 'en' } = await req.json()

    if (!suburb) {
      return Response.json({ error: 'Suburb is required' }, { status: 400 })
    }

    // Try to find council data
    const councilData = findCouncilBySuburb(suburb, state) || findCouncil(suburb)
    const costFallback = state ? STATE_COST_RANGES[state.toUpperCase()] : null

    const contextInfo = councilData
      ? `
COUNCIL DATA FOUND:
- Council: ${councilData.council}
- State: ${councilData.state}
- LGA: ${councilData.lga}
- Min Lot Size for KDR: ${councilData.minLotSize} sqm
- Max Height: ${councilData.maxHeight}m
- Heritage Risk: ${councilData.heritageRisk}
- Flood Risk: ${councilData.floodRisk}
- Bushfire Risk: ${councilData.bushfireRisk}
- CDC Eligible: ${councilData.cdcEligible ? 'Yes' : 'No (DA required)'}
- DA Timeline: ${councilData.daTimelineWeeks[0]}-${councilData.daTimelineWeeks[1]} weeks
- Typical Demolition Cost: $${councilData.avgDemolitionCost[0].toLocaleString()}-$${councilData.avgDemolitionCost[1].toLocaleString()}
- Typical Build Cost: $${councilData.avgBuildCostPerSqm[0].toLocaleString()}-$${councilData.avgBuildCostPerSqm[1].toLocaleString()} per sqm
- Notes: ${councilData.notes}
${lotSize ? `- User's Lot Size: ${lotSize} sqm (min required: ${councilData.minLotSize} sqm — ${Number(lotSize) >= councilData.minLotSize ? 'MEETS MINIMUM' : 'BELOW MINIMUM'})` : ''}
`
      : costFallback
        ? `
No specific council data found for "${suburb}".
State cost ranges for ${state}:
- Demolition: $${costFallback.demolition[0].toLocaleString()}-$${costFallback.demolition[1].toLocaleString()}
- Build: $${costFallback.buildPerSqm[0].toLocaleString()}-$${costFallback.buildPerSqm[1].toLocaleString()} per sqm
${lotSize ? `- User's Lot Size: ${lotSize} sqm` : ''}
`
        : `No specific data found for "${suburb}". Provide general Australian KDR guidance.`

    const isZh = lang === 'zh'
    const prompt = `You are Australia's leading Knockdown Rebuild (KDR) expert. A homeowner has asked about KDR feasibility for their property.

${isZh ? 'IMPORTANT: All text fields in the JSON (verdict, messages, titles, details, etc.) must be written in Simplified Chinese. Keep technical terms like "DA", "CDC", "Council" in English.' : ''}

Suburb: ${suburb}
${state ? `State: ${state}` : ''}
${lotSize ? `Lot Size: ${lotSize} sqm` : ''}

${contextInfo}

Generate a comprehensive, honest feasibility report. Return ONLY valid JSON in this exact structure:

{
  "suburb": "${suburb}",
  "state": "${state || councilData?.state || 'Australia'}",
  "council": "${councilData?.council || 'Check with your local council'}",
  "feasibilityScore": <number 1-10, where 10 = definitely feasible, 1 = very unlikely>,
  "feasibilityLabel": <"Highly Feasible" | "Feasible" | "Possible with Conditions" | "Difficult" | "Very Difficult">,
  "verdict": <2-3 sentence plain English summary of whether they can KDR and key factors>,
  "lotSizeCheck": {
    "passed": <true/false — null if no lot size provided>,
    "minRequired": <number or null>,
    "message": <string>
  },
  "riskFlags": [
    {
      "type": <"heritage" | "flood" | "bushfire" | "zoning" | "slope" | "other">,
      "level": <"Low" | "Medium" | "High">,
      "title": <short title>,
      "detail": <1-2 sentences explaining impact on KDR>
    }
  ],
  "approvalPath": {
    "type": <"CDC" | "DA" | "DA Required" | "Unknown">,
    "timelineWeeks": <[min, max] or null>,
    "description": <2-3 sentences about the approval process for this area>
  },
  "costEstimate": {
    "demolition": <[min, max] in AUD>,
    "buildPerSqm": <[min, max] in AUD>,
    "totalEstimate": <if lot size given, provide [min, max] for a typical 4BR home build, otherwise null>,
    "totalNote": <string explaining what the total includes or "Provide your lot size for a total estimate">
  },
  "timeline": {
    "totalWeeks": <[min, max]>,
    "phases": [
      {"phase": "Planning & Design", "weeks": "4–8"},
      {"phase": "Council Approval", "weeks": ".."},
      {"phase": "Demolition", "weeks": "1–2"},
      {"phase": "Construction", "weeks": "20–30"},
      {"phase": "Handover & Finishes", "weeks": "2–4"}
    ]
  },
  "nextSteps": [
    {
      "step": <number>,
      "title": <action title>,
      "detail": <what to do and why>,
      "urgency": <"First" | "Second" | "Third" | "When Ready">
    }
  ],
  "professionals": [
    {
      "role": <"Town Planner" | "Builder" | "Demolition Contractor" | "Surveyor" | "Structural Engineer" | "Finance Broker" | "Arborist" | "Geotechnical Engineer">,
      "why": <why needed for this specific property>,
      "timing": <when in the process to engage them>
    }
  ],
  "keyInsight": <1 sentence — the single most important thing this homeowner needs to know>
}

Be specific, honest, and practical. If risks are high, say so clearly. Use real Australian industry knowledge.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nCRITICAL: Output ONLY the raw JSON object. No markdown, no explanation, no code fences. Start your response with { and end with }.',
        },
        {
          role: 'assistant',
          content: '{',
        }
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // The assistant prefill starts with '{', so prepend it back
    const rawText = '{' + content.text
    // Find the end of the JSON object
    const end = rawText.lastIndexOf('}')
    if (end === -1) throw new Error('No JSON found in response')
    const jsonStr = rawText.slice(0, end + 1)
    const result = JSON.parse(jsonStr)
    return Response.json(result)

  } catch (error) {
    console.error('Feasibility API error:', error)
    return Response.json(
      { error: 'Failed to generate feasibility report. Please try again.' },
      { status: 500 }
    )
  }
}
