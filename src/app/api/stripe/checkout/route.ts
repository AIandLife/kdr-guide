import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  // Pre-validate env vars
  if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured: missing STRIPE_SECRET_KEY' }, { status: 500 })
  if (!process.env.STRIPE_PRICE_ANNUAL) return Response.json({ error: 'Stripe not configured: missing STRIPE_PRICE_ANNUAL' }, { status: 500 })
  if (!process.env.STRIPE_PRICE_MONTHLY) return Response.json({ error: 'Stripe not configured: missing STRIPE_PRICE_MONTHLY' }, { status: 500 })

  // Auth check — only logged-in users can create checkout sessions
  const authClient = await createServerSupabase()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim())
  try {
    const { plan, email, businessName, professionalId, supplierId, entityType,
            abn, licenseType, licenseNumber, yearsExperience,
            regType, licenseNumberSupplier, notes } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    )

    // Save credentials to DB before creating Stripe session
    // Verify the authenticated user owns this professional record
    if (professionalId) {
      const { data: proRow } = await supabase
        .from('professionals')
        .select('id, user_id, email')
        .eq('id', professionalId)
        .single()
      if (!proRow || (proRow.user_id !== user.id && proRow.email !== user.email)) {
        return Response.json({ error: 'Forbidden: you do not own this professional record' }, { status: 403 })
      }
      await supabase
        .from('professionals')
        .update({
          ...(abn ? { abn } : {}),
          ...(licenseType ? { license_type: licenseType } : {}),
          ...(licenseNumber ? { license_number: licenseNumber } : {}),
          ...(yearsExperience ? { years_experience: parseInt(yearsExperience) } : {}),
        })
        .eq('id', professionalId)
    }

    // Verify the authenticated user owns this supplier record
    if (supplierId) {
      const { data: supRow } = await supabase
        .from('supplier_listings')
        .select('id, user_id, email')
        .eq('id', supplierId)
        .single()
      if (!supRow || (supRow.user_id !== user.id && supRow.email !== user.email)) {
        return Response.json({ error: 'Forbidden: you do not own this supplier record' }, { status: 403 })
      }
      await supabase
        .from('supplier_listings')
        .update({
          ...(abn ? { abn } : {}),
          ...(licenseNumberSupplier ? { asic_number: licenseNumberSupplier } : {}),
          ...(regType ? { business_license_note: regType } : {}),
          ...(notes ? { verification_note: notes } : {}),
        })
        .eq('id', supplierId)
    }

    const priceId = (plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY
    )?.trim()

    const isSupplier = entityType === 'supplier'
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ausbuildcircle.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      metadata: {
        businessName: businessName || '',
        professionalId: professionalId || '',
        supplierId: supplierId || '',
        entityType: entityType || 'professional',
      },
      success_url: isSupplier
        ? `${SITE}/suppliers/account?verified=1`
        : `${SITE}/dashboard/pro?verified=1`,
      cancel_url: isSupplier
        ? `${SITE}/suppliers/account?cancelled=1`
        : `${SITE}/dashboard/pro?cancelled=1`,
    })

    return Response.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe checkout error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
