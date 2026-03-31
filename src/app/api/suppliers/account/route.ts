import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  // Auth check — only logged-in users can access their own supplier account
  const authClient = await createServerSupabase()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  // Look up by user_id first, fall back to authenticated email
  let listing = null
  const { data: byUserId } = await supabase
    .from('supplier_listings')
    .select('id, business_name, contact_name, email, phone, website, wechat, abn, category, states, specialties, description, status, created_at')
    .eq('user_id', user.id)
    .single()

  if (byUserId) {
    listing = byUserId
  } else {
    const { data: byEmail } = await supabase
      .from('supplier_listings')
      .select('id, business_name, contact_name, email, phone, website, wechat, abn, category, states, specialties, description, status, created_at')
      .eq('email', user.email!)
      .single()
    if (byEmail) {
      // Bind user_id for future lookups
      await supabase.from('supplier_listings').update({ user_id: user.id }).eq('id', byEmail.id)
      listing = byEmail
    }
  }

  return Response.json({ listing })
}
