import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/* rate limit: max 3 feedback submissions per hour per IP */
const ipHits = new Map<string, number[]>()
function checkRateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= max) return false
  hits.push(now)
  ipHits.set(ip, hits)
  return true
}

export async function POST(req: Request) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip, 3, 60 * 60 * 1000)) {
    return Response.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'

  try {
    const resend = new Resend((process.env.RESEND_API_KEY || "").trim())
    const { type, message, page, email } = await req.json()
    if (!message?.trim()) return Response.json({ error: 'Message required' }, { status: 400 })

    await supabase.from('site_feedback').insert({
      type: type || 'feedback',
      message: message.trim(),
      page: page || null,
      email: email || null,
    })

    const subjectMap: Record<string, string> = {
      bug: '🐛 Bug报告',
      partnership: '🤝 合作意向',
      feedback: '💬 用户意见',
    }
    const headerMap: Record<string, string> = {
      bug: '🐛 Bug 报告',
      partnership: '🤝 合作意向',
      feedback: '💬 用户反馈',
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[澳洲建房圈 反馈] ${subjectMap[type] ?? '💬 用户意见'}`,
      html: `
        <h3>${headerMap[type] ?? '💬 用户反馈'}</h3>
        <p><strong>页面：</strong>${page || '未知'}</p>
        ${email ? `<p><strong>联系：</strong><a href="mailto:${email}">${email}</a></p>` : ''}
        <p><strong>内容：</strong></p>
        <blockquote style="border-left:4px solid #f97316;padding-left:12px;color:#444">${message}</blockquote>
      `,
    }).catch(() => {})

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
