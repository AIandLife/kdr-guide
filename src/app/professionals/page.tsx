'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle, MapPin, Phone, ChevronRight,
  Briefcase, Globe, MessageCircle, X, TrendingUp, Activity, Heart
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'
import { useAuth } from '@/lib/auth-context'
import { SEED_SIGNALS, PROJECT_LABELS, formatTimeAgo, type DemandSignal } from '@/lib/demand-signals'
import { PROFESSIONALS, CATEGORIES, type Professional } from '@/lib/professionals-data'

// ── Demand Signal Feed ────────────────────────────────────────────────────────
const COLOR_PILL: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
}

function DemandFeed({ isZh }: { isZh: boolean }) {
  // Start with seed data; rotate in a new "live" item every ~8 seconds
  const [signals, setSignals] = useState<DemandSignal[]>(() => SEED_SIGNALS.slice(0, 8))
  const [flashIdx, setFlashIdx] = useState<number>(-1)
  const rotateRef = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => {
      rotateRef.current = (rotateRef.current + 1) % SEED_SIGNALS.length
      const next = { ...SEED_SIGNALS[rotateRef.current], hoursAgo: Math.random() * 0.25 }
      setSignals(prev => [next, ...prev.slice(0, 7)])
      setFlashIdx(0)
      setTimeout(() => setFlashIdx(-1), 1200)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Weekly stats derived from seed data
  const weeklyCount = SEED_SIGNALS.length
  const stateBreakdown = SEED_SIGNALS.reduce<Record<string, number>>((acc, s) => {
    acc[s.state] = (acc[s.state] || 0) + 1
    return acc
  }, {})
  const topStates = Object.entries(stateBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const kdrPct = Math.round(SEED_SIGNALS.filter(s => s.projectType === 'kdr').length / SEED_SIGNALS.length * 100)

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8 bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fff 60%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-900">
              {isZh ? '实时需求动态' : 'Live Homeowner Activity'}
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            {isZh ? '匿名 · 真实查询' : 'Anonymised · Real searches'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold text-gray-900">{weeklyCount}</span>
            <span>{isZh ? '本周查询' : 'this week'}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        {topStates.map(([state, count]) => (
          <div key={state} className="px-4 py-3 text-center">
            <div className="text-lg font-bold text-gray-900">{count}</div>
            <div className="text-xs text-gray-400">{state} {isZh ? '查询' : 'searches'}</div>
          </div>
        ))}
      </div>

      {/* Signal list */}
      <div className="divide-y divide-gray-50">
        {signals.map((s, i) => {
          const proj = PROJECT_LABELS[s.projectType]
          return (
            <div
              key={`${s.suburb}-${i}`}
              className={cn(
                'flex items-center gap-3 px-5 py-3 transition-colors duration-700',
                i === flashIdx && 'bg-green-50'
              )}
            >
              {/* Dot */}
              <div className={cn('w-2 h-2 rounded-full shrink-0', i === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-200')} />

              {/* Location */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">{s.suburb}</span>
                <span className="text-xs text-gray-400 ml-1.5">{s.state}</span>
                {s.lotSize && (
                  <span className="text-xs text-gray-400 ml-1.5">· {s.lotSize}㎡</span>
                )}
              </div>

              {/* Project type pill */}
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:block', COLOR_PILL[proj.color])}>
                {isZh ? proj.zh : proj.en}
              </span>

              {/* Time */}
              <span className="text-xs text-gray-400 shrink-0 w-14 text-right">
                {formatTimeAgo(s.hoursAgo, isZh)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Activity className="w-3.5 h-3.5" />
          {isZh
            ? `${kdrPct}% 为推倒重建 · 其余为翻新、扩建和 Granny Flat`
            : `${kdrPct}% knockdown rebuild · rest are renovations, extensions & granny flats`}
        </div>
        <a href="/" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
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

export default function ProfessionalsPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const tp = t.professionals
  const isZh = lang === 'zh'
  const { user } = useAuth()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeState, setActiveState] = useState<string>('all')
  const [loginGatePro, setLoginGatePro] = useState<Professional | null>(null)
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

  // Read ?category= from URL on mount (client-side only)
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat) setActiveCategory(cat)
  }, [])
  const [sentPros, setSentPros] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<ModalState>({ pro: null, step: 1, submitting: false, error: '' })
  const [form, setForm] = useState<LeadForm>({ userName: '', userEmail: '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })

  const filtered = PROFESSIONALS.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (activeState !== 'all' && p.state !== activeState && !p.regions.includes('All Australia')) return false
    return true
  })

  function openModal(pro: Professional) {
    if (!user) {
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
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/professionals" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tp.h1}</h1>
          <p className="text-gray-500 text-lg mb-6">{tp.subtitle}</p>

          {/* Live demand feed — shows builders real homeowner intent */}
          <DemandFeed isZh={isZh} />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
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
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
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
                    <div className="flex items-center gap-2">
                      {pro.verified && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" />{tp.verified}</span>}
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', STATE_COLORS[pro.state] || 'bg-gray-100 text-gray-500')}>{pro.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleFav(pro.slug)} className={cn('p-1.5 rounded-lg transition-colors', isFav ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-red-50')}>
                      <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                    </button>
                    {cat && <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', COLOR_MAP[cat.color])}><cat.icon className="w-5 h-5" /></div>}
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{pro.description}</p>

                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><MapPin className="w-3.5 h-3.5" />{pro.regions.join(' · ')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.specialties.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>

                {(pro.website || pro.wechat) && (
                  <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-gray-100">
                    {pro.website && (
                      <a href={`https://${pro.website}`} target="_blank" rel="noopener noreferrer"
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
            <p className="text-lg">No professionals found for this filter.</p>
            <p className="text-sm mt-2">Try changing the state or category.</p>
          </div>
        )}

        {/* Subtle B2B entry point */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">
            {isZh ? '你是 KDR 专业人士？' : 'Are you a KDR professional?'}
            {' '}
            <a href="/join" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              {isZh ? '免费收录你的业务 →' : 'List your business for free →'}
            </a>
          </p>
        </div>
      </div>

      {/* ── Login Gate Modal ── */}
      {loginGatePro && (
        <LoginGateModal
          onClose={() => setLoginGatePro(null)}
          redirectAfter="/professionals"
        />
      )}

      {/* ── Lead Modal (3-step) ── */}
      {modal.pro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-orange-500 font-medium mb-0.5">
                  {modal.step < 3 ? (isZh ? `发送询价 · 第 ${modal.step}/2 步` : `Get a Quote · Step ${modal.step} of 2`) : ''}
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
    </div>
  )
}
