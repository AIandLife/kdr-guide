import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

/* rate limit: max 10 uploads per hour per IP */
const ipHits = new Map<string, number[]>()
function checkRateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= max) return false
  hits.push(now)
  ipHits.set(ip, hits)
  return true
}

export async function POST(req: Request) {
  // Auth check
  const authClient = await createServerSupabase()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized — please log in to upload images' }, { status: 401 })
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip, 10, 60 * 60 * 1000)) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return Response.json({ error: 'No file' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('forum-images')
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('forum-images')
      .getPublicUrl(path)

    return Response.json({ url: publicUrl })
  } catch (err) {
    console.error('Image upload error:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
