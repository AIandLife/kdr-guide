import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.ADMIN_SECRET || 'kdr-admin-2025'

export async function GET(req: Request) {
  if (req.headers.get('x-admin-secret') !== SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabase
    .from('feasibility_searches')
    .select('id, suburb, state, lot_size, project_type, council, feasibility_score, created_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ searches: data || [] })
}
