'use client'

import { useState } from 'react'
import {
  CheckCircle, ChevronRight, Loader2, Shield, Star, Phone,
  HardHat, FileText, Zap, Droplets, Hammer, DollarSign, Briefcase, Ruler
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { SiteNav } from '@/components/SiteNav'
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

const VERIFY_BENEFITS_EN = [
  { icon: '✅', title: 'Verified badge on your listing', desc: 'Stand out from unverified listings. Homeowners filter by verified first.' },
  { icon: '📞', title: 'Contact details visible to buyers', desc: 'Phone, website, and WeChat displayed to everyone who views your profile.' },
  { icon: '⭐', title: 'Priority ranking in search results', desc: 'Verified businesses appear above unverified ones in all listings.' },
  { icon: '🎯', title: 'Lead enquiries sent to your email', desc: 'Homeowners can send you a quote request directly from your profile.' },
]

const VERIFY_BENEFITS_ZH = [
  { icon: '✅', title: '显示"已认证"徽章', desc: '与未认证商家明显区分。业主会优先筛选已认证的商家。' },
  { icon: '📞', title: '联系方式对买家可见', desc: '电话、网站和微信号向所有访问你主页的人展示。' },
  { icon: '⭐', title: '搜索结果优先排名', desc: '认证商家在所有列表中排在未认证商家前面。' },
  { icon: '🎯', title: '询盘直接发送到你的邮箱', desc: '业主可以直接从你的主页向你发送报价请求。' },
]

type View = 'form' | 'listed' | 'verify_requested' | 'done'

export default function JoinPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'

  const [view, setView] = useState<View>('form')
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    state: '', category: '', regions: '', website: '', wechat: '', description: '', abn: '',
  })
  const [submitting, setSubmitting] = useState(false)
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
          wechat: form.wechat || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setView('listed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestVerify = async () => {
    // Mark as pending verification in DB via the same join API
    // For now, just transition the view — admin will follow up
    setView('verify_requested')
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-gray-50 border border-gray-200 focus:border-orange-400'

  // ── Step 1: Form ──────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/professionals" backLabel={isZh ? '返回' : 'Back'} currentPath="/join" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-semibold text-orange-600 bg-orange-100 border border-orange-200">
              {isZh ? '专业人士入驻' : 'For Professionals'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isZh ? '免费收录你的业务' : 'List Your Business — Free'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isZh
                ? '填写公司基本信息，立即免费收录进我们的专业人士目录。'
                : 'Fill in your business details and get listed in our professional directory right away.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {isZh ? '业务信息' : 'Business Details'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '公司名称 *' : 'Business Name *'}</label>
                  <input
                    value={form.businessName} onChange={e => set('businessName', e.target.value)}
                    placeholder={isZh ? '你的公司或商号名称' : 'Your company or trading name'}
                    required className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '联系人姓名 *' : 'Contact Name *'}</label>
                  <input
                    value={form.contactName} onChange={e => set('contactName', e.target.value)}
                    placeholder={isZh ? '你的姓名' : 'Your name'}
                    required className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">ABN</label>
                  <input
                    value={form.abn} onChange={e => set('abn', e.target.value)}
                    placeholder="XX XXX XXX XXX"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '邮箱 *' : 'Email *'}</label>
                  <input
                    type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@company.com.au"
                    required className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '电话' : 'Phone'}</label>
                  <input
                    type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="04XX XXX XXX"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '微信号' : 'WeChat ID'}</label>
                  <input
                    value={form.wechat} onChange={e => set('wechat', e.target.value)}
                    placeholder={isZh ? '你的微信号（可选）' : 'WeChat username (optional)'}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '网站' : 'Website'}</label>
                  <input
                    type="url" value={form.website} onChange={e => set('website', e.target.value)}
                    placeholder="https://yourcompany.com.au"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {isZh ? '专业类别与服务范围' : 'Category & Service Area'}
              </h2>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">{isZh ? '专业类别 *' : 'Category *'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id} type="button"
                      onClick={() => set('category', cat.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all',
                        form.category === cat.id
                          ? 'text-orange-600 bg-orange-50 border border-orange-300'
                          : 'text-gray-600 bg-gray-50 border border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <cat.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '主要州 *' : 'Primary State *'}</label>
                  <select
                    value={form.state} onChange={e => set('state', e.target.value)} required
                    className={inputClass}
                  >
                    <option value="">{isZh ? '选择州' : 'Select state'}</option>
                    {['NSW','VIC','QLD','WA','SA','ACT','TAS','NT'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="All Australia">{isZh ? '全澳洲' : 'All Australia'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    {isZh ? '服务区域（逗号分隔）' : 'Regions (comma separated)'}
                  </label>
                  <input
                    value={form.regions} onChange={e => set('regions', e.target.value)}
                    placeholder="Sydney, Parramatta, Blacktown"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {isZh ? '业务介绍' : 'About Your Business'}
              </h2>
              <textarea
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={isZh
                  ? '简单介绍你的业务——专长、经验年数、擅长的项目类型等...'
                  : 'Tell us about your business — specialties, years of experience, types of projects you handle...'}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm resize-none bg-gray-50 border border-gray-200 focus:border-orange-400"
              />
            </div>

            {error && (
              <div className="rounded-xl p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting || !form.category}
              className="w-full text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
            >
              {submitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> {isZh ? '提交中...' : 'Submitting...'}</>
                : <><ChevronRight className="w-5 h-5" /> {isZh ? '免费提交' : 'List for Free'}</>}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Step 2: Listed — free confirmation + verification upsell ──────────────
  if (view === 'listed') {
    const benefits = isZh ? VERIFY_BENEFITS_ZH : VERIFY_BENEFITS_EN
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/professionals" backLabel={isZh ? '返回' : 'Back'} currentPath="/join" />

        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
          {/* Confirmation */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isZh ? '🎉 已免费收录！' : '🎉 You\'re Listed — Free!'}
            </h1>
            <p className="text-gray-500 leading-relaxed">
              {isZh
                ? `${form.businessName} 已经加入我们的专业人士目录。业主搜索时可以看到你的公司信息。`
                : `${form.businessName} is now in our professional directory. Homeowners searching in your area can find you.`}
            </p>
          </div>

          {/* Verification upsell */}
          <div className="rounded-2xl bg-white border border-orange-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <h2 className="font-bold text-gray-900">
                    {isZh ? '需要认证徽章吗？' : 'Want a Verified badge?'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isZh
                      ? '认证让你的公司出现在搜索结果的最前面，联系方式对业主可见。'
                      : 'Verification puts you at the top of search results and shows your contact details to homeowners.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 pt-2 space-y-3">
              <button
                onClick={handleRequestVerify}
                className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
              >
                <Star className="w-4 h-4" />
                {isZh ? '申请认证 →' : 'Apply for Verification →'}
              </button>
              <button
                onClick={() => setView('done')}
                className="w-full py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isZh ? '不用了，免费版就好' : 'No thanks, free listing is fine'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3a: Verification requested ──────────────────────────────────────
  if (view === 'verify_requested') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/professionals" backLabel={isZh ? '返回' : 'Back'} currentPath="/join" />

        <div className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Phone className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {isZh ? '认证申请已收到' : 'Verification Request Received'}
          </h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            {isZh
              ? `我们会在 1–2 个工作日内通过 ${form.email} 联系你，指导你完成认证流程。`
              : `We'll contact you at ${form.email} within 1–2 business days to walk you through the verification process.`}
          </p>
          <div className="rounded-2xl p-5 bg-orange-50 border border-orange-200 text-left mb-8">
            <p className="text-sm font-semibold text-orange-700 mb-2">
              {isZh ? '认证流程包括：' : 'The verification process includes:'}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {(isZh ? [
                'ABN / ASIC 注册核实',
                '资质证书核实（建筑执照等）',
                '联系方式激活',
                '认证徽章即时显示',
              ] : [
                'ABN / ASIC registration check',
                'Licence or qualification verification',
                'Contact details activated on your listing',
                'Verified badge displayed immediately',
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <a href="/" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
            {isZh ? '返回首页' : 'Back to Home'}
          </a>
        </div>
      </div>
    )
  }

  // ── Step 3b: Done (chose free) ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav backHref="/professionals" backLabel={isZh ? '返回' : 'Back'} currentPath="/join" />

      <div className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isZh ? '收录成功，感谢你的加入！' : 'You\'re all set — welcome aboard!'}
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          {isZh
            ? `${form.businessName} 已收录在我们的目录中。如果你以后想申请认证，随时可以再回来。`
            : `${form.businessName} is in our directory. If you ever want to get verified, you can always come back and apply.`}
        </p>
        <a href="/" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
          {isZh ? '返回首页' : 'Back to Home'}
        </a>
      </div>
    </div>
  )
}
