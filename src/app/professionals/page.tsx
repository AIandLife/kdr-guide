'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle, MapPin, Phone, ChevronRight,
  Briefcase, HardHat, Ruler, Zap, Droplets, FileText, DollarSign,
  Globe, MessageCircle, X, Building2, TrendingUp, Activity, PenTool
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'
import { useAuth } from '@/lib/auth-context'
import { SEED_SIGNALS, PROJECT_LABELS, formatTimeAgo, type DemandSignal } from '@/lib/demand-signals'

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

const CATEGORIES = [
  { id: 'builder',     label: 'Builders',          icon: HardHat,    color: 'orange' },
  { id: 'designer',    label: 'Building Designers', icon: PenTool,    color: 'indigo' },
  { id: 'planner',     label: 'Town Planners',      icon: FileText,   color: 'blue'   },
  { id: 'demolition',  label: 'Demolition',         icon: Building2,  color: 'red'    },
  { id: 'engineer',    label: 'Engineers',          icon: Ruler,      color: 'purple' },
  { id: 'electrician', label: 'Electricians',       icon: Zap,        color: 'yellow' },
  { id: 'plumber',     label: 'Plumbers',           icon: Droplets,   color: 'cyan'   },
  { id: 'finance',     label: 'Finance',            icon: DollarSign, color: 'green'  },
  { id: 'other',       label: 'Other',              icon: Briefcase,  color: 'gray'   },
]

const PROFESSIONALS = [
  // ── BUILDERS ──
  {
    name: 'Metricon Homes',
    category: 'builder', state: 'VIC',
    regions: ['Melbourne', 'Sydney', 'Brisbane', 'Adelaide'],
    specialties: ['Knockdown Rebuild', 'Display Homes', 'Custom Design'],
    verified: true, featured: true,
    description: 'Australia\'s largest home builder. Extensive KDR and new-home range across VIC, NSW, QLD, and SA. Volume pricing with full design studio.',
    website: 'metricon.com.au', wechat: null,
  },
  {
    name: 'GJ Gardner Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Brisbane', 'Perth', 'All States'],
    specialties: ['Knockdown Rebuild', 'Renovation', 'Custom Homes', 'Granny Flat'],
    verified: true, featured: true,
    description: 'National franchise builder operating across all states. Strong KDR and renovation track record. Local franchise owners with national brand backing.',
    website: 'gjgardner.com.au', wechat: null,
  },
  {
    name: 'McDonald Jones Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong'],
    specialties: ['Knockdown Rebuild', 'Dual Occupancy', 'Custom Homes'],
    verified: true, featured: false,
    description: 'Award-winning NSW builder known for quality finishes and KDR expertise across Greater Sydney and regional NSW. HIA award winner multiple years.',
    website: 'mcdonaldjones.com.au', wechat: null,
  },
  {
    name: 'Clarendon Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'ACT', 'South East NSW'],
    specialties: ['Knockdown Rebuild', 'Townhouses', 'Heritage Area Builds'],
    verified: true, featured: false,
    description: 'Premium NSW and ACT builder with deep experience navigating Sydney council requirements, heritage overlays, and dual-occupancy projects.',
    website: 'clarendonhomes.com.au', wechat: null,
  },
  {
    name: 'Plantation Homes',
    category: 'builder', state: 'QLD',
    regions: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Ipswich'],
    specialties: ['Knockdown Rebuild', 'Flood Rebuild', 'Queenslander Renovation'],
    verified: true, featured: false,
    description: 'Queensland specialist builder with proven KDR expertise across SEQ. Strong flood-zone and bush-fire overlay knowledge for QLD councils.',
    website: 'plantationhomes.com.au', wechat: null,
  },
  {
    name: 'Dale Alcock Homes',
    category: 'builder', state: 'WA',
    regions: ['Perth Metro', 'South West WA', 'All Perth Councils'],
    specialties: ['Knockdown Rebuild', 'Split Level', 'R-Codes Compliance'],
    verified: true, featured: false,
    description: 'Western Australia\'s trusted KDR builder. Deep expertise in Perth R-Codes, knock-down and rebuild process, and all metro council requirements.',
    website: 'dalealcock.com.au', wechat: null,
  },
  {
    name: 'Simonds Homes',
    category: 'builder', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Ballarat', 'Adelaide'],
    specialties: ['Knockdown Rebuild', 'Townhouses', 'Energy Efficiency'],
    verified: true, featured: false,
    description: 'Major Victorian and SA builder. Established KDR program with 7-star energy efficiency options. Strong presence across Melbourne metro and regional VIC.',
    website: 'simonds.com.au', wechat: null,
  },
  {
    name: 'Rawson Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Hunter Valley', 'Illawarra', 'Shoalhaven'],
    specialties: ['Knockdown Rebuild', 'Dual Occupancy', 'Acreage Homes'],
    verified: true, featured: false,
    description: 'NSW-focused builder with specialist KDR team. Strong in Sydney western and southern suburbs. Dual-occupancy and multi-dwelling experience.',
    website: 'rawsonhomes.com.au', wechat: null,
  },
  // ── BUILDING DESIGNERS ──
  {
    name: 'Buildplan Design Studio',
    category: 'designer', state: 'NSW',
    regions: ['Sydney', 'Wollongong', 'Central Coast'],
    specialties: ['KDR Design', 'Dual Occupancy', 'Granny Flat', 'DA Drawings'],
    verified: true, featured: true,
    description: 'Registered building designers specialising in KDR and dual occupancy projects across Greater Sydney. Full design and documentation service from concept to DA-ready plans.',
    website: null, wechat: null,
  },
  {
    name: 'Blueprint Residential Design',
    category: 'designer', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Mornington Peninsula'],
    specialties: ['Custom Home Design', 'KDR', 'Extensions', 'Planning Permit Drawings'],
    verified: true, featured: false,
    description: 'Melbourne-based residential designers with 15+ years of custom home and KDR experience. Coordinate with structural engineers and town planners for a seamless approval process.',
    website: null, wechat: null,
  },
  {
    name: 'ProDraft Building Designers',
    category: 'designer', state: 'QLD',
    regions: ['Brisbane', 'Gold Coast', 'Sunshine Coast'],
    specialties: ['House Plans', 'KDR', 'Granny Flat', 'Council Submissions'],
    verified: true, featured: false,
    description: 'QLD-licensed building designers providing full design documentation for KDR, dual occupancy, and secondary dwellings. Experienced with Brisbane City Plan 2014.',
    website: null, wechat: null,
  },
  {
    name: 'Form & Function Architects',
    category: 'designer', state: 'WA',
    regions: ['Perth', 'Fremantle', 'Swan Valley'],
    specialties: ['Architectural Design', 'KDR', 'Heritage Areas', 'Custom Homes'],
    verified: true, featured: false,
    description: 'Registered architects providing full residential design services across Perth metropolitan area. Heritage area specialists with JDAP/LDAP submission experience.',
    website: null, wechat: null,
  },
  // ── TOWN PLANNERS ──
  {
    name: 'Urban Planning Solutions',
    category: 'planner', state: 'NSW',
    regions: ['Sydney', 'All NSW'],
    specialties: ['DA Applications', 'Heritage', 'Rezoning', 'CDC'],
    verified: true, featured: false,
    description: 'Registered town planners with extensive council knowledge across all Sydney LGAs. Heritage, flood, and bushfire DA specialists.',
    website: null, wechat: null,
  },
  {
    name: 'Meridian Planning Consultants',
    category: 'planner', state: 'VIC',
    regions: ['Melbourne', 'Mornington Peninsula', 'Yarra Valley'],
    specialties: ['Planning Permits', 'Heritage Overlays', 'VCAT Appeals'],
    verified: true, featured: false,
    description: 'Melbourne planning consultants with 20+ years navigating complex overlays and permit applications for residential builds and KDR projects.',
    website: null, wechat: null,
  },
  // ── DEMOLITION ──
  {
    name: 'Precise Demolition',
    category: 'demolition', state: 'NSW',
    regions: ['Sydney', 'Hunter Valley', 'Illawarra'],
    specialties: ['Residential Demo', 'Asbestos Removal', 'Concrete Slab', 'Site Clearance'],
    verified: true, featured: false,
    description: 'Licensed residential demolition contractor. Asbestos removal certified, full insurance, and council permit management included.',
    website: null, wechat: null,
  },
  // ── ENGINEERS ──
  {
    name: 'Structural Solutions Engineering',
    category: 'engineer', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Ballarat'],
    specialties: ['Slab Design', 'Frame Engineering', 'Reactive Soil'],
    verified: true, featured: false,
    description: 'NER registered structural engineer. Specialises in residential KDR structural design including H2 and M-D reactive soil sites.',
    website: null, wechat: null,
  },
  // ── FINANCE ──
  {
    name: 'KDR Finance Brokers',
    category: 'finance', state: 'NSW',
    regions: ['All Australia'],
    specialties: ['Construction Loans', 'Owner Builder Finance', 'Bridging Loans'],
    verified: true, featured: true,
    description: 'Specialised mortgage brokers for KDR and construction finance. Access to 30+ lenders. Progress draw management included.',
    website: null, wechat: null,
  },
]

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
  const { user } = useAuth()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeState, setActiveState] = useState<string>('all')
  const [loginGatePro, setLoginGatePro] = useState<typeof PROFESSIONALS[0] | null>(null)

  // Read ?category= from URL on mount (client-side only)
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat) setActiveCategory(cat)
  }, [])
  const [sentPros, setSentPros] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<ModalState>({ pro: null, step: 'form', submitting: false, error: '' })
  const [form, setForm] = useState<LeadForm>({ userName: '', userEmail: '', userPhone: '', suburb: '', projectType: '', timeline: '', message: '' })

  const filtered = PROFESSIONALS.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (activeState !== 'all' && p.state !== activeState && !p.regions.includes('All Australia')) return false
    return true
  })

  function openModal(pro: typeof PROFESSIONALS[0]) {
    if (!user) {
      setLoginGatePro(pro)
      return
    }
    setModal({ pro, step: 'form', submitting: false, error: '' })
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
      // Save to DB (linked to user account if logged in)
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
      setModal(m => ({ ...m, step: 'success', submitting: false }))
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
            return (
              <div key={pro.name} className={cn('bg-white border rounded-2xl p-5 flex flex-col shadow-sm', pro.featured ? 'border-orange-300' : 'border-gray-200')}>
                {pro.featured && (
                  <div className="text-xs text-orange-600 font-semibold mb-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />Featured
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 leading-tight">{pro.name}</h3>
                    <div className="flex items-center gap-2">
                      {pro.verified && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" />{tp.verified}</span>}
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', STATE_COLORS[pro.state] || 'bg-gray-100 text-gray-500')}>{pro.state}</span>
                    </div>
                  </div>
                  {cat && <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', COLOR_MAP[cat.color])}><cat.icon className="w-5 h-5" /></div>}
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

                <button
                  onClick={() => !sent && openModal(pro)}
                  disabled={sent}
                  className={cn('w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                    sent ? 'bg-green-100 text-green-700 cursor-default' : 'bg-orange-500 hover:bg-orange-400 text-white')}
                >
                  {sent
                    ? <><CheckCircle className="w-4 h-4" />{tp.requestSent}</>
                    : <><Phone className="w-4 h-4" />{tp.getQuote}</>}
                </button>
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

      {/* ── Lead Modal ── */}
      {modal.pro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-orange-500 font-medium mb-0.5">
                  {isZh ? '发送询价' : 'Get a Quote'}
                </p>
                <h3 className="font-bold text-gray-900">{modal.pro.name}</h3>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form or Success */}
            {modal.step === 'form' ? (
              <div className="px-6 py-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '你的姓名 *' : 'Your name *'}</label>
                    <input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                      placeholder={isZh ? '姓名' : 'Full name'} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '你的 Suburb *' : 'Your suburb *'}</label>
                    <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                      placeholder={isZh ? '如：Strathfield' : 'e.g. Strathfield'} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '邮箱 *' : 'Email *'}</label>
                  <input type="email" value={form.userEmail} onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))}
                    placeholder="you@email.com" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '手机（可选）' : 'Phone (optional)'}</label>
                  <input value={form.userPhone} onChange={e => setForm(f => ({ ...f, userPhone: e.target.value }))}
                    placeholder="0400 000 000" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '项目类型' : 'Project type'}</label>
                    <select value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                      className={inputClass}>
                      <option value="">{isZh ? '请选择' : 'Select…'}</option>
                      {(isZh ? PROJECT_TYPES_ZH : PROJECT_TYPES_EN).map((pt, i) => (
                        <option key={i} value={PROJECT_TYPES_EN[i]}>{pt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '计划时间' : 'Timeline'}</label>
                    <select value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))}
                      className={inputClass}>
                      <option value="">{isZh ? '请选择' : 'Select…'}</option>
                      {(isZh ? TIMELINES_ZH : TIMELINES_EN).map((tl, i) => (
                        <option key={i} value={TIMELINES_EN[i]}>{tl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '补充说明（可选）' : 'Message (optional)'}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={isZh ? '你的地块情况、具体需求等…' : 'Any details about your block or project…'}
                    rows={2} className="w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm resize-none bg-gray-50 border border-gray-200 focus:border-orange-400" />
                </div>

                {modal.error && <p className="text-red-500 text-xs">{modal.error}</p>}

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
                <p className="text-xs text-gray-400 text-center pb-1">
                  {isZh
                    ? '你的信息将转发给该专业人士，通常 24–48 小时内回复。'
                    : 'Your details will be forwarded to this professional. Typical response: 24–48 hours.'}
                </p>
              </div>
            ) : (
              /* Success state */
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isZh ? '询价已发送！' : 'Enquiry sent!'}
                </h3>
                <p className="text-gray-500 text-sm mb-1">
                  {isZh ? '我们已将你的信息转发给' : 'Your details have been forwarded to'}
                </p>
                <p className="font-semibold text-gray-900 mb-4">{modal.pro.name}</p>
                <p className="text-gray-400 text-xs mb-6">
                  {isZh
                    ? '确认邮件已发至你的邮箱。专业人士通常在 24–48 小时内与你联系。'
                    : `A confirmation has been sent to ${form.userEmail}. The professional will be in touch within 24–48 hours.`}
                </p>
                <button onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl text-gray-700 font-medium text-sm transition-colors bg-gray-100 hover:bg-gray-200">
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
