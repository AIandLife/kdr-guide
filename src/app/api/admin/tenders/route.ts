import { createClient } from '@supabase/supabase-js'

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

/** GET — list all tenders for admin */
export async function GET(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== (process.env.ADMIN_SECRET || '').trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  const { data, error } = await supabase
    .from('government_tenders')
    .select('id, title, description_zh, category_name, source, is_construction, published_at, link, guid')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ tenders: data || [] })
}

/** POST — manually add a tender */
export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== (process.env.ADMIN_SECRET || '').trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const body = await req.json()
    const {
      title,
      description_en,
      description_zh,
      category_name,
      source,
      agency,
      location,
      link,
      close_date,
      is_construction,
    } = body

    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate a unique guid for manual entries
    const guid = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const { data, error } = await supabase
      .from('government_tenders')
      .insert({
        title,
        description_en: description_en || '',
        description_zh: description_zh || '',
        category_name: category_name || '',
        source: source || 'manual',
        agency: agency || '',
        location: location || '',
        link: link || '',
        close_date: parseDate(close_date || '') || null,
        is_construction: is_construction ?? false,
        guid,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, tender: data })
  } catch (err) {
    console.error('Admin add-tender error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE — delete tenders by IDs */
export async function DELETE(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== (process.env.ADMIN_SECRET || '').trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'Missing ids array' }, { status: 400 })
    }

    const { error } = await supabase
      .from('government_tenders')
      .delete()
      .in('id', ids)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, deleted: ids.length })
  } catch (err) {
    console.error('Admin delete-tender error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
