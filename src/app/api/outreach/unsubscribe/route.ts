import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  const token = searchParams.get('token')?.trim()

  if (!email) {
    return new Response(unsubPage('Invalid link.', false), { headers: { 'Content-Type': 'text/html' } })
  }

  // Simple token = base64 of email (prevents random unsubscribes but not a security feature)
  const expectedToken = Buffer.from(email).toString('base64url')
  if (token !== expectedToken) {
    return new Response(unsubPage('Invalid link.', false), { headers: { 'Content-Type': 'text/html' } })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  const { error } = await supabase
    .from('outreach_contacts')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('email', email)

  if (error) {
    console.error('Unsubscribe error:', error)
    return new Response(unsubPage('Something went wrong. Please try again.', false), { headers: { 'Content-Type': 'text/html' } })
  }

  return new Response(unsubPage(email, true), { headers: { 'Content-Type': 'text/html' } })
}

function unsubPage(emailOrError: string, success: boolean): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — AusBuildCircle</title></head>
<body style="font-family:-apple-system,sans-serif;max-width:480px;margin:60px auto;padding:20px;text-align:center;color:#333;">
  <div style="margin-bottom:24px;">
    <img src="https://ausbuildcircle.com/logo-icon.png" width="48" height="48" alt="AusBuildCircle" style="border-radius:12px;">
  </div>
  ${success
    ? `<h1 style="font-size:22px;margin-bottom:12px;">You've been unsubscribed</h1>
       <p style="color:#666;font-size:14px;line-height:1.6;">${emailOrError} has been removed from our mailing list. You won't receive any further emails from us.</p>
       <p style="color:#999;font-size:13px;margin-top:24px;">If this was a mistake, visit <a href="https://ausbuildcircle.com" style="color:#f97316;">AusBuildCircle.com</a> to re-register.</p>`
    : `<h1 style="font-size:22px;margin-bottom:12px;">Oops</h1>
       <p style="color:#666;font-size:14px;">${emailOrError}</p>`
  }
</body></html>`
}
