import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.ADMIN_SECRET || 'MISSING_SECRET'

export async function GET(req: Request) {
  if (req.headers.get('x-admin-secret') !== SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabase
    .from('contact_requests')
    .select('id, homeowner_name, homeowner_email, homeowner_phone, professional_name, professional_category, suburb, project_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ leads: data || [] })
}
