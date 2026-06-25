/**
 * Report safety net — deterministic, conservative guards on the AI feasibility
 * report so a wrong/broken value can never reach the user or poison the cache.
 *
 * Design (validated by an adversarial audit): the report STREAMS to the browser,
 * so the server can't "validate then regenerate before serving". The real
 * protections are therefore:
 *   1. Client-side `sanitizeReport()` — runs on what the user actually renders.
 *      ONLY deterministic clamps/repairs that CANNOT false-positive on a
 *      legitimately difficult block (heritage, flood, undersized-but-buildable).
 *      We never force-regenerate or push a score down on a "soft" judgement —
 *      that's exactly the David bug, which the low temperature already fixed.
 *   2. Server-side `reportLooksBad()` — gates the cache write so one bad
 *      generation can't be cached and re-served to many users.
 *
 * Centralising the numbers here means a CI guard can assert they don't drift.
 */

export const BOUNDS = {
  score: [1, 10] as const,
  buildPerSqm: [1500, 6000] as const,      // AUD per sqm — loose sanity, clamp only the absurd
  demolition: [0, 80_000] as const,        // AUD
  totalEstimateMax: 15_000_000,            // above this, the model multiplied land area by $/sqm
  impliedFloorMax: 1200,                    // sqm — total/buildPerSqm above this is implausible
  totalWeeks: [1, 260] as const,
  minRequired: [50, 4000] as const,        // sqm minimum-lot-size
} as const

const LABELS_ZH = ['非常困难', '较难', '有条件可行', '可行', '非常可行']
const LABELS_EN = ['Very Difficult', 'Difficult', 'Possible with Conditions', 'Feasible', 'Highly Feasible']

/** Canonical label for a score band (1–2 / 3–4 / 5–6 / 7–8 / 9–10). */
export function labelForScore(score: number, isZh: boolean): string {
  const i = score >= 9 ? 4 : score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0
  return (isZh ? LABELS_ZH : LABELS_EN)[i]
}

/** Coerce any score to an integer 1–10. Treats an obvious percentage (11–100)
 *  as score×10, so a stray "85" renders a 8.5 ring instead of an 850% arc. */
export function clampScore(n: unknown): number | null {
  let s = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(s)) return null
  if (s > 10 && s <= 100) s = s / 10
  s = Math.round(s)
  return Math.min(BOUNDS.score[1], Math.max(BOUNDS.score[0], s))
}

function clampTuple(t: unknown, lo: number, hi: number): [number, number] | null {
  if (!Array.isArray(t) || t.length < 2) return null
  let [a, b] = [Number(t[0]), Number(t[1])]
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (a > b) [a, b] = [b, a]                                   // un-invert (UI does b - a / a..b)
  return [Math.max(lo, Math.min(hi, a)), Math.max(lo, Math.min(hi, b))]
}

type Rec = Record<string, unknown>

/**
 * Deterministic, conservative repair of the report the USER will see. Never
 * rejects a report; only fixes values that are crash-inducing or arithmetically
 * impossible. Safe to run on a partial (still-streaming) object too.
 */
export function sanitizeReport(report: Rec, isZh: boolean): Rec {
  const r = { ...report }

  // Score is canonical; the colour + dashboard derive from it. Keep the label
  // in the same band so "score 2 / label 可行" contradictions can't show.
  const s = clampScore(r.feasibilityScore)
  if (s != null) {
    r.feasibilityScore = s
    if (!LABELS_ZH.includes(String(r.feasibilityLabel)) && !LABELS_EN.includes(String(r.feasibilityLabel))) {
      r.feasibilityLabel = labelForScore(s, isZh)
    } else {
      // Force the label into the score's band (drops "feasible" on a 2).
      r.feasibilityLabel = labelForScore(s, isZh)
    }
  }

  // Cost numbers — prevent the land-area-as-floor blow-up and inverted/NaN tuples
  // that crash the renderer (toLocaleString / arithmetic on undefined).
  const ce = r.costEstimate
  if (ce && typeof ce === 'object') {
    const c = { ...(ce as Rec) }
    const bp = clampTuple(c.buildPerSqm, BOUNDS.buildPerSqm[0], BOUNDS.buildPerSqm[1])
    if (bp) c.buildPerSqm = bp; else if (c.buildPerSqm != null) c.buildPerSqm = null
    const dem = clampTuple(c.demolition, BOUNDS.demolition[0], BOUNDS.demolition[1])
    if (dem) c.demolition = dem; else if (c.demolition != null) c.demolition = null
    // totalEstimate: null it out if absurd (the $14M land×rate bug) rather than
    // show a wrong number; the UI already handles a null total gracefully.
    const te = clampTuple(c.totalEstimate, 0, Number.MAX_SAFE_INTEGER)
    if (te) {
      const perSqm = bp ? bp[0] : BOUNDS.buildPerSqm[0]
      const impliedFloor = te[1] / Math.max(1, perSqm)
      c.totalEstimate = (te[1] > BOUNDS.totalEstimateMax || impliedFloor > BOUNDS.impliedFloorMax) ? null : te
    } else if (c.totalEstimate != null) {
      c.totalEstimate = null
    }
    r.costEstimate = c
  }

  // Timeline tuple — same crash guard.
  const tl = r.timeline
  if (tl && typeof tl === 'object') {
    const t = { ...(tl as Rec) }
    const tw = clampTuple(t.totalWeeks, BOUNDS.totalWeeks[0], BOUNDS.totalWeeks[1])
    if (tw) t.totalWeeks = tw; else if (t.totalWeeks != null) t.totalWeeks = null
    r.timeline = t
  }

  return r
}

/**
 * Server-side cache gate. Returns true when the RAW parsed report is broken
 * enough that it must NOT be cached (and should be logged), so one bad
 * generation can't be re-served to every later reader of that suburb.
 * Conservative — only flags clear breakage, never a legitimately low score.
 */
export function reportLooksBad(report: Rec): string | null {
  const s = report?.feasibilityScore
  if (typeof s !== 'number' || !Number.isFinite(s) || s < 1 || s > 10) return `score=${s}`
  if (typeof report?.verdict !== 'string' || report.verdict.length < 15) return 'verdict missing/short'
  if (!Array.isArray(report?.riskFlags) || !Array.isArray(report?.nextSteps)) return 'missing arrays'
  const ce = report?.costEstimate as Rec | undefined
  const te = ce?.totalEstimate
  if (Array.isArray(te) && Number.isFinite(Number(te[1])) && Number(te[1]) > BOUNDS.totalEstimateMax) {
    return `totalEstimate ${te[1]} > ${BOUNDS.totalEstimateMax}`
  }
  return null
}
