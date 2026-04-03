import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limit: max 3 requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('password_reset_codes')
      .select('id', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Store code in DB
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        email: normalizedEmail,
        code,
        expires_at: expiresAt,
      })

    if (insertError) throw insertError

    // Send code via Resend (plain text)
    const resend = new Resend((process.env.RESEND_API_KEY || '').trim())
    const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim() || 'noreply@ausbuildcircle.com'

    await resend.emails.send({
      from: `AusBuildCircle <${fromEmail}>`,
      to: normalizedEmail,
      subject: `Your verification code: ${code}`,
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;background:#f9fafb;">
  <div style="background:#f97316;padding:28px 24px;text-align:center;border-radius:12px 12px 0 0;">
    <span style="font-weight:800;font-size:20px;color:#fff;letter-spacing:0.5px;">AusBuildCircle</span>
    <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:6px 0 0;">澳洲建房圈</p>
  </div>
  <div style="padding:32px 24px;background:#fff;">
    <h2 style="color:#111;font-size:18px;margin:0 0 8px;font-weight:700;">Password Verification Code</h2>
    <p style="color:#555;font-size:14px;margin:0 0 24px;line-height:1.5;">Enter this code on the website to set your password:<br>请在网页上输入以下验证码来设置密码：</p>
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#f97316;font-family:monospace;">${code}</span>
    </div>
    <p style="color:#999;font-size:12px;margin:0;line-height:1.5;">This code expires in 10 minutes. If you didn't request this, please ignore this email.<br>验证码 10 分钟内有效。如非本人操作，请忽略。</p>
  </div>
  <div style="padding:16px 24px;text-align:center;border-top:1px solid #eee;">
    <span style="color:#bbb;font-size:11px;">AusBuildCircle · <a href="https://ausbuildcircle.com" style="color:#f97316;text-decoration:none;">ausbuildcircle.com</a></span>
  </div>
</div>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Send reset code error:', e)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
