import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function checkAuth(req: Request) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase()
    .from('professionals')
    .select('id, business_name, contact_name, email, category, state, verified, verification_status, is_demo, created_at, abn, license_type, license_number, years_experience, verification_submitted_at')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ professionals: data || [] })
}

export async function PATCH(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, verified, action, adminNote } = await req.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  // Handle approve/reject actions
  if (action === 'approve' || action === 'reject') {
    const db = supabase()

    // Get professional details for email
    const { data: pro } = await db
      .from('professionals')
      .select('email, business_name')
      .eq('id', id)
      .single()

    const newStatus = action === 'approve' ? 'verified' : 'free'
    const newVerified = action === 'approve'

    const { error } = await db
      .from('professionals')
      .update({ verified: newVerified, verification_status: newStatus })
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Send email to professional
    if (pro?.email) {
      const resend = new Resend((process.env.RESEND_API_KEY || '').trim())
      const FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || 'terry@ausbuildcircle.com').trim()

      if (action === 'approve') {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: pro.email,
          subject: '🎉 认证已通过 — Your Verification is Approved',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <div style="background:#22c55e;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:20px">✅ 认证已通过</h1>
              </div>
              <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                <p>您好${pro.business_name ? `，<strong>${esc(pro.business_name)}</strong>` : ''}，</p>
                <p>恭喜！您的认证申请已审核通过。您的主页现在已显示 <strong>认证徽章</strong>，并在搜索结果中优先排名。</p>
                ${adminNote ? `<p style="color:#6b7280;font-size:13px">备注：${esc(adminNote)}</p>` : ''}
                <p><a href="https://ausbuildcircle.com/professionals" style="color:#f97316">查看你的主页 →</a></p>
                <p>澳洲建房圈 团队</p>
              </div>
            </div>
          `,
        }).catch(err => console.error('Approval email error:', err))
      } else {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: pro.email,
          subject: '认证申请结果 — Verification Update',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <div style="background:#f9fafb;padding:24px;border-radius:12px;border:1px solid #e5e7eb">
                <p>您好${pro.business_name ? `，<strong>${esc(pro.business_name)}</strong>` : ''}，</p>
                <p>感谢您提交认证申请。经过审核，我们暂时无法通过您的认证申请。</p>
                ${adminNote ? `<p><strong>原因：</strong>${esc(adminNote)}</p>` : ''}
                <p>如有疑问或需要补充材料，请直接回复此邮件联系我们。</p>
                <p>澳洲建房圈 团队</p>
              </div>
            </div>
          `,
        }).catch(err => console.error('Rejection email error:', err))
      }
    }

    return Response.json({ success: true })
  }

  // Legacy toggle verify
  const { error } = await supabase()
    .from('professionals')
    .update({ verified: verified ?? true, verification_status: verified === false ? 'free' : 'verified' })
    .eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  const { error } = await supabase().from('professionals').delete().in('id', ids)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
