'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, CheckCircle, ChevronRight, Building2, DollarSign, Clock, Users } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0d1117 100%)' }}>
      {/* Nav */}
      <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">{t.nav.brand}</span>
            <span className="text-xs text-orange-400 ml-1 hidden sm:block">{t.nav.tagline}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-400">
            <a href="/guide" className="hover:text-white transition-colors hidden sm:block">{t.nav.guide}</a>
            <a href="/professionals" className="hover:text-white transition-colors hidden sm:block">{t.nav.professionals}</a>
            <LangToggle />
            <a href="/feasibility" className="bg-orange-500 hover:bg-orange-400 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-xs sm:text-sm shadow-lg shadow-orange-500/20">
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
        <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-8 pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">{h.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {h.h1a}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #fb923c)' }}> {h.h1b}</span>
              <br />{h.h1c}
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">{h.subtitle}</p>

            {/* Search Form */}
            <div className="max-w-2xl rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">{h.formSuburb}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={suburb}
                        onChange={e => setSuburb(e.target.value)}
                        placeholder={h.formSuburbPlaceholder}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">{h.formState}</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="" style={{ background: '#1e293b' }}>{h.formStateAll}</option>
                      {STATES.map(s => <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">{h.formLotSize}</label>
                  <input
                    type="number"
                    value={lotSize}
                    onChange={e => setLotSize(e.target.value)}
                    placeholder={h.formLotSizePlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
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
                <p className="text-center text-xs text-slate-600 mt-3">{h.formNote}</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {h.stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#fb923c' }}>{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{h.painTitle}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{h.painSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {h.pains.map((p, i) => {
            const Icon = PAIN_ICONS[i]
            return (
              <div key={i} className="rounded-2xl p-6 transition-all group cursor-default"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(249,115,22,0.12)' }}>
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{h.howTitle}</h2>
            <p className="text-slate-400 text-lg">{h.howSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {h.steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <div key={i} className="relative">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-px z-0" style={{ background: 'linear-gradient(to right, rgba(249,115,22,0.3), transparent)' }} />
                  )}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs text-orange-400 font-semibold mb-2 tracking-wide">STEP {i + 1}</div>
                    <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{h.ctaTitle}</h2>
          <p className="text-slate-400 text-lg mb-8">{h.ctaSubtitle}</p>
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
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">{t.nav.brand}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="/guide" className="hover:text-slate-300 transition-colors">{t.nav.guide}</a>
              <a href="/professionals" className="hover:text-slate-300 transition-colors">{t.nav.professionals}</a>
            </div>
            <p className="text-xs text-slate-700 text-center">{h.footerDisclaimer}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
