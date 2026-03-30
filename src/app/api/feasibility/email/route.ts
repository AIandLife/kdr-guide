import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { email, suburb, state, lang } = await req.json()
    if (!email || !suburb) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const resend = new Resend((process.env.RESEND_API_KEY || "").trim())
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@ausbuildcircle.com'
    const isZh = lang === 'zh'

    const reportUrl = `https://ausbuildcircle.com/feasibility?suburb=${encodeURIComponent(suburb)}${state ? `&state=${state}` : ''}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: isZh
        ? `你的 ${suburb} 可行性报告 — 澳洲建房圈`
        : `Your ${suburb} feasibility report — AusBuildCircle`,
      html: isZh ? `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">📊 你的可行性报告</h1>
            <p style="color:#fff7ed;margin:8px 0 0;font-size:14px">${suburb}${state ? `, ${state}` : ''}</p>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>感谢你使用澳洲建房圈 AI 可行性分析工具！</p>
            <p>你对 <strong>${suburb}</strong> 的可行性报告已生成。点击下方链接随时查看完整报告：</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${reportUrl}" style="background:#f97316;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
                查看完整报告 →
              </a>
            </div>
            <p style="font-size:13px;color:#6b7280">下一步：如果你想与附近经过认证的建筑商或规划师联系，可以访问我们的专业人士目录。</p>
            <p style="font-size:13px;color:#6b7280">如有任何疑问，请直接回复此邮件。</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">免责声明：本报告由 AI 生成，仅供参考。做任何建房决定前，请务必向当地 Council 及专业人士核实。</p>
          </div>
        </div>
      ` : `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">📊 Your Feasibility Report</h1>
            <p style="color:#fff7ed;margin:8px 0 0;font-size:14px">${suburb}${state ? `, ${state}` : ''}</p>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p>Thanks for using the AusBuildCircle AI feasibility tool!</p>
            <p>Your feasibility report for <strong>${suburb}</strong> is ready. Click below to view the full report anytime:</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${reportUrl}" style="background:#f97316;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
                View Full Report →
              </a>
            </div>
            <p style="font-size:13px;color:#6b7280">Next step: Browse our directory of verified builders and town planners near ${suburb}.</p>
            <p style="font-size:13px;color:#6b7280">Questions? Reply directly to this email.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">Disclaimer: This report is AI-generated and for information purposes only. Always verify with your local council and qualified professionals before making decisions.</p>
          </div>
        </div>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Feasibility email error:', err)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
