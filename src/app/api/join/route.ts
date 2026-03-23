import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@kdrguide.com.au'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kdrguide.com.au'

  try {
    const body = await req.json()
    const { businessName, contactName, email, phone, state, category, regions, website, description, abn } = body

    if (!businessName || !contactName || !email || !state || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate trial dates
    const trialStart = new Date().toISOString().split('T')[0]
    const trialEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('kdr_professional_applications')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
        state,
        category,
        regions: regions || [],
        website: website || null,
        description: description || null,
        abn: abn || null,
        status: 'pending',
        trial_start_date: trialStart,
        trial_end_date: trialEnd,
      })

    if (dbError) {
      console.error('DB error:', dbError)
      // Don't fail — still send emails
    }

    // Email to admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[澳洲建房圈] New Professional Application — ${businessName}`,
      html: `
        <h2>New Professional Application</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Business Name</td><td style="padding:8px">${businessName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Contact</td><td style="padding:8px">${contactName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${phone || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">State</td><td style="padding:8px">${state}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Category</td><td style="padding:8px">${category}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Regions</td><td style="padding:8px">${Array.isArray(regions) ? regions.join(', ') : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Website</td><td style="padding:8px">${website || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">ABN</td><td style="padding:8px">${abn || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Description</td><td style="padding:8px">${description || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Trial Period</td><td style="padding:8px">${trialStart} → ${trialEnd}</td></tr>
        </table>
        <p style="margin-top:16px"><a href="https://supabase.com/dashboard/project/lhuftwlywgemdjthinwl/editor" style="background:#f97316;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">View in Supabase</a></p>
      `,
    })

    // Confirmation email to professional
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to 澳洲建房圈 Professional Network — ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">Welcome to 澳洲建房圈</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>Hi ${contactName},</p>
            <p>Thank you for applying to join the <strong>澳洲建房圈 Professional Network</strong>. We've received your application for <strong>${businessName}</strong> and our team will review it shortly.</p>

            <div style="background:white;border:2px solid #f97316;border-radius:8px;padding:16px;margin:20px 0">
              <h3 style="margin:0 0 8px;color:#f97316">🎉 Your Free Trial</h3>
              <p style="margin:0">As one of our founding network members, you receive <strong>3 months completely free</strong> — no credit card required.</p>
              <ul style="margin:12px 0 0">
                <li>Trial starts: <strong>${trialStart}</strong></li>
                <li>Trial ends: <strong>${trialEnd}</strong></li>
              </ul>
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px">We'll be in touch before your trial ends with subscription options. No automatic charges.</p>
            </div>

            <p>Once approved, your business will be listed in our directory, connecting you with homeowners actively planning knockdown rebuild projects in your area.</p>

            <p>Questions? Reply to this email anytime.</p>
            <p>The 澳洲建房圈 Team</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true, trialEnd })

  } catch (error) {
    console.error('Join API error:', error)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
