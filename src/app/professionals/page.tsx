'use client'

import { useState } from 'react'
import {
  Building2, ArrowLeft, CheckCircle, MapPin, Phone, ChevronRight,
  Briefcase, HardHat, Ruler, Zap, Droplets, FileText, DollarSign,
  Globe, MessageCircle, X
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'

const CATEGORIES = [
  { id: 'builder',     label: 'Builders',       icon: HardHat,    color: 'orange' },
  { id: 'planner',     label: 'Town Planners',   icon: FileText,   color: 'blue'   },
  { id: 'demolition',  label: 'Demolition',      icon: Building2,  color: 'red'    },
  { id: 'engineer',    label: 'Engineers',       icon: Ruler,      color: 'purple' },
  { id: 'electrician', label: 'Electricians',    icon: Zap,        color: 'yellow' },
  { id: 'plumber',     label: 'Plumbers',        icon: Droplets,   color: 'cyan'   },
  { id: 'finance',     label: 'Finance',         icon: DollarSign, color: 'green'  },
  { id: 'other',       label: 'Other',           icon: Briefcase,  color: 'gray'   },
]

const PROFESSIONALS = [
  { name: 'KDR Specialists NSW',          category: 'builder',    state: 'NSW', regions: ['Sydney', 'Newcastle', 'Wollongong'],       specialties: ['Knockdown Rebuild', 'Dual Occupancy', 'Custom Homes'],          verified: true, featured: true,  description: 'Specialising in KDR projects across Greater Sydney. 15+ years experience, 200+ completed projects.', website: null, wechat: 'kdr_nsw' },
  { name: 'Melbourne Rebuild Co',         category: 'builder',    state: 'VIC', regions: ['Melbourne', 'Eastern Suburbs', 'South East'], specialties: ['Knockdown Rebuild', 'Townhouses', 'Passive House'],           verified: true, featured: true,  description: 'Award-winning custom builder specialising in KDR across Melbourne metro. Heritage area experience.',   website: null, wechat: null },
  { name: 'Urban Planning Solutions',     category: 'planner',    state: 'NSW', regions: ['Sydney', 'All NSW'],                        specialties: ['DA Applications', 'Heritage', 'Rezoning'],                       verified: true, featured: false, description: 'Registered town planners with extensive council knowledge across all Sydney LGAs.',                  website: null, wechat: 'urbanplan_au' },
  { name: 'QLD Build & Rebuild',          category: 'builder',    state: 'QLD', regions: ['Brisbane', 'Gold Coast', 'Sunshine Coast'], specialties: ['Knockdown Rebuild', 'Flood Rebuild', 'Acreage'],                verified: true, featured: false, description: 'Experienced in post-flood rebuild and standard KDR across SEQ. Excellent flood zone knowledge.',     website: null, wechat: null },
  { name: 'Perth KDR Professionals',      category: 'builder',    state: 'WA',  regions: ['Perth Metro', 'North Perth', 'South Perth'], specialties: ['Knockdown Rebuild', 'Split Level', 'Bush Block'],              verified: true, featured: false, description: "Western Australia's dedicated KDR builder. R-Codes expertise for all Perth councils.",              website: null, wechat: null },
  { name: 'Demolition Masters',           category: 'demolition', state: 'NSW', regions: ['Sydney', 'Hunter Valley', 'Illawarra'],     specialties: ['Residential Demo', 'Asbestos Removal', 'Concrete Slab'],        verified: true, featured: false, description: 'Licensed demolition contractor with asbestos removal certification. Fast, clean, and fully insured.', website: null, wechat: null },
  { name: 'Structural Solutions Engineering', category: 'engineer', state: 'VIC', regions: ['Melbourne', 'Geelong', 'Ballarat'],      specialties: ['Slab Design', 'Frame Engineering', 'Reactive Soil'],           verified: true, featured: false, description: 'NER registered structural engineer. Specialises in residential KDR structural design.',             website: null, wechat: null },
  { name: 'KDR Finance Brokers',          category: 'finance',    state: 'NSW', regions: ['All Australia'],                            specialties: ['Construction Loans', 'Owner Builder Finance', 'Bridging Loans'], verified: true, featured: true,  description: 'Specialised mortgage brokers for KDR and construction finance. Access to 30+ lenders.',             website: null, wechat: 'kdrfinance_au' },
]

const STATE_COLORS: Record<string, string> = {
  NSW: 'bg-blue-500/20 text-blue-400', VIC: 'bg-purple-500/20 text-purple-400',
  QLD: 'bg-yellow-500/20 text-yellow-400', WA: 'bg-green-500/20 text-green-400',
  SA: 'bg-red-500/20 text-red-400', ACT: 'bg-cyan-500/20 text-cyan-400',
  TAS: 'bg-orange-500/20 text-orange-400', NT: 'bg-pink-500/20 text-pink-400',
}
const COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-500/10 text-orange-400', blue: 'bg-blue-500/10 text-blue-400',
  red: 'bg-red-500/10 text-red-400', purple: 'bg-purple-500/10 text-purple-400',
  yellow: 'bg-yellow-500/10 text-yellow-400', cyan: 'bg-cyan-500/10 text-cyan-400',
  green: 'bg-green-500/10 text-green-400', gray: 'bg-gray-500/10 text-gray-400',
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
  pro: typeof PROFESSIONALS[0] | null
  step: 'form' | 'success'
  submitting: boolean
  error: string
}

export default function ProfessionalsPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const tp = t.professionals
  const isZh = lang === 'zh'

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeState, setActiveState] = useState<string>('all')
  const [sentPros, setSentPros] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<ModalState>({ pro: null, step: 'form', submitting: false, error: '' })
  const [form, setForm] = useState<LeadForm>({ userName: '', userEmail: '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })

  const filtered = PROFESSIONALS.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (activeState !== 'all' && p.state !== activeState && !p.regions.includes('All Australia')) return false
    return true
  })

  function openModal(pro: typeof PROFESSIONALS[0]) {
    setModal({ pro, step: 'form', submitting: false, error: '' })
    setForm({ userName: '', userEmail: '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })
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
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proName: modal.pro.name,
          proCategory: modal.pro.category,
          proState: modal.pro.state,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSentPros(prev => new Set([...prev, modal.pro!.name]))
      setModal(m => ({ ...m, step: 'success', submitting: false }))
    } catch (e: unknown) {
      setModal(m => ({ ...m, submitting: false, error: e instanceof Error ? e.message : 'Submission failed' }))
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm transition-colors'

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />{t.nav.home}
            </a>
            <div className="w-px h-5 bg-gray-700" />
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">{t.nav.brand}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <a href="/feasibility" className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">{tp.h1}</h1>
          <p className="text-gray-400 text-lg">{tp.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-3">{tp.filterByRole}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory('all')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white')}>{tp.allRoles}</button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeCategory === cat.id ? COLOR_MAP[cat.color] : 'bg-gray-800 text-gray-400 hover:text-white')}>
                  <cat.icon className="w-3.5 h-3.5" />{cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-3">{tp.filterByState}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveState('all')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeState === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white')}>{tp.allStates}</button>
              {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => (
                <button key={s} onClick={() => setActiveState(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeState === s ? STATE_COLORS[s] : 'bg-gray-800 text-gray-400 hover:text-white')}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filtered.map(pro => {
            const cat = CATEGORIES.find(c => c.id === pro.category)
            const sent = sentPros.has(pro.name)
            return (
              <div key={pro.name} className={cn('bg-gray-900 border rounded-2xl p-5 flex flex-col', pro.featured ? 'border-orange-500/30' : 'border-gray-800')}>
                {pro.featured && (
                  <div className="text-xs text-orange-400 font-semibold mb-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />Featured
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 leading-tight">{pro.name}</h3>
                    <div className="flex items-center gap-2">
                      {pro.verified && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />{tp.verified}</span>}
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', STATE_COLORS[pro.state] || 'bg-gray-700 text-gray-400')}>{pro.state}</span>
                    </div>
                  </div>
                  {cat && <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', COLOR_MAP[cat.color])}><cat.icon className="w-5 h-5" /></div>}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{pro.description}</p>

                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2"><MapPin className="w-3.5 h-3.5" />{pro.regions.join(' · ')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.specialties.map(s => <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>

                <button
                  onClick={() => !sent && openModal(pro)}
                  disabled={sent}
                  className={cn('w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                    sent ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-orange-500 hover:bg-orange-400 text-white')}
                >
                  {sent
                    ? <><CheckCircle className="w-4 h-4" />{tp.requestSent}</>
                    : <><Phone className="w-4 h-4" />{tp.getQuote}</>}
                </button>

                {(pro.website || pro.wechat) && (
                  <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-800">
                    {pro.website && (
                      <a href={`https://${pro.website}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        <Globe className="w-3.5 h-3.5" />{pro.website}
                      </a>
                    )}
                    {pro.wechat && (
                      <span className="flex items-center gap-1.5 text-xs text-green-400">
                        <MessageCircle className="w-3.5 h-3.5" />微信: {pro.wechat}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No professionals found for this filter.</p>
            <p className="text-sm mt-2">Try changing the state or category.</p>
          </div>
        )}

        {/* Register CTA */}
        <div className="bg-gradient-to-br from-orange-900/20 to-gray-900 border border-orange-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{tp.registerTitle}</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">{tp.registerSubtitle}</p>
          <a href="/join" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
            {tp.registerBtn}<ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Lead Modal ── */}
      {modal.pro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="text-xs text-orange-400 font-medium mb-0.5">
                  {isZh ? '发送询价' : 'Get a Quote'}
                </p>
                <h3 className="font-bold text-white">{modal.pro.name}</h3>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form or Success */}
            {modal.step === 'form' ? (
              <div className="px-6 py-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '你的姓名 *' : 'Your name *'}</label>
                    <input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                      placeholder={isZh ? '姓名' : 'Full name'} className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '你的 Suburb *' : 'Your suburb *'}</label>
                    <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                      placeholder={isZh ? '如：Strathfield' : 'e.g. Strathfield'} className={inputClass} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '邮箱 *' : 'Email *'}</label>
                  <input type="email" value={form.userEmail} onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))}
                    placeholder="you@email.com" className={inputClass} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '手机（可选）' : 'Phone (optional)'}</label>
                  <input value={form.userPhone} onChange={e => setForm(f => ({ ...f, userPhone: e.target.value }))}
                    placeholder="0400 000 000" className={inputClass} style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '项目类型' : 'Project type'}</label>
                    <select value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                      className={inputClass} style={{ ...inputStyle, color: form.projectType ? 'white' : '#64748b' }}>
                      <option value="" style={{ background: '#1e293b' }}>{isZh ? '请选择' : 'Select…'}</option>
                      {(isZh ? PROJECT_TYPES_ZH : PROJECT_TYPES_EN).map((pt, i) => (
                        <option key={i} value={PROJECT_TYPES_EN[i]} style={{ background: '#1e293b' }}>{pt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '计划时间' : 'Timeline'}</label>
                    <select value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))}
                      className={inputClass} style={{ ...inputStyle, color: form.timeline ? 'white' : '#64748b' }}>
                      <option value="" style={{ background: '#1e293b' }}>{isZh ? '请选择' : 'Select…'}</option>
                      {(isZh ? TIMELINES_ZH : TIMELINES_EN).map((tl, i) => (
                        <option key={i} value={TIMELINES_EN[i]} style={{ background: '#1e293b' }}>{tl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '补充说明（可选）' : 'Message (optional)'}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={isZh ? '你的地块情况、具体需求等…' : 'Any details about your block or project…'}
                    rows={2} className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm resize-none"
                    style={inputStyle} />
                </div>

                {modal.error && <p className="text-red-400 text-xs">{modal.error}</p>}

                <button
                  onClick={submitLead}
                  disabled={modal.submitting}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  {modal.submitting
                    ? (isZh ? '发送中…' : 'Sending…')
                    : (isZh ? '发送询价' : 'Send Enquiry')}
                  {!modal.submitting && <ChevronRight className="w-4 h-4" />}
                </button>
                <p className="text-xs text-slate-600 text-center pb-1">
                  {isZh
                    ? '你的信息将转发给该专业人士，通常 24–48 小时内回复。'
                    : 'Your details will be forwarded to this professional. Typical response: 24–48 hours.'}
                </p>
              </div>
            ) : (
              /* Success state */
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {isZh ? '询价已发送！' : 'Enquiry sent!'}
                </h3>
                <p className="text-slate-400 text-sm mb-1">
                  {isZh ? '我们已将你的信息转发给' : 'Your details have been forwarded to'}
                </p>
                <p className="font-semibold text-white mb-4">{modal.pro.name}</p>
                <p className="text-slate-500 text-xs mb-6">
                  {isZh
                    ? '确认邮件已发至你的邮箱。专业人士通常在 24–48 小时内与你联系。'
                    : `A confirmation has been sent to ${form.userEmail}. The professional will be in touch within 24–48 hours.`}
                </p>
                <button onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {isZh ? '关闭' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
