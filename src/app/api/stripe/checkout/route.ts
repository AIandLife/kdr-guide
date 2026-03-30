import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // Pre-validate env vars
  if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured: missing STRIPE_SECRET_KEY' }, { status: 500 })
  if (!process.env.STRIPE_PRICE_ANNUAL) return Response.json({ error: 'Stripe not configured: missing STRIPE_PRICE_ANNUAL' }, { status: 500 })
  if (!process.env.STRIPE_PRICE_MONTHLY) return Response.json({ error: 'Stripe not configured: missing STRIPE_PRICE_MONTHLY' }, { status: 500 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim())
  try {
    const { plan, email, businessName, professionalId, abn, licenseType, licenseNumber, yearsExperience } = await req.json()

    // Save credentials to DB before creating Stripe session
    if (professionalId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
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

    const priceId = (plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY
    )?.trim()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      metadata: {
        businessName: businessName || '',
        professionalId: professionalId || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ausbuildcircle.com'}/dashboard/pro?verified=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ausbuildcircle.com'}/dashboard/pro?cancelled=1`,
    })

    return Response.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe checkout error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
