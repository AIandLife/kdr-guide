/**
 * AusBuildCircle — Outreach Email Sender
 *
 * Usage:
 *   node send-outreach.js              # dry run (preview only, no emails sent)
 *   node send-outreach.js --send       # actually send
 *   node send-outreach.js --send --start=10  # skip first 10, resume from row 11
 *
 * Rate: 30 emails/hour (one every 2 minutes) — safe for cold outreach
 * Logs: outreach-log.csv (appended each run)
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// ── Config ──────────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM            = 'Terry <admin@ausbuildcircle.com>'
const REPLY_TO        = 'recommendforterry@gmail.com'
const CSV_FILE        = path.join(__dirname, 'sydney-builders.csv')
const LOG_FILE        = path.join(__dirname, 'outreach-log.csv')
const DELAY_MS        = 2 * 60 * 1000   // 2 minutes between emails (30/hour)
const DRY_RUN         = !process.argv.includes('--send')
const START_FROM      = parseInt((process.argv.find(a => a.startsWith('--start=')) || '--start=0').split('=')[1])

// ── Email template ───────────────────────────────────────────────────────────
function buildEmail(companyName) {
  return {
    subject: `Invitation to join AusBuildCircle`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
  <p>Hi,</p>

  <p>I'm Terry from AusBuildCircle — a platform connecting homeowners planning
  knockdown rebuilds, renovations and extensions with local builders and
  tradespeople in Australia.</p>

  <p>We came across <strong>${companyName}</strong> and think your services
  would be a great fit for our community.</p>

  <p><strong>What's on the platform:</strong></p>
  <ul>
    <li>An AI feasibility tool homeowners use to assess their block before reaching out to anyone</li>
    <li>A professional directory featuring Builders, Designers, Town Planners, Engineers and more</li>
    <li>A building materials directory for suppliers of flooring, windows, tiles, kitchens and beyond</li>
    <li>A community forum where homeowners discuss their projects</li>
  </ul>

  <p>If you're a <strong>builder or trade professional</strong>, you can list
  your business in our professional directory and receive enquiries directly.</p>

  <p>If you're a <strong>building materials supplier</strong>, you can list in
  our materials directory and connect with homeowners at the planning stage —
  before they've committed to anyone.</p>

  <p>Either way, it only takes a few minutes to get listed:<br>
  👉 <a href="https://ausbuildcircle.com">https://ausbuildcircle.com</a></p>

  <p>Feel free to reply with any questions.</p>

  <p>Terry<br>
  AusBuildCircle | ausbuildcircle.com<br>
  admin@ausbuildcircle.com</p>

  <p style="font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:12px">
    To unsubscribe, simply reply "unsubscribe" and we'll remove you immediately.
  </p>
</div>
    `.trim(),
  }
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCSV(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (cols[i] || '').trim()]))
  })
}

// ── Already sent log ─────────────────────────────────────────────────────────
function loadSentEmails() {
  if (!fs.existsSync(LOG_FILE)) return new Set()
  return new Set(
    fs.readFileSync(LOG_FILE, 'utf8')
      .split('\n').slice(1)
      .filter(Boolean)
      .map(l => l.split(',')[1])  // email column
  )
}

function appendLog(row) {
  const exists = fs.existsSync(LOG_FILE)
  if (!exists) fs.writeFileSync(LOG_FILE, 'sent_at,email,company_name,status\n')
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()},${row.email},${row.company_name},${row.status}\n`)
}

// ── Resend API call ──────────────────────────────────────────────────────────
function sendEmail(to, companyName) {
  return new Promise((resolve, reject) => {
    const { subject, html } = buildEmail(companyName)
    const body = JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      html,
    })

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) resolve(JSON.parse(data))
        else reject(new Error(`HTTP ${res.statusCode}: ${data}`))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Sleep helper ─────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!RESEND_API_KEY && !DRY_RUN) {
    console.error('❌  Set RESEND_API_KEY env var first.')
    process.exit(1)
  }

  const rows = parseCSV(CSV_FILE)
  const alreadySent = loadSentEmails()
  const toSend = rows
    .slice(START_FROM)
    .filter(r => r.email && !alreadySent.has(r.email))

  console.log(`\n${ DRY_RUN ? '🔍  DRY RUN — no emails will be sent' : '🚀  SENDING' }`)
  console.log(`📋  ${toSend.length} recipients (${alreadySent.size} already sent, starting from row ${START_FROM + 1})\n`)

  for (let i = 0; i < toSend.length; i++) {
    const row = toSend[i]
    const eta = new Date(Date.now() + (i * DELAY_MS))
    console.log(`[${i + 1}/${toSend.length}] ${row.company_name} <${row.email}>`)

    if (DRY_RUN) {
      console.log(`  ↳ DRY RUN — would send at ${eta.toLocaleTimeString()}`)
      continue
    }

    try {
      await sendEmail(row.email, row.company_name)
      console.log(`  ✅ Sent`)
      appendLog({ ...row, status: 'sent' })
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`)
      appendLog({ ...row, status: `error: ${err.message}` })
    }

    if (i < toSend.length - 1) {
      console.log(`  ⏳ Waiting 2 min...\n`)
      await sleep(DELAY_MS)
    }
  }

  console.log(`\n✅  Done. Log saved to ${LOG_FILE}`)
}

main().catch(console.error)
