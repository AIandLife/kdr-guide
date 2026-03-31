import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

/* rate limit: max 5 reports per hour per IP */
const ipHits = new Map<string, number[]>()
function checkRateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= max) return false
  hits.push(now)
  ipHits.set(ip, hits)
  return true
}

export async function POST(req: Request) {
  // Auth check
  const authClient = await createServerSupabase()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized — please log in to report' }, { status: 401 })
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip, 5, 60 * 60 * 1000)) {
    return Response.json({ error: 'Too many reports. Please try again later.' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const { post_id, reply_id, reason } = await req.json()
    if (!post_id || !reason) return Response.json({ error: 'Missing fields' }, { status: 400 })

    await supabase.from('forum_reports').insert({
      post_id,
      reply_id: reply_id || null,
      reporter_id: user.id,
      reason,
    })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
