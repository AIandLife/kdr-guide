'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign,
  ChevronRight, Loader2, Users, Flame,
  Droplets, Landmark, Shield, Info, Home, Mail, Send
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { useAuth } from '@/lib/auth-context'
import { LoginGateModal } from '@/components/LoginGateModal'
import { PROFESSIONALS, CATEGORIES, type Professional } from '@/lib/professionals-data'

interface RiskFlag {
  type: string
  level: 'Low' | 'Medium' | 'High'
  title: string
  detail: string
}

interface LiveZoneMeta {
  source: string
  zoneCode: string
  zoneName: string
  fsr: string | null
  maxHeight: number | null
  minLotSize: number | null
  lotAreaSqm?: number | null
  lotId?: string | null
  lotSource?: 'user' | 'cadastre' | null
  reportLevel?: 'parcel' | 'suburb' | null
}

interface FeasibilityResult {
  suburb: string
  state: string
  council: string
  projectType?: string
  feasibilityScore: number
  feasibilityLabel: string
  verdict: string
  lotSizeCheck: { passed: boolean | null; minRequired: number | null; message: string }
  riskFlags: RiskFlag[]
  approvalPath: { type: string; timelineWeeks: [number, number] | null; description: string }
  costEstimate: {
    demolition: [number, number]
    buildPerSqm: [number, number]
    totalEstimate: [number, number] | null
    totalNote: string
  }
  timeline: { totalWeeks: [number, number]; phases: { phase: string; weeks: string }[] }
  nextSteps: { step: number; title: string; detail: string; urgency: string }[]
  professionals: { role: string; why: string; timing: string }[]
  keyInsight: string
  worthIt?: { verdict: string; reason: string }
  alternatives?: { typeKey: string; label: string; cost: string; months: string; note: string }[]
  _liveZone?: LiveZoneMeta
}

// Map AI report role names → professional category IDs
const AI_ROLE_TO_CATEGORY: Record<string, string> = {
  'Town Planner': 'planner',
  'Builder': 'builder',
  'Demolition Contractor': 'demolition',
  'Surveyor': 'engineer',
  'Structural Engineer': 'engineer',
  'Finance Broker': 'finance',
  'Arborist': 'other',
  'Geotechnical Engineer': 'engineer',
  'Architect': 'designer',
  'Building Designer': 'designer',
  'Electrician': 'electrician',
  'Plumber': 'plumber',
}

const RISK_ICONS: Record<string, React.ElementType> = {
  heritage: Landmark,
  flood: Droplets,
  bushfire: Flame,
  zoning: Shield,
  slope: AlertTriangle,
  other: Info,
}

function ScoreMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 42 * pct / 100} ${2 * Math.PI * 42}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-400">/10</span>
      </div>
    </div>
  )
}

const RISK_LEVEL_ZH: Record<string, string> = {
  Low: '低风险',
  Medium: '中等风险',
  High: '高风险',
}

function RiskBadge({ level, lang }: { level: 'Low' | 'Medium' | 'High'; lang: string }) {
  return (
    <span className={cn(
      'text-xs font-semibold px-2 py-0.5 rounded-full',
      level === 'Low' && 'bg-green-100 text-green-700',
      level === 'Medium' && 'bg-yellow-100 text-yellow-700',
      level === 'High' && 'bg-red-100 text-red-700',
    )}>
      {lang === 'zh' ? RISK_LEVEL_ZH[level] || level : level}
    </span>
  )
}

function EmailReportButton({ suburb, state, lang, userEmail }: { suburb: string; state: string; lang: string; userEmail?: string }) {
  const [email, setEmail] = useState(userEmail || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const handleSend = async () => {
    if (!email) return
    setSending(true)
    try {
      await fetch('/api/feasibility/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, suburb, state, lang }),
      })
      setSent(true)
    } catch { /* non-critical */ }
    setSending(false)
  }

  if (sent) return (
    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <CheckCircle className="w-4 h-4 shrink-0" />
      {lang === 'zh' ? '报告已发送到你的邮箱！' : 'Report sent to your email!'}
    </div>
  )

  if (showInput) return (
    <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={lang === 'zh' ? '你的邮箱' : 'your@email.com'}
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        autoFocus
      />
      <button
        onClick={handleSend}
        disabled={sending || !email}
        className="flex items-center gap-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shrink-0"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {lang === 'zh' ? '发送' : 'Send'}
      </button>
    </div>
  )

  return (
    <button
      onClick={() => userEmail ? handleSend() : setShowInput(true)}
      className="inline-flex items-center justify-center gap-2 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
    >
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
      {lang === 'zh' ? '发送报告到邮箱' : 'Email me this report'}
    </button>
  )
}

// ── WeChat-friendly share card (pure canvas, no deps) ─────────────────────────
// Homeowners discuss 6-7 figure decisions in family WeChat groups; give them a
// clean image with the verdict + key numbers so the report shares itself.
function buildShareCard(result: FeasibilityResult, lang: string): string {
  const isZh = lang === 'zh'
  const W = 750, H = 1000, S = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * S
  canvas.height = H * S
  const ctx = canvas.getContext('2d')!
  ctx.scale(S, S)
  const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'

  const wrap = (text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) => {
    let line = '', lines = 0
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW) {
        ctx.fillText(line, x, y + lines * lh)
        lines++
        line = ch
        if (lines >= maxLines - 1) { line += '…'; break }
      } else line += ch
    }
    if (line) { ctx.fillText(line.replace(/…+$/, '…'), x, y + lines * lh); lines++ }
    return y + lines * lh
  }
  const fmtMoney = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}m` : `$${Math.round(n / 1000)}k`

  // bg
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  // header band
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, '#f97316'); grad.addColorStop(1, '#fb923c')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, 130)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 32px ${FONT}`
  ctx.fillText(isZh ? '澳洲建房圈 AusBuildCircle' : 'AusBuildCircle', 40, 58)
  ctx.font = `22px ${FONT}`
  ctx.globalAlpha = 0.9
  ctx.fillText(isZh ? 'AI 地块可行性报告' : 'AI Block Feasibility Report', 40, 96)
  ctx.globalAlpha = 1
  // suburb + type
  ctx.fillStyle = '#111827'
  ctx.font = `bold 42px ${FONT}`
  ctx.fillText(`${result.suburb}${result.state ? ', ' + result.state : ''}`, 40, 205)
  ctx.fillStyle = '#ea580c'
  ctx.font = `bold 24px ${FONT}`
  ctx.fillText(result.projectType || '', 40, 245)
  // score circle (top right)
  const cx = 645, cy = 210, r = 56
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = '#fde8d7'; ctx.lineWidth = 10; ctx.stroke()
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.min(result.feasibilityScore, 10) / 10) * Math.PI * 2)
  ctx.strokeStyle = result.feasibilityScore >= 7 ? '#22c55e' : result.feasibilityScore >= 5 ? '#f59e0b' : '#ef4444'
  ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke()
  ctx.fillStyle = '#111827'; ctx.font = `bold 40px ${FONT}`; ctx.textAlign = 'center'
  ctx.fillText(String(result.feasibilityScore), cx, cy + 8)
  ctx.font = `18px ${FONT}`; ctx.fillStyle = '#6b7280'
  ctx.fillText(result.feasibilityLabel || '', cx, cy + 36)
  ctx.textAlign = 'left'
  // verdict
  ctx.fillStyle = '#374151'
  ctx.font = `25px ${FONT}`
  wrap(result.verdict || '', 40, 305, 670, 38, 4)
  // worth-it / insight box
  const boxY = 470
  ctx.fillStyle = result.worthIt ? '#ecfdf5' : '#fff7ed'
  ctx.beginPath(); ctx.roundRect(40, boxY, 670, 130, 16); ctx.fill()
  ctx.fillStyle = result.worthIt ? '#047857' : '#9a3412'
  ctx.font = `bold 24px ${FONT}`
  ctx.fillText(result.worthIt
    ? `💰 ${isZh ? '值不值' : 'Worth it?'} · ${result.worthIt.verdict}`
    : `💡 ${isZh ? '关键提示' : 'Key insight'}`, 64, boxY + 42)
  ctx.fillStyle = result.worthIt ? '#065f46' : '#7c2d12'
  ctx.font = `21px ${FONT}`
  wrap(result.worthIt ? result.worthIt.reason : (result.keyInsight || ''), 64, boxY + 76, 620, 30, 2)
  // stat boxes
  const ce = result.costEstimate
  const costStr = ce?.totalEstimate ? `${fmtMoney(ce.totalEstimate[0])}–${fmtMoney(ce.totalEstimate[1])}`
    : ce?.buildPerSqm ? `$${ce.buildPerSqm[0]}–${ce.buildPerSqm[1]}/㎡` : '—'
  const tw = result.timeline?.totalWeeks
  const timeStr = tw ? `${Math.round(tw[0] / 4.3)}–${Math.round(tw[1] / 4.3)} ${isZh ? '个月' : 'mo'}` : '—'
  const stats = [
    { label: isZh ? '估算总费用' : 'Est. cost', value: costStr },
    { label: isZh ? '预计工期' : 'Timeline', value: timeStr },
    { label: isZh ? '审批路径' : 'Approval', value: result.approvalPath?.type || '—' },
  ]
  stats.forEach((s, i) => {
    const x = 40 + i * 230
    ctx.fillStyle = '#fff7ed'
    ctx.beginPath(); ctx.roundRect(x, 640, 210, 110, 14); ctx.fill()
    ctx.fillStyle = '#9a3412'; ctx.font = `20px ${FONT}`
    ctx.fillText(s.label, x + 18, 678)
    ctx.fillStyle = '#111827'
    let fs = 27
    ctx.font = `bold ${fs}px ${FONT}`
    while (ctx.measureText(s.value).width > 176 && fs > 16) { fs -= 1; ctx.font = `bold ${fs}px ${FONT}` }
    ctx.fillText(s.value, x + 18, 722)
  })
  // disclaimer + footer
  ctx.fillStyle = '#9ca3af'; ctx.font = `19px ${FONT}`
  ctx.fillText(isZh ? '📊 费用为估算区间（非报价）· 数据含官方规划/地籍来源' : '📊 Estimates only · official planning & cadastre data', 40, 800)
  ctx.strokeStyle = '#f3f4f6'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(40, 850); ctx.lineTo(710, 850); ctx.stroke()
  ctx.fillStyle = '#ea580c'; ctx.font = `bold 26px ${FONT}`
  ctx.fillText('ausbuildcircle.com', 40, 905)
  ctx.fillStyle = '#6b7280'; ctx.font = `22px ${FONT}`
  ctx.fillText(isZh ? '输入地址，2 分钟免费查你家这块地能盖什么' : 'Enter your address — free feasibility in 2 minutes', 40, 945)
  return canvas.toDataURL('image/png')
}

function FeasibilityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
  const langRef = useRef(lang)
  useEffect(() => { langRef.current = lang }, [lang])
  const t = translations[lang]
  const tf = t.feasibility

  const [result, setResult] = useState<FeasibilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suburb, setSuburb] = useState(searchParams.get('suburb') || '')
  const [address, setAddress] = useState(searchParams.get('address') || '')
  const [lotSize, setLotSize] = useState(searchParams.get('lotSize') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [projectType, setProjectType] = useState(searchParams.get('projectType') || 'kdr')
  const [showLoginGate, setShowLoginGate] = useState(false)
  const { user } = useAuth()
  const [dbProfessionals, setDbProfessionals] = useState<Professional[]>([])

  // Fetch DB professionals once on mount
  useEffect(() => {
    fetch('/api/professionals-list')
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        const mapped: Professional[] = data.map((d) => ({
          slug: String(d.business_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: String(d.business_name || ''),
          category: String(d.category || 'other'),
          state: String(d.state || ''),
          regions: Array.isArray(d.regions) ? d.regions as string[] : [],
          specialties: [],
          verified: Boolean(d.verified),
          featured: false,
          description: String(d.description || ''),
          descriptionEn: (d.description_en as string | null) || null,
          website: (d.website as string) || null,
          wechat: (d.wechat as string) || null,
          phone: (d.phone as string) || null,
          languages: Array.isArray(d.languages) ? d.languages as string[] : [],
        }))
        setDbProfessionals(mapped)
      })
      .catch(() => { /* non-critical */ })
  }, [])

  useEffect(() => {
    const s = searchParams.get('suburb')
    if (s) {
      setSuburb(s)
      const pt = searchParams.get('projectType') || 'kdr'
      setProjectType(pt)
      fetchFeasibility(s, searchParams.get('address') || '', searchParams.get('lotSize') || '', searchParams.get('state') || '', langRef.current, pt)
      return
    }
    // Restore saved form data after login redirect
    try {
      const saved = sessionStorage.getItem('feasibility_form')
      if (saved && user) {
        const f = JSON.parse(saved)
        sessionStorage.removeItem('feasibility_form')
        setSuburb(f.suburb || '')
        setAddress(f.address || '')
        setLotSize(f.lotSize || '')
        setState(f.state || '')
        setProjectType(f.projectType || 'kdr')
        if (f.suburb) fetchFeasibility(f.suburb, f.address || '', f.lotSize || '', f.state || '', langRef.current, f.projectType || 'kdr')
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user])

  const [loadingStep, setLoadingStep] = useState(0)
  const [liveFacts, setLiveFacts] = useState<LiveZoneMeta | null>(null)
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // GA4 event helper — no-ops when gtag isn't loaded.
  const track = (name: string, params?: Record<string, unknown>) => {
    try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params) } catch { /* ignore */ }
  }

  const fetchFeasibility = async (sub: string, addr: string, lot: string, st: string, l: string, pt = 'kdr', attempt = 0) => {
    if (!sub) return
    setLoading(true)
    setLoadingStep(0)
    setError('')
    setResult(null)
    setLiveFacts(null)

    // Fast, LLM-free facts lookup in PARALLEL — shows the real block data within
    // seconds, long before the slow AI report finishes. Degrades silently.
    fetch('/api/site-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suburb: sub, address: addr || null, state: st, lotSize: lot ? Number(lot) : null }),
    }).then(r => r.json()).then(d => { if (d?.meta) setLiveFacts(d.meta) }).catch(() => {})

    // Animated step progression (purely cosmetic, gives feedback during the ~8-15s wait)
    const stepTimer1 = setTimeout(() => setLoadingStep(1), 1800)
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 5000)
    const stepTimer3 = setTimeout(() => setLoadingStep(3), 9000)

    try {
      const res = await fetch('/api/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suburb: sub, address: addr || null, lotSize: lot ? Number(lot) : null, state: st, lang: l, projectType: pt, userId: user?.id || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }

      // Read streaming response
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = '{'
      let metaStr = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Check for trailing __META__ or __ERROR__ markers
        if (chunk.includes('\n__META__')) {
          const [textPart, metaPart] = chunk.split('\n__META__')
          accumulated += textPart
          metaStr = metaPart
        } else if (chunk.includes('\n__ERROR__')) {
          const [, errPart] = chunk.split('\n__ERROR__')
          throw new Error(errPart)
        } else {
          accumulated += chunk
        }
      }

      // Parse accumulated JSON — with robust truncation repair
      let result: Record<string, unknown> | null = null

      // Try 1: parse as-is
      try { result = JSON.parse(accumulated) } catch { /* fall through */ }

      // Try 2: auto-close brackets/braces (handles server-side truncation repair)
      if (!result) {
        let repaired = accumulated
        // Trim trailing comma or incomplete value
        repaired = repaired.replace(/,\s*$/, '')
        // Close open string if needed
        const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
        if (quoteCount % 2 === 1) repaired += '"'
        // Remove trailing incomplete key-value (e.g. "key": or "key": "partial)
        repaired = repaired.replace(/,?\s*"[^"]*":\s*"?[^",}\]]*$/, '')
        // Count and close unclosed brackets
        let braces = 0, brackets = 0, inStr = false
        for (let i = 0; i < repaired.length; i++) {
          const c = repaired[i]
          if (c === '"' && (i === 0 || repaired[i - 1] !== '\\')) inStr = !inStr
          if (inStr) continue
          if (c === '{') braces++
          if (c === '}') braces--
          if (c === '[') brackets++
          if (c === ']') brackets--
        }
        for (let i = 0; i < brackets; i++) repaired += ']'
        for (let i = 0; i < braces; i++) repaired += '}'
        try { result = JSON.parse(repaired) } catch { /* fall through */ }
      }

      // Try 3: find last complete top-level property
      if (!result) {
        const end = accumulated.lastIndexOf('}')
        if (end !== -1) {
          const jsonStr = accumulated.slice(0, end + 1)
          for (const sep of ['",\n', '",\r\n', '"\n', ']\n', '}\n']) {
            const safeEnd = jsonStr.lastIndexOf(sep)
            if (safeEnd !== -1) {
              let candidate = jsonStr.slice(0, safeEnd + 1)
              // Close remaining brackets
              let b = 0, k = 0, s = false
              for (let i = 0; i < candidate.length; i++) {
                const c = candidate[i]
                if (c === '"' && (i === 0 || candidate[i - 1] !== '\\')) s = !s
                if (s) continue
                if (c === '{') b++; if (c === '}') b--
                if (c === '[') k++; if (c === ']') k--
              }
              for (let i = 0; i < k; i++) candidate += ']'
              for (let i = 0; i < b; i++) candidate += '}'
              try { result = JSON.parse(candidate); break } catch { /* try next */ }
            }
          }
        }
      }

      if (!result) throw new Error('Response was truncated. Please try again.')


      if (metaStr) {
        try { result._liveZone = JSON.parse(metaStr) } catch { /* ignore */ }
      }

      setResult(result as unknown as FeasibilityResult)
      track('report_generated', { suburb: sub, project_type: pt, retried: attempt > 0 })
    } catch (e) {
      // LLM streaming is occasionally flaky — retry once silently before
      // surfacing an error to the homeowner.
      if (attempt === 0) {
        track('report_retry', { suburb: sub, project_type: pt })
        setTimeout(() => fetchFeasibility(sub, addr, lot, st, l, pt, 1), 300)
        return
      }
      track('report_failed', { suburb: sub, project_type: pt })
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      // Save form data and show login gate
      try {
        sessionStorage.setItem('feasibility_form', JSON.stringify({ suburb, address, lotSize, state, projectType }))
      } catch { /* ignore */ }
      setShowLoginGate(true)
      return
    }
    const params = new URLSearchParams({ suburb, lang, projectType })
    if (address) params.set('address', address)
    if (lotSize) params.set('lotSize', lotSize)
    if (state) params.set('state', state)
    router.push(`/feasibility?${params.toString()}`)
    fetchFeasibility(suburb, address, lotSize, state, lang, projectType)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/feasibility" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
          {/* Project type pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'kdr', en: 'Knockdown & Rebuild', zh: '推倒重建' },
              { value: 'dual-occ', en: 'Dual Occupancy', zh: '双住宅' },
              { value: 'granny-flat', en: 'Granny Flat', zh: 'Granny Flat' },
              { value: 'renovation', en: 'Renovation', zh: '翻新' },
              { value: 'extension', en: 'Extension', zh: '扩建' },
            ].map(pt => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setProjectType(pt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  projectType === pt.value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {lang === 'zh' ? pt.zh : pt.en}
              </button>
            ))}
          </div>
          {/* Primary input: address OR suburb */}
          <div className="relative mb-3">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input
              type="text"
              value={address || suburb}
              onChange={e => {
                const val = e.target.value
                // If input looks like a street address (starts with number), use as address
                if (/^\d/.test(val)) {
                  setAddress(val)
                  // Extract suburb from address: last word-group before state/postcode
                  const parts = val.split(',')
                  const suburbPart = parts.length > 1 ? parts[parts.length - 1].trim().replace(/\s+(NSW|VIC|QLD|WA|SA|ACT|TAS|NT)\s*\d{4}$/i, '').trim() : ''
                  if (suburbPart) setSuburb(suburbPart)
                  else setSuburb(val)
                } else {
                  setSuburb(val)
                  setAddress('')
                }
              }}
              placeholder={lang === 'zh'
                ? '输入街道地址或区域名 — 如：12 Smith St, Strathfield 或 Strathfield'
                : 'Enter address or suburb — e.g. 12 Smith St, Strathfield or just Strathfield'}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 text-[16px]"
              required
            />
            {address && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {lang === 'zh' ? '地址级精准查询' : 'Address-level data'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400"
            >
              <option value="">{t.home.formState}</option>
              {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="number"
              value={lotSize}
              onChange={e => setLotSize(e.target.value)}
              placeholder={lang === 'zh' ? '地块面积 (m²)（可选）' : 'Lot size m² (optional)'}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'zh' ? '填写完整地址可获取地块级精准数据（遗产/洪水/分区）' : 'Full address unlocks parcel-level heritage, flood & zoning data'}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {lang === 'zh' ? '分析中...' : 'Analysing...'}</> : <><MapPin className="w-4 h-4" /> {tf.searchBtn}</>}
          </button>
        </form>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-6" />
            <p className="text-gray-700 text-lg font-semibold mb-6">{tf.loadingTitle}</p>
            {liveFacts && (liveFacts.zoneCode || liveFacts.lotAreaSqm) && (
              <div className="max-w-md mx-auto mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {liveFacts.lotAreaSqm
                    ? (lang === 'zh' ? '已查到你这块地（官方数据）' : 'Found your block (official data)')
                    : (lang === 'zh' ? '已查到该区规划参考（官方数据）' : 'Found area planning data (official)')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {liveFacts.zoneCode && <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">{liveFacts.zoneCode}{liveFacts.zoneName ? ' · ' + liveFacts.zoneName : ''}</span>}
                  {liveFacts.lotAreaSqm && liveFacts.lotSource === 'cadastre' && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">🏠 {lang === 'zh' ? '地块' : 'Lot'} {liveFacts.lotAreaSqm}㎡</span>}
                  {liveFacts.minLotSize && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{lang === 'zh' ? '最小地块' : 'Min lot'} {liveFacts.minLotSize}㎡</span>}
                  {liveFacts.maxHeight && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{lang === 'zh' ? '限高' : 'Max'} {liveFacts.maxHeight}m</span>}
                </div>
                <p className="text-[11px] text-green-600 mt-2">{lang === 'zh' ? 'AI 正在据此生成你的完整报告…' : 'AI is writing your full report from this…'}</p>
              </div>
            )}
            <div className="max-w-xs mx-auto space-y-3 text-left">
              {(lang === 'zh'
                ? ['正在查询规划分区数据...', '正在分析地块条件与风险...', '正在估算建设费用与时间线...', '正在生成可行性报告...']
                : ['Looking up planning zone data...', 'Analysing site conditions & risks...', 'Estimating costs & timeline...', 'Generating feasibility report...']
              ).map((step, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${loadingStep >= i ? 'opacity-100' : 'opacity-25'}`}>
                  {loadingStep > i
                    ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    : loadingStep === i
                      ? <Loader2 className="w-5 h-5 animate-spin text-orange-400 shrink-0" />
                      : <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                  }
                  <span className={`text-sm ${loadingStep >= i ? 'text-gray-700' : 'text-gray-400'}`}>{step}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-6">{tf.loadingSubtitle}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => fetchFeasibility(suburb, address, lotSize, state, lang, projectType)} className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline">
              {lang === 'zh' ? '重试' : 'Try again'}
            </button>
          </div>
        )}

        {result && !loading && shareCardUrl && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShareCardUrl(null)}>
            <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shareCardUrl} alt="share card" className="w-full rounded-xl border border-gray-200" />
              <p className="text-xs text-gray-400 text-center mt-2">
                {lang === 'zh' ? '手机长按图片保存，发到微信群和家人一起看' : 'Long-press to save and share with family'}
              </p>
              <div className="flex gap-2 mt-3">
                <a href={shareCardUrl} download={`ausbuildcircle-${result.suburb || 'report'}.png`}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl text-center">
                  {lang === 'zh' ? '下载图片' : 'Download'}
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/feasibility?suburb=${encodeURIComponent(result.suburb || suburb)}&state=${encodeURIComponent(result.state || state)}&projectType=${encodeURIComponent(projectType)}&lang=${lang}&utm_source=share_card&utm_medium=wechat`
                    navigator.clipboard?.writeText(url).then(() => {
                      setLinkCopied(true)
                      track('share_link_copied', { suburb: result.suburb })
                    }).catch(() => { /* clipboard unavailable */ })
                  }}
                  className="flex-1 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-semibold py-2.5 rounded-xl">
                  {linkCopied ? (lang === 'zh' ? '✓ 已复制' : '✓ Copied') : (lang === 'zh' ? '复制报告链接' : 'Copy link')}
                </button>
                <button onClick={() => setShareCardUrl(null)} className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900">
                  {lang === 'zh' ? '关闭' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            {/* Report level banner — make crystal clear whether this is THEIR block or the area */}
            {result._liveZone?.lotSource === 'cadastre' ? null : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
                <span className="font-semibold text-blue-700">📍 {lang === 'zh' ? '区域分析报告' : 'Suburb-level report'}</span>
                <span className="text-blue-800/80">
                  {lang === 'zh'
                    ? `以下是 ${result.suburb} 的整体情况（按该区典型地块分析），不代表你家具体地块。`
                    : `General analysis for ${result.suburb} based on typical lots — not your specific block.`}
                </span>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-blue-700 font-semibold hover:text-blue-900 text-xs underline underline-offset-2">
                  {lang === 'zh' ? '输入完整门牌地址，免费升级成你家地块的专属报告 ↑' : 'Enter your full street address for a block-specific report ↑'}
                </button>
              </div>
            )}
            {/* Live zone banner */}
            {result._liveZone && (
              <div className="flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  {result._liveZone.lotSource === 'cadastre'
                    ? (lang === 'zh' ? '📐 你家地块 · 实测官方数据' : '📐 Your block · measured official data')
                    : (lang === 'zh' ? '实时规划数据' : 'Live Planning Data')}
                </span>
                <span className="text-green-600">
                  {(() => {
                    const s = result._liveZone.source
                    const name = s === 'nsw-eplan' ? 'NSW ePlanning Portal'
                      : s === 'vic-vicplan' ? 'VicPlan'
                      : (lang === 'zh' ? 'NSW 地籍' : 'NSW Cadastre') // source 为空=分区未命中、但地块数据来自地籍
                    return lang === 'zh' ? `已从 ${name} 读取实时数据` : `Live data from ${name}`
                  })()}
                </span>
                <div className="flex flex-wrap gap-2 ml-auto">
                  {result._liveZone.zoneCode && (
                    <span className="bg-green-100 text-green-800 font-mono text-xs px-2 py-0.5 rounded-full border border-green-200">
                      {result._liveZone.zoneCode} · {result._liveZone.zoneName}
                    </span>
                  )}
                  {result._liveZone.fsr && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200">
                      FSR {result._liveZone.fsr}
                    </span>
                  )}
                  {result._liveZone.maxHeight && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200">
                      {lang === 'zh' ? `限高 ${result._liveZone.maxHeight}m` : `Max ${result._liveZone.maxHeight}m`}
                    </span>
                  )}
                  {result._liveZone.minLotSize && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200">
                      {lang === 'zh' ? `最小地块 ${result._liveZone.minLotSize}m²` : `Min lot ${result._liveZone.minLotSize}m²`}
                    </span>
                  )}
                  {result._liveZone.lotAreaSqm && result._liveZone.lotSource === 'cadastre' && (
                    <span className="bg-green-100 text-green-800 font-semibold text-xs px-2 py-0.5 rounded-full border border-green-200">
                      {lang === 'zh' ? `🏠 地块 ${result._liveZone.lotAreaSqm}m² 实测` : `🏠 Lot ${result._liveZone.lotAreaSqm}m² (cadastre)`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Verdict */}
              <div className={cn(
                'rounded-2xl p-4 flex flex-col items-center justify-center text-center border',
                result.feasibilityScore >= 7 ? 'bg-green-50 border-green-200' :
                result.feasibilityScore >= 5 ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              )}>
                {result.feasibilityScore >= 7
                  ? <CheckCircle className="w-6 h-6 text-green-500 mb-1.5" />
                  : result.feasibilityScore >= 5
                    ? <AlertTriangle className="w-6 h-6 text-yellow-500 mb-1.5" />
                    : <XCircle className="w-6 h-6 text-red-500 mb-1.5" />}
                <p className="text-xs text-gray-500 mb-0.5">{lang === 'zh' ? '可行性' : 'Verdict'}</p>
                <p className={cn(
                  'text-sm font-bold',
                  result.feasibilityScore >= 7 ? 'text-green-700' :
                  result.feasibilityScore >= 5 ? 'text-yellow-700' : 'text-red-700'
                )}>{result.feasibilityLabel}</p>
              </div>
              {/* Cost */}
              <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200">
                <DollarSign className="w-6 h-6 text-orange-400 mb-1.5" />
                <p className="text-xs text-gray-500 mb-0.5">{lang === 'zh' ? '估算总费用' : 'Est. Total Cost'}</p>
                {result.costEstimate.totalEstimate ? (
                  <p className="text-sm font-bold text-gray-900">
                    ${Math.round(result.costEstimate.totalEstimate[0] / 1000)}k–${Math.round(result.costEstimate.totalEstimate[1] / 1000)}k
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">{lang === 'zh' ? '输入地块面积获取' : 'Enter lot size'}</p>
                )}
              </div>
              {/* Timeline */}
              <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200">
                <Clock className="w-6 h-6 text-purple-400 mb-1.5" />
                <p className="text-xs text-gray-500 mb-0.5">{lang === 'zh' ? '预计工期' : 'Timeline'}</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round(result.timeline.totalWeeks[0] / 4)}–{Math.round(result.timeline.totalWeeks[1] / 4)} {lang === 'zh' ? '个月' : 'months'}
                </p>
              </div>
              {/* Approval path */}
              <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200">
                <Shield className="w-6 h-6 text-blue-400 mb-1.5" />
                <p className="text-xs text-gray-500 mb-0.5">{lang === 'zh' ? '审批路径' : 'Approval'}</p>
                <p className="text-sm font-bold text-blue-700">{result.approvalPath.type}</p>
              </div>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <ScoreMeter score={result.feasibilityScore} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{result.suburb}</h1>
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{result.state}</span>
                    {result.projectType && (
                      <span className="text-sm bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full font-medium">
                        {result.projectType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{result.council}</p>
                  <div className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-4',
                    result.feasibilityScore >= 7 ? 'bg-green-100 text-green-700' :
                    result.feasibilityScore >= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {result.feasibilityScore >= 7 ? <CheckCircle className="w-4 h-4" /> :
                     result.feasibilityScore >= 5 ? <AlertTriangle className="w-4 h-4" /> :
                     <XCircle className="w-4 h-4" />}
                    {result.feasibilityLabel}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{result.verdict}</p>
                </div>
              </div>
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-orange-800 text-sm leading-relaxed">
                    <strong>{tf.keyInsight}:</strong> {result.keyInsight}
                  </p>
                </div>
              </div>
              {result.worthIt && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 leading-none">💰</span>
                    <p className="text-emerald-900 text-sm leading-relaxed">
                      <strong>{lang === 'zh' ? '值不值' : 'Worth it?'} · {result.worthIt.verdict}</strong>
                      {' — '}{result.worthIt.reason}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  try {
                    setShareCardUrl(buildShareCard(result, lang))
                    setLinkCopied(false)
                    track('share_card_created', { suburb: result.suburb, project_type: result.projectType })
                  } catch { /* canvas unsupported — ignore */ }
                }}
                className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                📤 {lang === 'zh' ? '生成分享卡片（发微信群一起看）' : 'Create a share card'}
              </button>
            </div>

            {/* Lot Size Check */}
            {result.lotSizeCheck.passed !== null && (
              <div className={cn(
                'rounded-2xl p-5 border flex items-start gap-4',
                result.lotSizeCheck.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              )}>
                {result.lotSizeCheck.passed
                  ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  : <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />}
                <div>
                  <p className={cn('font-semibold', result.lotSizeCheck.passed ? 'text-green-700' : 'text-red-700')}>
                    {result.lotSizeCheck.passed ? tf.lotSizePassed : tf.lotSizeFailed}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{result.lotSizeCheck.message}</p>
                </div>
              </div>
            )}

            {/* Risk Flags */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                {tf.riskTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.riskFlags.map((flag, i) => {
                  const Icon = RISK_ICONS[flag.type] || Info
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{flag.title}</span>
                        </div>
                        <RiskBadge level={flag.level} lang={lang} />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{flag.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Approval + Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  {tf.approvalTitle}
                </h2>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg mb-3">
                  {result.approvalPath.type}
                </div>
                {result.approvalPath.timelineWeeks && (
                  <p className="text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4 inline mr-1 text-gray-400" />
                    {result.approvalPath.timelineWeeks[0]}–{result.approvalPath.timelineWeeks[1]} {tf.approvalWeeks}
                  </p>
                )}
                <p className="text-sm text-gray-500 leading-relaxed">{result.approvalPath.description}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  {tf.costTitle}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tf.demolition}</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${result.costEstimate.demolition[0].toLocaleString()} – ${result.costEstimate.demolition[1].toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tf.buildPerSqm}</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${result.costEstimate.buildPerSqm[0].toLocaleString()} – ${result.costEstimate.buildPerSqm[1].toLocaleString()}
                    </span>
                  </div>
                  {result.costEstimate.totalEstimate && (
                    <div className="border-t border-gray-200 pt-3 mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{tf.totalEstimate}</span>
                      <span className="text-sm font-bold text-orange-500">
                        ${(result.costEstimate.totalEstimate[0] / 1000).toFixed(0)}k – ${(result.costEstimate.totalEstimate[1] / 1000).toFixed(0)}k
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{result.costEstimate.totalNote}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                {tf.timelineTitle}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {tf.totalWeeks}: {result.timeline.totalWeeks[0]}–{result.timeline.totalWeeks[1]} {lang === 'zh' ? '周' : 'weeks'}
                （{Math.round(result.timeline.totalWeeks[0] / 4)}–{Math.round(result.timeline.totalWeeks[1] / 4)} {tf.months}）
              </p>
              <div className="space-y-3">
                {result.timeline.phases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-purple-600">{i + 1}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{phase.phase}</span>
                      <span className="text-sm text-gray-400">{phase.weeks} {lang === 'zh' ? '周' : 'wks'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternatives — same block, other paths */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span>🔀</span>{lang === 'zh' ? '同一块地，还能怎么做？' : 'Same block, other options'}
                </h2>
                <p className="text-xs text-gray-400 mb-4">{lang === 'zh' ? 'AI 顺手帮你比了比另外两条路，想看哪条点一下就重查' : 'Two other paths compared — one click to re-run'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-gray-900">{alt.label}</p>
                        <span className="text-xs text-gray-400 shrink-0">{alt.months} {lang === 'zh' ? '个月' : 'months'}</span>
                      </div>
                      <p className="text-sm font-semibold text-orange-600 mb-1.5">{alt.cost} <span className="text-[10px] font-normal text-gray-400">{lang === 'zh' ? '估算' : 'est.'}</span></p>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{alt.note}</p>
                      <button
                        onClick={() => { setProjectType(alt.typeKey); fetchFeasibility(suburb, address, lotSize, state, lang, alt.typeKey); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 text-left"
                      >
                        {lang === 'zh' ? '换这个方案查一查 →' : 'Re-run with this →'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-orange-500" />
                {tf.nextStepsTitle}
              </h2>
              {(() => {
                const first = result.nextSteps.find(s => s.urgency === 'First') || result.nextSteps[0]
                return first ? (
                  <div className="mb-4 bg-orange-500 text-white rounded-xl p-4">
                    <div className="text-xs font-semibold text-orange-50 mb-1">{lang === 'zh' ? '👉 下一步，就做这一件' : '👉 Your single next step'}</div>
                    <div className="text-base font-bold">{first.title}</div>
                    <div className="text-sm text-orange-50 mt-1 leading-relaxed">{first.detail}</div>
                  </div>
                ) : null
              })()}
              <div className="space-y-4">
                {result.nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-orange-600">{step.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{step.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Board CTA — flip the funnel: let merchants come to the homeowner */}
            <div className="rounded-2xl p-6 border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <h2 className="text-base font-bold text-gray-900 mb-1.5">
                {lang === 'zh' ? '📣 不想一家家去找？把需求挂到对接大厅' : '📣 Done searching? Post your brief instead'}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {lang === 'zh'
                  ? '免费发布你的项目需求（只显示区域，不公开门牌和联系方式），让商家来响应你。商家名片会发到你邮箱，联系谁你自己挑。'
                  : 'Post your project brief for free — suburb only, no address or contact shown. Merchant cards arrive in your inbox and you choose who to talk to.'}
              </p>
              <a
                href={`/board?publish=1&suburb=${encodeURIComponent(result.suburb || suburb)}&state=${encodeURIComponent(state)}&type=${encodeURIComponent(projectType)}${result._liveZone?.lotAreaSqm && result._liveZone.lotSource === 'cadastre' ? `&lot=${result._liveZone.lotAreaSqm}` : ''}&report=1`}
                onClick={() => track('board_cta_from_report', { suburb: result.suburb })}
                className="inline-block px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {lang === 'zh' ? '带着这份报告去发布 →' : 'Publish with this report →'}
              </a>
            </div>

            {/* Professionals */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                {tf.prosTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.professionals.map((pro, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-semibold text-cyan-700 mb-1">{pro.role}</p>
                    <p className="text-xs text-gray-500 mb-1">{pro.why}</p>
                    <p className="text-xs text-gray-400 italic">{pro.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Professionals from Directory */}
            {(() => {
              // Derive matching category IDs from AI report roles
              const roleCats = new Set(
                (result.professionals || [])
                  .map(p => AI_ROLE_TO_CATEGORY[p.role])
                  .filter(Boolean)
              )
              const userState = (result.state || state || '').toUpperCase()

              // Combine static + DB professionals, filter by state & role
              const allPros = [...PROFESSIONALS, ...dbProfessionals]
              const matched = allPros.filter(p => {
                const stateMatch = p.state === userState || p.regions.includes('All Australia')
                const roleMatch = roleCats.has(p.category)
                return stateMatch && roleMatch
              })
              // Deduplicate by slug
              const seen = new Set<string>()
              const unique = matched.filter(p => {
                if (seen.has(p.slug)) return false
                seen.add(p.slug)
                return true
              })
              // Prioritize verified, then limit to 6
              unique.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
              const display = unique.slice(0, 6)

              const stateSlug = userState.toLowerCase()

              return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    {tf.recProsTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mb-5">{tf.recProsSubtitle}</p>

                  {display.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {display.map((pro) => {
                        const cat = CATEGORIES.find(c => c.id === pro.category)
                        return (
                          <div key={pro.slug} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900 flex-1 truncate">{pro.name}</span>
                              {pro.verified && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                                  {tf.recProsVerified}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-orange-600 font-medium mb-1">
                              {cat ? (lang === 'zh' ? cat.labelZh : cat.label) : pro.category}
                            </span>
                            <span className="text-xs text-gray-400 mb-3 line-clamp-1">
                              {pro.regions.slice(0, 3).join(', ')}
                            </span>
                            <Link
                              href={`/professionals/${stateSlug}/${pro.slug}`}
                              className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 transition-colors"
                            >
                              {tf.recProsContact} →
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{tf.recProsEmpty}</p>
                  )}

                  <div className="mt-5 text-center">
                    <Link
                      href={`/professionals/${stateSlug || ''}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {tf.recProsViewAll} →
                    </Link>
                  </div>
                </div>
              )
            })()}

            {/* Post-report CTA section */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{tf.ctaTitle}</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto text-center">
                {lang === 'zh'
                  ? `我们在 ${result.suburb} 附近有认证的 Builder、Town Planner 等专业人士，他们了解当地情况，可以直接联系咨询。`
                  : `Our verified builders, town planners, and specialists near ${result.suburb} know the local rules — reach out directly.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* 1. Find professionals — link filtered to report state + top recommended role */}
                <Link
                  href={(() => {
                    const ROLE_TO_CAT: Record<string, string> = {
                      'Town Planner': 'planner', 'Builder': 'builder', 'Architect': 'designer',
                      'Structural Engineer': 'engineer', 'Finance Broker': 'finance',
                      'Demolition Contractor': 'demolition', 'Surveyor': 'other',
                      'Arborist': 'other', 'Geotechnical Engineer': 'other',
                    }
                    const role = result.professionals?.[0]?.role || ''
                    const cat = ROLE_TO_CAT[role] || ''
                    const stateSlug = (result.state || '').toLowerCase()
                    return `/professionals/${stateSlug}${cat ? `?category=${cat}` : ''}`
                  })()}
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
                >
                  {lang === 'zh'
                    ? `在 ${result.state || '附近'} 找 ${result.professionals?.[0]?.role || '专业人士'} →`
                    : `Find a ${result.professionals?.[0]?.role || 'Professional'} in ${result.suburb} →`}
                </Link>
                {/* 2. Email report */}
                <EmailReportButton suburb={result.suburb} state={result.state} lang={lang} userEmail={user?.email} />
              </div>
              {/* 3. Run another suburb */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setResult(null)
                    setSuburb('')
                    setAddress('')
                    setLotSize('')
                    setState('')
                    router.push('/feasibility')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-orange-100"
                >
                  <Home className="w-4 h-4" />
                  {lang === 'zh' ? '换一个区域重新查询' : 'Run another suburb'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">{tf.ctaFree}</p>
            </div>

            <p className="text-center text-xs text-gray-400 pb-4">{tf.disclaimer}</p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="space-y-8">
            <div className="text-center pt-6 pb-2">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">{tf.emptyState}</p>
            </div>

            {/* Report preview mockup */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                {lang === 'zh' ? '你将获得什么？' : 'What you\'ll get'}
              </h3>
              <p className="text-sm text-gray-400 text-center mb-6">
                {lang === 'zh' ? '每份报告包含以下专业分析模块' : 'Every report includes these professional analysis modules'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Feasibility Score */}
                <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-green-300 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-green-600">8.2</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {lang === 'zh' ? '可行性评分' : 'Feasibility Score'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">1-10</p>
                </div>

                {/* Risk Flags */}
                <div className="rounded-xl border-2 border-dashed border-yellow-200 bg-yellow-50/50 p-4 flex flex-col items-center text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">
                    {lang === 'zh' ? '风险预警' : 'Risk Flags'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lang === 'zh' ? '遗产/洪水/山火' : 'Heritage / Flood / Fire'}
                  </p>
                </div>

                {/* Cost Estimate */}
                <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-4 flex flex-col items-center text-center">
                  <DollarSign className="w-8 h-8 text-orange-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">
                    {lang === 'zh' ? '费用估算' : 'Cost Estimate'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lang === 'zh' ? '拆除+建造范围' : 'Demo + build range'}
                  </p>
                </div>

                {/* Approval Path */}
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 flex flex-col items-center text-center">
                  <Shield className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">
                    {lang === 'zh' ? '审批路径' : 'Approval Path'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lang === 'zh' ? 'CDC/DA + 时间线' : 'CDC/DA + timeline'}
                  </p>
                </div>

                {/* Recommended Professionals */}
                <div className="rounded-xl border-2 border-dashed border-cyan-200 bg-cyan-50/50 p-4 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                  <Users className="w-8 h-8 text-cyan-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">
                    {lang === 'zh' ? '推荐专家' : 'Recommended Pros'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lang === 'zh' ? '按你的项目匹配' : 'Matched to your project'}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-5">
                {lang === 'zh' ? '完全免费 · AI 实时生成 · 约 15 秒出结果' : 'Completely free · AI-generated in real time · ~15 seconds'}
              </p>
            </div>
          </div>
        )}
      </div>

      {showLoginGate && (
        <LoginGateModal
          onClose={() => setShowLoginGate(false)}
          redirectAfter="/feasibility"
          subtitle={{
            zh: '登录后即可免费使用 AI 地块可行性分析，你之前填写的信息会自动保留。',
            en: 'Sign in to run the free AI feasibility analysis. Your form data will be saved.',
          }}
        />
      )}
    </div>
  )
}

const feasibilityJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI Feasibility Report — Knockdown Rebuild & Renovation",
  "url": "https://ausbuildcircle.com/feasibility",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "AUD" },
  "description": "Free AI feasibility report for knockdown rebuild, renovation, extension, granny flat and dual occupancy projects across all Australian councils.",
  "inLanguage": ["en-AU", "zh-Hans"],
  "provider": {
    "@type": "Organization",
    "name": "AusBuildCircle 澳洲建房圈",
    "url": "https://ausbuildcircle.com"
  }
}

export default function FeasibilityPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(feasibilityJsonLd) }} />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      }>
        <FeasibilityContent />
      </Suspense>
    </>
  )
}
