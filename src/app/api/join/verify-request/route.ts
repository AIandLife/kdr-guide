import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { email, businessName, category, verifyDocs } = await req.json()
    if (!email || !businessName) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@ausbuildcircle.com'
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'

    const docRows = Object.entries(verifyDocs ?? {})
      .map(([label, val]) => `<tr><td style="padding:6px 10px;font-weight:600;background:#f9fafb;width:160px">${label}</td><td style="padding:6px 10px">${val || '—'}</td></tr>`)
      .join('')

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[澳洲建房圈] Verification Request — ${businessName}`,
      html: `
        <h2>Verification Request</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 10px;font-weight:600;background:#f9fafb;width:160px">Business</td><td style="padding:6px 10px">${businessName}</td></tr>
          <tr><td style="padding:6px 10px;font-weight:600;background:#f9fafb">Email</td><td style="padding:6px 10px">${email}</td></tr>
          <tr><td style="padding:6px 10px;font-weight:600;background:#f9fafb">Category</td><td style="padding:6px 10px">${category || '—'}</td></tr>
          ${docRows}
        </table>
        <p style="margin-top:16px"><a href="https://supabase.com/dashboard/project/nojfkmxcpdqzyrayvujv/editor" style="background:#f97316;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">View in Supabase</a></p>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('verify-request error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
