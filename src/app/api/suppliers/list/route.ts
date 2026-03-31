import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('supplier_listings')
    .select('id, business_name, category, origin, description, states, specialties, status, google_rating, google_reviews, featured, website, phone, wechat, email')
    .in('status', ['unverified', 'verified'])
    .order('status', { ascending: false }) // verified first (v > u alphabetically)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Suppliers list error:', error)
    return Response.json({ suppliers: [] })
  }

  // Derive verified boolean from status; strip contact info for unverified
  const sanitized = (data || []).map(s => {
    const verified = s.status === 'verified'
    if (verified) return { ...s, verified, status: undefined }
    return {
      id: s.id,
      business_name: s.business_name,
      category: s.category,
      origin: s.origin,
      description: s.description,
      states: s.states,
      specialties: s.specialties,
      verified,
      featured: s.featured,
      // contact fields hidden for unverified
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
