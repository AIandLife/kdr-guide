import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('supplier_listings')
    .select('id, business_name, category, origin, description, states, specialties, status, google_rating, google_reviews, featured, reliability_score, website, phone, wechat, email')
    .in('status', ['unverified', 'pending_review', 'verified'])
    .order('status', { ascending: false }) // verified first
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Suppliers list error:', error)
    return Response.json({ suppliers: [] })
  }

  // For unverified/pending: strip contact info
  const sanitized = (data || []).map(s => {
    if (s.status === 'verified') return s
    return {
      id: s.id,
      business_name: s.business_name,
      category: s.category,
      origin: s.origin,
      description: s.description,
      states: s.states,
      specialties: s.specialties,
      status: s.status,
      featured: s.featured,
      reliability_score: s.reliability_score,
      // contact fields hidden
      website: null,
      phone: null,
      wechat: null,
      email: null,
      google_rating: null,
      google_reviews: null,
    }
  })

  return Response.json({ suppliers: sanitized })
}
