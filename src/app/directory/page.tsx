'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle, MapPin, Phone, ChevronRight,
  Briefcase, Globe, MessageCircle, X, TrendingUp, Activity, Heart,
  HelpCircle, Mail, Star, Send, Loader2
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'
import { useAuth } from '@/lib/auth-context'
import { PROJECT_LABELS, formatTimeAgo, getRotationInterval, getInitialSignals, getWeeklyStats, type DemandSignal } from '@/lib/demand-signals'
import { PROFESSIONALS, CATEGORIES, type Professional } from '@/lib/professionals-data'
import {
  SUPPLIERS, SUPPLIER_CATEGORIES, rankSuppliers,
  type SupplierCategory, type SupplierOrigin, type Supplier
} from '@/lib/suppliers-data'

// ═══════════════════════════════════════════════════════════════════════════════
// PROFESSIONALS TAB — copied from /professionals/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_PILL: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
}

interface ApiSignal extends DemandSignal { isReal?: boolean }

function DemandFeed({ isZh }: { isZh: boolean }) {
  const [signals, setSignals] = useState<ApiSignal[]>(() => getInitialSignals())
  const initStats = getWeeklyStats()
  const [weeklyCount, setWeeklyCount] = useState(initStats.weeklyCount)
  const [stateBreakdown, setStateBreakdown] = useState<Record<string, number>>(initStats.stateBreakdown)
  const [kdrPct, setKdrPct] = useState(initStats.kdrPct)
  const [flashIdx, setFlashIdx] = useState<number>(-1)

  useEffect(() => {
    fetch('/api/demand-signals')
      .then(r => r.json())
      .then(data => {
        setSignals(data.signals ?? [])
        setWeeklyCount(data.weeklyCount ?? 0)
        setStateBreakdown(data.stateBreakdown ?? {})
        setKdrPct(data.kdrPct ?? 52)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (signals.length === 0) return
    function scheduleNext() {
      const interval = getRotationInterval()
      return setTimeout(() => {
        fetch('/api/demand-signals')
          .then(r => r.json())
          .then(data => {
            const fresh = data.signals ?? []
            const prevTop = signals[0]
            const newTop = fresh[0]
            if (newTop && (!prevTop || newTop.suburb !== prevTop.suburb || newTop.isReal !== prevTop.isReal)) {
              setFlashIdx(0)
              setTimeout(() => setFlashIdx(-1), 1200)
            }
            setSignals(fresh)
            setWeeklyCount(data.weeklyCount ?? weeklyCount)
            setStateBreakdown(data.stateBreakdown ?? stateBreakdown)
            setKdrPct(data.kdrPct ?? kdrPct)
          })
          .catch(() => {})
        timerRef.current = scheduleNext()
      }, interval)
    }
    const timerRef = { current: scheduleNext() }
    return () => clearTimeout(timerRef.current)
  }, [signals.length])

  const topStates = Object.entries(stateBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fff 60%)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
          <span className="text-sm font-semibold text-gray-900">
            {isZh ? '实时需求动态' : 'Live Activity'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3 text-orange-400" />
          <span className="font-semibold text-gray-900">{weeklyCount}</span>
          <span>{isZh ? '本周' : 'this week'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        {topStates.map(([state, count]) => (
          <div key={state} className="px-2 py-2.5 text-center">
            <div className="text-base font-bold text-gray-900">{count}</div>
            <div className="text-xs text-gray-400">{state}</div>
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-50">
        {signals.map((s, i) => {
          const proj = PROJECT_LABELS[s.projectType]
          const isRealAndRecent = s.isReal && s.hoursAgo < 2
          return (
            <div key={`${s.suburb}-${i}-${s.hoursAgo}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 transition-colors duration-700',
                i === flashIdx && 'bg-green-50',
                isRealAndRecent && 'bg-green-50/50'
              )}>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                isRealAndRecent ? 'bg-green-500 animate-pulse' :
                i === 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-200'
              )} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate block">{s.suburb}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">{s.state}</span>
                  {s.lotSize && <span className="text-xs text-gray-300">· {s.lotSize}m²</span>}
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', COLOR_PILL[proj.color])}>
                  {isZh ? proj.zh : proj.en}
                </span>
                <span className="text-xs text-gray-400">{formatTimeAgo(s.hoursAgo, isZh)}</span>
              </div>
            </div>
          )
        })}
        {signals.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-gray-300">
            {isZh ? '加载中…' : 'Loading…'}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          <Activity className="w-3 h-3 inline mr-1" />
          {kdrPct}% {isZh ? '推倒重建' : 'knockdown rebuild'}
        </span>
        <a href="/" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
          {isZh ? '查询我的地块 →' : 'Check my block →'}
        </a>
      </div>
    </div>
  )
}

const STATE_COLORS: Record<string, string> = {
  NSW: 'bg-blue-100 text-blue-700', VIC: 'bg-purple-100 text-purple-700',
  QLD: 'bg-yellow-100 text-yellow-700', WA: 'bg-green-100 text-green-700',
  SA: 'bg-red-100 text-red-700', ACT: 'bg-cyan-100 text-cyan-700',
  TAS: 'bg-orange-100 text-orange-700', NT: 'bg-pink-100 text-pink-700',
}
const COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-600', blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600', purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600', cyan: 'bg-cyan-100 text-cyan-600',
  green: 'bg-green-100 text-green-600', gray: 'bg-gray-100 text-gray-600',
  indigo: 'bg-indigo-100 text-indigo-600',
}

const PROJECT_TYPES_EN = ['Knockdown Rebuild', 'Dual Occupancy', 'Renovation', 'New Build', 'Not sure yet']
const PROJECT_TYPES_ZH = ['推倒重建', '双住宅开发', '翻新', '新建', '还不确定']
const TIMELINES_EN = ['Just exploring', 'Within 6 months', 'Within 12 months', 'Next 1–2 years']
const TIMELINES_ZH = ['初步了解', '6 个月内', '12 个月内', '1–2 年内']

interface LeadForm {
  userName: string
  userEmail: string
  userPhone: string
  suburb: string
  projectType: string
  timeline: string
  message: string
}

interface ModalState {
  pro: Professional | null
  step: number
  submitting: boolean
  error: string
}

function ProfessionalsTab() {
  const { lang } = useLang()
  const t = translations[lang]
  const tp = t.professionals
  const isZh = lang === 'zh'
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeState, setActiveState] = useState<string>(() => {
    const s = searchParams.get('state')
    return s ? s.toUpperCase() : 'all'
  })
  const [mandarinOnly, setMandarinOnly] = useState(false)
  const [loginGatePro, setLoginGatePro] = useState<Professional | null>(null)
  const [pendingContactSlug, setPendingContactSlug] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem('kdr_favorites') || '[]')) } catch { return new Set() }
  })

  function toggleFav(slug: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      try { localStorage.setItem('kdr_favorites', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const [dbPros, setDbPros] = useState<Professional[]>([])

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat) setActiveCategory(cat)

    fetch('/api/professionals-list')
      .then(r => r.json())
      .then((rows: Array<{business_name:string,category:string,state:string,regions:string[],description:string,description_en:string|null,verified:boolean,website:string|null,wechat:string|null,phone:string|null,is_demo:boolean,languages:string[]|null}>) => {
        const VALID_CATS = new Set(['builder','designer','planner','demolition','engineer','electrician','plumber','finance','other'])
        const CAT_MAP: Record<string, string> = {
          'Builder': 'builder', 'Town Planner': 'planner', 'Building Designer': 'designer',
          'Demolition Contractor': 'demolition', 'Structural Engineer': 'engineer',
          'Geotechnical Engineer': 'engineer', 'Finance Broker': 'finance',
          'Finance': 'finance', 'Surveyor': 'other', 'Arborist': 'other', 'Other': 'other',
        }
        const pros: Professional[] = rows.map(r => ({
          slug: r.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: r.business_name,
          category: VALID_CATS.has(r.category) ? r.category : (CAT_MAP[r.category] || 'other'),
          state: r.state,
          regions: r.regions || [],
          specialties: [],
          verified: r.verified,
          featured: r.verified && !r.is_demo,
          description: r.description || '',
          descriptionEn: r.description_en || null,
          website: r.website || null,
          wechat: r.wechat || null,
          phone: r.phone || null,
          is_demo: r.is_demo ?? false,
          languages: r.languages ?? ['English'],
        }))
        const dbSlugs = new Set(pros.map(p => p.slug))
        const hardcodedFiltered = PROFESSIONALS.filter(p => !dbSlugs.has(p.slug))
          .map(p => ({ ...p, is_demo: true }))
        setDbPros([...pros, ...hardcodedFiltered])
      })
      .catch(() => {})
  }, [])

  const allPros = dbPros.length > 0 ? dbPros : PROFESSIONALS
  const [sentPros, setSentPros] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<ModalState>({ pro: null, step: 1, submitting: false, error: '' })
  const [form, setForm] = useState<LeadForm>({ userName: '', userEmail: '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })

  const filtered = allPros.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (activeState !== 'all' && p.state !== activeState && !p.regions.includes('All Australia')) return false
    if (mandarinOnly && !(p.languages ?? []).includes('Mandarin')) return false
    return true
  })

  useEffect(() => {
    const contactSlug = searchParams.get('contact')
    if (!contactSlug || !user || allPros.length === 0) return
    const pro = allPros.find(p => p.slug === contactSlug)
    if (!pro) return
    setModal({ pro, step: 1, submitting: false, error: '' })
    setForm({ userName: '', userEmail: user.email ?? '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })
    const url = new URL(window.location.href)
    url.searchParams.delete('contact')
    window.history.replaceState({}, '', url.toString())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, allPros.length])

  function openModal(pro: Professional) {
    if (!user) {
      setPendingContactSlug(pro.slug)
      setLoginGatePro(pro)
      return
    }
    setModal({ pro, step: 1, submitting: false, error: '' })
    setForm({ userName: '', userEmail: user.email ?? '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })
  }

  function closeModal() {
    setModal(m => ({ ...m, pro: null }))
  }

  async function submitLead() {
    if (!modal.pro) return
    if (!form.userName || !form.userEmail || !form.suburb) {
      setModal(m => ({ ...m, error: isZh ? '请填写必填项（姓名、邮箱、区域）' : 'Please fill in name, email, and suburb.' }))
      return
    }
    setModal(m => ({ ...m, submitting: true, error: '' }))
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeowner_id: user?.id ?? null,
          homeowner_name: form.userName,
          homeowner_email: form.userEmail,
          homeowner_phone: form.userPhone || null,
          professional_name: modal.pro.name,
          professional_category: modal.pro.category,
          message: form.message,
          suburb: form.suburb,
          project_type: form.projectType,
        }),
      })
      setSentPros(prev => new Set([...prev, modal.pro!.name]))
      setModal(m => ({ ...m, step: 3, submitting: false }))
    } catch (e: unknown) {
      setModal(m => ({ ...m, submitting: false, error: e instanceof Error ? e.message : 'Submission failed' }))
    }
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-colors bg-gray-50 border border-gray-200 focus:border-orange-400'

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {tp.h1}
            </h1>
            <p className="text-gray-500">{tp.subtitle}</p>
          </div>
          <a
            href="/join"
            className="shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4" />
            {isZh ? '专业人士入驻' : 'List Your Business'}
          </a>
        </div>

        {/* Desktop: sidebar + main. Mobile: stacked */}
        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* Left sidebar: demand feed (sticky on desktop) */}
          <aside className="lg:w-72 xl:w-80 shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-6">
            <DemandFeed isZh={isZh} />
          </aside>

          {/* Right: filters + cards */}
          <div className="flex-1 min-w-0">

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase font-medium mb-3">{tp.filterByRole}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory('all')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{tp.allRoles}</button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeCategory === cat.id ? COLOR_MAP[cat.color] : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  <cat.icon className="w-3.5 h-3.5" />{cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-3">{tp.filterByState}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveState('all')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeState === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{tp.allStates}</button>
              {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => (
                <button key={s} onClick={() => setActiveState(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeState === s ? STATE_COLORS[s] : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-3 mt-4">{isZh ? '语言' : 'Language'}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMandarinOnly(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                  mandarinOnly
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Mandarin 普通话
              </button>
            </div>
          </div>
        </div>


        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {filtered.map(pro => {
            const cat = CATEGORIES.find(c => c.id === pro.category)
            const sent = sentPros.has(pro.name)
            const isFav = favorites.has(pro.slug)
            return (
              <div key={pro.slug} className={cn('bg-white border rounded-2xl p-5 flex flex-col shadow-sm', pro.featured ? 'border-orange-300' : 'border-gray-200')}>
                {pro.featured && (
                  <div className="text-xs text-orange-600 font-semibold mb-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />Featured
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <a href={`/professionals/${pro.state.toLowerCase()}/${pro.slug}`}
                      className="font-semibold text-gray-900 mb-1 leading-tight hover:text-orange-500 transition-colors block">
                      {pro.name}
                    </a>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pro.verified && !pro.is_demo && (
                        <span className="relative group cursor-pointer flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />{tp.verified}
                          <span className="absolute bottom-full left-0 mb-1.5 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-snug">
                            {isZh
                              ? 'ABN 已核实，持有效执照或行业注册。'
                              : 'ABN confirmed, holds a current licence or industry registration.'}
                          </span>
                        </span>
                      )}
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', STATE_COLORS[pro.state] || 'bg-gray-100 text-gray-500')}>{pro.state}</span>
                      {(() => {
                        const langs = pro.languages ?? (pro.wechat ? ['Mandarin','English'] : ['English'])
                        const isBilingual = langs.includes('Mandarin') && langs.includes('English')
                        const isChineseOnly = langs.includes('Mandarin') && !langs.includes('English')
                        const isEnglishOnly = !langs.includes('Mandarin')
                        if (isBilingual) return (
                          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                            <MessageCircle className="w-3 h-3" />{isZh ? '中英双语' : 'Mandarin & English'}
                          </span>
                        )
                        if (isChineseOnly) return (
                          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                            <MessageCircle className="w-3 h-3" />{isZh ? '中文' : 'Mandarin'}
                          </span>
                        )
                        if (isEnglishOnly) return (
                          <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                            English
                          </span>
                        )
                        return null
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleFav(pro.slug)} className={cn('p-1.5 rounded-lg transition-colors', isFav ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-red-50')}>
                      <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                    </button>
                    {cat && <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', COLOR_MAP[cat.color])}><cat.icon className="w-5 h-5" /></div>}
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{!isZh && pro.descriptionEn ? pro.descriptionEn : pro.description}</p>

                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><MapPin className="w-3.5 h-3.5" />{pro.regions.join(' · ')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.specialties.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>

                {(pro.website || pro.wechat) && (
                  <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-gray-100">
                    {pro.website && (
                      <a href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                        <Globe className="w-3.5 h-3.5" />{pro.website}
                      </a>
                    )}
                    {pro.wechat && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600">
                        <MessageCircle className="w-3.5 h-3.5" />微信: {pro.wechat}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <a href={`/professionals/${pro.state.toLowerCase()}/${pro.slug}`}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors text-center">
                    {isZh ? '查看详情' : 'View Profile'}
                  </a>
                  <button
                    onClick={() => !sent && openModal(pro)}
                    disabled={sent}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                      sent ? 'bg-green-100 text-green-700 cursor-default' : 'bg-orange-500 hover:bg-orange-400 text-white')}>
                    {sent
                      ? <><CheckCircle className="w-4 h-4" />{tp.requestSent}</>
                      : <><Phone className="w-4 h-4" />{tp.getQuote}</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{isZh ? '未找到符合条件的专业人士。' : 'No professionals found for this filter.'}</p>
            <p className="text-sm mt-2">{isZh ? '试试换一个州或类别。' : 'Try changing the state or category.'}</p>
          </div>
        )}

        {/* Subtle B2B entry point */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">
            {isZh ? '你是建房专业人士或建材商？' : 'Are you a building professional or supplier?'}
            {' '}
            <a href="/join" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              {isZh ? '专业人士免费入驻 →' : 'Join as Professional →'}
            </a>
            {' · '}
            <a href="/suppliers/register" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              {isZh ? '建材商免费入驻 →' : 'List as Supplier →'}
            </a>
          </p>
        </div>

          </div>{/* end right column */}
        </div>{/* end flex */}
      </div>

      {/* Login Gate Modal */}
      {loginGatePro && (
        <LoginGateModal
          onClose={() => { setLoginGatePro(null); setPendingContactSlug(null) }}
          redirectAfter={pendingContactSlug ? `/directory?tab=professionals&contact=${pendingContactSlug}` : '/directory?tab=professionals'}
        />
      )}

      {/* Lead Modal (3-step) */}
      {modal.pro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-orange-500 font-medium mb-0.5">
                  {modal.step < 3 ? (isZh ? `发送询价 · 第 ${modal.step}/3 步` : `Get a Quote · Step ${modal.step} of 3`) : ''}
                </p>
                <h3 className="font-bold text-gray-900">{modal.pro.name}</h3>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            {modal.step === 1 && (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '项目类型 *' : 'Project type *'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROJECT_TYPES_EN.map((pt, i) => (
                      <button key={pt} type="button" onClick={() => setForm(f => ({ ...f, projectType: pt }))}
                        className={cn('px-3 py-2 rounded-xl text-sm font-medium border transition-colors text-left',
                          form.projectType === pt ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300')}>
                        {isZh ? PROJECT_TYPES_ZH[i] : pt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '你的 Suburb *' : 'Your suburb *'}</label>
                  <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                    placeholder={isZh ? '如：Strathfield' : 'e.g. Strathfield'} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '计划时间' : 'Timeline'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIMELINES_EN.map((tl, i) => (
                      <button key={tl} type="button" onClick={() => setForm(f => ({ ...f, timeline: tl }))}
                        className={cn('px-3 py-2 rounded-xl text-sm font-medium border transition-colors text-left',
                          form.timeline === tl ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300')}>
                        {isZh ? TIMELINES_ZH[i] : tl}
                      </button>
                    ))}
                  </div>
                </div>
                {modal.error && <p className="text-red-500 text-xs text-center">{modal.error}</p>}
                <button onClick={() => { if (!form.suburb) { setModal(m => ({ ...m, error: isZh ? '请填写你的区域' : 'Please enter your suburb' })); return } setModal(m => ({ ...m, step: 2, error: '' })) }}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                  {isZh ? '下一步' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {modal.step === 2 && (
              <div className="px-6 py-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '姓名 *' : 'Name *'}</label>
                    <input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder={isZh ? '姓名' : 'Full name'} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '手机' : 'Phone'}</label>
                    <input value={form.userPhone} onChange={e => setForm(f => ({ ...f, userPhone: e.target.value }))} placeholder="0400 000 000" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '邮箱 *' : 'Email *'}</label>
                  <input type="email" value={form.userEmail} onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))} placeholder="you@email.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '补充说明（可选）' : 'Message (optional)'}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={isZh ? '你的地块情况、具体需求…' : 'Details about your block or project…'}
                    rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-400 text-gray-900 placeholder-gray-400" />
                </div>
                {modal.error && <p className="text-red-500 text-xs">{modal.error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setModal(m => ({ ...m, step: 1 }))} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">{isZh ? '返回' : 'Back'}</button>
                  <button onClick={submitLead} disabled={modal.submitting}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                    {modal.submitting ? (isZh ? '发送中…' : 'Sending…') : (isZh ? '发送询价' : 'Send')}
                    {!modal.submitting && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">{isZh ? '通常 24–48 小时内回复。' : 'Typical response time: 24–48 hours.'}</p>
              </div>
            )}

            {modal.step === 3 && (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{isZh ? '询价已发送！' : 'Enquiry sent!'}</h3>
                <p className="text-gray-500 text-sm mb-1">{isZh ? '信息已转发给' : 'Your details have been forwarded to'}</p>
                <p className="font-semibold text-gray-900 mb-4">{modal.pro.name}</p>
                <p className="text-gray-400 text-xs mb-6">{isZh ? '专业人士通常在 24–48 小时内与你联系。' : `Expect a reply to ${form.userEmail} within 24–48 hours.`}</p>
                <button onClick={closeModal} className="px-6 py-2.5 rounded-xl text-gray-700 text-sm bg-gray-100 hover:bg-gray-200">{isZh ? '关闭' : 'Close'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPLIERS TAB — copied from /suppliers/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

interface DbSupplier {
  id: string
  business_name: string
  category: string
  origin: string
  description: string | null
  states: string[]
  specialties: string[]
  verified: boolean
  featured: boolean
  website: string | null
  phone: string | null
  wechat: string | null
  email: string | null
  google_rating: number | null
  google_reviews: number | null
}

function dbToSupplier(d: DbSupplier): Supplier {
  return {
    id: d.id,
    name: d.business_name,
    category: d.category as SupplierCategory,
    origin: (d.origin || 'local') as SupplierOrigin,
    description: d.description || '',
    descriptionZh: d.description || '',
    states: d.states || [],
    specialties: d.specialties || [],
    specialtiesZh: d.specialties || [],
    verified: d.verified,
    verifiedNote: d.verified ? 'Self-verified via AusBuildCircle' : undefined,
    googleRating: d.google_rating ?? undefined,
    googleReviews: d.google_reviews ?? undefined,
    website: d.website ?? undefined,
    phone: d.phone ?? undefined,
    email: d.email ?? undefined,
    featured: d.featured,
    reliabilityScore: 50,
  }
}

const ORIGIN_LABELS: Record<SupplierOrigin, { en: string; zh: string; color: string }> = {
  local:  { en: 'Australian',    zh: '澳洲本地', color: 'text-green-700 bg-green-100' },
  china:  { en: 'China Import',  zh: '中国进口', color: 'text-red-700 bg-red-100' },
  europe: { en: 'European',      zh: '欧洲进口', color: 'text-blue-700 bg-blue-100' },
  multi:  { en: 'Multi-Origin',  zh: '多产地',   color: 'text-purple-700 bg-purple-100' },
}

const CATEGORY_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-600',
  cyan:   'bg-cyan-100 text-cyan-600',
  red:    'bg-red-100 text-red-600',
  green:  'bg-green-100 text-green-600',
  pink:   'bg-pink-100 text-pink-600',
  stone:  'bg-stone-100 text-stone-600',
}

const HARD_CATEGORIES = ['windows-doors','flooring','paint','tiles','kitchen','plumbing','electrical','roofing','insulation']
const SOFT_CATEGORIES = ['curtains-blinds','custom-wardrobes','landscaping','outdoor-paving']

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            fill={i <= full ? '#fbbf24' : 'none'}
            color={i <= full || (half && i === full + 1) ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
    </div>
  )
}

interface EnquiryForm {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  suburb: string
  projectType: string
  productsNeeded: string
  quantityEstimate: string
  timeline: string
  message: string
}

const BLANK_FORM: EnquiryForm = {
  buyerName: '', buyerEmail: '', buyerPhone: '',
  suburb: '', projectType: '', productsNeeded: '',
  quantityEstimate: '', timeline: '', message: '',
}

function SuppliersTab() {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [activeCategory, setActiveCategory] = useState<SupplierCategory | 'all'>('all')
  const [activeOrigin, setActiveOrigin] = useState<SupplierOrigin | 'all'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([])
  const [enquiryTarget, setEnquiryTarget] = useState<Supplier | null>(null)
  const [form, setForm] = useState<EnquiryForm>(BLANK_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) {
      setForm(f => ({ ...f, buyerEmail: f.buyerEmail || user.email! }))
    }
  }, [user])

  function openEnquiry(supplier: Supplier) {
    if (!user) {
      setPendingSupplierId(supplier.id)
      setShowLoginGate(true)
      return
    }
    const cat = SUPPLIER_CATEGORIES[supplier.category]
    setForm({ ...BLANK_FORM, productsNeeded: isZh ? cat.zh : cat.en, buyerEmail: user.email || '' })
    setSubmitted(false)
    setSubmitError('')
    setEnquiryTarget(supplier)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!enquiryTarget) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/suppliers/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: enquiryTarget.id,
          supplierName: enquiryTarget.name,
          supplierCategory: enquiryTarget.category,
          supplierEmail: enquiryTarget.email || null,
          homeownerId: user?.id || null,
          ...form,
        }),
      })
      const data = await res.json()
      if (data.success) setSubmitted(true)
      else setSubmitError(data.error || (isZh ? '提交失败，请稍后再试。' : 'Submission failed. Please try again.'))
    } catch {
      setSubmitError(isZh ? '网络错误，请稍后再试。' : 'Network error. Please try again.')
    }
    setSubmitting(false)
  }

  useEffect(() => {
    fetch('/api/suppliers/list')
      .then(r => r.json())
      .then(data => {
        if (data.suppliers) setDbSuppliers(data.suppliers.map(dbToSupplier))
      })
      .catch(() => {})
  }, [])

  // After login redirect back with ?enquire=id — auto-open modal
  useEffect(() => {
    const enquireId = searchParams.get('enquire')
    if (!enquireId || !user) return
    const staticNames = new Set(SUPPLIERS.map(s => s.name.toLowerCase()))
    const all = [...SUPPLIERS, ...dbSuppliers.filter(s => !staticNames.has(s.name.toLowerCase()))]
    const supplier = all.find(s => s.id === enquireId)
    if (supplier) {
      openEnquiry(supplier)
      const url = new URL(window.location.href)
      url.searchParams.delete('enquire')
      window.history.replaceState({}, '', url.toString())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, dbSuppliers])

  const staticNames = new Set(SUPPLIERS.map(s => s.name.toLowerCase()))
  const uniqueDb = dbSuppliers.filter(s => !staticNames.has(s.name.toLowerCase()))
  const allSuppliers = [...SUPPLIERS, ...uniqueDb]

  const ranked = rankSuppliers(allSuppliers)

  const filtered = ranked.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false
    if (activeOrigin !== 'all' && s.origin !== activeOrigin) return false
    if (verifiedOnly && !s.verified) return false
    return true
  })

  const categories = Object.entries(SUPPLIER_CATEGORIES) as [SupplierCategory, typeof SUPPLIER_CATEGORIES[SupplierCategory]][]

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isZh ? '建材商目录' : 'Building Materials Directory'}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {isZh
              ? '地板、门窗、油漆、厨卫配件——找到适合你推倒重建项目的本地和进口建材供应商。认证商家已通过资质核查。'
              : 'Flooring, windows, paint, kitchen, and bathroom — find local and imported suppliers for your KDR project. Verified suppliers have passed our vetting process.'}
          </p>
        </div>

        {/* Social proof bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { icon: '🏭', en: '60+ suppliers listed', zh: '60+ 家供应商已收录' },
            { icon: '✅', en: 'Verified suppliers prioritised', zh: '认证商家优先展示' },
            { icon: '🌏', en: 'Local & China imports covered', zh: '澳洲本地 + 中国进口全覆盖' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <span>{item.icon}</span>
              <span>{isZh ? item.zh : item.en}</span>
            </div>
          ))}
          <Link href="/suppliers/register" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 transition-colors rounded-lg px-3 py-2">
            <span className="text-lg leading-none">+</span>
            <span>{isZh ? '新商家申请入驻' : 'List your business'}</span>
          </Link>
        </div>

        {/* Verification explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-4 flex items-start gap-3 bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {isZh ? '已认证供应商' : 'Verified Suppliers'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isZh
                  ? '已提交营业资质，Google 评分良好，获我们团队核实推荐。优先排名，获得认证徽章。'
                  : 'Business credentials verified, strong Google rating, reviewed by our team. Priority ranking and verification badge displayed.'}
              </p>
            </div>
          </div>
          <div className="rounded-xl p-4 flex items-start gap-3 bg-white border border-gray-200">
            <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {isZh ? '未认证列表' : 'Unverified Listings'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isZh
                  ? '免费收录，但资质未经我们核实。建议在交易前自行尽职调查。'
                  : 'Free to list, but credentials have not been independently verified by us. We recommend doing your own due diligence before transacting.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 mb-8 bg-white border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setActiveCategory('all')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={activeCategory === 'all' ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
              >
                {isZh ? '全部' : 'All'}
              </button>
            </div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2 tracking-wide">{isZh ? '硬装建材' : 'Construction & Finishes'}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.filter(([key]) => HARD_CATEGORIES.includes(key)).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={activeCategory === key ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                >
                  <span>{cat.icon}</span>
                  {isZh ? cat.zh : cat.en}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2 tracking-wide">{isZh ? '软装 & 户外' : 'Soft Furnishings & Outdoor'}</p>
            <div className="flex flex-wrap gap-2">
              {categories.filter(([key]) => SOFT_CATEGORIES.includes(key)).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={activeCategory === key ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                >
                  <span>{cat.icon}</span>
                  {isZh ? cat.zh : cat.en}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3 tracking-wide">
                {isZh ? '产地' : 'Origin'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'local', 'china', 'europe', 'multi'] as const).map(orig => (
                  <button
                    key={orig}
                    onClick={() => setActiveOrigin(orig)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={activeOrigin === orig ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                  >
                    {orig === 'all'
                      ? (isZh ? '全部' : 'All')
                      : (isZh ? ORIGIN_LABELS[orig].zh : ORIGIN_LABELS[orig].en)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:ml-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setVerifiedOnly(v => !v)}
                  className="w-10 h-5 rounded-full relative transition-all cursor-pointer"
                  style={{ background: verifiedOnly ? '#22c55e' : '#e5e7eb' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: verifiedOnly ? '22px' : '2px' }}
                  />
                </div>
                <span className="text-sm text-gray-700">
                  {isZh ? '只显示已认证' : 'Verified only'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          {isZh ? `显示 ${filtered.length} 个供应商` : `Showing ${filtered.length} supplier${filtered.length !== 1 ? 's' : ''}`}
          {filtered.filter(s => s.verified).length > 0 && (
            <span className="text-green-600 ml-2">
              · {filtered.filter(s => s.verified).length} {isZh ? '已认证' : 'verified'}
            </span>
          )}
        </p>

        {/* Supplier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map(supplier => {
            const cat = SUPPLIER_CATEGORIES[supplier.category]
            const orig = ORIGIN_LABELS[supplier.origin]
            const catColor = CATEGORY_COLORS[cat.color]
            return (
              <div
                key={supplier.id}
                className="rounded-2xl p-5 flex flex-col bg-white shadow-sm transition-all"
                style={{
                  border: supplier.verified ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 leading-tight truncate">{supplier.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {supplier.verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isZh ? '已认证' : 'Verified'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {isZh ? '未认证' : 'Unverified'}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orig.color}`}>
                        {isZh ? orig.zh : orig.en}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${catColor}`}>
                    {cat.icon}
                  </div>
                </div>

                {/* Category badge */}
                <div className="mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor}`}>
                    {isZh ? cat.zh : cat.en}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-4">
                  {isZh ? supplier.descriptionZh : supplier.description}
                </p>
                <div className="flex-1" />

                {/* Google Rating */}
                {supplier.googleRating && supplier.googleReviews && (
                  <div className="mb-3">
                    <StarRating rating={supplier.googleRating} reviews={supplier.googleReviews} />
                  </div>
                )}

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(isZh ? supplier.specialtiesZh : supplier.specialties).slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {s}
                    </span>
                  ))}
                </div>

                {/* States served */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {supplier.states.join(' · ')}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => openEnquiry(supplier)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isZh ? '发送询价' : 'Request Quote'}
                  </button>

                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {supplier.website && (
                      <a
                        href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        {isZh ? '访问网站' : 'Website'}
                      </a>
                    )}
                    {supplier.phone && (
                      <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </a>
                    )}
                    {supplier.wechat && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <MessageCircle className="w-3 h-3" />
                        {supplier.wechat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{isZh ? '暂无符合条件的供应商。' : 'No suppliers match your filters.'}</p>
            <p className="text-sm mt-2">{isZh ? '请尝试其他筛选条件。' : 'Try adjusting the filters above.'}</p>
          </div>
        )}

        {/* B2B entry point */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <Link href="/suppliers/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            <span className="text-xl leading-none">+</span>
            {isZh ? '新商家申请入驻' : 'List your business'}
          </Link>
        </div>
      </div>

      {/* Enquiry Modal */}
      {enquiryTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setEnquiryTarget(null) }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">
                  {isZh ? '发送询价' : 'Request a Quote'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{enquiryTarget.name}</p>
              </div>
              <button onClick={() => setEnquiryTarget(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">
                  {isZh ? '询价已发送！' : 'Enquiry Sent!'}
                </h3>
                <p className="text-gray-500 text-sm mb-1">
                  {isZh
                    ? `你的询价已发送给 ${enquiryTarget.name}，通常 1-2 个工作日内回复。`
                    : `Your enquiry has been sent to ${enquiryTarget.name}. Expect a reply within 1-2 business days.`}
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  {isZh ? '确认邮件已发送至 ' : 'A confirmation has been sent to '}{form.buyerEmail}
                </p>
                <button onClick={() => setEnquiryTarget(null)}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors text-sm">
                  {isZh ? '关闭' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {isZh ? '你的联系方式' : 'Your Contact Details'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '姓名 *' : 'Name *'}</label>
                      <input required value={form.buyerName}
                        onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                        placeholder={isZh ? '张三' : 'John Smith'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '邮箱 *' : 'Email *'}</label>
                      <input required type="email" value={form.buyerEmail}
                        onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '电话' : 'Phone'}</label>
                      <input value={form.buyerPhone}
                        onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                        placeholder="04xx xxx xxx"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '项目地区' : 'Project Suburb'}</label>
                      <input value={form.suburb}
                        onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                        placeholder={isZh ? '例：Parramatta NSW' : 'e.g. Parramatta NSW'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {isZh ? '项目信息' : 'Project Details'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '项目类型' : 'Project Type'}</label>
                      <select value={form.projectType}
                        onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                        <option value="">{isZh ? '请选择' : 'Select...'}</option>
                        <option value={isZh ? '推倒重建' : 'Knockdown Rebuild'}>{isZh ? '推倒重建（KDR）' : 'Knockdown Rebuild (KDR)'}</option>
                        <option value={isZh ? '翻新改造' : 'Renovation'}>{isZh ? '翻新改造' : 'Renovation'}</option>
                        <option value={isZh ? '扩建' : 'Extension'}>{isZh ? '扩建' : 'Extension'}</option>
                        <option value={isZh ? '新建' : 'New Build'}>{isZh ? '新建' : 'New Build'}</option>
                        <option value={isZh ? '其他' : 'Other'}>{isZh ? '其他' : 'Other'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{isZh ? '计划时间线' : 'Timeline'}</label>
                      <select value={form.timeline}
                        onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                        <option value="">{isZh ? '请选择' : 'Select...'}</option>
                        <option value={isZh ? '马上需要' : 'Ready now'}>{isZh ? '马上需要' : 'Ready now'}</option>
                        <option value={isZh ? '1-3个月内' : '1-3 months'}>{isZh ? '1-3 个月内' : '1-3 months'}</option>
                        <option value={isZh ? '3-6个月内' : '3-6 months'}>{isZh ? '3-6 个月内' : '3-6 months'}</option>
                        <option value={isZh ? '6个月以上' : '6+ months'}>{isZh ? '6 个月以上' : '6+ months'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '所需产品/规格 *' : 'Products / Specifications *'}</label>
                    <textarea required rows={3} value={form.productsNeeded}
                      onChange={e => setForm(f => ({ ...f, productsNeeded: e.target.value }))}
                      placeholder={isZh
                        ? '例：600x600 哑光瓷砖，适合客厅和走廊；需要防滑等级 P3 以上'
                        : 'e.g. 600x600 matte porcelain tiles for living room and hallway, P3 slip rating minimum'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '数量/面积估算' : 'Quantity / Area Estimate'}</label>
                    <input value={form.quantityEstimate}
                      onChange={e => setForm(f => ({ ...f, quantityEstimate: e.target.value }))}
                      placeholder={isZh ? '例：约 120 平方米' : 'e.g. approx. 120 sqm'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">{isZh ? '其他要求（可选）' : 'Additional Notes (optional)'}</label>
                  <textarea rows={2} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={isZh ? '例：需要样品间参观、需要安装报价、指定品牌等' : 'e.g. need showroom visit, require installation quote, preferred brands, etc.'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>

                {submitError && (
                  <p className="text-red-500 text-sm">{submitError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEnquiryTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isZh ? '发送询价' : 'Send Enquiry'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  {isZh
                    ? '提交即视为同意将你的联系方式分享给该供应商。'
                    : 'By submitting, you agree to share your contact details with this supplier.'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Login Gate */}
      {showLoginGate && (
        <LoginGateModal
          onClose={() => { setShowLoginGate(false); setPendingSupplierId(null) }}
          redirectAfter={`/directory?tab=suppliers${pendingSupplierId ? `&enquire=${pendingSupplierId}` : ''}`}
          subtitle={{
            zh: '登录后即可发送询价，邮箱将自动填入，方便供应商回复你。',
            en: 'Sign in to send your enquiry. Your email will be pre-filled so the supplier can reply.',
          }}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DIRECTORY PAGE — Tab switcher
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = 'professionals' | 'suppliers'

function DirectoryPageInner() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabFromUrl = searchParams.get('tab')
  const initialTab: TabKey = tabFromUrl === 'suppliers' ? 'suppliers' : 'professionals'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  function switchTab(tab: TabKey) {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    // Remove tab-specific params when switching
    if (tab === 'professionals') {
      url.searchParams.delete('enquire')
    } else {
      url.searchParams.delete('contact')
      url.searchParams.delete('category')
      url.searchParams.delete('state')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'professionals', label: isZh ? '专业人士' : 'Professionals' },
    { key: 'suppliers', label: isZh ? '建材供应商' : 'Suppliers' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/directory" />

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={cn(
                  'relative px-5 py-3.5 text-sm font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'professionals' ? <ProfessionalsTab /> : <SuppliersTab />}
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense>
      <DirectoryPageInner />
    </Suspense>
  )
}
