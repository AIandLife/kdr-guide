import { createClient } from '@supabase/supabase-js'

/**
 * 对接大厅 — public list of live briefs + recent anonymous demand signals.
 *
 * SAFE COLUMNS ONLY: contact_name/email/phone/wechat are never selected here.
 * Signals come from feasibility_searches at suburb level only (never addresses).
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const [briefsRes, signalsRes] = await Promise.all([
      supabase
        .from('project_briefs')
        .select('id, kind, project_type, state, suburb, budget_band, timeline, description, lot_area_sqm, has_report, response_count, created_at')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('feasibility_searches')
        .select('suburb, state, project_type, created_at')
        .order('created_at', { ascending: false })
        .limit(60),
    ])

    // Privacy guard: feasibility_searches.suburb sometimes holds the user's
    // raw input including a street number ("77 illawong penrith"). Signals
    // must be suburb-level ONLY — drop anything with a digit, titlecase,
    // and dedupe by suburb+type.
    const seen = new Set<string>()
    const signals = (signalsRes.data || []).filter(s => {
      const sub = String(s.suburb || '').trim()
      if (!sub || sub.length > 30 || /\d/.test(sub)) return false
      const key = `${sub.toLowerCase()}|${s.project_type || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 12).map(s => ({
      ...s,
      suburb: String(s.suburb).trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    }))

    return Response.json({
      briefs: briefsRes.data || [],
      signals,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Board list error:', error)
    return Response.json({ briefs: [], signals: [] })
  }
}
