import Stripe from 'stripe'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { plan, email, businessName } = await req.json()

    const priceId = plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL!
      : process.env.STRIPE_PRICE_MONTHLY!

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      metadata: { businessName: businessName || '' },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ausbuildcircle.com'}/dashboard/pro?verified=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ausbuildcircle.com'}/dashboard/pro?cancelled=1`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
