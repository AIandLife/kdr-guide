import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
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

    if (email) {
      // Auto-approve on payment — set verified immediately
      await supabase
        .from('professionals')
        .update({
          verification_status: 'verified',
          verified: true,
        })
        .eq('email', email)

      // Also update kdr_professional_applications if exists
      await supabase
        .from('kdr_professional_applications')
        .update({
          status: 'verified',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          paid_at: new Date().toISOString(),
        })
        .eq('email', email)
    }

    // Send confirmation email to professional
    if (email) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '付款成功 — 认证申请已提交 | Payment Received',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:20px">✅ 付款成功</h1>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
              <p>您好${businessName ? `，<strong>${businessName}</strong>` : ''}，</p>
              <p>我们已收到您的付款，您的认证状态已即时生效。您的主页现在已显示认证徽章，并获得优先排名。</p>
              <p>如有疑问，请直接回复此邮件。</p>
              <p>澳洲建房圈 团队</p>
            </div>
          </div>
        `,
      }).catch(err => console.error('Webhook email error:', err))
    }

    console.log(`Payment received: ${businessName || email} — subscription ${session.subscription}`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    // Downgrade back to free when subscription cancelled
    await supabase
      .from('professionals')
      .update({ verification_status: 'free', verified: false })
      .eq('email', sub.metadata?.email ?? '')

    await supabase
      .from('kdr_professional_applications')
      .update({ status: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)
  }

  return Response.json({ received: true })
}
