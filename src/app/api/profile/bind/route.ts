import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 1. Verify the authenticated user via cookies
    const authClient = await createServerSupabase()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. The user's email comes from the auth token, NOT from the request body
    const userEmail = user.email
    if (!userEmail) {
      return Response.json({ error: 'No email on account' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    )

    // 3. Check if user already has a profile by user_id
    const { data: existingById } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingById) {
      return Response.json({ bound: true, professionalId: existingById.id })
    }

    // 4. Try to bind by email (only the user's own verified email)
    const { data: byEmail } = await supabase
      .from('professionals')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()

    if (byEmail) {
      await supabase
        .from('professionals')
        .update({ user_id: user.id })
        .eq('email', userEmail)

      return Response.json({ bound: true, professionalId: byEmail.id })
    }

    return Response.json({ bound: false })
  } catch (e) {
    console.error('Profile bind error:', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
