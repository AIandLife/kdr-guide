/**
 * AusBuildCircle Outreach Campaign Sender
 *
 * Usage: node send-campaign.js [--dry-run] [--limit=N] [--language=en|both] [--gmail-only] [--skip-outlook]
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const FROM_EMAIL = 'Terry <hello@ausbuildcircle.com>';
const CAMPAIGN = 'wave1_apr2026';
const DELAY_MS = 1500;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 99999;
const langArg = args.find(a => a.startsWith('--language='));
const langFilter = langArg ? langArg.split('=')[1] : null;
const skipOutlook = args.includes('--skip-outlook');

const OUTLOOK_DOMAINS = ['outlook.com','hotmail.com','live.com','msn.com','outlook.com.au','hotmail.com.au'];

function makeUnsubscribeUrl(email) {
  const token = Buffer.from(email).toString('base64url');
  return `https://ausbuildcircle.com/api/outreach/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

// Plain text style — no buttons, no colors, no emoji, looks like a real person wrote it
function englishEmail(unsubUrl) {
  return {
    subject: 'Quick question about your building business',
    text: `Hi,

My name is Terry — I run a platform called AusBuildCircle that connects homeowners with building professionals across Australia.

Homeowners come to our site to figure out if they can do a knockdown rebuild, renovation, or extension on their property. They use our AI feasibility tool, browse government tenders, and then look for builders and tradespeople in their area.

I wanted to reach out because I think your business would be a good fit for our directory. Here is what it includes:

- Homeowner enquiries sent directly to your email, no middleman
- 200+ government construction tenders from federal and 87 local councils, updated daily
- A searchable listing visible to homeowners in your area
- Optional verified badge if you want priority ranking (completely up to you)

It takes about 2 minutes to set up: AusBuildCircle.com/join

Happy to answer any questions — just reply to this email.

Cheers,
Terry
AusBuildCircle.com

---
You received this because your business is publicly listed online.
Unsubscribe: ${unsubUrl}`
  };
}

function chineseEmail(unsubUrl) {
  return {
    subject: '你好 — 想邀请你入驻澳洲建房圈',
    text: `你好，

我是 Terry，澳洲建房圈（AusBuildCircle.com）的创始人。

每天都有业主来我们平台，用 AI 工具评估他们的推倒重建、翻新或扩建项目。评估完了，下一步就是找专业人士——这时候他们需要你这样的建筑商。

平台能给你带来什么：

- 业主询盘直达你的邮箱，没有中间人
- 200 多条政府建筑招标，全部有中文翻译，每天自动更新
- 你的公司出现在专业人士目录中，业主按地区就能找到你
- 如果需要，可以申请认证徽章获得优先排名（完全自愿）

注册很快，大概 2 分钟：AusBuildCircle.com/join

有任何问题直接回复这封邮件就行。

Terry
澳洲建房圈 AusBuildCircle
AusBuildCircle.com

---
这封邮件是因为你的公司信息在网上公开可见。
退订：${unsubUrl}`
  };
}

async function fetchPendingContacts() {
  // Fetch all pending contacts (paginate if needed)
  let all = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/outreach_contacts?status=eq.pending&select=id,email,company_name,language&order=created_at.asc&limit=${pageSize}&offset=${offset}`;
    if (langFilter) url += `&language=eq.${langFilter}`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    all = all.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  // Filter out Outlook if needed
  if (skipOutlook) {
    all = all.filter(c => !OUTLOOK_DOMAINS.some(d => c.email.toLowerCase().endsWith('@' + d)));
  }

  // Apply limit
  return all.slice(0, limit);
}

async function markSent(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/outreach_contacts?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'sent', sent_at: new Date().toISOString(),
      last_contacted_at: new Date().toISOString(), contact_count: 1, campaign: CAMPAIGN,
    })
  });
}

async function main() {
  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars'); process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);
  const contacts = await fetchPendingContacts();

  console.log(`\n=== AusBuildCircle Outreach ===`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Campaign: ${CAMPAIGN}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Skip Outlook: ${skipOutlook}`);
  console.log(`Format: PLAIN TEXT (anti-spam)`);
  console.log(`==============================\n`);

  let sent = 0, errors = 0;

  for (const contact of contacts) {
    const unsubUrl = makeUnsubscribeUrl(contact.email);
    const isZh = contact.language === 'both' || contact.language === 'zh';
    const { subject, text } = isZh ? chineseEmail(unsubUrl) : englishEmail(unsubUrl);

    if (dryRun) {
      console.log(`[DRY] ${contact.email} (${contact.company_name}) [${isZh ? 'ZH' : 'EN'}]`);
      sent++;
      continue;
    }

    try {
      await resend.emails.send({ from: FROM_EMAIL, to: contact.email, subject, text });
      await markSent(contact.id);
      sent++;
      if (sent % 50 === 0 || sent === contacts.length) {
        console.log(`Progress: ${sent}/${contacts.length} sent, ${errors} errors`);
      }
    } catch (err) {
      errors++;
      console.error(`❌ ${contact.email} — ${err.message || err}`);
    }

    if (!dryRun) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n=== Done ===`);
  console.log(`Sent: ${sent} | Errors: ${errors}`);
  console.log(`Outlook skipped: ${skipOutlook ? 'yes (send later)' : 'no'}`);
}

main().catch(console.error);
