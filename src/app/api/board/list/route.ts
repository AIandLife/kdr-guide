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
        .limit(12),
    ])

    return Response.json({
      briefs: briefsRes.data || [],
      signals: signalsRes.data || [],
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Board list error:', error)
    return Response.json({ briefs: [], signals: [] })
  }
}
