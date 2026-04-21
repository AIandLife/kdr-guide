import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const resend = new Resend((process.env.RESEND_API_KEY || "").trim())
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  try {
    const body = await req.json()
    const { businessName, contactName, email: rawEmail, phone, state, category, regions, website, description, businessNameEn, contactNameEn, descriptionEn, userId, languages } = body

    if (!businessName || !contactName || !rawEmail || !state || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const email = String(rawEmail).toLowerCase().trim()

    // Simple rate limit: reject if same email submitted in last 60 minutes
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentApp } = await supabase
      .from('kdr_professional_applications')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo)
      .limit(1)
      .maybeSingle()
    if (recentApp) {
      return Response.json({ error: 'Application already submitted recently. Please wait before trying again.' }, { status: 429 })
    }

    // Calculate trial dates
    const trialStart = new Date().toISOString().split('T')[0]
    const trialEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('kdr_professional_applications')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
        state,
        category,
        regions: regions || [],
        website: website || null,
        description: description || null,
        business_name_en: businessNameEn || null,
        contact_name_en: contactNameEn || null,
        description_en: descriptionEn || null,
        status: 'pending',
        trial_start_date: trialStart,
        trial_end_date: trialEnd,
      })

    if (dbError) {
      console.error('DB error (applications):', dbError)
      return Response.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // Auto-polish short descriptions with AI
    let polishedDesc = description || ''
    let polishedDescEn = descriptionEn || ''
    if (polishedDesc || businessName) {
      const needsPolish = !polishedDesc || polishedDesc.length < 50
      const needsEn = !polishedDescEn || polishedDescEn.length < 30
      if (needsPolish || needsEn) {
        try {
          const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
          if (apiKey) {
            const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
              body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 400,
                messages: [{ role: 'user', content: `You are helping a building professional write their business listing description. Based on the info below, write two descriptions (2-3 sentences each, professional and factual, no marketing fluff).

Business: ${businessName}
Category: ${category}
State: ${state}
Existing description: ${polishedDesc || 'none'}
Website: ${website || 'none'}

Return ONLY valid JSON: {"zh":"中文描述","en":"English description"}` }],
              }),
            })
            if (aiRes.ok) {
              const aiData = await aiRes.json()
              let text = aiData.content?.[0]?.text?.trim() || ''
              text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
              try {
                const parsed = JSON.parse(text)
                if (needsPolish && parsed.zh) polishedDesc = parsed.zh
                if (needsEn && parsed.en) polishedDescEn = parsed.en
              } catch { /* keep original */ }
            }
          }
        } catch { /* AI failure is non-critical, keep original description */ }
      }
    }

    // Also create/update in professionals table so dashboard works
    // But first: if already verified, don't overwrite their record
    const { data: existingPro } = await supabase
      .from('professionals')
      .select('id, verified')
      .eq('email', email)
      .maybeSingle()

    let professionalId: string | null = null

    if (existingPro?.verified) {
      // Already registered and verified — skip upsert to preserve their data
      professionalId = existingPro.id
    } else {
      const { data: profRow } = await supabase
        .from('professionals')
        .upsert({
          business_name: businessName,
          contact_name: contactName,
          email,
          phone: phone || null,
          state,
          category,
          regions: regions || [],
          website: website || null,
          description: polishedDesc || null,
          verified: false,
          verification_status: 'free',
          business_name_en: businessNameEn || null,
          contact_name_en: contactNameEn || null,
          description_en: polishedDescEn || null,
          ...(userId ? { user_id: userId } : {}),
          languages: languages || ['English'],
        }, { onConflict: 'email' })
        .select('id')
        .single()
      professionalId = profRow?.id ?? null
    }

    // Emails — fire-and-forget, failures don't affect the response
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[澳洲建房圈] New Professional Application — ${esc(businessName)}`,
      html: `
        <h2>New Professional Application</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Business Name</td><td style="padding:8px">${esc(businessName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Contact</td><td style="padding:8px">${esc(contactName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px">${esc(email)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${phone ? esc(phone) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">State</td><td style="padding:8px">${esc(state)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Category</td><td style="padding:8px">${esc(category)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Regions</td><td style="padding:8px">${Array.isArray(regions) ? esc(regions.join(', ')) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Website</td><td style="padding:8px">${website ? esc(website) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Description</td><td style="padding:8px">${description ? esc(description) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">EN Business Name</td><td style="padding:8px">${businessNameEn ? esc(businessNameEn) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Trial Period</td><td style="padding:8px">${trialStart} → ${trialEnd}</td></tr>
        </table>
        <p style="margin-top:16px"><a href="https://supabase.com/dashboard/project/nojfkmxcpdqzyrayvujv/editor" style="background:#f97316;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">View in Supabase</a></p>
      `,
    }).catch(err => console.error('Admin email failed:', err))

    resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to 澳洲建房圈 Professional Network — ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">Welcome to 澳洲建房圈</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>Hi ${esc(contactName)},</p>
            <p>Thank you for applying to join the <strong>澳洲建房圈 Professional Network</strong>. We've received your application for <strong>${esc(businessName)}</strong> and our team will review it shortly.</p>

            <div style="background:white;border:2px solid #f97316;border-radius:8px;padding:16px;margin:20px 0">
              <h3 style="margin:0 0 8px;color:#f97316">🎉 Your Free Trial</h3>
              <p style="margin:0">As one of our founding network members, you receive <strong>3 months completely free</strong> — no credit card required.</p>
              <ul style="margin:12px 0 0">
                <li>Trial starts: <strong>${trialStart}</strong></li>
                <li>Trial ends: <strong>${trialEnd}</strong></li>
              </ul>
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px">We'll be in touch before your trial ends with subscription options. No automatic charges.</p>
            </div>

            <p>Once approved, your business will be listed in our directory, connecting you with homeowners planning knockdown rebuild, renovation, extension, and other residential projects in your area.</p>

            <p>Questions? Reply to this email anytime.</p>
            <p>The 澳洲建房圈 Team</p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Confirmation email failed:', err))

    return Response.json({ success: true, trialEnd, professionalId })

  } catch (error) {
    console.error('Join API error:', error)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
