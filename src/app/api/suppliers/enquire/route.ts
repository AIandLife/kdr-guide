import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY?.trim())
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'terry@ausbuildcircle.com'
  const FROM = process.env.RESEND_FROM_EMAIL?.trim() || 'terry@ausbuildcircle.com'

  try {
    const body = await req.json()
    const {
      supplierId, supplierName, supplierCategory, supplierEmail,
      buyerName, buyerEmail, buyerPhone,
      suburb, projectType, productsNeeded, quantityEstimate, timeline, message,
    } = body

    if (!supplierName || !buyerName || !buyerEmail || !productsNeeded) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Rate limit: max 3 inquiries per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('supplier_inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_email', buyerEmail)
      .gte('created_at', oneHourAgo)
    if ((count ?? 0) >= 3) {
      return Response.json({ error: 'Too many requests. Please wait before sending another enquiry.' }, { status: 429 })
    }

    // Save to DB
    await supabase.from('supplier_inquiries').insert({
      supplier_id: supplierId || null,
      supplier_name: supplierName,
      supplier_category: supplierCategory || null,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone || null,
      suburb: suburb || null,
      project_type: projectType || null,
      products_needed: productsNeeded,
      quantity_estimate: quantityEstimate || null,
      timeline: timeline || null,
      message: message || null,
    })

    const toEmail = supplierEmail || ADMIN_EMAIL
    const isForwarded = !supplierEmail

    // Email to supplier (or admin if no supplier email)
    resend.emails.send({
      from: `Terry · 澳洲建房圈 <${FROM}>`,
      to: toEmail,
      replyTo: buyerEmail,
      subject: `[新询价] ${supplierName} — ${productsNeeded.slice(0, 50)}`,
      html: `
        <div style="font-family:sans-serif;max-width:620px;margin:0 auto">
          <div style="background:#f97316;padding:20px 28px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:20px">📋 新询价单</h2>
            <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">
              ${isForwarded ? `[由澳洲建房圈转发] 针对 ${supplierName} 的询价` : `来自澳洲建房圈的客户询价`}
            </p>
          </div>
          <div style="background:#f9fafb;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr style="background:white">
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;width:35%">客户姓名</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${buyerName}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">邮箱</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">
                  <a href="mailto:${buyerEmail}" style="color:#f97316">${buyerEmail}</a>
                </td>
              </tr>
              ${buyerPhone ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">电话</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${buyerPhone}</td></tr>` : ''}
              ${suburb ? `<tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">项目地区</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${suburb}</td></tr>` : ''}
              ${projectType ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">项目类型</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${projectType}</td></tr>` : ''}
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">所需产品</td>
                <td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${productsNeeded}</td>
              </tr>
              ${quantityEstimate ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">数量/面积</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${quantityEstimate}</td></tr>` : ''}
              ${timeline ? `<tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb;background:#f9fafb">项目时间线</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb;background:#f9fafb">${timeline}</td></tr>` : ''}
              ${message ? `<tr style="background:white"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#374151;border:1px solid #e5e7eb">备注</td><td style="padding:10px 14px;font-size:14px;color:#111827;border:1px solid #e5e7eb">${message}</td></tr>` : ''}
            </table>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin-bottom:20px">
              <p style="margin:0;font-size:13px;color:#c2410c;font-weight:600">💡 请直接回复此邮件联系客户</p>
              <p style="margin:6px 0 0;font-size:13px;color:#92400e">客户邮箱：<a href="mailto:${buyerEmail}" style="color:#f97316">${buyerEmail}</a>${buyerPhone ? `　电话：${buyerPhone}` : ''}</p>
            </div>

            <p style="font-size:12px;color:#9ca3af;margin:0">本询价单由 <a href="https://ausbuildcircle.com/suppliers" style="color:#f97316">澳洲建房圈建材商目录</a> 生成</p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Supplier email failed:', err))

    // Confirmation to buyer
    resend.emails.send({
      from: `Terry · 澳洲建房圈 <${FROM}>`,
      to: buyerEmail,
      subject: `询价已发送 — ${supplierName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:20px 28px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:20px">✅ 询价已成功发送</h2>
          </div>
          <div style="background:#f9fafb;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
            <p style="color:#111827">Hi ${buyerName}，</p>
            <p style="color:#374151">你对 <strong>${supplierName}</strong> 的询价已通过澳洲建房圈发送。供应商通常会在 1-2 个工作日内与你联系。</p>

            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151">你的询价摘要</p>
              <p style="margin:0;font-size:13px;color:#6b7280"><strong>供应商：</strong>${supplierName}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>所需产品：</strong>${productsNeeded}</p>
              ${quantityEstimate ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>数量/面积：</strong>${quantityEstimate}</p>` : ''}
              ${timeline ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>时间线：</strong>${timeline}</p>` : ''}
            </div>

            <p style="color:#374151;font-size:14px">如有疑问，回复本邮件联系我们。</p>
            <p style="color:#374151;font-size:14px">澳洲建房圈团队</p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">
              <a href="https://ausbuildcircle.com/suppliers" style="color:#f97316">浏览更多建材商</a> ·
              <a href="https://ausbuildcircle.com/professionals" style="color:#f97316">找专业人士</a>
            </p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Buyer confirmation email failed:', err))

    return Response.json({ success: true })

  } catch (err) {
    console.error('Supplier enquiry error:', err)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
