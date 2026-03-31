import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: Request) {
  try {
    // 1. Verify authenticated user
    const authClient = await createServerSupabase()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enquiryId } = await req.json()
    if (!enquiryId) {
      return Response.json({ error: 'Missing enquiryId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    )

    // 2. Verify the enquiry belongs to this professional
    // First get the professional profile for this user
    const { data: profile } = await supabase
      .from('professionals')
      .select('id, business_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return Response.json({ error: 'Not a professional' }, { status: 403 })
    }

    // 3. Verify the enquiry is addressed to this professional
    const { data: enquiry } = await supabase
      .from('contact_requests')
      .select('id, professional_id, professional_name')
      .eq('id', enquiryId)
      .single()

    if (!enquiry) {
      return Response.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    const isOwner = enquiry.professional_id === profile.id ||
                    enquiry.professional_name === profile.business_name
    if (!isOwner) {
      return Response.json({ error: 'Forbidden: not your enquiry' }, { status: 403 })
    }

    // 4. Update status
    const { error } = await supabase
      .from('contact_requests')
      .update({ status: 'replied' })
      .eq('id', enquiryId)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (e) {
    console.error('Mark replied error:', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
