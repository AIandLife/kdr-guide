'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MapPin, Globe, MessageCircle, Phone, ArrowLeft, ChevronRight, X, Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'
import { PROFESSIONALS, CATEGORIES, STATE_INFO, type Professional } from '@/lib/professionals-data'
import { useState, useEffect } from 'react'

const CAT_MAP: Record<string, string> = {
  'Builder': 'builder', 'Town Planner': 'planner', 'Building Designer': 'designer',
  'Demolition Contractor': 'demolition', 'Structural Engineer': 'engineer',
  'Geotechnical Engineer': 'engineer', 'Finance Broker': 'finance',
  'Finance': 'finance', 'Surveyor': 'other', 'Arborist': 'other', 'Other': 'other',
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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

export default function ProfessionalProfilePage({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state, slug } = use(params)
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const { user } = useAuth()

  const [pro, setPro] = useState<Professional | null>(
    PROFESSIONALS.find(p => p.slug === slug && p.state === state.toUpperCase()) ?? null
  )
  const [loadingPro, setLoadingPro] = useState(!pro)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    if (pro) return
    fetch('/api/professionals-list')
      .then(r => r.json())
      .then((data: Array<{ business_name: string; category: string; state: string; regions: string[]; description: string; verified: boolean; website: string | null; wechat: string | null }>) => {
        const match = data.find(d => slugify(d.business_name) === slug && d.state?.toUpperCase() === state.toUpperCase())
        if (match) {
          setPro({
            slug,
            name: match.business_name,
            category: CAT_MAP[match.category] ?? 'other',
            state: match.state?.toUpperCase() ?? state.toUpperCase(),
            regions: match.regions ?? [],
            specialties: [],
            verified: match.verified,
            featured: false,
            description: match.description ?? '',
            website: match.website ?? null,
            wechat: match.wechat ?? null,
          })
        } else {
          setNotFoundState(true)
        }
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoadingPro(false))
  }, [])

  const [loginGate, setLoginGate] = useState(false)
  const [sent, setSent] = useState(false)
  const [isFav, setIsFav] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return (JSON.parse(localStorage.getItem('kdr_favorites') || '[]') as string[]).includes(slug) } catch { return false }
  })
  const [modal, setModal] = useState({ open: false, step: 1, submitting: false, error: '' })
  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', suburb: '', userState: '', projectType: '', timeline: '', message: '' })

  if (loadingPro) return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/professionals" />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>
    </div>
  )
  if (notFoundState || !pro) return notFound()

  const cat = CATEGORIES.find(c => c.id === pro.category)
  const stateInfo = STATE_INFO[state.toUpperCase()]
  const related = PROFESSIONALS.filter(p => p.category === pro.category && p.slug !== pro.slug && p.state === pro.state).slice(0, 3)

  function toggleFav() {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('kdr_favorites') || '[]')
      const next = isFav ? favs.filter(s => s !== slug) : [...favs, slug]
      localStorage.setItem('kdr_favorites', JSON.stringify(next))
      setIsFav(!isFav)
    } catch {}
  }

  function openQuote() {
    if (!user) { setLoginGate(true); return }
    setModal({ open: true, step: 1, submitting: false, error: '' })
    setForm({ userName: '', userEmail: user.email ?? '', userPhone: '', suburb: '', userState: '', projectType: '', timeline: '', message: '' })
  }

  async function submit() {
    if (!form.userName || !form.userEmail || !form.suburb || !form.userState) {
      setModal(m => ({ ...m, error: isZh ? '请填写所有必填项' : 'Please fill in name, email, suburb, and state.' }))
      return
    }
    setModal(m => ({ ...m, submitting: true, error: '' }))
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeowner_id: user?.id ?? null, professional_name: pro!.name, professional_category: pro!.category, message: form.message, suburb: `${form.suburb}, ${form.userState}`, project_type: form.projectType }),
      })
      setSent(true)
      setModal(m => ({ ...m, step: 3, submitting: false }))
    } catch (e) {
      setModal(m => ({ ...m, submitting: false, error: e instanceof Error ? e.message : 'Submission failed' }))
    }
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-gray-50 border border-gray-200 focus:border-orange-400'

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav backHref={`/professionals/${state}`} backLabel={stateInfo ? `${pro.state} Professionals` : 'Professionals'} currentPath="/professionals" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Profile card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0', cat ? COLOR_MAP[cat.color] : 'bg-gray-100 text-gray-400')}>
              {cat ? <cat.icon className="w-9 h-9" /> : pro.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pro.name}</h1>
                {pro.verified && (
                  <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    <CheckCircle className="w-4 h-4" />{isZh ? '已认证' : 'Verified'}
                  </span>
                )}
                {pro.featured && (
                  <span className="text-sm text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 font-medium">
                    {isZh ? '推荐' : 'Featured'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {cat && <span className={cn('text-sm font-medium px-3 py-1 rounded-full', COLOR_MAP[cat.color])}>{isZh ? cat.labelZh : cat.label}</span>}
                <span className={cn('text-sm px-3 py-1 rounded-full font-medium', STATE_COLORS[pro.state] || 'bg-gray-100 text-gray-500')}>{pro.state}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{pro.description}</p>
            </div>
            <button onClick={toggleFav} className={cn('p-3 rounded-xl transition-colors self-start shrink-0', isFav ? 'text-red-500 bg-red-50 border border-red-200' : 'text-gray-400 bg-gray-50 border border-gray-200 hover:border-red-200 hover:text-red-400')}>
              <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />
            </button>
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">{isZh ? '服务区域' : 'Service Areas'}</p>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{pro.regions.join(' · ')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">{isZh ? '专业领域' : 'Specialties'}</p>
              <div className="flex flex-wrap gap-1.5">
                {pro.specialties.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>)}
              </div>
            </div>
            {pro.website && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-2">{isZh ? '官网' : 'Website'}</p>
                <a href={`https://${pro.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors">
                  <Globe className="w-4 h-4" />{pro.website}
                </a>
              </div>
            )}
            {pro.wechat && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-2">WeChat</p>
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <MessageCircle className="w-4 h-4" />{pro.wechat}
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {sent ? (
              <div className="flex items-center gap-2 text-green-600 justify-center py-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{isZh ? '询价已发送！专业人士将在 24–48 小时内联系你。' : 'Enquiry sent! They\'ll be in touch within 24–48 hours.'}</span>
              </div>
            ) : (
              <button onClick={openQuote}
                className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
                <Phone className="w-5 h-5" />
                {isZh ? '立即获取报价' : 'Get a Free Quote'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Related professionals */}
        {related.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {isZh ? `更多 ${pro.state} ${cat ? (isZh ? cat.labelZh : cat.label) : ''}` : `More ${cat ? cat.label : 'Professionals'} in ${pro.state}`}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`/professionals/${r.state.toLowerCase()}/${r.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-200 hover:shadow-md transition-all group">
                  <p className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors mb-1 text-sm">{r.name}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.specialties.slice(0, 2).map(s => <span key={s} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                  <p className="text-xs text-gray-400">{r.regions.slice(0, 2).join(' · ')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href={`/professionals/${state}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {isZh ? `查看所有 ${pro.state} 专业人士` : `All ${pro.state} professionals`}
          </Link>
        </div>
      </div>

      {loginGate && <LoginGateModal onClose={() => setLoginGate(false)} redirectAfter={`/professionals/${state}/${slug}`} />}

      {/* Quote modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(m => ({ ...m, open: false })) }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-orange-500 font-medium mb-0.5">
                  {modal.step < 3 ? (isZh ? `获取报价 · 第 ${modal.step}/2 步` : `Get a Quote · Step ${modal.step} of 2`) : ''}
                </p>
                <h3 className="font-bold text-gray-900">{pro.name}</h3>
              </div>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? 'Suburb *' : 'Suburb *'}</label>
                    <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} placeholder={isZh ? '如：Strathfield' : 'e.g. Strathfield'} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '州 *' : 'State *'}</label>
                    <select value={form.userState} onChange={e => setForm(f => ({ ...f, userState: e.target.value }))} className={inputClass}>
                      <option value="">{isZh ? '选择州' : 'Select'}</option>
                      {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
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
                <button onClick={() => { if (!form.suburb) { setModal(m => ({ ...m, error: isZh ? '请填写区域' : 'Please enter your suburb' })); return } setModal(m => ({ ...m, step: 2, error: '' })) }}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                  {isZh ? '下一步' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
                {modal.error && <p className="text-red-500 text-xs text-center">{modal.error}</p>}
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
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '补充说明' : 'Message (optional)'}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={isZh ? '你的地块情况、具体需求…' : 'Details about your block or project…'}
                    rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-400 text-gray-900 placeholder-gray-400" />
                </div>
                {modal.error && <p className="text-red-500 text-xs">{modal.error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setModal(m => ({ ...m, step: 1 }))} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">{isZh ? '返回' : 'Back'}</button>
                  <button onClick={submit} disabled={modal.submitting}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                    {modal.submitting ? (isZh ? '发送中…' : 'Sending…') : (isZh ? '发送询价' : 'Send')}
                    {!modal.submitting && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {modal.step === 3 && (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{isZh ? '询价已发送！' : 'Enquiry sent!'}</h3>
                <p className="text-gray-500 text-sm mb-4">{isZh ? '专业人士通常在 24–48 小时内与你联系。' : `${pro.name} will be in touch within 24–48 hours.`}</p>
                <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-6 py-2.5 rounded-xl text-gray-700 text-sm bg-gray-100 hover:bg-gray-200">{isZh ? '关闭' : 'Close'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
