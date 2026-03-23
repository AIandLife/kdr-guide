import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { homeowner_id, professional_name, professional_category, message, suburb, project_type } = body

    // Save contact request
    const { error } = await supabase.from('contact_requests').insert({
      homeowner_id: homeowner_id || null,
      professional_name,
      professional_category,
      message: message || '',
      suburb: suburb || '',
      project_type: project_type || '',
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
