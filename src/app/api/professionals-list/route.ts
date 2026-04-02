import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('professionals')
    .select('business_name, category, state, regions, description, description_en, verified, website, wechat, phone, is_demo, languages')
    .order('is_demo', { ascending: true })
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })

  // Strip internal fields; hide contact info for unverified professionals
  const cleaned = (data ?? []).map(({ is_demo: _d, ...rest }) => {
    if (!rest.verified) {
      return { ...rest, phone: null, wechat: null, website: null }
    }
    return rest
  })

  return Response.json(cleaned, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
