import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('professionals')
    .select('business_name, category, state, regions, description, verified, verification_status, website, wechat')
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })

  return Response.json(data ?? [], {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
