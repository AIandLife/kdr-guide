import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

/**
 * 对接大厅 — a listed professional responds to a brief.
 *
 * Flow keeps the homeowner in control: the merchant's pitch + contact details
 * are emailed TO the homeowner. The homeowner's contact info is never given
 * to the merchant.
 *
 * Requires: logged-in user with a professionals profile (free listing is
 * enough — requiring paid verification would kill liquidity at this stage).
 */

export async function POST(req: Request) {
  try {
    // 1. Must be logged in
    const authClient = await createServerSupabase()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { briefId, message } = await req.json()
    if (!briefId || !message || String(message).trim().length < 10) {
      return Response.json({ error: 'Please write a short message to the homeowner (at least 10 characters).' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    )

    // 2. Must have a professional profile (matched by user_id, else by email)
    let { data: pro } = await supabase
      .from('professionals')
      .select('id, business_name, contact_name, email, phone, wechat, website, category, verified')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!pro && user.email) {
      const { data: byEmail } = await supabase
        .from('professionals')
        .select('id, business_name, contact_name, email, phone, wechat, website, category, verified')
        .eq('email', user.email.toLowerCase())
        .maybeSingle()
      pro = byEmail
    }
    if (!pro) {
      return Response.json({ error: 'no_profile' }, { status: 403 })
    }

    // 3. Brief must exist and be live
    const { data: brief } = await supabase
      .from('project_briefs')
      .select('id, suburb, state, project_type, kind, contact_name, contact_email, response_count')
      .eq('id', briefId)
      .eq('status', 'live')
      .maybeSingle()
    if (!brief) {
      return Response.json({ error: 'Brief not found or no longer open.' }, { status: 404 })
    }

    // 4. One response per professional per brief (unique constraint backs this)
    const { error: insError } = await supabase
      .from('brief_responses')
      .insert({
        brief_id: brief.id,
        professional_id: pro.id,
        message: String(message).slice(0, 2000),
        contact_snapshot: {
          business_name: pro.business_name,
          contact_name: pro.contact_name,
          email: pro.email,
          phone: pro.phone,
          wechat: pro.wechat,
          website: pro.website,
          category: pro.category,
          verified: pro.verified,
        },
      })
    if (insError) {
      if (insError.code === '23505') {
        return Response.json({ error: 'already_responded' }, { status: 409 })
      }
      console.error('Board respond DB error:', insError)
      return Response.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    await supabase
      .from('project_briefs')
      .update({ response_count: (brief.response_count ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', brief.id)

    // 5. Email the homeowner with the merchant's card — homeowner decides
    const resend = new Resend((process.env.RESEND_API_KEY || '').trim())
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'
    const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const homeownerEmailPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: brief.contact_email,
      subject: `有商家响应了你在对接大厅的需求（${brief.suburb}）`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">澳洲建房圈 · 对接大厅</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>${esc(brief.contact_name)} 你好，</p>
            <p>你发布的 <b>${esc(brief.suburb)}, ${esc(brief.state)}</b> 需求有商家响应了：</p>
            <div style="background:white;border:2px solid #f97316;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:0 0 6px"><b>${esc(pro.business_name)}</b>（${esc(pro.category)}）${pro.verified ? ' ✅ 已认证' : ''}</p>
              <p style="margin:0 0 10px;color:#374151">${esc(message)}</p>
              <p style="margin:0;font-size:14px;color:#6b7280">
                联系人：${esc(pro.contact_name)}<br>
                ${pro.phone ? '电话：' + esc(pro.phone) + '<br>' : ''}
                ${pro.wechat ? '微信：' + esc(pro.wechat) + '<br>' : ''}
                邮箱：${esc(pro.email)}
                ${pro.website ? '<br>网站：' + esc(pro.website) : ''}
              </p>
            </div>
            <p style="font-size:14px;color:#6b7280">你的联系方式没有给到商家。是否联系、联系谁，完全由你决定。建议多对比几家再做决定。</p>
            <p style="font-size:13px;color:#9ca3af">澳洲建房圈 ausbuildcircle.com</p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Board homeowner email failed:', err))

    const adminEmailPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[对接大厅] ${esc(pro.business_name)} 响应了 ${esc(brief.suburb)} 的需求`,
      html: `<p>${esc(pro.business_name)}（${esc(pro.category)}）→ ${esc(brief.suburb)}, ${esc(brief.state)} ${esc(brief.project_type || brief.kind)}</p><p>${esc(message)}</p>`,
    }).catch(() => {})

    // Serverless: must await or the sends are dropped when the function freezes
    await Promise.all([homeownerEmailPromise, adminEmailPromise])

    return Response.json({ success: true })
  } catch (error) {
    console.error('Board respond error:', error)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
