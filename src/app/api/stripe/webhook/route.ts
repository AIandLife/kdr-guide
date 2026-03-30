import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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
    const professionalId = session.metadata?.professionalId

    const resend = new Resend((process.env.RESEND_API_KEY || '').trim())
    const FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || 'terry@ausbuildcircle.com').trim()
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'terry@ausbuildcircle.com').trim()

    // Fetch professional by ID (reliable) or fall back to email
    let pro: {
      id: string; email: string; business_name: string;
      abn?: string | null; license_type?: string | null;
      license_number?: string | null; years_experience?: number | null;
    } | null = null

    if (professionalId) {
      const { data } = await supabase
        .from('professionals')
        .select('id, email, business_name, abn, license_type, license_number, years_experience')
        .eq('id', professionalId)
        .single()
      pro = data
    } else if (email) {
      const { data } = await supabase
        .from('professionals')
        .select('id, email, business_name, abn, license_type, license_number, years_experience')
        .eq('email', email)
        .single()
      pro = data
    }

    if (pro) {
      // Set pending — NOT verified; admin must approve
      await supabase
        .from('professionals')
        .update({ verification_status: 'pending', verification_submitted_at: new Date().toISOString() })
        .eq('id', pro.id)

      await supabase
        .from('kdr_professional_applications')
        .update({
          status: 'pending',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          paid_at: new Date().toISOString(),
        })
        .eq('email', pro.email)

      // Email admin to review
      const credLines = [
        pro.abn ? `<li><strong>ABN：</strong>${pro.abn}</li>` : '',
        pro.license_type ? `<li><strong>执照类型：</strong>${pro.license_type}</li>` : '',
        pro.license_number ? `<li><strong>执照号：</strong>${pro.license_number}</li>` : '',
        pro.years_experience ? `<li><strong>从业年限：</strong>${pro.years_experience} 年</li>` : '',
      ].join('')

      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `[审核] 新认证申请 — ${pro.business_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#f97316;padding:20px;border-radius:12px 12px 0 0">
              <h2 style="color:white;margin:0;font-size:18px">新认证申请待审核</h2>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
              <p><strong>公司：</strong>${pro.business_name}</p>
              <p><strong>邮箱：</strong>${pro.email}</p>
              <p><strong>ID：</strong>${pro.id}</p>
              ${credLines ? `<p><strong>提交资质：</strong></p><ul>${credLines}</ul>` : '<p>未提交资质信息</p>'}
              <p>付款已确认，请登录后台审核并一键批准或拒绝。</p>
              <a href="https://ausbuildcircle.com/admin" style="display:inline-block;background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">前往后台审核 →</a>
            </div>
          </div>
        `,
      }).catch(err => console.error('Admin email error:', err))

      // Email professional: payment received, under review
      const proEmail = pro.email || email
      if (proEmail) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: proEmail,
          subject: '付款成功 — 认证申请审核中 | Application Under Review',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:20px">✅ 付款成功</h1>
              </div>
              <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                <p>您好${businessName ? `，<strong>${businessName}</strong>` : ''}，</p>
                <p>我们已收到您的认证申请及付款。您的资质正在审核中，通常 <strong>1–2 个工作日</strong>内完成。</p>
                <p>审核通过后，您将收到确认邮件，您的主页将自动显示认证徽章。</p>
                <p>如有疑问，请直接回复此邮件。</p>
                <p>澳洲建房圈 团队</p>
              </div>
            </div>
          `,
        }).catch(err => console.error('Pro email error:', err))
      }

      console.log(`Payment received (pending review): ${pro.business_name} — ${pro.email}`)
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
