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
      text: `Your AusBuildCircle verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n你的澳洲建房圈验证码是：${code}\n验证码10分钟内有效。如非本人操作，请忽略。`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Send reset code error:', e)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
