import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'recommendedforterry@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return Response.json({ secret: process.env.ADMIN_SECRET || 'MISSING_SECRET' })
}
