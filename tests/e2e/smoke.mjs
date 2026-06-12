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
  { name: 'areas-index',   url: '/areas' },
  { name: 'area-page',     url: '/areas/nsw/castle-hill' },
]
const MOBILE_PAGES = new Set(['home', 'report', 'professionals', 'forum', 'ruzhu'])

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
    const full = await post({ suburb: 'Lidcombe', state: 'NSW', address: '33 Yarram St, Lidcombe NSW' })
    if (full?.lotSource === 'cadastre' && full.lotAreaSqm > 100 && full.lotAreaSqm < 3000) {
      console.log(`  OK             full address → ${full.lotAreaSqm}㎡ (cadastre)`)
    } else {
      failures.push(`full-address lookup broken: ${JSON.stringify(full)} (GURAS/cadastre pipeline?)`)
      console.log('  FAIL           full address lookup')
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

  console.log('\n==================== summary ====================')
  if (warnings.length) { console.log(`⚠️  ${warnings.length} warning(s):`); warnings.forEach(w => console.log('   ' + w)) }
  if (failures.length) {
    console.log(`❌ ${failures.length} failure(s):`); failures.forEach(f => console.log('   ' + f))
    process.exit(1)
  }
  console.log('✅ all smoke checks passed')
}

run().catch(e => { console.error('smoke runner crashed:', e); process.exit(1) })
