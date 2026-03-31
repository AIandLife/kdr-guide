import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_FIELDS = ['business_name', 'contact_name', 'phone', 'website', 'wechat', 'description']

export async function PATCH(req: Request) {
  try {
    // 1. Verify the authenticated user via cookies
    const authClient = await createServerSupabase()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { profileId, ...fields } = body

    if (!profileId) {
      return Response.json({ error: 'Missing profileId' }, { status: 400 })
    }

    // 2. Sanitize: only allow whitelisted fields
    const sanitized: Record<string, string> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in fields && typeof fields[key] === 'string') {
        sanitized[key] = fields[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // 3. Use service role to verify ownership, then update
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    )

    // Verify the profile belongs to this user
    const { data: profile } = await supabase
      .from('professionals')
      .select('id, user_id')
      .eq('id', profileId)
      .single()

    if (!profile || profile.user_id !== user.id) {
      return Response.json({ error: 'Forbidden: not your profile' }, { status: 403 })
    }

    // 4. Perform the update
    const { error } = await supabase
      .from('professionals')
      .update(sanitized)
      .eq('id', profileId)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (e) {
    console.error('Profile update error:', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
