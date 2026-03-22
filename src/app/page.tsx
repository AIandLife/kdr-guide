'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, CheckCircle, ChevronRight, Building2, DollarSign, Clock, Users } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'

const PAIN_ICONS = [Building2, DollarSign, Clock, Users]
const STEP_ICONS = [MapPin, Search, CheckCircle, Users]

export default function HomePage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = translations[lang]
  const h = t.home

  const [suburb, setSuburb] = useState('')
  const [lotSize, setLotSize] = useState('')
  const [state, setState] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suburb.trim()) return
    const params = new URLSearchParams({ suburb: suburb.trim(), lang })
    if (lotSize) params.set('lotSize', lotSize)
    if (state) params.set('state', state)
    router.push(`/feasibility?${params.toString()}`)
  }

  const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT']

  return (
    <div className="min-h-screen bg-white">
      <SiteNav currentPath="/" />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fff7ed 0%, #ffffff 60%)' }}>
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #fed7aa, transparent)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-orange-50 border border-orange-200">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-600 text-sm font-medium">{h.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {h.h1a}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #fb923c)' }}> {h.h1b}</span>
              <br />{h.h1c}
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">{h.subtitle}</p>

            {/* Search Form */}
            <div className="max-w-2xl rounded-2xl p-4 sm:p-6 bg-white border border-gray-200 shadow-lg shadow-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">{h.formSuburb}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={suburb}
                        onChange={e => setSuburb(e.target.value)}
                        placeholder={h.formSuburbPlaceholder}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">{h.formState}</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors"
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
                <button
                  type="submit"
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 32px rgba(249,115,22,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(249,115,22,0.3)')}
                >
                  <Search className="w-5 h-5" />
                  {h.formBtn}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">{h.formNote}</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {h.stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold mb-1 text-orange-500">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* WeChat Group */}
          <div className="rounded-2xl p-6 text-center flex flex-col items-center bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl bg-green-50">
              💬
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {lang === 'zh' ? '澳洲建房交流群' : 'WeChat Community Group'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {lang === 'zh'
                ? '扫码加入微信群，和业主、建筑商、设计师直接交流。'
                : 'Scan to join our WeChat group — homeowners, builders, and designers in one place.'}
            </p>
            <div className="w-32 h-32 rounded-xl flex items-center justify-center mb-3 bg-gray-50 border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-1">📱</div>
                <p className="text-xs text-gray-400">{lang === 'zh' ? '二维码即将上线' : 'QR coming soon'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">{lang === 'zh' ? '微信扫码加群' : 'Scan with WeChat'}</p>
          </div>

          {/* WeChat Official Account */}
          <div className="rounded-2xl p-6 text-center flex flex-col items-center bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl bg-green-50">
              📰
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {lang === 'zh' ? '微信公众号' : 'WeChat Official Account'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {lang === 'zh'
                ? '关注公众号，获取最新建房资讯、政策解读和优质案例分享。'
                : 'Follow our official account for the latest KDR news, policy updates, and case studies.'}
            </p>
            <div className="w-32 h-32 rounded-xl flex items-center justify-center mb-3 bg-gray-50 border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-1">📱</div>
                <p className="text-xs text-gray-400">{lang === 'zh' ? '二维码即将上线' : 'QR coming soon'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {lang === 'zh' ? '搜索公众号：KDR建房指南' : 'Search: KDR Guide Australia'}
            </p>
          </div>

          {/* Direct contact */}
          <div className="rounded-2xl p-6 text-center flex flex-col items-center bg-orange-50 border border-orange-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl bg-orange-100">
              ✉️
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {lang === 'zh' ? '私信我们' : 'Message Us Directly'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {lang === 'zh'
                ? '有建房问题、合作意向或想入驻我们平台？直接联系我们的团队。'
                : 'Questions about KDR, partnership opportunities, or want to list your business? Reach our team directly.'}
            </p>
            <a
              href="mailto:terry@kdrguide.com.au"
              className="w-full py-3 rounded-xl text-sm font-semibold transition-colors text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}
            >
              {lang === 'zh' ? '发送邮件' : 'Send Email'}
            </a>
            <p className="text-xs text-gray-400 mt-3">terry@kdrguide.com.au</p>
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

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">{t.nav.brand}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/guide" className="hover:text-gray-900 transition-colors">{t.nav.guide}</a>
              <a href="/professionals" className="hover:text-gray-900 transition-colors">{t.nav.professionals}</a>
              <a href="/articles" className="hover:text-gray-900 transition-colors">{t.nav.articles}</a>
              <a href="/suppliers" className="hover:text-gray-900 transition-colors">{t.nav.suppliers}</a>
            </div>
            <p className="text-xs text-gray-400 text-center">{h.footerDisclaimer}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
