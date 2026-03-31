import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

const MAX_TENDERS_PER_RUN = 20
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const CONSTRUCTION_KEYWORDS = [
  'construction',
  'building',
  'renovation',
  'maintenance',
  'facility',
  'infrastructure',
  'school',
  'hospital',
  'road',
  'bridge',
  'architecture',
]

function isConstructionRelated(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase()
  return CONSTRUCTION_KEYWORDS.some((kw) => combined.includes(kw))
}

/** Extract text content from an XML element by tag name */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(regex)
  if (!match) return ''
  let val = match[1].trim()
  if (val.startsWith('<![CDATA[')) {
    val = val.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim()
  }
  return val
}

/** Extract ATM ID from title */
function extractAtmId(title: string): string | null {
  const match = title.match(/^(\d{5,})/)
  if (match) return match[1]
  const match2 = title.match(/ATM\s*ID[:\s]*(\d+)/i)
  if (match2) return match2[1]
  return null
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

/** Call Claude Haiku to analyze tender */
async function analyzeTender(
  title: string,
  description: string
): Promise<{ summary: string; category: string; isConstruction: boolean }> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (!apiKey) {
    return {
      summary: '',
      category: '',
      isConstruction: isConstructionRelated(title, description),
    }
  }

  const prompt = `Analyze this Australian government tender. Return ONLY a JSON object with these fields:
- "summary": Chinese summary in 2-3 sentences (简体中文)
- "category": category name in English (e.g. "Construction", "IT Services", "Health", "Education", "Defence", "Transport", "Environment", "Professional Services", "Other")
- "isConstruction": true if related to construction, building, renovation, maintenance, infrastructure, facility management, school/hospital building, roads, bridges, or architecture

Title: ${title}
Description: ${description}

Return ONLY valid JSON, no markdown.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('fetch-tenders: Claude API error', res.status)
      return {
        summary: '',
        category: '',
        isConstruction: isConstructionRelated(title, description),
      }
    }

    const data = await res.json()
    let text = data.content?.[0]?.text?.trim() || ''
    // Strip markdown code fences if present
    text = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    try {
      const parsed = JSON.parse(text)
      return {
        summary: parsed.summary || '',
        category: parsed.category || '',
        isConstruction:
          parsed.isConstruction ?? isConstructionRelated(title, description),
      }
    } catch {
      return {
        summary: text,
        category: '',
        isConstruction: isConstructionRelated(title, description),
      }
    }
  } catch (err) {
    console.error('fetch-tenders: Claude API call failed', err)
    return {
      summary: '',
      category: '',
      isConstruction: isConstructionRelated(title, description),
    }
  }
}

export async function GET(req: Request) {
  // Auth: accept CRON_SECRET or ADMIN_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecret = (process.env.CRON_SECRET || '').trim()
  const adminSecret = (process.env.ADMIN_SECRET || '').trim()

  const validToken =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (adminSecret && authHeader === `Bearer ${adminSecret}`)

  if (!validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  let processed = 0
  let errors = 0

  try {
    // 1. Fetch RSS feed
    console.log('fetch-tenders: fetching RSS feed...')
    const rssRes = await fetch(
      'https://www.tenders.gov.au/public_data/rss/rss.xml',
      { headers: { 'User-Agent': USER_AGENT } }
    )

    if (!rssRes.ok) {
      console.error('fetch-tenders: RSS fetch failed', rssRes.status)
      return NextResponse.json(
        { error: 'Failed to fetch RSS feed', status: rssRes.status },
        { status: 502 }
      )
    }

    const rssXml = await rssRes.text()

    // 2. Parse items
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    const items: Array<{
      title: string
      link: string
      description: string
      pubDate: string
      guid: string
    }> = []

    let itemMatch
    while ((itemMatch = itemRegex.exec(rssXml)) !== null) {
      const itemXml = itemMatch[1]
      items.push({
        title: extractTag(itemXml, 'title'),
        link: extractTag(itemXml, 'link'),
        description: extractTag(itemXml, 'description'),
        pubDate: extractTag(itemXml, 'pubDate'),
        guid: extractTag(itemXml, 'guid'),
      })
    }

    console.log(`fetch-tenders: found ${items.length} items in RSS feed`)

    if (items.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No items in feed',
        processed: 0,
      })
    }

    // 3. Check which guids already exist
    const guids = items.map((i) => i.guid).filter(Boolean)
    const { data: existing } = await supabase
      .from('government_tenders')
      .select('guid')
      .in('guid', guids)

    const existingGuids = new Set(
      (existing || []).map((e: { guid: string }) => e.guid)
    )

    // 4. Process new tenders
    const newItems = items.filter((i) => i.guid && !existingGuids.has(i.guid))
    console.log(`fetch-tenders: ${newItems.length} new tenders to process`)

    const toProcess = newItems.slice(0, MAX_TENDERS_PER_RUN)

    for (const item of toProcess) {
      try {
        console.log(
          `fetch-tenders: processing "${item.title.substring(0, 60)}..."`
        )

        const descriptionEn = item.description || ''
        const atmId = extractAtmId(item.title)

        // AI analysis
        const analysis = await analyzeTender(item.title, descriptionEn)

        // Upsert
        const { error: upsertErr } = await supabase
          .from('government_tenders')
          .upsert(
            {
              atm_id: atmId,
              title: item.title,
              agency: '',
              category_name: analysis.category,
              close_date: null,
              atm_type: '',
              location: '',
              description_en: descriptionEn,
              description_zh: analysis.summary,
              link: item.link,
              guid: item.guid,
              is_construction: analysis.isConstruction,
              published_at: parseDate(item.pubDate),
              source: 'austender',
            },
            { onConflict: 'guid' }
          )

        if (upsertErr) {
          console.error('fetch-tenders: upsert failed', upsertErr)
          errors++
        } else {
          processed++
        }
      } catch (err) {
        console.error(
          'fetch-tenders: error processing item',
          item.guid,
          err
        )
        errors++
      }
    }

    console.log(
      `fetch-tenders: done. processed=${processed} already_in_db=${existingGuids.size} errors=${errors}`
    )

    return NextResponse.json({
      ok: true,
      processed,
      already_in_db: existingGuids.size,
      errors,
      total_in_feed: items.length,
    })
  } catch (err) {
    console.error('fetch-tenders: fatal error', err)
    return NextResponse.json(
      { error: 'Internal error', details: String(err) },
      { status: 500 }
    )
  }
}
