import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderNewsletter, type NewsletterData } from '@/lib/newsletter/template'

const SECRET = process.env.ADMIN_SECRET || 'MISSING_SECRET'

export async function POST(req: Request) {
  if (req.headers.get('x-admin-secret') !== SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json() as Omit<NewsletterData, 'unsubscribeToken'> & { testEmail?: string }
  const { testEmail, ...newsletterData } = body

  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'
  const subject = `澳洲建房圈 Issue #${String(newsletterData.issueNumber).padStart(2, '0')} · ${newsletterData.heroTitle}`

  // Test mode: send to one email only
  if (testEmail) {
    const html = renderNewsletter({ ...newsletterData, unsubscribeToken: 'test' })
    const result = await resend.emails.send({
      from: `AusBuildCircle 澳洲建房圈 <${FROM}>`,
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html,
    }).catch(err => ({ error: err }))
    return Response.json({ sent: 1, test: true, result })
  }

  // Fetch all active subscribers
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('unsubscribed', false)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!subscribers?.length) return Response.json({ sent: 0, message: 'No subscribers' })

  let sent = 0
  let failed = 0

  // Send in batches of 50 to respect Resend rate limits
  const batchSize = 50
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    await Promise.all(batch.map(async (sub) => {
      const html = renderNewsletter({ ...newsletterData, unsubscribeToken: sub.unsubscribe_token })
      const result = await resend.emails.send({
        from: `AusBuildCircle 澳洲建房圈 <${FROM}>`,
        to: sub.email,
        subject,
        html,
      }).catch(() => null)
      if (result) sent++
      else failed++
    }))
    if (i + batchSize < subscribers.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  return Response.json({ sent, failed, total: subscribers.length })
}
