/**
 * Nightly production smoke tests — run by .github/workflows/nightly-smoke.yml
 * against https://ausbuildcircle.com (no local server needed).
 *
 * Checks, per page, on desktop AND iPhone viewports:
 *   - navigation succeeds (no white "Something went wrong" crash page)
 *   - no uncaught JS exceptions (pageerror — this is what once killed /professionals)
 *   - horizontal overflow on mobile (warning only)
 * Plus data-path regression checks on /api/site-data:
 *   - full street address  → real cadastre lot area (GURAS + DCDB pipeline alive)
 *   - suburb-only          → NO lot area (the "40,000㎡ park as your lot" bug stays dead)
 *
 * FAILS (exit 1) on: crash pages, nav failures, uncaught exceptions, API regressions.
 * WARNS only on: console.error noise, mobile overflow.
 */
import { chromium, devices } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.SMOKE_BASE_URL || 'https://ausbuildcircle.com'
const OUT = 'smoke-output'

const PAGES = [
  { name: 'home',          url: '/' },
  // Fixed suburb so the report is usually a fast cache hit (and cheap when not)
  { name: 'report',        url: '/feasibility?lang=zh&projectType=kdr&state=NSW&suburb=parramatta', waitText: '可行', budget: 90000 },
  { name: 'professionals', url: '/professionals' },
  { name: 'directory',     url: '/directory' },
  { name: 'suppliers',     url: '/suppliers' },
  { name: 'forum',         url: '/forum' },
  { name: 'guide',         url: '/guide' },
  { name: 'articles',      url: '/articles' },
  { name: 'login',         url: '/login' },
  { name: 'join',          url: '/join' },
  { name: 'ruzhu',         url: '/ruzhu' },
  { name: 'board',         url: '/board' },
  { name: 'areas-index',   url: '/areas' },
  { name: 'area-page',     url: '/areas/nsw/castle-hill' },
]
const MOBILE_PAGES = new Set(['home', 'report', 'professionals', 'forum', 'ruzhu', 'board'])

const failures = []
const warnings = []

async function checkPage(context, profile, p) {
  const page = await context.newPage()
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', e => pageErrors.push(e.message.slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  let verdict = 'OK'
  try {
    await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    if (p.waitText) {
      await page.waitForFunction(t => document.body.innerText.includes(t), p.waitText, { timeout: p.budget || 60000 })
        .catch(() => warnings.push(`[${profile}/${p.name}] waitText "${p.waitText}" not seen in budget (slow LLM?)`))
    }
    await page.waitForTimeout(2500)
    const m = await page.evaluate(() => ({
      crashed: /Something went wrong|Application error/i.test(document.body.innerText),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }))
    if (m.crashed) { verdict = 'CRASH PAGE'; failures.push(`[${profile}/${p.name}] crash page rendered`) }
    if (pageErrors.length) { verdict = 'JS EXCEPTION'; failures.push(`[${profile}/${p.name}] pageerror: ${pageErrors[0]}`) }
    if (profile === 'mobile' && m.overflow > 4) warnings.push(`[${profile}/${p.name}] horizontal overflow ${m.overflow}px`)
    if (consoleErrors.length) warnings.push(`[${profile}/${p.name}] ${consoleErrors.length} console.error(s): ${consoleErrors[0]}`)
    await page.screenshot({ path: `${OUT}/${profile}-${p.name}.png`, fullPage: true })
  } catch (e) {
    verdict = 'NAV FAIL'
    failures.push(`[${profile}/${p.name}] navigation failed: ${String(e.message).slice(0, 200)}`)
  }
  console.log(`  ${verdict.padEnd(14)} ${profile}/${p.name}`)
  await page.close()
}

async function checkDataPath() {
  console.log('— data-path regression (/api/site-data) —')
  const post = async body => {
    const r = await fetch(`${BASE}/api/site-data`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    return (await r.json())?.meta || null
  }
  try {
    // The cadastre + zoning lookups hit external NSW gov services that have brief
    // outages (esp. overnight maintenance). Retry a few times so a transient blip
    // doesn't raise a false alarm — only a persistent failure should fail the run.
    let full = null
    for (let attempt = 0; attempt < 3; attempt++) {
      full = await post({ suburb: 'Lidcombe', state: 'NSW', address: '33 Yarram St, Lidcombe NSW' })
      if (full?.lotSource === 'cadastre' && full?.zoneCode === 'R2') break
      if (attempt < 2) await new Promise(r => setTimeout(r, 4000))
    }
    if (full?.lotSource === 'cadastre' && full.lotAreaSqm > 100 && full.lotAreaSqm < 3000) {
      console.log(`  OK             full address → ${full.lotAreaSqm}㎡ (cadastre)`)
    } else {
      failures.push(`full-address lookup broken: ${JSON.stringify(full)} (GURAS/cadastre pipeline?)`)
      console.log('  FAIL           full address lookup')
    }
    // Live NSW zoning guard — the ePlanning endpoint silently 404'd once and
    // nulled all zoning for weeks. A known R2 address must return zone + height.
    if (full?.zoneCode === 'R2' && typeof full.maxHeight === 'number' && full.maxHeight > 0) {
      console.log(`  OK             NSW zoning → ${full.zoneCode} / ${full.maxHeight}m (ArcGIS EPI layers)`)
    } else {
      failures.push(`NSW live zoning broken: zone=${full?.zoneCode} height=${full?.maxHeight} — ePlanning ArcGIS endpoint changed?`)
      console.log('  FAIL           NSW live zoning')
    }
    const sub = await post({ suburb: 'quakers hill', state: 'NSW', address: 'quakers hill' })
    if (sub?.lotAreaSqm) {
      failures.push(`suburb-only query returned a lot area (${sub.lotAreaSqm}㎡) — centroid-parcel bug regressed!`)
      console.log('  FAIL           suburb-only must not return a lot')
    } else {
      console.log('  OK             suburb-only → no lot (correct)')
    }
  } catch (e) {
    failures.push(`site-data unreachable: ${String(e.message).slice(0, 150)}`)
  }
}

// Parse the streamed feasibility report (body has no leading '{' and a __META__ trailer).
async function fetchReport(body) {
  const r = await fetch(`${BASE}/api/feasibility`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!r.ok) return null
  const raw = await r.text()
  let s = '{' + raw.split('__META__')[0].split('__ERROR__')[0]
  try { return JSON.parse(s) } catch { /* repair */ }
  s = s.replace(/,\s*$/, '')
  if (((s.match(/(?<!\\)"/g) || []).length) % 2 === 1) s += '"'
  let b = 0, k = 0, inS = false
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '"' && s[i - 1] !== '\\') inS = !inS; if (inS) continue; if (c === '{') b++; if (c === '}') b--; if (c === '[') k++; if (c === ']') k-- }
  for (let i = 0; i < k; i++) s += ']'; for (let i = 0; i < b; i++) s += '}'
  try { return JSON.parse(s) } catch { return null }
}

// Report-quality guard. Catches the class of bug a real user (David) hit: a normal
// residential block wrongly judged "very difficult", and the same block swinging
// run-to-run because the LLM had no temperature control.
async function checkReportQuality() {
  console.log('— report quality (/api/feasibility) —')
  try {
    // Cross-field + numeric sanity on any report (after the safety net runs).
    const LABELS = ['Very Difficult', 'Difficult', 'Possible with Conditions', 'Feasible', 'Highly Feasible']
    const numericSane = (rep, who) => {
      const ce = rep?.costEstimate || {}
      const tuples = [['buildPerSqm', ce.buildPerSqm], ['totalEstimate', ce.totalEstimate], ['totalWeeks', rep?.timeline?.totalWeeks]]
      for (const [k, t] of tuples) {
        if (t == null) continue
        if (!Array.isArray(t) || !Number.isFinite(Number(t[0])) || !Number.isFinite(Number(t[1])) || Number(t[0]) > Number(t[1])) {
          failures.push(`report numbers: ${who} ${k}=${JSON.stringify(t)} is inverted/NaN (renderer crash risk)`)
        }
      }
      if (Array.isArray(ce.totalEstimate) && Number(ce.totalEstimate[1]) > 15_000_000) {
        failures.push(`report numbers: ${who} totalEstimate ${ce.totalEstimate[1]} absurd (land-as-floor blow-up)`)
      }
      // Label must sit in the score's band (no "score 2 / Feasible" contradiction)
      const s = rep?.feasibilityScore
      const expect = s >= 9 ? 4 : s >= 7 ? 3 : s >= 5 ? 2 : s >= 3 ? 1 : 0
      if (rep?.feasibilityLabel && rep.feasibilityLabel !== LABELS[expect]) {
        failures.push(`report contradiction: ${who} score ${s} but label "${rep.feasibilityLabel}" (expected "${LABELS[expect]}")`)
      }
    }

    // 1. Sanity: a normal residential block in a standard suburb must be feasible (≥5)
    for (const c of [
      { suburb: 'Quakers Hill', state: 'NSW', projectType: 'kdr', lotSize: 600 },
      { suburb: 'Footscray', state: 'VIC', projectType: 'kdr', lotSize: 500 },
    ]) {
      const rep = await fetchReport({ ...c, lang: 'en', userId: null })
      const score = rep?.feasibilityScore
      if (typeof score === 'number' && score >= 5 && rep.verdict) {
        console.log(`  OK             ${c.suburb} ${c.state} → score ${score} (feasible)`)
      } else {
        failures.push(`report sanity: ${c.suburb} ${c.state} ${c.projectType} scored ${score} (<5 or malformed) — a normal residential block judged not feasible`)
        console.log(`  FAIL           ${c.suburb} report sanity (score ${score})`)
      }
      if (rep) numericSane(rep, `${c.suburb} ${c.state}`)
    }
    // 2. Consistency: same full address twice (addresses bypass cache → fresh each time)
    // must not swing — guards against the temperature/non-determinism regression.
    const addr = { address: '33 Yarram St, Lidcombe NSW', suburb: 'Lidcombe', state: 'NSW', projectType: 'kdr', lang: 'en', userId: null }
    const a = (await fetchReport(addr))?.feasibilityScore
    const b = (await fetchReport(addr))?.feasibilityScore
    if (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1) {
      console.log(`  OK             consistency → same block scored ${a} & ${b} (stable)`)
    } else {
      failures.push(`report consistency: same block scored ${a} then ${b} — verdict swinging run-to-run (temperature regressed?)`)
      console.log(`  FAIL           report consistency (${a} vs ${b})`)
    }
  } catch (e) {
    failures.push(`report quality check errored: ${String(e.message).slice(0, 150)}`)
  }
}

const run = async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  console.log('— desktop (1280×800) —')
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'zh-CN' })
  for (const p of PAGES) await checkPage(desktop, 'desktop', p)
  await desktop.close()

  console.log('— mobile (iPhone 13) —')
  const mobile = await browser.newContext({ ...devices['iPhone 13'], locale: 'zh-CN' })
  for (const p of PAGES.filter(p => MOBILE_PAGES.has(p.name))) await checkPage(mobile, 'mobile', p)
  await mobile.close()

  await browser.close()
  await checkDataPath()
  await checkReportQuality()

  console.log('\n==================== summary ====================')
  if (warnings.length) { console.log(`⚠️  ${warnings.length} warning(s):`); warnings.forEach(w => console.log('   ' + w)) }
  if (failures.length) {
    console.log(`❌ ${failures.length} failure(s):`); failures.forEach(f => console.log('   ' + f))
    process.exit(1)
  }
  console.log('✅ all smoke checks passed')
}

run().catch(e => { console.error('smoke runner crashed:', e); process.exit(1) })
