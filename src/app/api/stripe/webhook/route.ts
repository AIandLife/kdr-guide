import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email
    const businessName = session.metadata?.businessName

    // Update professional application status to pending
    if (email) {
      await supabase
        .from('kdr_professional_applications')
        .update({
          status: 'pending',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          paid_at: new Date().toISOString(),
        })
        .eq('email', email)
    }

    console.log(`Payment received: ${businessName || email} — subscription ${session.subscription}`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    // Downgrade back to free when subscription cancelled
    await supabase
      .from('kdr_professional_applications')
      .update({ status: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)
  }

  return Response.json({ received: true })
}
