'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  MapPin, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign,
  ChevronRight, Building2, ArrowLeft, Loader2, Users, Flame,
  Droplets, Landmark, Shield, Info
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'

interface RiskFlag {
  type: string
  level: 'Low' | 'Medium' | 'High'
  title: string
  detail: string
}

interface FeasibilityResult {
  suburb: string
  state: string
  council: string
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
        <circle cx="50" cy="50" r="42" fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 42 * pct / 100} ${2 * Math.PI * 42}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-500">/10</span>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  return (
    <span className={cn(
      'text-xs font-semibold px-2 py-0.5 rounded-full',
      level === 'Low' && 'bg-green-500/20 text-green-400',
      level === 'Medium' && 'bg-yellow-500/20 text-yellow-400',
      level === 'High' && 'bg-red-500/20 text-red-400',
    )}>
      {level}
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
  const [lotSize, setLotSize] = useState(searchParams.get('lotSize') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')

  useEffect(() => {
    const s = searchParams.get('suburb')
    if (s) {
      setSuburb(s)
      fetchFeasibility(s, searchParams.get('lotSize') || '', searchParams.get('state') || '', lang)
    }
  }, [searchParams, lang])

  const fetchFeasibility = async (sub: string, lot: string, st: string, l: string) => {
    if (!sub) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suburb: sub, lotSize: lot ? Number(lot) : null, state: st, lang: l }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ suburb, lang })
    if (lotSize) params.set('lotSize', lotSize)
    if (state) params.set('state', state)
    router.push(`/feasibility?${params.toString()}`)
    fetchFeasibility(suburb, lotSize, state, lang)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">{t.nav.brand}</span>
          </a>
          <div className="flex items-center gap-3">
            <LangToggle />
            <a href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.nav.back}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
                placeholder={t.home.formSuburbPlaceholder}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
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
              className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {lang === 'zh' ? '分析中...' : 'Analysing...'}</> : <><MapPin className="w-4 h-4" /> {tf.searchBtn}</>}
          </button>
        </form>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{tf.loadingTitle}</p>
            <p className="text-gray-600 text-sm mt-2">{tf.loadingSubtitle}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => fetchFeasibility(suburb, lotSize, state, lang)} className="mt-4 text-sm text-gray-400 hover:text-white underline">
              {lang === 'zh' ? '重试' : 'Try again'}
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <ScoreMeter score={result.feasibilityScore} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{result.suburb}</h1>
                    <span className="text-sm bg-gray-800 text-gray-400 px-3 py-1 rounded-full">{result.state}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{result.council}</p>
                  <div className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-4',
                    result.feasibilityScore >= 7 ? 'bg-green-500/20 text-green-400' :
                    result.feasibilityScore >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  )}>
                    {result.feasibilityScore >= 7 ? <CheckCircle className="w-4 h-4" /> :
                     result.feasibilityScore >= 5 ? <AlertTriangle className="w-4 h-4" /> :
                     <XCircle className="w-4 h-4" />}
                    {result.feasibilityLabel}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{result.verdict}</p>
                </div>
              </div>
              <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-orange-200 text-sm leading-relaxed">
                    <strong>{tf.keyInsight}:</strong> {result.keyInsight}
                  </p>
                </div>
              </div>
            </div>

            {/* Lot Size Check */}
            {result.lotSizeCheck.passed !== null && (
              <div className={cn(
                'rounded-2xl p-5 border flex items-start gap-4',
                result.lotSizeCheck.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              )}>
                {result.lotSizeCheck.passed
                  ? <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                  : <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}
                <div>
                  <p className={cn('font-semibold', result.lotSizeCheck.passed ? 'text-green-400' : 'text-red-400')}>
                    {result.lotSizeCheck.passed ? tf.lotSizePassed : tf.lotSizeFailed}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{result.lotSizeCheck.message}</p>
                </div>
              </div>
            )}

            {/* Risk Flags */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                {tf.riskTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.riskFlags.map((flag, i) => {
                  const Icon = RISK_ICONS[flag.type] || Info
                  return (
                    <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-white">{flag.title}</span>
                        </div>
                        <RiskBadge level={flag.level} />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{flag.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Approval + Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  {tf.approvalTitle}
                </h2>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-sm font-semibold px-3 py-1.5 rounded-lg mb-3">
                  {result.approvalPath.type}
                </div>
                {result.approvalPath.timelineWeeks && (
                  <p className="text-sm text-gray-400 mb-3">
                    <Clock className="w-4 h-4 inline mr-1 text-gray-500" />
                    {result.approvalPath.timelineWeeks[0]}–{result.approvalPath.timelineWeeks[1]} {tf.approvalWeeks}
                  </p>
                )}
                <p className="text-sm text-gray-500 leading-relaxed">{result.approvalPath.description}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  {tf.costTitle}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tf.demolition}</span>
                    <span className="text-sm font-medium text-white">
                      ${result.costEstimate.demolition[0].toLocaleString()} – ${result.costEstimate.demolition[1].toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tf.buildPerSqm}</span>
                    <span className="text-sm font-medium text-white">
                      ${result.costEstimate.buildPerSqm[0].toLocaleString()} – ${result.costEstimate.buildPerSqm[1].toLocaleString()}
                    </span>
                  </div>
                  {result.costEstimate.totalEstimate && (
                    <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{tf.totalEstimate}</span>
                      <span className="text-sm font-bold text-orange-400">
                        ${(result.costEstimate.totalEstimate[0] / 1000).toFixed(0)}k – ${(result.costEstimate.totalEstimate[1] / 1000).toFixed(0)}k
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">{result.costEstimate.totalNote}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                {tf.timelineTitle}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {tf.totalWeeks}: {result.timeline.totalWeeks[0]}–{result.timeline.totalWeeks[1]} {lang === 'zh' ? '周' : 'weeks'}
                （{Math.round(result.timeline.totalWeeks[0] / 4)}–{Math.round(result.timeline.totalWeeks[1] / 4)} {tf.months}）
              </p>
              <div className="space-y-3">
                {result.timeline.phases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-purple-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-300">{phase.phase}</span>
                      <span className="text-sm text-gray-500">{phase.weeks} {lang === 'zh' ? '周' : 'wks'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-orange-400" />
                {tf.nextStepsTitle}
              </h2>
              <div className="space-y-4">
                {result.nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-orange-400">{step.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{step.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professionals */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                {tf.prosTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.professionals.map((pro, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-cyan-400 mb-1">{pro.role}</p>
                    <p className="text-xs text-gray-400 mb-1">{pro.why}</p>
                    <p className="text-xs text-gray-600 italic">{pro.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead CTA */}
            <div className="bg-gradient-to-br from-orange-900/30 to-gray-900 border border-orange-500/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{tf.ctaTitle}</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {tf.ctaSubtitle} {result.suburb}。{tf.ctaFree}
              </p>
              {!leadSubmitted ? (
                <form onSubmit={e => { e.preventDefault(); setLeadSubmitted(true) }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder={tf.ctaEmail}
                    required
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                    {tf.ctaBtn}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">{tf.ctaSuccess}</span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-700 pb-4">{tf.disclaimer}</p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-gray-700 mx-auto mb-4" />
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    }>
      <FeasibilityContent />
    </Suspense>
  )
}
