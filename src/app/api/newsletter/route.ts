import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { email, source } = await req.json()
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // ignoreDuplicates: true preserves existing unsubscribe_token on re-signup
  await supabase.from('newsletter_subscribers').upsert(
    { email, source: source || 'login', unsubscribed: false },
    { onConflict: 'email', ignoreDuplicates: false }
  )
  return Response.json({ success: true })
}
