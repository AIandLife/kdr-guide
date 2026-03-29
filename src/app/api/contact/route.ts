import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      homeowner_id, homeowner_name, homeowner_email, homeowner_phone,
      professional_name, professional_category, message, suburb, project_type,
    } = body

    if (!homeowner_name || !homeowner_email || !professional_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Rate limit: max 3 contact requests from same email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('homeowner_email', homeowner_email)
      .gte('created_at', oneHourAgo)
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Too many requests. Please wait before sending more.' }, { status: 429 })
    }

    // HTML-escape user-supplied content before embedding in emails
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

    // Look up professional first (need id + is_demo)
    const { data: pro } = await supabase
      .from('professionals')
      .select('id, email, contact_name, is_demo')
      .eq('business_name', professional_name)
      .single()

    // Save contact request with homeowner info + professional_id FK
    const { error } = await supabase.from('contact_requests').insert({
      homeowner_id: homeowner_id || null,
      homeowner_name,
      homeowner_email,
      homeowner_phone: homeowner_phone || null,
      professional_name,
      professional_category,
      professional_id: pro?.id || null,
      message: message || '',
      suburb: suburb || '',
      project_type: project_type || '',
    })

    if (error) throw error

    const resend = new Resend(process.env.RESEND_API_KEY?.trim())
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'terry@ausbuildcircle.com'
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'terry@ausbuildcircle.com'

    const toAdmin = !pro?.email || pro.is_demo
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <div style="background:#f97316;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="color:white;margin:0;font-size:18px">新询盘 / New Enquiry</h2>
          <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">${esc(professional_name)}</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          ${toAdmin ? `<p style="background:#fff3e0;padding:8px 12px;border-radius:6px;font-size:13px;color:#92400e;margin:0 0 12px">⚠️ Demo listing — forwarded to admin</p>` : ''}
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;width:120px;border-bottom:1px solid #f0f0f0">姓名</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${esc(homeowner_name)}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">邮箱</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0"><a href="mailto:${esc(homeowner_email)}" style="color:#f97316">${esc(homeowner_email)}</a></td></tr>
            ${homeowner_phone ? `<tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">电话</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${esc(homeowner_phone)}</td></tr>` : ''}
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">Suburb</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${esc(suburb || '—')}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">项目</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${esc(project_type || '—')}</td></tr>
            ${message ? `<tr><td style="padding:8px 12px;font-weight:600;background:#fff">备注</td><td style="padding:8px 12px">${esc(message)}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;padding:12px 16px;background:#fff3e0;border-radius:8px;font-size:14px">
            <strong>直接回复</strong>：<a href="mailto:${esc(homeowner_email)}" style="color:#f97316">${esc(homeowner_email)}</a>
          </div>
        </div>
      </div>
    `

    const toEmail = toAdmin ? ADMIN_EMAIL : pro!.email
    const subject = toAdmin
      ? `[澳洲建房圈] 新询盘 → ${professional_name} (${homeowner_name})`
      : `新询盘：${homeowner_name} 来自 ${suburb || '未知区域'}`
    await resend.emails.send({
      from: `Terry · 澳洲建房圈 <${FROM_EMAIL}>`,
      to: toEmail,
      subject,
      html: emailHtml,
      replyTo: homeowner_email,
    }).catch(err => console.error('Contact email error:', err))

    // Buyer confirmation
    resend.emails.send({
      from: `Terry · 澳洲建房圈 <${FROM_EMAIL}>`,
      to: homeowner_email,
      subject: `询盘已发送 — ${professional_name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:20px 28px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:20px">✅ 询盘已成功发送</h2>
          </div>
          <div style="background:#f9fafb;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
            <p style="color:#111827">Hi ${esc(homeowner_name)}，</p>
            <p style="color:#374151">你对 <strong>${esc(professional_name)}</strong> 的询盘已通过澳洲建房圈发出。专业人士通常会在 1–2 个工作日内与你联系。</p>
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151">询盘摘要</p>
              ${suburb ? `<p style="margin:0;font-size:13px;color:#6b7280"><strong>地区：</strong>${esc(suburb)}</p>` : ''}
              ${project_type ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>项目：</strong>${esc(project_type)}</p>` : ''}
              ${message ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280"><strong>备注：</strong>${esc(message)}</p>` : ''}
            </div>
            <p style="color:#374151;font-size:14px">如有疑问，直接回复本邮件即可。</p>
            <p style="color:#374151;font-size:14px">澳洲建房圈团队</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">
              <a href="https://ausbuildcircle.com/professionals" style="color:#f97316">浏览更多专业人士</a> ·
              <a href="https://ausbuildcircle.com/suppliers" style="color:#f97316">建材目录</a>
            </p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Buyer confirmation email error:', err))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Contact route error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
