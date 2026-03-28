import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('professionals')
    .select('business_name, category, state, regions, description, verified, verification_status, website, wechat, phone, is_demo, languages')
    .order('is_demo', { ascending: true })        // real professionals first (false < true)
    .order('verified', { ascending: false })       // then verified before unverified
    .order('created_at', { ascending: false })

  return Response.json(data ?? [], {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
