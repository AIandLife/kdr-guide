import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { businessName, description, contactName, direction = 'zh-to-en' } = await req.json()

    if (!businessName && !description) {
      return Response.json({ error: 'At least businessName or description required' }, { status: 400 })
    }

    const isZhToEn = direction === 'zh-to-en'

    const prompt = isZhToEn ? `
You are helping translate a building professional's listing from Chinese to English for an Australian website.

CRITICAL RULES FOR COMPANY/PERSON NAMES:
- Do NOT automatically translate proper nouns (company names, person names)
- For company names: provide BOTH the pinyin transliteration AND a suggested English meaning
- Format company name as: { "original": "蓝天建设", "pinyin": "Lantian Construction", "suggested": "Blue Sky Construction", "keep_original": false }
- If the name is already in English or is a brand name, keep it as-is
- Person names: provide pinyin only (e.g. "Zhang Wei" not "Brave Zhang")

Input data:
Business Name: ${businessName || ''}
Contact Name: ${contactName || ''}
Description: ${description || ''}

Return ONLY valid JSON in this exact structure:
{
  "businessName": {
    "original": "${businessName || ''}",
    "pinyin": "<pinyin version, e.g. Lantian Jianshe>",
    "suggested": "<natural English translation if it has clear meaning, otherwise same as pinyin>",
    "note": "<brief note explaining the options, e.g. '蓝天 means Blue Sky; you can use either Lantian or Blue Sky'>",
    "keep_original": false
  },
  "contactName": {
    "original": "${contactName || ''}",
    "translated": "<pinyin of name, e.g. Wei Zhang>",
    "note": "<note if name has special meaning>"
  },
  "description": {
    "original": "${description || ''}",
    "translated": "<natural Australian English translation. Keep suburb names, council names, Australian building terms (DA, CDC, KDR, BASIX) in English. Do not translate: Strathfield, Parramatta, etc.>",
    "confidence": <0-100, how confident you are in the translation quality>
  }
}
` : `
You are helping translate a building professional's listing from English to Chinese for an Australian website.

CRITICAL RULES:
- Keep Australian building terms in English where they are commonly used in Chinese community: DA, CDC, KDR, BASIX, OC, CC
- Keep suburb names and place names as-is (e.g. Strathfield stays Strathfield)
- Person names: provide pinyin phonetic transcription in Chinese characters where natural, or keep English
- Company names in English: keep English name AND add a Chinese phonetic/meaning translation suggestion

Input data:
Business Name: ${businessName || ''}
Contact Name: ${contactName || ''}
Description: ${description || ''}

Return ONLY valid JSON in this exact structure:
{
  "businessName": {
    "original": "${businessName || ''}",
    "suggested": "<Chinese translation or phonetic, e.g. 蓝天建设 or 麦克建筑>",
    "note": "<brief note>",
    "keep_original": false
  },
  "contactName": {
    "original": "${contactName || ''}",
    "translated": "<Chinese phonetic or keep English>",
    "note": ""
  },
  "description": {
    "original": "${description || ''}",
    "translated": "<natural Simplified Chinese translation>",
    "confidence": <0-100>
  }
}
`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Translation failed: invalid response' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return Response.json({ ok: true, result, direction })

  } catch (err) {
    console.error('Professional translation error:', err)
    return Response.json({ error: 'Translation failed' }, { status: 500 })
  }
}
