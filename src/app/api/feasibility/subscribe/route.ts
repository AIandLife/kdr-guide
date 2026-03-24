import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@kdrguide.com.au'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kdrguide.com.au'

  try {
    const { email, suburb, state, projectType } = await req.json()

    if (!email || !suburb) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save interest record (non-fatal if table doesn't exist)
    await supabase.from('feasibility_interests').insert({
      email,
      suburb,
      state: state || null,
      project_type: projectType || 'kdr',
    })

    // Notify admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[KDR Interest] ${email} — ${suburb}${state ? `, ${state}` : ''}`,
      html: `
        <h2 style="color:#f97316">New Feasibility Interest</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5;width:120px">Email</td><td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Suburb</td><td style="padding:8px 12px">${suburb}${state ? `, ${state}` : ''}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f5f5f5">Project</td><td style="padding:8px 12px">${projectType || 'KDR'}</td></tr>
        </table>
        <p style="margin-top:16px;font-size:13px;color:#666">This user completed a feasibility check and expressed interest in connecting with professionals.</p>
      `,
    }).catch(() => {/* non-fatal */})

    return Response.json({ success: true })

  } catch (err) {
    console.error('Feasibility subscribe error:', err)
    return Response.json({ error: 'Submission failed' }, { status: 500 })
  }
}
