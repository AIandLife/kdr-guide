import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@ausbuildcircle.com'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'

  try {
    const body = await req.json()
    const {
      businessName, contactName, email, phone, website, wechat, abn,
      category, origin, description, states, specialties,
      // verification fields (optional on first submit)
      asicNumber, businessLicenseNote, verificationNote,
    } = body

    if (!businessName || !contactName || !email || !category || !origin) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('supplier_listings')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      return Response.json(
        { error: 'A listing with this email already exists.', existing },
        { status: 409 }
      )
    }

    const isVerificationRequest = !!(asicNumber || businessLicenseNote || verificationNote)
    const status = isVerificationRequest ? 'pending_review' : 'unverified'

    const { data: row, error: dbError } = await supabase
      .from('supplier_listings')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
        website: website || null,
        wechat: wechat || null,
        abn: abn || null,
        category,
        origin,
        description: description || null,
        states: states || [],
        specialties: specialties || [],
        status,
        asic_number: asicNumber || null,
        business_license_note: businessLicenseNote || null,
        verification_note: verificationNote || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return Response.json({ error: 'Failed to save listing.' }, { status: 500 })
    }

    // Admin notification
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[澳洲建房圈] New Supplier Listing — ${businessName} (${status})`,
      html: `
        <h2>New Supplier Listing Submitted</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Business</td><td style="padding:8px">${businessName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Contact</td><td style="padding:8px">${contactName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Category</td><td style="padding:8px">${category}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Origin</td><td style="padding:8px">${origin}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Status</td><td style="padding:8px"><strong>${status}</strong></td></tr>
          ${isVerificationRequest ? `<tr><td style="padding:8px;font-weight:bold;background:#fff3cd">Verification</td><td style="padding:8px">ABN/ASIC: ${asicNumber || '—'}<br>${verificationNote || ''}</td></tr>` : ''}
        </table>
        <p style="margin-top:16px">
          <a href="https://ausbuildcircle.com/admin/suppliers" style="background:#f97316;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">Review in Admin</a>
        </p>
      `,
    }).catch(() => {/* non-fatal */})

    // Confirmation to submitter
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your 澳洲建房圈 listing has been received — ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">澳洲建房圈 — Listing Received</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>Hi ${contactName},</p>
            <p>Thank you for submitting <strong>${businessName}</strong> to the 澳洲建房圈 directory.</p>
            ${status === 'unverified'
              ? `<div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
                  <p style="margin:0 0 8px;font-weight:bold">Current status: Unverified</p>
                  <p style="margin:0;color:#6b7280;font-size:14px">Your business name has been added to our directory. Contact details and website are not publicly shown until verified.</p>
                  <p style="margin:12px 0 0;font-size:14px">To get verified and have your full profile displayed, reply to this email or visit <a href="https://ausbuildcircle.com/suppliers/register">ausbuildcircle.com/suppliers/register</a> to complete your verification application.</p>
                </div>`
              : `<div style="background:white;border:2px solid #f97316;border-radius:8px;padding:16px;margin:16px 0">
                  <p style="margin:0 0 8px;font-weight:bold;color:#f97316">Verification application received</p>
                  <p style="margin:0;color:#6b7280;font-size:14px">We'll review your documents and get back to you within 2 business days.</p>
                </div>`
            }
            <p>Questions? Reply to this email anytime.</p>
            <p>The 澳洲建房圈 Team</p>
          </div>
        </div>
      `,
    }).catch(() => {/* non-fatal */})

    return Response.json({ success: true, id: row.id, status })

  } catch (err) {
    console.error('Supplier register error:', err)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
