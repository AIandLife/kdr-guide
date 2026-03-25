import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function checkAuth(req: Request) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase()
    .from('professionals')
    .select('id, business_name, contact_name, email, category, state, verified, verification_status, is_demo, created_at')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ professionals: data || [] })
}

export async function PATCH(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, verified } = await req.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await supabase()
    .from('professionals')
    .update({ verified: verified ?? true, verification_status: verified === false ? 'free' : 'verified' })
    .eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  const { error } = await supabase().from('professionals').delete().in('id', ids)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
