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

    // Save contact request with homeowner info
    const { error } = await supabase.from('contact_requests').insert({
      homeowner_id: homeowner_id || null,
      homeowner_name,
      homeowner_email,
      homeowner_phone: homeowner_phone || null,
      professional_name,
      professional_category,
      message: message || '',
      suburb: suburb || '',
      project_type: project_type || '',
    })

    if (error) throw error

    // Email notification — try to find the professional's email in DB
    const { data: pro } = await supabase
      .from('professionals')
      .select('email, contact_name')
      .eq('business_name', professional_name)
      .single()

    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@ausbuildcircle.com'
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'terry@kdrguide.com.au'

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <div style="background:#f97316;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="color:white;margin:0;font-size:18px">新询盘 / New Enquiry</h2>
          <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">${professional_name}</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;width:120px;border-bottom:1px solid #f0f0f0">姓名</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${homeowner_name}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">邮箱</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0"><a href="mailto:${homeowner_email}" style="color:#f97316">${homeowner_email}</a></td></tr>
            ${homeowner_phone ? `<tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">电话</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${homeowner_phone}</td></tr>` : ''}
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">Suburb</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${suburb || '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;background:#fff;border-bottom:1px solid #f0f0f0">项目</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${project_type || '—'}</td></tr>
            ${message ? `<tr><td style="padding:8px 12px;font-weight:600;background:#fff">备注</td><td style="padding:8px 12px">${message}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;padding:12px 16px;background:#fff3e0;border-radius:8px;font-size:14px">
            <strong>直接回复</strong>：<a href="mailto:${homeowner_email}" style="color:#f97316">${homeowner_email}</a>
          </div>
        </div>
      </div>
    `

    // Send to professional if found in DB, otherwise to admin
    const toEmail = pro?.email || ADMIN_EMAIL
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      ...(pro?.email ? {} : { subject: `[澳洲建房圈] 新询盘 → ${professional_name}` }),
      subject: `新询盘：${homeowner_name} 来自 ${suburb || '未知区域'}`,
      html: emailHtml,
      replyTo: homeowner_email,
    }).catch(err => console.error('Contact email error:', err))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Contact route error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
