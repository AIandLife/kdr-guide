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
    .from('forum_posts')
    .select('id, title, author_name, category, city, is_demo, created_at, reply_count')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ posts: data || [] })
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  const { error } = await supabase().from('forum_posts').delete().in('id', ids)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
