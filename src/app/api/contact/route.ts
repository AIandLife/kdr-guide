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

    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@kdrguide.com.au'

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
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html: emailHtml,
      replyTo: homeowner_email,
    }).catch(err => console.error('Contact email error:', err))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Contact route error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
