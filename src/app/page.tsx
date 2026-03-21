'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, CheckCircle, ChevronRight, Building2, DollarSign, Clock, Users } from 'lucide-react'

const STATS = [
  { value: '40+', label: 'Councils Covered' },
  { value: '8', label: 'States & Territories' },
  { value: '2 min', label: 'to get your report' },
  { value: 'Free', label: 'feasibility check' },
]

const HOW_IT_WORKS = [
  {
    icon: MapPin,
    title: 'Enter your suburb',
    desc: 'Type your suburb or address. We cover all major councils across Australia.',
  },
  {
    icon: Search,
    title: 'AI analyses your block',
    desc: 'We check council policy, heritage overlays, flood & bushfire zones, and zoning rules.',
  },
  {
    icon: CheckCircle,
    title: 'Get your feasibility report',
    desc: 'Instant report: can you KDR, estimated costs, timeline, and next steps.',
  },
  {
    icon: Users,
    title: 'Connect with builders',
    desc: 'We match you with verified builders, planners, and tradespeople in your area.',
  },
]

const PAIN_POINTS = [
  { icon: Building2, title: 'Every council has different rules', desc: 'Heritage overlays, flood zones, minimum lot sizes — we\'ve mapped them all.' },
  { icon: DollarSign, title: 'No idea what it actually costs', desc: 'Get realistic cost ranges based on your state, suburb, and house size.' },
  { icon: Clock, title: 'Don\'t know how long it takes', desc: 'From DA lodgement to handover — realistic timelines for your council.' },
  { icon: Users, title: 'Can\'t find the right builder', desc: 'We connect you with KDR-specialist builders, town planners, and trades.' },
]

export default function HomePage() {
  const router = useRouter()
  const [suburb, setSuburb] = useState('')
  const [lotSize, setLotSize] = useState('')
  const [state, setState] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suburb.trim()) return
    const params = new URLSearchParams({ suburb: suburb.trim() })
    if (lotSize) params.set('lotSize', lotSize)
    if (state) params.set('state', state)
    router.push(`/feasibility?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">KDR Guide</span>
            <span className="text-xs text-orange-400 ml-1 hidden sm:block">Australia</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-400">
            <a href="/guide" className="hover:text-white transition-colors hidden sm:block">Process Guide</a>
            <a href="/professionals" className="hover:text-white transition-colors hidden sm:block">Find Builders</a>
            <a href="/feasibility" className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Check My Block
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">Full Australia Coverage — All 8 States & Territories</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Can you knock down
              <span className="text-orange-400"> & rebuild</span>
              <br />your home?
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl">
              Enter your suburb and get an instant AI feasibility check — council rules, costs, timeline,
              and who to call. No consultant needed.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Your Suburb</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={suburb}
                      onChange={e => setSuburb(e.target.value)}
                      placeholder="e.g. Strathfield, Box Hill, Parramatta"
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">State</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="">All States</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="ACT">ACT</option>
                    <option value="TAS">TAS</option>
                    <option value="NT">NT</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Lot Size (optional)</label>
                <input
                  type="number"
                  value={lotSize}
                  onChange={e => setLotSize(e.target.value)}
                  placeholder="e.g. 600 (square metres)"
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
              >
                <Search className="w-5 h-5" />
                Check My Feasibility — Free
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-600 mt-3">
                No signup required. Instant AI-powered analysis.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            KDR is complicated. We make it clear.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every property is different. Every council has different rules. We cut through the complexity.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAIN_POINTS.map(p => (
            <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">From question to action in minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-gray-700 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs text-orange-400 font-medium mb-2">STEP {i + 1}</div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to find out if you can rebuild?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Takes 2 minutes. No consultant. No guessing. Just enter your suburb.
        </p>
        <a
          href="/feasibility"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          Check My Block Now
          <ChevronRight className="w-5 h-5" />
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">KDR Guide</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/guide" className="hover:text-gray-300 transition-colors">Process Guide</a>
              <a href="/professionals" className="hover:text-gray-300 transition-colors">Find Builders</a>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Information only — not professional advice. Always consult your council.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
