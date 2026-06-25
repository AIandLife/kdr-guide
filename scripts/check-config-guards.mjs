/**
 * Config-drift guard — fails CI if a safety setting silently reverts.
 *
 * The David bug existed because the report ran at the default temperature (1.0)
 * and nobody noticed. This asserts, from source, that the protections stay in
 * place. Run in the nightly workflow; exits 1 on any violation.
 */
import fs from 'node:fs'

const fails = []
const read = p => fs.readFileSync(p, 'utf8')

// 1. Feasibility report temperature must stay low (≤0.3) so verdicts are stable.
const route = read('src/app/api/feasibility/route.ts')
const tMatch = route.match(/temperature:\s*([0-9.]+)/)
if (!tMatch) {
  fails.push('feasibility route: no `temperature:` set — defaults to 1.0, the David-bug config')
} else if (Number(tMatch[1]) > 0.3) {
  fails.push(`feasibility route: temperature ${tMatch[1]} > 0.3 — verdicts will swing run-to-run`)
} else {
  console.log(`  OK   feasibility temperature = ${tMatch[1]}`)
}

// 2. The report safety net + its bounds must exist and be wired in.
if (!fs.existsSync('src/lib/report-bounds.ts')) {
  fails.push('src/lib/report-bounds.ts missing — the report safety net is gone')
} else {
  const b = read('src/lib/report-bounds.ts')
  for (const sym of ['export const BOUNDS', 'export function sanitizeReport', 'export function reportLooksBad', 'export function clampScore']) {
    if (!b.includes(sym)) fails.push(`report-bounds.ts: ${sym} missing`)
  }
  if (route.includes('reportLooksBad')) console.log('  OK   cache write gated by reportLooksBad')
  else fails.push('feasibility route no longer calls reportLooksBad — bad reports can be cached again')
  const page = read('src/app/feasibility/page.tsx')
  if (page.includes('sanitizeReport')) console.log('  OK   report rendered through sanitizeReport')
  else fails.push('feasibility page no longer calls sanitizeReport — the user sees unclamped values')
}

console.log('— config guards —')
if (fails.length) {
  console.log(`❌ ${fails.length} config guard failure(s):`)
  fails.forEach(f => console.log('   ' + f))
  process.exit(1)
}
console.log('✅ all config guards passed')
