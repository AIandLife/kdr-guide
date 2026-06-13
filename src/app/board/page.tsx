'use client'

/**
 * 对接大厅 — demand board.
 *
 * Privacy model (the product's core promise):
 *   - Briefs show suburb-level location only — never an address
 *   - Homeowner contact details are never rendered anywhere on this page;
 *     merchants respond and the homeowner receives their card by email
 *   - "Signals" are anonymous suburb-level feasibility searches, clearly
 *     marked as signals, not briefs
 */

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  MapPin, Clock, Loader2, X, CheckCircle, Zap, Shield, FileText, Ruler, Megaphone, HardHat,
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'

interface Brief {
  id: string
  kind: string
  project_type: string | null
  state: string
  suburb: string
  budget_band: string | null
  timeline: string | null
  description: string | null
  lot_area_sqm: number | null
  has_report: boolean
  is_demo?: boolean
  response_count: number
  created_at: string
}

interface Signal {
  suburb: string
  state: string
  project_type: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  kdr: { zh: '推倒重建', en: 'Knockdown Rebuild' },
  granny_flat: { zh: '奶奶房', en: 'Granny Flat' },
  dual_occupancy: { zh: '双拼 / 双住户', en: 'Dual Occupancy' },
  renovation: { zh: '翻新', en: 'Renovation' },
  extension: { zh: '扩建', en: 'Extension' },
  new_build: { zh: '新建房', en: 'New Build' },
  other: { zh: '其他', en: 'Other' },
}
const KIND_LABELS: Record<string, { zh: string; en: string }> = {
  hire: { zh: '招工', en: 'Hiring' },
  work_wanted: { zh: '找活干', en: 'Work Wanted' },
}

const BUDGET_OPTIONS = ['20万以下', '20-50万', '50-100万', '100-150万', '150万以上', '还不确定']
const TIMELINE_OPTIONS = ['3个月内动工', '半年内', '一年内', '先了解行情']

const track = (name: string, params?: Record<string, unknown>) => {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', name, params)
  } catch { /* never break the page */ }
}

function timeAgo(iso: string, isZh: boolean): string {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return isZh ? `${mins} 分钟前` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return isZh ? `${hours} 小时前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return isZh ? `${days} 天前` : `${days}d ago`
}

function typeLabel(b: { kind: string; project_type: string | null }, isZh: boolean): string {
  if (b.kind !== 'project' && KIND_LABELS[b.kind]) return isZh ? KIND_LABELS[b.kind].zh : KIND_LABELS[b.kind].en
  const t = TYPE_LABELS[b.project_type || 'other'] || TYPE_LABELS.other
  return isZh ? t.zh : t.en
}

function BoardPageInner() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const { user } = useAuth()
  const params = useSearchParams()

  const [briefs, setBriefs] = useState<Brief[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const [showPublish, setShowPublish] = useState(false)
  const [showRespond, setShowRespond] = useState<Brief | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  const load = useCallback(() => {
    fetch('/api/board/list')
      .then(r => r.json())
      .then(d => { setBriefs(d.briefs || []); setSignals(d.signals || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // ?publish=1 deep link (e.g. from a feasibility report CTA)
  useEffect(() => {
    if (params.get('publish') === '1') setShowPublish(true)
  }, [params])

  const filtered = filter === 'all' ? briefs : briefs.filter(b =>
    filter === 'hire' || filter === 'work_wanted' ? b.kind === filter : b.project_type === filter
  )

  const filterChips = [
    { id: 'all', zh: '全部', en: 'All' },
    { id: 'kdr', zh: '推倒重建', en: 'KDR' },
    { id: 'granny_flat', zh: '奶奶房', en: 'Granny Flat' },
    { id: 'dual_occupancy', zh: '双拼', en: 'Dual Occ' },
    { id: 'renovation', zh: '翻新', en: 'Reno' },
    { id: 'extension', zh: '扩建', en: 'Extension' },
    { id: 'hire', zh: '招工', en: 'Hiring' },
    { id: 'work_wanted', zh: '找活干', en: 'Work Wanted' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/board" />

      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-50 to-gray-50 border-b border-orange-100/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isZh ? '对接大厅' : 'Project Board'}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-5 max-w-2xl">
            {isZh
              ? '业主发需求，商家来响应。不公开门牌，不公开联系方式，商家名片发到你邮箱，联系谁你自己挑。'
              : 'Homeowners post project briefs, merchants respond. No street address shown, no contact details exposed — merchant cards land in your inbox and you choose who to talk to.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setShowPublish(true); track('board_publish_open') }}
              className="px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}
            >
              <Megaphone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {isZh ? '免费发布我的需求' : 'Post Your Brief — Free'}
            </button>
            <a
              href="/ruzhu"
              className="px-5 py-3 rounded-xl font-semibold text-sm text-orange-600 bg-white border border-orange-200 hover:border-orange-400 transition-colors"
            >
              <HardHat className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {isZh ? '我是商家，先入驻' : "I'm a Merchant — Get Listed"}
            </a>
          </div>
          {/* Privacy strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-600" />{isZh ? '只显示区域，不显示门牌' : 'Suburb shown, never your address'}</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-600" />{isZh ? '联系方式不公开' : 'Contact details never public'}</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-600" />{isZh ? '商家响应进你邮箱，主动权在你' : 'Responses go to your inbox — you decide'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Demand signals */}
        {signals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {isZh ? '⚡ 实时需求信号（匿名查询）' : '⚡ Live Demand Signals (anonymous)'}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {signals.slice(0, 8).map((s, i) => (
                <div key={i} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-600">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {isZh
                      ? <>{timeAgo(s.created_at, true)}有业主查询了 <b className="text-gray-800">{s.suburb}</b> {typeLabel({ kind: 'project', project_type: s.project_type }, true)}可行性</>
                      : <><b className="text-gray-800">{s.suburb}</b> {typeLabel({ kind: 'project', project_type: s.project_type }, false)} feasibility checked {timeAgo(s.created_at, false)}</>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filterChips.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
                filter === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              {isZh ? c.zh : c.en}
            </button>
          ))}
        </div>

        {/* Briefs */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />{isZh ? '加载中...' : 'Loading...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              {isZh ? '这个分类下还没有需求。做第一个发布的人，商家响应最快。' : 'No briefs in this category yet. Be the first — early briefs get the fastest responses.'}
            </p>
            <button onClick={() => setShowPublish(true)}
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
              {isZh ? '免费发布需求' : 'Post a Brief'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(b => (
              <div key={b.id} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                      {typeLabel(b, isZh)}
                    </span>
                    {b.is_demo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-400 border border-gray-200" title={isZh ? '平台示例需求' : 'Sample brief'}>
                        {isZh ? '示例' : 'Sample'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{timeAgo(b.created_at, isZh)}</span>
                </div>
                <p className="font-semibold text-gray-900 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />{b.suburb}, {b.state}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                  {b.budget_band && <span>💰 {isZh ? '预算' : 'Budget'} {b.budget_band}{/[一-鿿]/.test(b.budget_band) ? '' : ''}</span>}
                  {b.timeline && <span>📅 {b.timeline}</span>}
                  {b.lot_area_sqm && <span className="flex items-center gap-0.5"><Ruler className="w-3 h-3" />{isZh ? '地块' : 'Lot'} {b.lot_area_sqm}㎡</span>}
                </div>
                {b.has_report && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 mb-2">
                    <FileText className="w-3.5 h-3.5" />{isZh ? '已做 AI 可行性报告 ✓' : 'AI feasibility report done ✓'}
                  </span>
                )}
                {b.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-4">{b.description}</p>
                )}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {b.response_count > 0
                      ? (isZh ? `已有 ${b.response_count} 个商家响应` : `${b.response_count} merchant response${b.response_count > 1 ? 's' : ''}`)
                      : (isZh ? '还没有商家响应' : 'No responses yet')}
                  </span>
                  <button
                    onClick={() => { if (!user) { setShowLogin(true) } else { setShowRespond(b) }; track('board_respond_open', { brief: b.id }) }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors"
                  >
                    {isZh ? '我能对接 →' : 'I Can Help →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPublish && (
        <PublishModal
          isZh={isZh}
          prefill={{
            suburb: params.get('suburb') || '',
            state: params.get('state') || 'NSW',
            projectType: params.get('type') || '',
            lot: params.get('lot') || '',
            hasReport: params.get('report') === '1',
          }}
          onClose={() => setShowPublish(false)}
          onPublished={() => { setShowPublish(false); load() }}
        />
      )}
      {showRespond && (
        <RespondModal isZh={isZh} brief={showRespond} onClose={() => setShowRespond(null)} onSent={() => { setShowRespond(null); load() }} />
      )}
      {showLogin && (
        <LoginGateModal
          onClose={() => setShowLogin(false)}
          redirectAfter="/board"
          subtitle={{
            zh: '响应需求需要商家账号，业主会收到你的名片。还没入驻？关掉后点「我是商家，先入驻」。',
            en: 'Responding requires a merchant account so the homeowner receives your card. Not listed yet? Close this and tap "Get Listed".',
          }}
        />
      )}
    </div>
  )
}

/* ── Publish modal ──────────────────────────────────────────────────────── */
function PublishModal({ isZh, prefill, onClose, onPublished }: {
  isZh: boolean
  prefill: { suburb: string; state: string; projectType: string; lot: string; hasReport: boolean }
  onClose: () => void
  onPublished: () => void
}) {
  const [form, setForm] = useState({
    kind: 'project',
    projectType: prefill.projectType || 'kdr',
    state: prefill.state || 'NSW',
    suburb: prefill.suburb,
    budgetBand: '',
    timeline: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactWechat: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/board/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          projectType: form.kind === 'project' ? form.projectType : undefined,
          lotAreaSqm: prefill.lot ? Number(prefill.lot) : undefined,
          hasReport: prefill.hasReport,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isZh ? '发布失败，请稍后再试' : 'Failed, please retry'))
      track('board_brief_published', { type: form.kind === 'project' ? form.projectType : form.kind, state: form.state })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{isZh ? '发布需求' : 'Post a Brief'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">{isZh ? '已发布！' : 'Published!'}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {isZh
                ? '商家响应后，他们的名片会发到你的邮箱。你的联系方式不会给到任何商家。'
                : "When merchants respond, their cards arrive in your inbox. Your contact details are never shared with merchants."}
            </p>
            <button onClick={onPublished} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
              {isZh ? '看看我的需求' : 'View the Board'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {/* Kind */}
            <div className="flex gap-2">
              {[
                { id: 'project', zh: '我要建房 / 改造', en: 'Building project' },
                { id: 'hire', zh: '我要招工', en: 'Hiring workers' },
                { id: 'work_wanted', zh: '我找活干', en: 'Looking for work' },
              ].map(k => (
                <button key={k.id} type="button" onClick={() => set('kind', k.id)}
                  className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-medium border-2 transition-colors ${
                    form.kind === k.id ? 'bg-orange-50 text-orange-700 border-orange-400' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                  {isZh ? k.zh : k.en}
                </button>
              ))}
            </div>

            {form.kind === 'project' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '项目类型' : 'Project type'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_LABELS).filter(([k]) => k !== 'other').map(([k, v]) => (
                    <button key={k} type="button" onClick={() => set('projectType', k)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium border-2 transition-colors ${
                        form.projectType === k ? 'bg-orange-50 text-orange-700 border-orange-400' : 'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                      {isZh ? v.zh : v.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '州' : 'State'} *</label>
                <select value={form.state} onChange={e => set('state', e.target.value)} className={inputClass}>
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '区域 Suburb（不填门牌）' : 'Suburb (no address)'} *</label>
                <input value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="e.g. Castle Hill" required className={inputClass} />
              </div>
            </div>

            {form.kind === 'project' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '预算（澳元）' : 'Budget (AUD)'}</label>
                  <select value={form.budgetBand} onChange={e => set('budgetBand', e.target.value)} className={inputClass}>
                    <option value="">{isZh ? '选择预算' : 'Select'}</option>
                    {BUDGET_OPTIONS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '时间计划' : 'Timeline'}</label>
                  <select value={form.timeline} onChange={e => set('timeline', e.target.value)} className={inputClass}>
                    <option value="">{isZh ? '选择时间' : 'Select'}</option>
                    {TIMELINE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '具体说说你的需求' : 'Describe your project'}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                placeholder={isZh ? '例如：老房子想推倒建双拼，地块大约 600㎡，希望找有 Castle Hill 附近经验的 builder...' : 'e.g. Looking to knock down and build a duplex, block is around 600sqm...'}
                className={`${inputClass} resize-none`} />
            </div>

            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-xs text-green-800 leading-relaxed">
              🔒 {isZh
                ? '以下联系方式只用于把商家响应发给你，不会展示在大厅，也不会给到商家。'
                : 'Contact details below are only used to send you merchant responses. Never shown publicly, never given to merchants.'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '怎么称呼你' : 'Your name'} *</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)} required className={inputClass} placeholder={isZh ? '例如：王先生' : 'e.g. Sam'} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '邮箱' : 'Email'} *</label>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} required className={inputClass} placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '手机（选填）' : 'Phone (optional)'}</label>
                <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} className={inputClass} placeholder="04XX XXX XXX" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '微信（选填）' : 'WeChat (optional)'}</label>
                <input value={form.contactWechat} onChange={e => set('contactWechat', e.target.value)} className={inputClass} />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 -mt-1">{isZh ? '手机和微信至少填一个，方便你和选中的商家联系。' : 'Provide at least phone or WeChat.'}</p>

            {error && <div className="rounded-xl p-3 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>}

            <button type="submit" disabled={submitting}
              className="w-full text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />{isZh ? '发布中...' : 'Publishing...'}</> : (isZh ? '发布到对接大厅' : 'Publish Brief')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Respond modal (merchants) ──────────────────────────────────────────── */
function RespondModal({ isZh, brief, onClose, onSent }: {
  isZh: boolean
  brief: Brief
  onClose: () => void
  onSent: () => void
}) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [noProfile, setNoProfile] = useState(false)
  const [done, setDone] = useState(false)

  const [doneDemo, setDoneDemo] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/board/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: brief.id, message }),
      })
      const data = await res.json()
      if (res.status === 403 && data.error === 'no_profile') { setNoProfile(true); return }
      if (res.status === 409) throw new Error(isZh ? '你已经响应过这条需求了。' : 'You already responded to this brief.')
      if (!res.ok) throw new Error(data.error || (isZh ? '发送失败，请稍后再试' : 'Failed, please retry'))
      track('board_response_sent', { brief: brief.id, demo: !!data.isDemo })
      setDoneDemo(!!data.isDemo)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{isZh ? '响应这条需求' : 'Respond to Brief'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">{isZh ? '已收到！' : 'Received!'}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {doneDemo
                ? (isZh
                    ? '这条是平台示例需求。你的名片我们已存档 —— 你服务区域有匹配的真实需求时，我们会第一时间联系你。'
                    : "This is a sample brief. We've saved your card — when a matching real brief comes up in your area, we'll reach out to you first.")
                : (isZh
                    ? '你的名片和留言已发到业主邮箱。业主有兴趣会直接联系你。'
                    : "Your card and message are in the homeowner's inbox. They'll contact you directly if interested.")}
            </p>
            <button onClick={onSent} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gray-900">{isZh ? '好的' : 'Done'}</button>
          </div>
        ) : noProfile ? (
          <div className="p-8 text-center">
            <HardHat className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">{isZh ? '先完成商家入驻' : 'Get Listed First'}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {isZh ? '响应需求需要有商家档案，业主才能看到你是谁。入驻免费，2 分钟。' : 'You need a merchant profile so homeowners can see who you are. Listing is free and takes 2 minutes.'}
            </p>
            <a href="/ruzhu" className="inline-block px-6 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
              {isZh ? '免费入驻' : 'List My Business'}
            </a>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700">
              <b>{brief.suburb}, {brief.state}</b> · {typeLabel(brief, isZh)}
              {brief.budget_band && <> · {isZh ? '预算' : 'Budget'} {brief.budget_band}</>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                {isZh ? '给业主的留言（说说你为什么合适）' : 'Message to the homeowner'}
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder={isZh ? '例如：我们在这个区做过 6 个同类项目，有 builder 牌照，可以先免费给你估个价...' : 'e.g. We have completed 6 similar projects in this area...'}
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 resize-none" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isZh ? '你的商家名片（公司、类别、联系方式）会随留言一起发给业主。' : 'Your merchant card (business, category, contact) is sent along with your message.'}
            </p>
            {error && <div className="rounded-xl p-3 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>}
            <button onClick={submit} disabled={submitting || message.trim().length < 10}
              className="w-full text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 bg-gray-900">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />{isZh ? '发送中...' : 'Sending...'}</> : (isZh ? '发送给业主' : 'Send to Homeowner')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BoardPageInner />
    </Suspense>
  )
}
