'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle, ChevronRight, Building2, DollarSign, Clock, Users, MapPin, ExternalLink } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'

const PAIN_ICONS = [Building2, DollarSign, Clock, Users]
const STEP_ICONS = [MapPin, Search, CheckCircle, Users]

const SUBURB_TAGS = [
  'Strathfield', 'Parramatta', 'Box Hill', 'Chatswood', 'Epping', 'Ryde', 'Kellyville',
  'Hornsby', 'Sutherland', 'Glen Waverley', 'Doncaster', 'Brighton', 'Moonee Ponds',
  'Frankston', 'Oakleigh', 'Norwood', 'Prospect', 'Unley', 'Glenelg', 'New Farm',
  'Ascot', 'Bulimba', 'Kenmore', 'Cottesloe', 'Subiaco', 'Claremont', 'Duncraig',
  'Wembley', 'Applecross', 'Como', 'Nedlands', 'Toowong', 'Taringa', 'Indooroopilly',
  'Paddington', 'Woollahra', 'Mosman', 'Cremorne', 'Neutral Bay', 'Lindfield',
  'Pymble', 'Turramurra', 'Waitara', 'Pennant Hills', 'Castle Hill', 'Baulkham Hills',
]

const SERVICE_TAGS = [
  { label: 'KDR Builder', zh: 'KDR 建筑商' },
  { label: 'Town Planner', zh: '城市规划师' },
  { label: 'Demolition', zh: '拆除工程' },
  { label: 'Surveyor', zh: '测量师' },
  { label: 'Structural Engineer', zh: '结构工程师' },
  { label: 'Architect', zh: '建筑设计师' },
  { label: 'Interior Designer', zh: '室内设计师' },
  { label: 'Finance Broker', zh: '贷款经纪人' },
  { label: 'Arborist', zh: '树木师' },
  { label: 'Landscape Designer', zh: '景观设计师' },
  { label: 'Building Inspector', zh: '建筑检测师' },
  { label: 'Energy Assessor', zh: '能源评估师' },
  { label: 'Project Manager', zh: '项目经理' },
  { label: 'Geotechnical Engineer', zh: '岩土工程师' },
  { label: 'Pool Builder', zh: '泳池建造商' },
  { label: 'Solar Installer', zh: '太阳能安装' },
  { label: 'Certifier', zh: '认证工程师' },
  { label: 'Building Designer', zh: '住宅设计师' },
]

function MarqueeSection({ lang }: { lang: string }) {
  // Double each list for seamless infinite loop
  const suburbs = [...SUBURB_TAGS, ...SUBURB_TAGS]
  const services = [...SERVICE_TAGS, ...SERVICE_TAGS]

  return (
    <section className="py-16 overflow-hidden bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {lang === 'zh'
            ? '你需要的，这里都有'
            : 'Everything you need, all in one place'}
        </h2>
        <p className="text-gray-500 text-base max-w-lg mx-auto">
          {lang === 'zh'
            ? '查政策、估费用、找建筑商、比建材——全澳每个区都覆盖，一站搞定。'
            : 'Check council rules, estimate costs, find builders, compare suppliers — covering every suburb across Australia.'}
        </p>
      </div>

      {/* Row 1: Suburbs → scrolling left */}
      <div className="marquee-track mb-3 relative">
        <div className="flex gap-3 animate-marquee-left whitespace-nowrap w-max">
          {suburbs.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100 shrink-0">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2: Services → scrolling right */}
      <div className="marquee-track relative">
        <div className="flex gap-3 animate-marquee-right whitespace-nowrap w-max">
          {services.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              {lang === 'zh' ? s.zh : s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = translations[lang]
  const h = t.home

  const [suburb, setSuburb] = useState('')
  const [lotSize, setLotSize] = useState('')
  const [state, setState] = useState('')
  const [projectType, setProjectType] = useState('kdr')
  const [formError, setFormError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suburb.trim()) { setFormError(lang === 'zh' ? '请输入你的区域（Suburb）' : 'Please enter your suburb'); return }
    if (!state) { setFormError(lang === 'zh' ? '请选择所在州' : 'Please select a state'); return }
    setFormError('')
    const params = new URLSearchParams({ suburb: suburb.trim(), lang, projectType, state })
    if (lotSize) params.set('lotSize', lotSize)
    router.push(`/feasibility?${params.toString()}`)
  }

  const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT']

  return (
    <div className="min-h-screen bg-white">
      <SiteNav currentPath="/" />

      {/* Hero — two-column layout */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fff7ed 0%, #ffffff 55%)' }}>
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #fed7aa, transparent)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — headline + subtitle only */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-orange-50 border border-orange-200">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-orange-600 text-sm font-medium">{h.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
                {h.h1a}<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #fb923c)' }}>{h.h1b}</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed">{h.subtitle}</p>
            </div>

            {/* Right — Search Form */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white border border-gray-200 shadow-xl shadow-gray-100/60">
              <form onSubmit={handleSubmit}>
                {/* Project Type Pills */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-2 font-medium">{h.formProjectType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {h.formProjectTypes.map(pt => (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => setProjectType(pt.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border text-left ${
                          projectType === pt.value
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">{h.formSuburb}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={suburb}
                        onChange={e => setSuburb(e.target.value)}
                        placeholder={h.formSuburbPlaceholder}
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">{h.formState}</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full h-[46px] px-4 py-3 rounded-xl text-gray-900 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors"
                    >
                      <option value="">{h.formStateAll}</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">{h.formLotSize}</label>
                  <input
                    type="number"
                    value={lotSize}
                    onChange={e => setLotSize(e.target.value)}
                    placeholder={h.formLotSizePlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors"
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-sm text-center -mt-1">{formError}</p>
                )}
                <button
                  type="submit"
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 28px rgba(249,115,22,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)')}
                >
                  <Search className="w-5 h-5" />
                  {h.formBtn}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">{h.formNote}</p>
              </form>
            </div>

          </div>

          {/* Stats bar — full width below both columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-orange-100">
            {h.stats.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-500">{s.value}</span>
                <span className="text-sm text-gray-500 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee — Coverage Section */}
      <MarqueeSection lang={lang} />

      {/* Pain Points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{h.painTitle}</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">{h.painSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {h.pains.map((p, i) => {
            const Icon = PAIN_ICONS[i]
            return (
              <div key={i} className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm transition-all group cursor-default hover:border-orange-200 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-orange-50">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{h.howTitle}</h2>
            <p className="text-gray-500 text-lg">{h.howSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {h.steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <div key={i} className="relative">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-px z-0" style={{ background: 'linear-gradient(to right, #fdba74, transparent)' }} />
                  )}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs text-orange-500 font-semibold mb-2 tracking-wide">STEP {i + 1}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {lang === 'zh' ? '加入澳洲建房社群' : 'Join Our Community'}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {lang === 'zh'
              ? '和数千位正在规划或已完成推倒重建的澳洲业主一起交流，分享经验，互相解答。'
              : 'Connect with thousands of Australian homeowners planning or completing a knockdown rebuild. Share experiences, ask questions, get answers.'}
          </p>
        </div>

        <div className="flex justify-center">
          {/* WeChat Official Account + Group */}
          <div className="rounded-2xl p-8 text-center flex flex-col items-center bg-white border border-gray-100 shadow-sm max-w-sm w-full">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl bg-green-50">
              💬
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {lang === 'zh' ? '关注公众号，加入微信群' : 'WeChat — Official Account & Group'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {lang === 'zh'
                ? '关注公众号「澳洲建房圈」，并加入建房讨论群，和业主、建筑商、设计师直接交流。'
                : 'Follow our official account and join the build discussion group — homeowners, builders, and designers in one place.'}
            </p>
            <img
              src="/wechat-official.jpg"
              alt="澳洲建房圈公众号二维码"
              className="w-36 h-36 rounded-xl object-cover mb-3"
            />
            <p className="text-xs text-gray-400">
              {lang === 'zh' ? '搜索公众号：澳洲建房圈' : 'Search WeChat: AusBuildCircle'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{h.ctaTitle}</h2>
            <p className="text-gray-500 text-lg mb-8">{h.ctaSubtitle}</p>
            <a
              href="/feasibility"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 36px rgba(249,115,22,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(249,115,22,0.3)')}
            >
              {h.ctaBtn}
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Ecosystem Banner */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-3">
            {lang === 'zh' ? 'BossLink商业生态' : 'BossLink Ecosystem'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {lang === 'zh' ? '我们是生态大家庭的一员' : 'Part of a Bigger Ecosystem'}
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
            {lang === 'zh'
              ? '澳洲建房圈是 BossLink 商业生态旗下的垂直平台之一，共同为华人在澳的生活、创业、置业提供专业支持。'
              : 'AusBuildCircle is part of the BossLink ecosystem — a network of platforms supporting the Chinese-Australian community.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://bosslink.ai" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {lang === 'zh' ? 'BossLink' : 'BossLink'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href="https://auspropertycircle.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {lang === 'zh' ? '澳洲房产圈' : 'Aus Property Circle'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="inline-flex items-center gap-1.5 border border-slate-700 text-slate-600 font-semibold px-5 py-2.5 rounded-xl text-sm cursor-default">
              {lang === 'zh' ? '澳洲NDIS圈（即将上线）' : 'NDIS Hub AU — Coming Soon'}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">{t.nav.brand}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">{h.footerDisclaimer}</p>
            </div>
            {/* Ecosystem */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {lang === 'zh' ? '生态伙伴' : 'Ecosystem'}
              </p>
              <div className="space-y-2">
                {[
                  { href: 'https://bosslink.ai', label: lang === 'zh' ? 'BossLink' : 'BossLink' },
                  { href: 'https://auspropertycircle.com',             label: lang === 'zh' ? '澳洲房产圈' : 'Aus Property Circle' },
                  { href: '#', label: lang === 'zh' ? '澳洲NDIS圈（即将上线）' : 'NDIS Hub AU — Coming Soon' },
                ].map(l => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              {lang === 'zh' ? 'Built with ♥ BossLink商业生态' : 'Built with ♥ BossLink Ecosystem'}
            </p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </a>
              <a href="/terms" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                {lang === 'zh' ? '服务条款' : 'Terms of Service'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
