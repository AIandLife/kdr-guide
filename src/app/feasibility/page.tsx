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

  const fetchFeasibility = async (sub: string, addr: string, lot: string, st: string, l: string, pt = 'kdr') => {
    if (!sub) return
    setLoading(true)
    setLoadingStep(0)
    setError('')
    setResult(null)

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
    } catch (e) {
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

        {result && !loading && (
          <div className="space-y-6">
            {/* Live zone banner */}
            {result._liveZone && (
              <div className="flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  {lang === 'zh' ? '实时规划数据' : 'Live Planning Data'}
                </span>
                <span className="text-green-600">
                  {lang === 'zh'
                    ? `已从${result._liveZone.source === 'nsw-eplan' ? 'NSW ePlanning Portal' : result._liveZone.source === 'vic-vicplan' ? 'VicPlan' : result._liveZone.source}读取实时分区数据`
                    : `Zone data pulled live from ${result._liveZone.source === 'nsw-eplan' ? 'NSW ePlanning Portal' : result._liveZone.source === 'vic-vicplan' ? 'VicPlan' : result._liveZone.source}`}
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

            {/* Next Steps */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-orange-500" />
                {tf.nextStepsTitle}
              </h2>
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
