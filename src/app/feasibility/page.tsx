'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  MapPin, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign,
  ChevronRight, Loader2, Users, Flame,
  Droplets, Landmark, Shield, Info
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'

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

function FeasibilityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
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
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')

  useEffect(() => {
    const s = searchParams.get('suburb')
    if (s) {
      setSuburb(s)
      const pt = searchParams.get('projectType') || 'kdr'
      setProjectType(pt)
      fetchFeasibility(s, searchParams.get('address') || '', searchParams.get('lotSize') || '', searchParams.get('state') || '', lang, pt)
    }
  }, [searchParams, lang])

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
        body: JSON.stringify({ suburb: sub, address: addr || null, lotSize: lot ? Number(lot) : null, state: st, lang: l, projectType: pt }),
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

      // Parse accumulated JSON
      const end = accumulated.lastIndexOf('}')
      if (end === -1) throw new Error('No JSON found in response')
      let jsonStr = accumulated.slice(0, end + 1)
      let result: Record<string, unknown>
      try {
        result = JSON.parse(jsonStr)
      } catch {
        const safeEnd = jsonStr.lastIndexOf('",\n')
        if (safeEnd === -1) throw new Error('Response was truncated. Please try again.')
        jsonStr = jsonStr.slice(0, safeEnd + 1) + '}'
        result = JSON.parse(jsonStr)
      }

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
              { value: 'renovation', en: 'Renovation', zh: '翻新' },
              { value: 'extension', en: 'Extension', zh: '扩建' },
              { value: 'granny-flat', en: 'Granny Flat', zh: 'Granny Flat' },
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
                placeholder={t.home.formSuburbPlaceholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
                required
              />
            </div>
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
              placeholder={lang === 'zh' ? '地块面积 (m²)' : 'Lot size (m²)'}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
          </div>
          {/* Street address — optional, enables live zoning lookup */}
          <div className="mt-3 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={lang === 'zh'
                ? '街道地址（可选）— 填写后启用实时规划区数据，例如：123 Smith Street, Bondi'
                : 'Street address (optional) — enables live zoning lookup, e.g. 123 Smith Street, Bondi'}
              className="w-full bg-green-50 border border-green-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 text-sm"
            />
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
                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
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

            {/* Lead CTA */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{tf.ctaTitle}</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {tf.ctaSubtitle} {result.suburb}。{tf.ctaFree}
              </p>
              {!leadSubmitted ? (
                <form onSubmit={async e => {
                  e.preventDefault()
                  await fetch('/api/feasibility/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: leadEmail,
                      suburb: result?.suburb,
                      state: result?.state,
                      projectType: result?.projectType,
                    }),
                  }).catch(() => {})
                  setLeadSubmitted(true)
                }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder={tf.ctaEmail}
                    required
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  />
                  <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                    {tf.ctaBtn}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">{tf.ctaSuccess}</span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-400 pb-4">{tf.disclaimer}</p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{tf.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FeasibilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    }>
      <FeasibilityContent />
    </Suspense>
  )
}
