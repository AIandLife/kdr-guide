import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY?.trim())
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'terry@ausbuildcircle.com'
  const FROM = process.env.RESEND_FROM_EMAIL?.trim() || 'terry@ausbuildcircle.com'

  try {
    const body = await req.json()
    const { listingId, businessName, contactName, email, regType, abn, licenseNumber, notes } = body

    if (!listingId || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update listing status to pending_review
    await supabase
      .from('supplier_listings')
      .update({
        status: 'pending_review',
        abn: abn || null,
        asic_number: licenseNumber || null,
        business_license_note: regType,
        verification_note: notes || null,
      })
      .eq('id', listingId)

    // Email admin
    resend.emails.send({
      from: `Terry · 澳洲建房圈 <${FROM}>`,
      to: ADMIN_EMAIL,
      subject: `[认证申请] ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:20px 28px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:18px">🏅 新认证申请</h2>
          </div>
          <div style="background:#f9fafb;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr style="background:white">
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;width:35%">公司名称</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${businessName}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">联系人</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${contactName}</td>
              </tr>
              <tr style="background:white">
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">邮箱</td>
                <td style="padding:10px 14px;font-size:14px;border:1px solid #e5e7eb">
                  <a href="mailto:${email}" style="color:#f97316">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">注册地</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${regType === 'au' ? '🇦🇺 澳洲企业' : '🇨🇳 中国企业'}</td>
              </tr>
              ${abn ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">ABN</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${abn}</td></tr>` : ''}
              ${licenseNumber ? `<tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">营业执照号</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${licenseNumber}</td></tr>` : ''}
              ${notes ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">补充说明</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${notes}</td></tr>` : ''}
            </table>
            <a href="https://ausbuildcircle.com/admin" style="background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">后台审核</a>
          </div>
        </div>
      `,
    }).catch(err => console.error('Verify request email failed:', err))

    return Response.json({ success: true })

  } catch (err) {
    console.error('Verify request error:', err)
    return Response.json({ error: 'Submission failed.' }, { status: 500 })
  }
}
