import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
