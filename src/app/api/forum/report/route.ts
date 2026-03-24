import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { post_id, reply_id, reporter_id, reason } = await req.json()
    if (!post_id || !reason) return Response.json({ error: 'Missing fields' }, { status: 400 })

    await supabase.from('forum_reports').insert({
      post_id,
      reply_id: reply_id || null,
      reporter_id: reporter_id || null,
      reason,
    })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
