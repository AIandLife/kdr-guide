'use client'

import { useState } from 'react'
import {
  Building2, ArrowLeft, CheckCircle, ChevronRight, Loader2,
  HardHat, FileText, Zap, Droplets, Hammer, DollarSign, Briefcase, Ruler
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import { cn } from '@/lib/cn'

const CATEGORIES = [
  { id: 'Builder', label: 'Builder（建筑商）', icon: HardHat },
  { id: 'Town Planner', label: 'Town Planner（城市规划师）', icon: FileText },
  { id: 'Demolition', label: 'Demolition（拆房商）', icon: Hammer },
  { id: 'Structural Engineer', label: 'Structural Engineer（结构工程师）', icon: Ruler },
  { id: 'Electrician', label: 'Electrician（电工）', icon: Zap },
  { id: 'Plumber', label: 'Plumber（水管工）', icon: Droplets },
  { id: 'Finance Broker', label: 'Finance Broker（贷款经纪）', icon: DollarSign },
  { id: 'Surveyor', label: 'Surveyor（测量师）', icon: Briefcase },
  { id: 'Other', label: 'Other（其他）', icon: Briefcase },
]

const BENEFITS = [
  { en: 'Listed in our professional directory', zh: '入驻专业人士目录' },
  { en: 'Matched with homeowners planning KDR in your area', zh: '与你所在区域正在计划推倒重建的业主匹配' },
  { en: 'Full profile with your specialties and regions', zh: '展示你的专业领域和服务范围' },
  { en: 'Lead enquiries sent directly to your email', zh: '询盘直接发送到你的邮箱' },
  { en: 'Dashboard to manage your listing', zh: '管理后台（即将推出）' },
]

export default function JoinPage() {
  const { lang } = useLang()
  const t = translations[lang]

  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    state: '', category: '', regions: '', website: '', description: '', abn: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trialEnd, setTrialEnd] = useState('')
  const [error, setError] = useState('')

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          regions: form.regions.split(',').map(r => r.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setTrialEnd(data.trialEnd)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isZh = lang === 'zh'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0d1117 100%)' }}>
      {/* Nav */}
      <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/professionals" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isZh ? '返回' : 'Back'}
            </a>
            <div className="w-px h-5 bg-white/10" />
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">{t.nav.brand}</span>
            </a>
          </div>
          <LangToggle />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left — Info panel */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-semibold text-orange-400" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  {isZh ? '专业人士入驻' : 'For Professionals'}
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  {isZh ? '加入 KDR Guide 专业网络' : 'Join the KDR Guide Professional Network'}
                </h1>
                <p className="text-slate-400 leading-relaxed mb-8">
                  {isZh
                    ? '与全澳洲正在计划推倒重建的业主建立联系。我们将你的业务与有真实需求的客户匹配。'
                    : 'Connect with homeowners across Australia who are actively planning a knockdown rebuild. We match your business with real, qualified leads.'}
                </p>

                {/* Free trial box */}
                <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {isZh ? '前 3 个月完全免费' : '3 Months Free'}
                  </div>
                  <p className="text-sm text-slate-400">
                    {isZh
                      ? '作为早期入驻成员，享受前 3 个月免费试用期。无需信用卡，到期前我们会提前通知你。'
                      : 'As a founding member, enjoy 3 months completely free. No credit card required — we\'ll notify you before your trial ends.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {BENEFITS.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">{isZh ? b.zh : b.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {isZh ? '业务信息' : 'Business Details'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '公司名称 *' : 'Business Name *'}</label>
                      <input
                        value={form.businessName} onChange={e => set('businessName', e.target.value)}
                        placeholder={isZh ? '你的公司或商号名称' : 'Your company or trading name'}
                        required
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '联系人姓名 *' : 'Contact Name *'}</label>
                      <input
                        value={form.contactName} onChange={e => set('contactName', e.target.value)}
                        placeholder={isZh ? '你的姓名' : 'Your name'}
                        required
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">ABN</label>
                      <input
                        value={form.abn} onChange={e => set('abn', e.target.value)}
                        placeholder="XX XXX XXX XXX"
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '邮箱 *' : 'Email *'}</label>
                      <input
                        type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="you@company.com.au"
                        required
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '电话' : 'Phone'}</label>
                      <input
                        type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="04XX XXX XXX"
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '网站' : 'Website'}</label>
                      <input
                        type="url" value={form.website} onChange={e => set('website', e.target.value)}
                        placeholder="https://yourcompany.com.au"
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {isZh ? '专业类别与服务范围' : 'Category & Service Area'}
                  </h2>
                  <div className="mb-4">
                    <label className="block text-xs text-slate-500 mb-2">{isZh ? '专业类别 *' : 'Category *'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => set('category', cat.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all',
                            form.category === cat.id
                              ? 'text-orange-300'
                              : 'text-slate-500 hover:text-slate-300'
                          )}
                          style={{
                            background: form.category === cat.id ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${form.category === cat.id ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.07)'}`,
                          }}
                        >
                          <cat.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    {!form.category && <p className="text-xs text-red-400 mt-1">{isZh ? '请选择一个类别' : 'Please select a category'}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{isZh ? '主要州 *' : 'Primary State *'}</label>
                      <select
                        value={form.state} onChange={e => set('state', e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-xl text-white focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <option value="" style={{ background: '#1e293b' }}>{isZh ? '选择州' : 'Select state'}</option>
                        {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => (
                          <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                        ))}
                        <option value="All Australia" style={{ background: '#1e293b' }}>{isZh ? '全澳洲' : 'All Australia'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">
                        {isZh ? '服务区域（逗号分隔）' : 'Regions (comma separated)'}
                      </label>
                      <input
                        value={form.regions} onChange={e => set('regions', e.target.value)}
                        placeholder={isZh ? 'Sydney, Parramatta, Blacktown' : 'Sydney, Parramatta, Blacktown'}
                        className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {isZh ? '业务介绍' : 'About Your Business'}
                  </h2>
                  <textarea
                    value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder={isZh
                      ? '简单介绍你的业务——专长、经验年数、擅长的 KDR 项目类型等...'
                      : 'Tell us about your business — specialties, years of experience, types of KDR projects you handle...'}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                {error && (
                  <div className="rounded-xl p-4 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.category}
                  className="w-full text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
                >
                  {submitting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> {isZh ? '提交中...' : 'Submitting...'}</>
                    : <><ChevronRight className="w-5 h-5" /> {isZh ? '提交申请' : 'Submit Application'}</>}
                </button>
                <p className="text-center text-xs text-slate-600">
                  {isZh ? '提交后我们会在 1-2 个工作日内审核并发送确认邮件。' : 'We\'ll review and send a confirmation email within 1-2 business days.'}
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* Success */
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {isZh ? '申请已提交！' : 'Application Received!'}
            </h1>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {isZh
                ? `感谢申请入驻 KDR Guide 专业网络。我们已向 ${form.email} 发送了确认邮件，其中包含你的免费试用期详情。`
                : `Thanks for applying to join the KDR Guide Professional Network. We've sent a confirmation to ${form.email} with your free trial details.`}
            </p>
            <div className="rounded-2xl p-5 mb-8 text-left" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <p className="text-sm font-semibold text-orange-400 mb-2">
                {isZh ? '你的 3 个月免费试用期' : 'Your 3-Month Free Trial'}
              </p>
              <p className="text-sm text-slate-400">
                {isZh ? `试用期至 ${trialEnd} 结束。到期前我们会提前通知你，无需信用卡，不会自动扣费。` : `Your trial runs until ${trialEnd}. We'll notify you before it ends — no auto-charge, no credit card needed.`}
              </p>
            </div>
            <a href="/" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
              {isZh ? '返回首页' : 'Back to Home'}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
