import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kdrguide.com.au'

  try {
    const { id, action, adminNotes } = await req.json()
    // action: 'approve' | 'reject'

    if (!id || !action) {
      return Response.json({ error: 'Missing id or action' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected'

    const { data: supplier, error: fetchErr } = await supabase
      .from('supplier_listings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !supplier) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { error: updateErr } = await supabase
      .from('supplier_listings')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        verified_at: action === 'approve' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (updateErr) {
      return Response.json({ error: 'Update failed' }, { status: 500 })
    }

    // Send email to supplier
    if (action === 'approve') {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: supplier.email,
        subject: `✅ Your 澳洲建房圈 listing is now Verified — ${supplier.business_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:22px">You're Verified on 澳洲建房圈</h1>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
              <p>Hi ${supplier.contact_name},</p>
              <p>Great news — <strong>${supplier.business_name}</strong> has been verified on 澳洲建房圈. Your full profile is now publicly visible in our directory, including your contact details, website, and WeChat.</p>
              <div style="background:white;border:2px solid #22c55e;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:0;color:#16a34a;font-weight:bold">✅ Verified status active</p>
                <p style="margin:8px 0 0;color:#6b7280;font-size:14px">Your listing now appears with priority ranking and the Verified badge. Homeowners can see your contact details and reach you directly.</p>
              </div>
              ${adminNotes ? `<p style="color:#6b7280;font-size:14px">Note from our team: ${adminNotes}</p>` : ''}
              <p>View your listing: <a href="https://ausbuildcircle.com/suppliers">ausbuildcircle.com/suppliers</a></p>
              <p>The 澳洲建房圈 Team</p>
            </div>
          </div>
        `,
      }).catch(() => {})
    } else {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: supplier.email,
        subject: `澳洲建房圈 — Verification update for ${supplier.business_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <p>Hi ${supplier.contact_name},</p>
            <p>We've reviewed your verification application for <strong>${supplier.business_name}</strong>.</p>
            ${adminNotes ? `<p>Feedback from our team: ${adminNotes}</p>` : ''}
            <p>Please reply to this email if you have questions or would like to resubmit.</p>
            <p>The 澳洲建房圈 Team</p>
          </div>
        `,
      }).catch(() => {})
    }

    return Response.json({ success: true, status: newStatus })

  } catch (err) {
    console.error('Approve supplier error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
