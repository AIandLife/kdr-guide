import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  // Try to get authenticated user (optional — suppliers may register before login)
  let authUserId: string | null = null
  try {
    const authClient = await createServerSupabase()
    const { data: { user } } = await authClient.auth.getUser()
    if (user) authUserId = user.id
  } catch { /* not logged in — that's fine */ }
  const resend = new Resend((process.env.RESEND_API_KEY || "").trim())
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

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

    // Auto-polish short descriptions with AI
    let polishedDesc = description || ''
    if (!polishedDesc || polishedDesc.length < 50) {
      try {
        const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
        if (apiKey) {
          const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 300,
              messages: [{ role: 'user', content: `Write a professional 2-3 sentence business description for a building materials supplier. Be factual, no marketing fluff.

Business: ${businessName}
Category: ${category}
Origin: ${origin}
Existing description: ${polishedDesc || 'none'}

Return ONLY the description text, nothing else. Write in the same language as the existing description (Chinese if Chinese, English if English). If no existing description, write in English.` }],
            }),
          })
          if (aiRes.ok) {
            const aiData = await aiRes.json()
            const text = aiData.content?.[0]?.text?.trim() || ''
            if (text && text.length > 20) polishedDesc = text
          }
        }
      } catch { /* non-critical */ }
    }

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
        description: polishedDesc || null,
        states: states || [],
        specialties: specialties || [],
        status,
        asic_number: asicNumber || null,
        business_license_note: businessLicenseNote || null,
        verification_note: verificationNote || null,
        ...(authUserId ? { user_id: authUserId } : {}),
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
      subject: `[澳洲建房圈] New Supplier Listing — ${esc(businessName)} (${status})`,
      html: `
        <h2>New Supplier Listing Submitted</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Business</td><td style="padding:8px">${esc(businessName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Contact</td><td style="padding:8px">${esc(contactName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px">${esc(email)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Category</td><td style="padding:8px">${esc(category)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Origin</td><td style="padding:8px">${esc(origin)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Status</td><td style="padding:8px"><strong>${status}</strong></td></tr>
          ${isVerificationRequest ? `<tr><td style="padding:8px;font-weight:bold;background:#fff3cd">Verification</td><td style="padding:8px">ABN/ASIC: ${asicNumber ? esc(asicNumber) : '—'}<br>${verificationNote ? esc(verificationNote) : ''}</td></tr>` : ''}
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
      subject: `入驻申请已收到 — ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">✅ 入驻申请已收到</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="color:#111827">Hi ${esc(contactName)}，</p>
            <p style="color:#374151">感谢你将 <strong>${esc(businessName)}</strong> 提交至澳洲建房圈建材目录。</p>
            <p style="color:#374151">我们会在 1–2 个工作日内完成审核，审核通过后你的商家信息将对买家和业主可见。</p>
            <p style="color:#374151">如有问题，直接回复本邮件即可。</p>
            <p style="color:#374151">澳洲建房圈团队</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">
              <a href="https://ausbuildcircle.com/suppliers" style="color:#f97316">浏览建材目录</a> ·
              <a href="https://ausbuildcircle.com/suppliers/account" style="color:#f97316">管理我的商家信息</a>
            </p>
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
