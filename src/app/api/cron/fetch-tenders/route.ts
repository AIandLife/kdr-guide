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
  'repair',
  'civil',
  'plumbing',
  'electrical',
  'landscaping',
  'playground',
  'park',
  'demolition',
  'roofing',
  'painting',
  'concrete',
  'fencing',
  'drainage',
]

const NON_CONSTRUCTION_KEYWORDS = [
  'it services',
  'software',
  'consulting',
  'legal services',
  'marketing',
  'catering',
  'advertising',
  'audit',
  'accounting',
  'insurance',
  'recruitment',
  'training',
  'printing',
  'stationery',
  'medical supplies',
  'pharmacy',
  'telecommunications',
]

function isConstructionRelated(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase()
  // If clearly non-construction, skip
  if (NON_CONSTRUCTION_KEYWORDS.some((kw) => combined.includes(kw))) {
    // Unless it also has strong construction signals
    if (!CONSTRUCTION_KEYWORDS.some((kw) => combined.includes(kw))) {
      return false
    }
  }
  return CONSTRUCTION_KEYWORDS.some((kw) => combined.includes(kw))
}

/** Extract council name from VendorPanel tender title/description */
function extractCouncilName(title: string, description: string): string {
  const combined = `${title} ${description}`
  // Common patterns: "XXX Council", "XXX Shire", "City of XXX"
  const patterns = [
    /(?:^|\s)((?:[A-Z][a-zA-Z'-]+\s+)*(?:City|Shire|Regional)\s+Council(?:\s+of\s+[A-Z][a-zA-Z'-]+)?)/,
    /(?:^|\s)(Council\s+of\s+(?:[A-Z][a-zA-Z'-]+\s*)+)/,
    /(?:^|\s)(City\s+of\s+(?:[A-Z][a-zA-Z'-]+\s*)+)/,
    /(?:^|\s)((?:[A-Z][a-zA-Z'-]+\s+)+Council)\b/,
    /(?:^|\s)((?:[A-Z][a-zA-Z'-]+\s+)*(?:Municipality|Borough)(?:\s+of\s+[A-Z][a-zA-Z'-]+)?)/,
  ]
  for (const pattern of patterns) {
    const match = combined.match(pattern)
    if (match) return match[1].trim()
  }
  return ''
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

  let austenderProcessed = 0
  let austenderErrors = 0
  let vendorpanelProcessed = 0
  let vendorpanelErrors = 0

  try {
    // ========== AUSTENDER ==========
    console.log('fetch-tenders: fetching AusTender RSS feed...')
    let austenderTotal = 0
    let austenderExistingCount = 0

    try {
      const rssRes = await fetch(
        'https://www.tenders.gov.au/public_data/rss/rss.xml',
        { headers: { 'User-Agent': USER_AGENT } }
      )

      if (!rssRes.ok) {
        console.error('fetch-tenders: AusTender RSS fetch failed', rssRes.status)
      } else {
        const rssXml = await rssRes.text()

        // Parse items
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

        austenderTotal = items.length
        console.log(`fetch-tenders: found ${items.length} items in AusTender RSS`)

        if (items.length > 0) {
          // Check which guids already exist
          const guids = items.map((i) => i.guid).filter(Boolean)
          const { data: existing } = await supabase
            .from('government_tenders')
            .select('guid')
            .in('guid', guids)

          const existingGuids = new Set(
            (existing || []).map((e: { guid: string }) => e.guid)
          )
          austenderExistingCount = existingGuids.size

          // Process new tenders
          const newItems = items.filter((i) => i.guid && !existingGuids.has(i.guid))
          console.log(`fetch-tenders: ${newItems.length} new AusTender tenders to process`)

          const toProcess = newItems.slice(0, MAX_TENDERS_PER_RUN)

          for (const item of toProcess) {
            try {
              console.log(
                `fetch-tenders: [AusTender] processing "${item.title.substring(0, 60)}..."`
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
                    council_name: '',
                  },
                  { onConflict: 'guid' }
                )

              if (upsertErr) {
                console.error('fetch-tenders: AusTender upsert failed', upsertErr)
                austenderErrors++
              } else {
                austenderProcessed++
              }
            } catch (err) {
              console.error(
                'fetch-tenders: error processing AusTender item',
                item.guid,
                err
              )
              austenderErrors++
            }
          }
        }
      }
    } catch (err) {
      console.error('fetch-tenders: AusTender fatal error', err)
    }

    // ========== VENDORPANEL ==========
    console.log('fetch-tenders: fetching VendorPanel RSS feed...')
    let vpTotalItems = 0
    let vpConstructionItems = 0
    let vpExistingCount = 0

    try {
      const vpRes = await fetch(
        'https://www.vendorpanel.com.au/PublicTendersRssV2.aspx?mode=all',
        { headers: { 'User-Agent': USER_AGENT } }
      )

      if (!vpRes.ok) {
        console.error('fetch-tenders: VendorPanel RSS fetch failed', vpRes.status)
      } else {
        const vpXml = await vpRes.text()

        // Parse items
        const vpItemRegex = /<item>([\s\S]*?)<\/item>/gi
        const vpItems: Array<{
          title: string
          link: string
          description: string
          pubDate: string
          guid: string
        }> = []

        let vpMatch
        while ((vpMatch = vpItemRegex.exec(vpXml)) !== null) {
          const itemXml = vpMatch[1]
          vpItems.push({
            title: extractTag(itemXml, 'title'),
            link: extractTag(itemXml, 'link'),
            description: extractTag(itemXml, 'description'),
            pubDate: extractTag(itemXml, 'pubDate'),
            guid: extractTag(itemXml, 'guid'),
          })
        }

        vpTotalItems = vpItems.length
        console.log(`fetch-tenders: found ${vpItems.length} items in VendorPanel RSS`)

        // Filter to construction-related only
        const constructionItems = vpItems.filter((item) =>
          isConstructionRelated(item.title, item.description)
        )
        vpConstructionItems = constructionItems.length
        console.log(
          `fetch-tenders: ${constructionItems.length} construction-related items out of ${vpItems.length} total VendorPanel items`
        )

        if (constructionItems.length > 0) {
          // Prefix guids with 'vp-' to avoid conflicts with AusTender
          const vpGuids = constructionItems
            .map((i) => {
              const rawGuid = i.guid || i.link
              return rawGuid ? `vp-${rawGuid}` : ''
            })
            .filter(Boolean)

          const { data: vpExisting } = await supabase
            .from('government_tenders')
            .select('guid')
            .in('guid', vpGuids)

          const vpExistingGuids = new Set(
            (vpExisting || []).map((e: { guid: string }) => e.guid)
          )
          vpExistingCount = vpExistingGuids.size

          // Process new tenders
          const vpNewItems = constructionItems.filter((i) => {
            const prefixedGuid = `vp-${i.guid || i.link}`
            return prefixedGuid && !vpExistingGuids.has(prefixedGuid)
          })
          console.log(
            `fetch-tenders: ${vpNewItems.length} new VendorPanel tenders to process`
          )

          const vpToProcess = vpNewItems.slice(0, MAX_TENDERS_PER_RUN)

          for (const item of vpToProcess) {
            try {
              const prefixedGuid = `vp-${item.guid || item.link}`
              console.log(
                `fetch-tenders: [VendorPanel] processing "${item.title.substring(0, 60)}..."`
              )

              const descriptionEn = item.description || ''
              const councilName = extractCouncilName(item.title, descriptionEn)

              // AI analysis
              const analysis = await analyzeTender(item.title, descriptionEn)

              // Upsert
              const { error: upsertErr } = await supabase
                .from('government_tenders')
                .upsert(
                  {
                    atm_id: null,
                    title: item.title,
                    agency: councilName || '',
                    category_name: analysis.category,
                    close_date: null,
                    atm_type: '',
                    location: '',
                    description_en: descriptionEn,
                    description_zh: analysis.summary,
                    link: item.link,
                    guid: prefixedGuid,
                    is_construction: true,
                    published_at: parseDate(item.pubDate),
                    source: 'council',
                    council_name: councilName,
                  },
                  { onConflict: 'guid' }
                )

              if (upsertErr) {
                console.error('fetch-tenders: VendorPanel upsert failed', upsertErr)
                vendorpanelErrors++
              } else {
                vendorpanelProcessed++
              }
            } catch (err) {
              console.error(
                'fetch-tenders: error processing VendorPanel item',
                item.guid,
                err
              )
              vendorpanelErrors++
            }
          }
        }
      }
    } catch (err) {
      console.error('fetch-tenders: VendorPanel fatal error', err)
    }

    const totalProcessed = austenderProcessed + vendorpanelProcessed
    const totalErrors = austenderErrors + vendorpanelErrors

    console.log(
      `fetch-tenders: done. austender=${austenderProcessed} vendorpanel=${vendorpanelProcessed} errors=${totalErrors}`
    )

    return NextResponse.json({
      ok: true,
      processed: totalProcessed,
      austender: {
        processed: austenderProcessed,
        already_in_db: austenderExistingCount,
        errors: austenderErrors,
        total_in_feed: austenderTotal,
      },
      vendorpanel: {
        processed: vendorpanelProcessed,
        already_in_db: vpExistingCount,
        errors: vendorpanelErrors,
        total_in_feed: vpTotalItems,
        construction_items: vpConstructionItems,
      },
      errors: totalErrors,
    })
  } catch (err) {
    console.error('fetch-tenders: fatal error', err)
    return NextResponse.json(
      { error: 'Internal error', details: String(err) },
      { status: 500 }
    )
  }
}
