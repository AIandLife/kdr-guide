export interface NewsletterData {
  issueNumber: number
  heroTitle: string
  heroTitleEn: string
  heroBody: string
  heroBodyEn: string
  heroCtaLabel: string
  heroCtaUrl: string
  quickBites: { zh: string; en: string }[]
  spotlight?: {
    name: string
    role: string
    roleEn: string
    question: string
    answer: string
    profileUrl: string
  }
  buildTip: { zh: string; en: string }
  communityQ?: { question: string; answer: string }
  platformUpdate?: { zh: string; en: string }
  unsubscribeToken: string
}

export function renderNewsletter(data: NewsletterData): string {
  const siteUrl = 'https://ausbuildcircle.com'
  const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${data.unsubscribeToken}`
  const orange = '#f97316'
  const darkText = '#111827'
  const mutedText = '#6b7280'
  const borderColor = '#e5e7eb'
  const bgLight = '#f9fafb'

  const quickBitesHtml = data.quickBites.map(b => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${borderColor}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="24" valign="top" style="padding-top:2px">
              <div style="width:8px;height:8px;background:${orange};border-radius:50%;margin-top:4px"></div>
            </td>
            <td>
              <p style="margin:0;font-size:14px;color:${darkText};line-height:1.6">${b.zh}</p>
              <p style="margin:2px 0 0;font-size:12px;color:${mutedText}">${b.en}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  const spotlightHtml = data.spotlight ? `
    <!-- SPOTLIGHT -->
    <tr><td style="padding:32px 40px 0">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgLight};border:1px solid ${borderColor};border-radius:12px;overflow:hidden">
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid ${borderColor};background:white">
            <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${orange}">行家说 · PROFESSIONAL SPOTLIGHT</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:${darkText}">${data.spotlight.name}</p>
                  <p style="margin:0 0 16px;font-size:13px;color:${mutedText}">${data.spotlight.role} · ${data.spotlight.roleEn}</p>
                  <p style="margin:0 0 8px;font-size:13px;font-style:italic;color:${mutedText}">"${data.spotlight.question}"</p>
                  <p style="margin:0 0 20px;font-size:14px;color:${darkText};line-height:1.7">${data.spotlight.answer}</p>
                  <a href="${data.spotlight.profileUrl}" style="display:inline-block;background:white;border:1px solid ${orange};color:${orange};font-size:13px;font-weight:600;padding:8px 18px;border-radius:8px;text-decoration:none">查看主页 / View Profile →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  ` : ''

  const buildTipHtml = `
    <!-- BUILD TIP -->
    <tr><td style="padding:32px 40px 0">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-left:4px solid ${orange};border-radius:0 12px 12px 0">
        <tr>
          <td style="padding:20px 24px">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${orange}">省钱建造 · BUILD SMART TIP</p>
            <p style="margin:0 0 6px;font-size:14px;color:${darkText};line-height:1.7">${data.buildTip.zh}</p>
            <p style="margin:0;font-size:13px;color:${mutedText};line-height:1.6">${data.buildTip.en}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  `

  const communityHtml = data.communityQ ? `
    <!-- COMMUNITY Q -->
    <tr><td style="padding:32px 40px 0">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${mutedText}">社区问答 · COMMUNITY Q&A</p>
      <p style="margin:8px 0 6px;font-size:14px;font-weight:600;color:${darkText}">Q: ${data.communityQ.question}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.7">${data.communityQ.answer}</p>
      <a href="${siteUrl}/forum" style="font-size:13px;color:${orange};text-decoration:none;font-weight:600">加入讨论 Join the discussion →</a>
    </td></tr>
  ` : ''

  const platformHtml = data.platformUpdate ? `
    <!-- PLATFORM UPDATE -->
    <tr><td style="padding:24px 40px 0">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px">
        <tr>
          <td style="padding:16px 20px">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#16a34a">平台动态 · PLATFORM UPDATE</p>
            <p style="margin:6px 0 4px;font-size:14px;color:${darkText};line-height:1.6">${data.platformUpdate.zh}</p>
            <p style="margin:0;font-size:13px;color:${mutedText}">${data.platformUpdate.en}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  ` : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>澳洲建房圈 · Issue #${data.issueNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- HEADER -->
        <tr>
          <td style="background:${orange};padding:28px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 10px;vertical-align:middle">
                        <span style="font-size:20px">🏠</span>
                      </td>
                      <td style="padding-left:12px;vertical-align:middle">
                        <p style="margin:0;font-size:18px;font-weight:800;color:white">AusBuildCircle</p>
                        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8)">澳洲建房圈</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" valign="middle">
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);font-weight:600">Issue #${String(data.issueNumber).padStart(2, '0')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:1px solid ${borderColor}">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${orange}">本期焦点 · FEATURE</p>
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${darkText};line-height:1.3">${data.heroTitle}</h1>
            <p style="margin:0 0 16px;font-size:13px;color:${mutedText};font-style:italic">${data.heroTitleEn}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.8">${data.heroBody}</p>
            <p style="margin:0 0 24px;font-size:13px;color:${mutedText};line-height:1.7">${data.heroBodyEn}</p>
            <a href="${data.heroCtaUrl}" style="display:inline-block;background:${orange};color:white;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none">${data.heroCtaLabel} →</a>
          </td>
        </tr>

        <!-- QUICK BITES -->
        <tr>
          <td style="padding:28px 40px;border-bottom:1px solid ${borderColor}">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${mutedText}">市场速报 · QUICK BITES</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${quickBitesHtml}
            </table>
          </td>
        </tr>

        ${spotlightHtml}
        ${buildTipHtml}
        ${communityHtml}
        ${platformHtml}

        <!-- CTA BANNER -->
        <tr>
          <td style="padding:32px 40px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid #fed7aa;border-radius:12px">
              <tr>
                <td style="padding:24px;text-align:center">
                  <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:${darkText}">免费AI地块可行性分析</p>
                  <p style="margin:0 0 16px;font-size:13px;color:${mutedText}">Free AI Feasibility Analysis · 45+ councils covered</p>
                  <a href="${siteUrl}/feasibility" style="display:inline-block;background:${orange};color:white;font-size:14px;font-weight:700;padding:12px 32px;border-radius:10px;text-decoration:none">立即分析我的地块 →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${bgLight};border-top:1px solid ${borderColor};padding:24px 40px;text-align:center">
            <p style="margin:0 0 4px;font-size:12px;color:${mutedText}">你收到这封邮件是因为你在 ausbuildcircle.com 订阅了我们的通讯。</p>
            <p style="margin:0 0 12px;font-size:12px;color:${mutedText}">You received this because you subscribed at ausbuildcircle.com.</p>
            <a href="${unsubUrl}" style="font-size:12px;color:#9ca3af;text-decoration:underline">退订 Unsubscribe</a>
            <span style="color:#d1d5db;margin:0 8px">·</span>
            <a href="${siteUrl}" style="font-size:12px;color:#9ca3af;text-decoration:underline">访问网站 Visit site</a>
            <p style="margin:16px 0 0;font-size:11px;color:#d1d5db">© 2025 AusBuildCircle · ausbuildcircle.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}
