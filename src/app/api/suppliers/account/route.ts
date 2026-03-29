import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }

  const { data: listing, error } = await supabase
    .from('supplier_listings')
    .select('id, business_name, contact_name, email, phone, website, wechat, abn, category, states, specialties, description, status, created_at')
    .eq('email', email)
    .single()

  if (error || !listing) {
    return Response.json({ listing: null })
  }

  return Response.json({ listing })
}
