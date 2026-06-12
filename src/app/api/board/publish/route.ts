import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

/**
 * 对接大厅 — homeowner publishes a project brief.
 *
 * Privacy by design: contact fields are stored but NEVER exposed through
 * /api/board/list. Both board tables have RLS enabled with no policies,
 * so the only read path is our own service-role routes.
 */

const PROJECT_TYPES = new Set(['kdr', 'granny_flat', 'dual_occupancy', 'renovation', 'extension', 'new_build', 'other'])
const KINDS = new Set(['project', 'hire', 'work_wanted'])
const STATES = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'])

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )

  try {
    const body = await req.json()
    const {
      kind, projectType, state, suburb, budgetBand, timeline, description,
      lotAreaSqm, hasReport, reportMeta,
      contactName, contactEmail, contactPhone, contactWechat,
    } = body

    if (!state || !suburb || !contactName || !contactEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!STATES.has(state)) {
      return Response.json({ error: 'Invalid state' }, { status: 400 })
    }
    if (kind && !KINDS.has(kind)) {
      return Response.json({ error: 'Invalid kind' }, { status: 400 })
    }
    if (projectType && !PROJECT_TYPES.has(projectType)) {
      return Response.json({ error: 'Invalid project type' }, { status: 400 })
    }
    if (!contactPhone && !contactWechat) {
      return Response.json({ error: 'Provide at least a phone number or WeChat ID' }, { status: 400 })
    }

    const email = String(contactEmail).toLowerCase().trim()

    // Rate limit: max 3 briefs per email per 24h
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('project_briefs')
      .select('id', { count: 'exact', head: true })
      .eq('contact_email', email)
      .gte('created_at', dayAgo)
    if ((count ?? 0) >= 3) {
      return Response.json({ error: 'Too many briefs today. Please try again tomorrow.' }, { status: 429 })
    }

    // Lot area is the homeowner's own disclosure — clamp to sane residential range
    const lot = Number(lotAreaSqm)
    const safeLot = Number.isFinite(lot) && lot >= 100 && lot <= 10000 ? Math.round(lot) : null

    const { data: row, error: dbError } = await supabase
      .from('project_briefs')
      .insert({
        kind: kind || 'project',
        project_type: projectType || null,
        state,
        suburb: String(suburb).trim(),
        budget_band: budgetBand ? String(budgetBand).slice(0, 60) : null,
        timeline: timeline ? String(timeline).slice(0, 60) : null,
        description: description ? String(description).slice(0, 2000) : null,
        lot_area_sqm: safeLot,
        has_report: Boolean(hasReport),
        report_meta: reportMeta && typeof reportMeta === 'object' ? reportMeta : null,
        contact_name: String(contactName).slice(0, 100),
        contact_email: email,
        contact_phone: contactPhone ? String(contactPhone).slice(0, 40) : null,
        contact_wechat: contactWechat ? String(contactWechat).slice(0, 60) : null,
        status: 'live',
      })
      .select('id')
      .single()

    if (dbError || !row) {
      console.error('Board publish DB error:', dbError)
      return Response.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // Admin notification — fire and forget
    const resend = new Resend((process.env.RESEND_API_KEY || '').trim())
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'recommendforterry@gmail.com'
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[对接大厅] 新需求 — ${esc(suburb)} ${projectType || kind || ''}`,
      html: `
        <h2>对接大厅新需求（已直接上线，有问题去 Supabase 改 status）</h2>
        <p><b>${esc(String(suburb))}, ${esc(state)}</b> · ${esc(String(projectType || kind || ''))} · 预算 ${esc(String(budgetBand || '—'))} · ${esc(String(timeline || '—'))}</p>
        <p>${esc(String(description || '—'))}</p>
        <p>联系人（不公开）：${esc(String(contactName))} · ${esc(email)} · ${esc(String(contactPhone || ''))} ${contactWechat ? '· 微信 ' + esc(String(contactWechat)) : ''}</p>
        <p>地块：${safeLot ? safeLot + '㎡' : '—'} · 带AI报告：${hasReport ? '是' : '否'}</p>
      `,
    }).catch((err: unknown) => console.error('Board admin email failed:', err))

    return Response.json({ success: true, briefId: row.id })
  } catch (error) {
    console.error('Board publish error:', error)
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
