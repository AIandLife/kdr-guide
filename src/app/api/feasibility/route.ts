import Anthropic from '@anthropic-ai/sdk'
import { findCouncilBySuburb, findCouncil, STATE_COST_RANGES } from '@/lib/council-data'
import { getLiveZoning, type LiveZoneData } from '@/lib/spatial-api'

export const maxDuration = 30   // seconds — needs Vercel Pro; Hobby hard-caps at 10s

const client = new Anthropic()

function buildLiveZoneContext(z: LiveZoneData, lotSize: number | null): string {
  const sourceLabel: Record<string, string> = {
    'nsw-eplan': 'NSW ePlanning Portal (live)',
    'vic-vicplan': 'VicPlan MapShare (live)',
    'qld-spatial': 'QLD Spatial (live)',
    'wa-landgate': 'Landgate WA (live)',
    'sa-planssa': 'PlanSA (live)',
    'fallback': 'Static data',
  }
  const lines = [
    `LIVE ZONING DATA (source: ${sourceLabel[z.source] || z.source}):`,
    `- Zone Code: ${z.zoneCode}`,
    `- Zone Name: ${z.zoneName}`,
    z.fsr ? `- Floor Space Ratio (FSR): ${z.fsr}` : null,
    z.maxHeight ? `- Maximum Building Height: ${z.maxHeight}m` : null,
    z.minLotSize ? `- Minimum Lot Size: ${z.minLotSize} sqm` : null,
    z.lep ? `- Planning Instrument: ${z.lep}` : null,
    z.kdrPermitted !== null ? `- KDR / Residential Development: ${z.kdrPermitted ? 'PERMITTED in this zone' : 'NOT PERMITTED in this zone'}` : null,
    ...z.notes,
    lotSize && z.minLotSize ? `- User's Lot: ${lotSize} sqm vs zone minimum ${z.minLotSize} sqm — ${lotSize >= z.minLotSize ? 'MEETS MINIMUM' : 'BELOW MINIMUM'}` : null,
  ].filter(Boolean).join('\n')
  return lines
}

export async function POST(req: Request) {
  try {
    const { suburb, state, lotSize, lang = 'en', projectType = 'kdr', address } = await req.json()

    if (!suburb) {
      return Response.json({ error: 'Suburb is required' }, { status: 400 })
    }

    // 1. Try live spatial API with a 4s timeout — skip gracefully if slow
    let liveZone: LiveZoneData | null = null
    if (state) {
      const lookupAddress = address || suburb
      liveZone = await Promise.race([
        getLiveZoning(lookupAddress, state),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 4000)),
      ])
    }

    // 2. Try static council data
    const councilData = findCouncilBySuburb(suburb, state) || findCouncil(suburb)
    const costFallback = state ? STATE_COST_RANGES[state.toUpperCase()] : null

    // 3. Build context for AI — live data takes priority, supplemented by council static data
    let contextInfo: string
    if (liveZone) {
      const liveCtx = buildLiveZoneContext(liveZone, lotSize ? Number(lotSize) : null)
      const staticSupp = councilData ? `
SUPPLEMENTARY COUNCIL DATA (${councilData.council}):
- Heritage Risk: ${councilData.heritageRisk}
- Flood Risk: ${councilData.floodRisk}
- Bushfire Risk: ${councilData.bushfireRisk}
- CDC Eligible: ${councilData.cdcEligible ? 'Yes' : 'No (DA required)'}
- DA Timeline: ${councilData.daTimelineWeeks[0]}–${councilData.daTimelineWeeks[1]} weeks
- Typical Demolition Cost: $${councilData.avgDemolitionCost[0].toLocaleString()}–$${councilData.avgDemolitionCost[1].toLocaleString()}
- Typical Build Cost: $${councilData.avgBuildCostPerSqm[0].toLocaleString()}–$${councilData.avgBuildCostPerSqm[1].toLocaleString()} per sqm
- Notes: ${councilData.notes}` : costFallback ? `
State cost ranges for ${state}:
- Demolition: $${costFallback.demolition[0].toLocaleString()}–$${costFallback.demolition[1].toLocaleString()}
- Build: $${costFallback.buildPerSqm[0].toLocaleString()}–$${costFallback.buildPerSqm[1].toLocaleString()} per sqm` : ''
      contextInfo = liveCtx + '\n' + staticSupp
    } else if (councilData) {
      contextInfo = `
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
- DA Timeline: ${councilData.daTimelineWeeks[0]}–${councilData.daTimelineWeeks[1]} weeks
- Typical Demolition Cost: $${councilData.avgDemolitionCost[0].toLocaleString()}–$${councilData.avgDemolitionCost[1].toLocaleString()}
- Typical Build Cost: $${councilData.avgBuildCostPerSqm[0].toLocaleString()}–$${councilData.avgBuildCostPerSqm[1].toLocaleString()} per sqm
- Notes: ${councilData.notes}
${lotSize ? `- User's Lot Size: ${lotSize} sqm (min required: ${councilData.minLotSize} sqm — ${Number(lotSize) >= councilData.minLotSize ? 'MEETS MINIMUM' : 'BELOW MINIMUM'})` : ''}
`
    } else if (costFallback) {
      contextInfo = `
No specific council data found for "${suburb}".
State cost ranges for ${state}:
- Demolition: $${costFallback.demolition[0].toLocaleString()}–$${costFallback.demolition[1].toLocaleString()}
- Build: $${costFallback.buildPerSqm[0].toLocaleString()}–$${costFallback.buildPerSqm[1].toLocaleString()} per sqm
${lotSize ? `- User's Lot Size: ${lotSize} sqm` : ''}
`
    } else {
      contextInfo = `No specific data found for "${suburb}". Provide general Australian KDR guidance.`
    }

    const isZh = lang === 'zh'

    const PROJECT_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
      'kdr': { en: 'Knockdown & Rebuild (KDR)', zh: '推倒重建 (KDR)' },
      'renovation': { en: 'Major Renovation', zh: '大型翻新' },
      'extension': { en: 'Extension / Addition', zh: '扩建 / 加建' },
      'granny-flat': { en: 'Granny Flat / Secondary Dwelling', zh: '独立辅助住宅 (Granny Flat)' },
    }
    const projectLabel = PROJECT_TYPE_LABELS[projectType] || PROJECT_TYPE_LABELS['kdr']
    const projectLabelText = isZh ? projectLabel.zh : projectLabel.en

    const projectContext = projectType === 'kdr'
      ? ''
      : projectType === 'renovation'
        ? `
PROJECT TYPE: Major Renovation (NOT knockdown rebuild)
- Focus on: council approval requirements for renovation, heritage impacts, building permit vs DA threshold
- Costs: renovation typically $1,500–$4,500/sqm depending on scope
- No demolition cost (unless partial), focus on scope of works, structural changes
- Key risks: hidden structural issues, asbestos in older homes, heritage restrictions on facade/materials
- Do NOT mention lot size minimum requirements (not relevant to renovation)
`
        : projectType === 'extension'
          ? `
PROJECT TYPE: Extension / Home Addition (adding floor space to existing home)
- Focus on: setback requirements, site coverage limits, floor space ratio (FSR), height limits
- Whether CDC or DA applies depends on size and type of extension
- Costs: typically $2,500–$5,000/sqm for quality extension
- Key considerations: impact on neighbours, BASIX requirements, structural tie-in
- Lot size minimums may apply for ground floor extensions affecting site coverage
`
          : projectType === 'granny-flat'
            ? `
PROJECT TYPE: Granny Flat / Secondary Dwelling
- Under NSW SEPP, granny flats under 60sqm on lots 450sqm+ can often get CDC (complying development)
- Other states have different rules — check state-specific secondary dwelling policies
- Costs: typically $120,000–$250,000 for a self-contained 1–2 bedroom unit
- Key considerations: utilities connection, separate access, rental income potential
- Often faster approval than full DA — this is a key selling point
`
            : ''

    const zhInstruction = isZh ? `
LANGUAGE RULE — MUST FOLLOW EXACTLY:
You are writing for a Chinese-speaking Australian homeowner. ALL narrative text fields must be in Simplified Chinese.

Fields that MUST be in Simplified Chinese:
- feasibilityLabel (use one of: "非常可行" | "可行" | "有条件可行" | "较难" | "非常困难")
- verdict (全中文，2-3句)
- lotSizeCheck.message (全中文)
- riskFlags[].title (全中文)
- riskFlags[].detail (全中文)
- approvalPath.description (全中文)
- costEstimate.totalNote (全中文)
- timeline.phases[].phase (全中文，如 "规划与设计"、"Council 审批"、"拆除"、"施工"、"竣工与收尾")
- nextSteps[].title (全中文)
- nextSteps[].detail (全中文)
- professionals[].why (全中文)
- professionals[].timing (全中文)
- keyInsight (全中文，1句)

Fields that MUST stay in English (used for system logic):
- riskFlags[].level ("Low" | "Medium" | "High") — DO NOT translate
- approvalPath.type ("CDC" | "DA" | "DA Required" | "Unknown") — DO NOT translate
- nextSteps[].urgency ("First" | "Second" | "Third" | "When Ready") — DO NOT translate
- professionals[].role (keep English role names) — DO NOT translate
- suburb, state, council — keep as-is

Technical terms you MAY keep in English within Chinese text: DA, CDC, Council, KDR, Builder, Town Planner.
` : ''

    const prompt = `You are Australia's leading property development expert specialising in residential projects. A homeowner has asked about feasibility for their property project.
${zhInstruction}
Project Type: ${projectLabelText}
${projectContext}
Suburb: ${suburb}
${state ? `State: ${state}` : ''}
${lotSize ? `Lot Size: ${lotSize} sqm` : ''}

${contextInfo}

Generate a comprehensive, honest feasibility report tailored to the project type above. Return ONLY valid JSON in this exact structure:

{
  "suburb": "${suburb}",
  "state": "${state || councilData?.state || 'Australia'}",
  "council": "${councilData?.council || 'Check with your local council'}",
  "projectType": "${projectLabelText}",
  "feasibilityScore": <number 1-10, where 10 = definitely feasible, 1 = very unlikely>,
  "feasibilityLabel": ${isZh ? '<"非常可行" | "可行" | "有条件可行" | "较难" | "非常困难">' : '<"Highly Feasible" | "Feasible" | "Possible with Conditions" | "Difficult" | "Very Difficult">'},
  "verdict": <${isZh ? '2-3句简体中文描述是否可以KDR及关键因素' : '2-3 sentence plain English summary of whether they can KDR and key factors'}>,
  "lotSizeCheck": {
    "passed": <true/false — null if no lot size provided>,
    "minRequired": <number or null>,
    "message": <${isZh ? '简体中文说明' : 'string'}>
  },
  "riskFlags": [
    {
      "type": <"heritage" | "flood" | "bushfire" | "zoning" | "slope" | "other">,
      "level": <"Low" | "Medium" | "High">,
      "title": <${isZh ? '简体中文短标题' : 'short title'}>,
      "detail": <${isZh ? '1-2句简体中文解释对KDR的影响' : '1-2 sentences explaining impact on KDR'}>
    }
  ],
  "approvalPath": {
    "type": <"CDC" | "DA" | "DA Required" | "Unknown">,
    "timelineWeeks": <[min, max] or null>,
    "description": <${isZh ? '2-3句简体中文描述该区域的审批流程' : '2-3 sentences about the approval process for this area'}>
  },
  "costEstimate": {
    "demolition": <[min, max] in AUD>,
    "buildPerSqm": <[min, max] in AUD>,
    "totalEstimate": <if lot size given, provide [min, max] for a typical 4BR home build, otherwise null>,
    "totalNote": <${isZh ? '简体中文说明总费用包含内容，如未提供地块面积则说明原因' : 'string explaining what the total includes or "Provide your lot size for a total estimate"'}>
  },
  "timeline": {
    "totalWeeks": <[min, max]>,
    "phases": [
      {"phase": ${isZh ? '"规划与设计"' : '"Planning & Design"'}, "weeks": "4–8"},
      {"phase": ${isZh ? '"Council 审批"' : '"Council Approval"'}, "weeks": ".."},
      {"phase": ${isZh ? '"拆除"' : '"Demolition"'}, "weeks": "1–2"},
      {"phase": ${isZh ? '"施工建造"' : '"Construction"'}, "weeks": "20–30"},
      {"phase": ${isZh ? '"竣工与收尾"' : '"Handover & Finishes"'}, "weeks": "2–4"}
    ]
  },
  "nextSteps": [
    {
      "step": <number>,
      "title": <${isZh ? '简体中文行动标题' : 'action title'}>,
      "detail": <${isZh ? '简体中文说明做什么及原因' : 'what to do and why'}>,
      "urgency": <"First" | "Second" | "Third" | "When Ready">
    }
  ],
  "professionals": [
    {
      "role": <"Town Planner" | "Builder" | "Demolition Contractor" | "Surveyor" | "Structural Engineer" | "Finance Broker" | "Arborist" | "Geotechnical Engineer">,
      "why": <${isZh ? '简体中文说明为何该物业需要此专业人士' : 'why needed for this specific property'}>,
      "timing": <${isZh ? '简体中文说明在流程中何时聘请' : 'when in the process to engage them'}>
    }
  ],
  "keyInsight": <${isZh ? '1句最重要的简体中文提示' : '1 sentence — the single most important thing this homeowner needs to know'}>
}

Be specific, honest, and practical. If risks are high, say so clearly. Use real Australian industry knowledge.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
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
    // Attach live zone metadata so the frontend can show a "live data" badge
    if (liveZone) {
      result._liveZone = {
        source: liveZone.source,
        zoneCode: liveZone.zoneCode,
        zoneName: liveZone.zoneName,
        fsr: liveZone.fsr,
        maxHeight: liveZone.maxHeight,
        minLotSize: liveZone.minLotSize,
      }
    }
    return Response.json(result)

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack?.split('\n').slice(0,4).join(' | ') : ''
    console.error('Feasibility API error:', msg, stack)
    return Response.json(
      { error: `Failed: ${msg}` },
      { status: 500 }
    )
  }
}
