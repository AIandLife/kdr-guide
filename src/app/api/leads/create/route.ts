import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/* rate limit: max 5 lead submissions per hour per IP */
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
  // Rate limit (no auth required — homeowners need this)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip, 5, 60 * 60 * 1000)) {
    return Response.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )
  const resend = new Resend((process.env.RESEND_API_KEY || "").trim())
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  try {
    const body = await req.json()
    const { proName, proCategory, proState, userName, userEmail, userPhone, suburb, projectType, timeline, message } = body

    if (!proName || !userName || !userEmail || !suburb) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save lead
    await supabase.from('kdr_leads').insert({
      pro_name: proName,
      pro_category: proCategory || null,
      pro_state: proState || null,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone || null,
      suburb,
      project_type: projectType || null,
      timeline: timeline || null,
      message: message || null,
      status: 'new',
    })

    // Email to admin (acts as notification to professional for now)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[KDR Lead] ${esc(userName)} from ${esc(suburb)} → ${esc(proName)}`,
      html: `
        <h2 style="color:#f97316">New KDR Lead</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5;width:140px">Professional</td><td style="padding:8px 12px">${esc(proName)} (${proCategory ? esc(proCategory) : '—'}, ${proState ? esc(proState) : '—'})</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Homeowner</td><td style="padding:8px 12px">${esc(userName)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Email</td><td style="padding:8px 12px"><a href="mailto:${esc(userEmail)}">${esc(userEmail)}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Phone</td><td style="padding:8px 12px">${userPhone ? esc(userPhone) : '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Suburb</td><td style="padding:8px 12px">${esc(suburb)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Project Type</td><td style="padding:8px 12px">${projectType ? esc(projectType) : '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Timeline</td><td style="padding:8px 12px">${timeline ? esc(timeline) : '—'}</td></tr>
          ${message ? `<tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Message</td><td style="padding:8px 12px">${esc(message)}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px;font-size:13px;color:#666">Reply directly to <a href="mailto:${esc(userEmail)}">${esc(userEmail)}</a> to contact this homeowner.</p>
      `,
      replyTo: userEmail,
    })

    // Confirmation to homeowner
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Your enquiry has been sent to ${esc(proName)}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">Enquiry Sent</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>Hi ${esc(userName)},</p>
            <p>Your enquiry has been sent to <strong>${esc(proName)}</strong>. They typically respond within 24–48 hours.</p>
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;font-size:14px">
              <p style="margin:0 0 4px;color:#6b7280">Your enquiry summary:</p>
              <p style="margin:0"><strong>Suburb:</strong> ${esc(suburb)}</p>
              ${projectType ? `<p style="margin:4px 0 0"><strong>Project:</strong> ${esc(projectType)}</p>` : ''}
              ${timeline ? `<p style="margin:4px 0 0"><strong>Timeline:</strong> ${esc(timeline)}</p>` : ''}
            </div>
            <p style="font-size:14px;color:#6b7280">While you wait, you can <a href="https://ausbuildcircle.com/feasibility" style="color:#f97316">run a free AI feasibility check</a> on your suburb to prepare for the conversation.</p>
            <p style="font-size:14px">The 澳洲建房圈 Team</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error('Lead create error:', err)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
