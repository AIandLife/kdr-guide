import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
)

// GET /api/reviews?entity_type=professional&entity_id=xxx
export async function GET(req: Request) {
  const url = new URL(req.url)
  const entityType = url.searchParams.get('entity_type')
  const entityId = url.searchParams.get('entity_id')

  if (!entityType || !entityId) {
    return Response.json({ error: 'entity_type and entity_id required' }, { status: 400 })
  }
  if (!['professional', 'supplier'].includes(entityType)) {
    return Response.json({ error: 'entity_type must be professional or supplier' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, reviewer_name, rating, title, body, project_type, suburb, is_verified, created_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Also compute aggregate
  const ratings = (data || []).map(r => r.rating)
  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return Response.json({
    reviews: data || [],
    aggregate: {
      count: ratings.length,
      average: Math.round(avg * 10) / 10,
    },
  })
}

// POST /api/reviews
export async function POST(req: Request) {
  // Check auth via server client
  const serverSupa = await createServerClient()
  const { data: { user } } = await serverSupa.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { entity_type, entity_id, entity_name, rating, title, review_body, project_type, suburb } = body

    if (!entity_type || !entity_id || !entity_name || !rating) {
      return Response.json({ error: 'Missing required fields: entity_type, entity_id, entity_name, rating' }, { status: 400 })
    }
    if (!['professional', 'supplier'].includes(entity_type)) {
      return Response.json({ error: 'entity_type must be professional or supplier' }, { status: 400 })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return Response.json({ error: 'rating must be 1-5' }, { status: 400 })
    }

    // Rate limit: 1 review per entity per user
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .limit(1)

    if (existing && existing.length > 0) {
      return Response.json({ error: 'You have already reviewed this entity' }, { status: 409 })
    }

    // Derive reviewer name from user metadata or email
    const reviewerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

    const { data, error } = await supabaseAdmin.from('reviews').insert({
      reviewer_id: user.id,
      reviewer_name: reviewerName,
      entity_type,
      entity_id,
      entity_name,
      rating,
      title: title || null,
      body: review_body || null,
      project_type: project_type || null,
      suburb: suburb || null,
    }).select('id').single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, id: data.id })
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
