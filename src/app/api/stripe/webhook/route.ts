import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { lookupAbn } from '@/lib/abn-lookup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim())
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, (process.env.STRIPE_WEBHOOK_SECRET || '').trim())
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email
    const businessName = session.metadata?.businessName

    if (email) {
      // Fetch ABN + registration country — columns may not exist yet (added later)
      let pro: { abn?: string | null; registration_country?: string | null } | null = null
      try {
        const { data } = await supabase
          .from('professionals')
          .select('abn, registration_country')
          .eq('email', email)
          .single()
        pro = data
      } catch { /* columns may not exist yet — fall through to auto-verify */ }

      const isAustralian = !pro?.registration_country || pro.registration_country === 'australia'
      const hasAbn = !!pro?.abn?.trim()

      let verified = true
      let verifyNote = ''

      if (isAustralian && hasAbn) {
        // Verify ABN via Australian Business Register
        const abnResult = await lookupAbn(pro!.abn!)
        if (abnResult.isActive) {
          verified = true
          verifyNote = `ABN verified: ${abnResult.entityName} (${abnResult.state})`
          console.log(`ABN verified for ${email}: ${verifyNote}`)
        } else if (abnResult.isValid && !abnResult.isActive) {
          // ABN exists but is cancelled — still verify for now, flag it
          verified = true
          verifyNote = `ABN found but inactive: ${abnResult.entityName}`
          console.warn(`ABN inactive for ${email}: ${verifyNote}`)
        } else {
          // ABN not found — still set verified (paid customer), but log for review
          verified = true
          verifyNote = `ABN lookup failed: ${abnResult.rawMessage}`
          console.warn(`ABN not found for ${email}: ${verifyNote}`)
        }
      } else if (!isAustralian) {
        // Non-Australian business (China / Other) — auto-verify on payment
        verified = true
        verifyNote = `Non-Australian business (${pro?.registration_country || 'unknown'}) — auto-verified`
      } else {
        // No ABN provided — still verify (they paid)
        verified = true
        verifyNote = 'No ABN provided — auto-verified on payment'
      }

      await supabase
        .from('professionals')
        .update({ verification_status: 'verified', verified })
        .eq('email', email)

      await supabase
        .from('kdr_professional_applications')
        .update({
          status: 'verified',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          paid_at: new Date().toISOString(),
        })
        .eq('email', email)

      // Send confirmation email
      const resend = new Resend(process.env.RESEND_API_KEY)
      const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'

      const abnLine = verifyNote ? `<p style="font-size:13px;color:#6b7280">验证备注：${verifyNote}</p>` : ''

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
              ${abnLine}
              <p>如有疑问，请直接回复此邮件。</p>
              <p>澳洲建房圈 团队</p>
            </div>
          </div>
        `,
      }).catch(err => console.error('Webhook email error:', err))

      console.log(`Payment received: ${businessName || email} — ${verifyNote}`)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription

    // Look up email via stripe_subscription_id (metadata.email is empty on subscription objects)
    const { data: appRow } = await supabase
      .from('kdr_professional_applications')
      .select('email')
      .eq('stripe_subscription_id', sub.id)
      .single()

    await supabase
      .from('kdr_professional_applications')
      .update({ status: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)

    if (appRow?.email) {
      await supabase
        .from('professionals')
        .update({ verification_status: 'free', verified: false })
        .eq('email', appRow.email)
      console.log(`Subscription cancelled: ${appRow.email}`)
    }
  }

  return Response.json({ received: true })
}
