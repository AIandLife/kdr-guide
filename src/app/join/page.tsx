'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ChevronRight, Loader2, Globe, Check, Shield,
  HardHat, FileText, Zap, Droplets, Hammer, DollarSign, Briefcase, Ruler,
  PenTool
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { LoginGateModal } from '@/components/LoginGateModal'
import { cn } from '@/lib/cn'

const CATEGORIES = [
  { id: 'Builder', label: 'Builder（建筑商）', icon: HardHat },
  { id: 'Building Designer', label: 'Building Designer / Architect（建筑设计师 / 建筑师）', icon: PenTool },
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

// Per-category verification documents required
const VERIFY_DOCS: Record<string, { label: string; labelZh: string; placeholder: string }[]> = {
  Builder: [
    { label: 'Builder\'s Licence Number', labelZh: '建筑执照号码', placeholder: 'e.g. BLD123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  'Building Designer': [
    { label: 'Building Designer Registration / Architect Registration', labelZh: '建筑设计师 / 注册建筑师号码', placeholder: 'e.g. BD12345 or ARBV-12345' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  'Town Planner': [
    { label: 'PIA / Planning Registration Number', labelZh: 'PIA 规划注册号码', placeholder: 'e.g. PIA-123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  Demolition: [
    { label: 'Demolition Contractor Licence', labelZh: '拆房承包商执照号码', placeholder: 'e.g. DEM123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  'Structural Engineer': [
    { label: 'CPEng / Engineers Australia No.', labelZh: '结构工程师注册号码', placeholder: 'e.g. CPEng-12345' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  Electrician: [
    { label: 'Electrical Contractor Licence', labelZh: '电工承包商执照号码', placeholder: 'e.g. EC123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  Plumber: [
    { label: 'Plumbing Licence Number', labelZh: '水管工执照号码', placeholder: 'e.g. PL123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  'Finance Broker': [
    { label: 'ACL / MFAA / FBAA Number', labelZh: 'ACL / MFAA / FBAA 会员号码', placeholder: 'e.g. ACL123456' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  Surveyor: [
    { label: 'Surveyor Registration Number', labelZh: '测量师注册号码', placeholder: 'e.g. SRV-12345' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
  Other: [
    { label: 'Relevant Licence / Registration', labelZh: '相关执照 / 注册号码', placeholder: 'e.g. your licence number' },
    { label: 'ABN', labelZh: 'ABN', placeholder: 'XX XXX XXX XXX' },
  ],
}

type View = 'form' | 'listed' | 'verify_requested' | 'done'

interface TranslationResult {
  businessName: {
    original: string
    pinyin: string
    suggested: string
    note: string
  }
  contactName: {
    original: string
    translated: string
    note: string
  }
  description: {
    original: string
    translated: string
    confidence: number
  }
}

/* ── Verification Upsell Card (shown after successful registration) ────── */
function VerificationUpsellCard({
  isZh, benefits, docs, category, email, businessName, professionalId,
}: {
  isZh: boolean
  benefits: typeof VERIFY_BENEFITS_EN
  docs: { label: string; labelZh: string; placeholder: string }[]
  category: string
  email: string
  businessName: string
  professionalId: string | null
}) {
  const [docFields, setDocFields] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const setField = (key: string, value: string) =>
    setDocFields(f => ({ ...f, [key]: value }))

  // Derive licenseNumber and ABN from doc fields
  const licenseField = docs.find(d => d.label !== 'ABN')
  const abnField = docs.find(d => d.label === 'ABN')

  const handleVerify = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'annual',
          email,
          businessName,
          professionalId,
          entityType: 'professional',
          abn: abnField ? (docFields[abnField.label] || '').trim() : '',
          licenseNumber: licenseField ? (docFields[licenseField.label] || '').trim() : '',
          licenseType: category,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">
            {isZh ? '升级为认证商家' : 'Upgrade to Verified'}
          </h2>
        </div>
        <p className="text-sm text-gray-500 ml-8">
          {isZh
            ? '认证商家获得更多曝光和客户信任'
            : 'Verified businesses get more visibility and client trust'}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{b.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Licence / doc fields */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {isZh ? '认证信息' : 'Verification Details'}
          </h3>
          {docs.map(doc => (
            <div key={doc.label}>
              <label className="block text-xs text-gray-500 mb-1.5">
                {isZh ? doc.labelZh : doc.label}
              </label>
              <input
                type="text"
                value={docFields[doc.label] || ''}
                onChange={e => setField(doc.label, e.target.value)}
                placeholder={doc.placeholder}
                className="w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-gray-50 border border-gray-200 focus:border-orange-400"
              />
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
          <DollarSign className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-800">
            {isZh ? '认证费用：$199 AUD（一次性）' : 'Verification fee: $199 AUD (one-time)'}
          </span>
        </div>

        {error && (
          <div className="rounded-xl p-3 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
        )}

        {/* CTA */}
        <button
          onClick={handleVerify}
          disabled={submitting}
          className="w-full text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
        >
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> {isZh ? '处理中...' : 'Processing...'}</>
            : <><Shield className="w-5 h-5" /> {isZh ? '立即认证' : 'Get Verified Now'}</>}
        </button>
      </div>
    </div>
  )
}

export default function JoinPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const { user, loading: authLoading } = useAuth()

  const [view, setView] = useState<View>('form')
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    state: '', category: '', regions: '', website: '', wechat: '', description: '',
    languages: 'both',
  })

  // Pre-fill email once user is known
  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: f.email || user.email! }))
  }, [user])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  // Bilingual translation state
  const [translating, setTranslating] = useState(false)
  const [translation, setTranslation] = useState<TranslationResult | null>(null)
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [enBusinessNameChoice, setEnBusinessNameChoice] = useState<'original' | 'pinyin' | 'suggested' | 'custom'>('pinyin')
  const [enBusinessNameCustom, setEnBusinessNameCustom] = useState('')
  const [enContactName, setEnContactName] = useState('')
  const [enDescription, setEnDescription] = useState('')
  const [enConfirmed, setEnConfirmed] = useState(false)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleGenerateTranslation = async () => {
    setTranslating(true)
    setEnConfirmed(false)
    try {
      const res = await fetch('/api/translate/professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.contactName,
          description: form.description,
          direction: 'zh-to-en',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.result) throw new Error('Translation failed')
      const r: TranslationResult = data.result
      setTranslation(r)
      setEnBusinessNameChoice('pinyin')
      setEnBusinessNameCustom(r.businessName.pinyin || r.businessName.original)
      setEnContactName(r.contactName.translated || r.contactName.original)
      setEnDescription(r.description.translated || r.description.original)
      setShowTranslationPanel(true)
    } catch {
      // ignore — button just stays
    } finally {
      setTranslating(false)
    }
  }

  const getEnBusinessName = () => {
    if (!translation) return ''
    if (enBusinessNameChoice === 'original') return translation.businessName.original
    if (enBusinessNameChoice === 'pinyin') return translation.businessName.pinyin
    if (enBusinessNameChoice === 'suggested') return translation.businessName.suggested
    return enBusinessNameCustom
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // Auto-prepend https:// if user typed a domain without protocol
      let website = form.website.trim()
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website
      }
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website: website || undefined,
          regions: form.regions.split(',').map(r => r.trim()).filter(Boolean),
          wechat: form.wechat || undefined,
          // Bilingual EN fields (only if confirmed)
          businessNameEn: enConfirmed ? getEnBusinessName() : undefined,
          contactNameEn: enConfirmed ? enContactName : undefined,
          descriptionEn: enConfirmed ? enDescription : undefined,
          // Bind user_id at join time if already logged in
          userId: user?.id || undefined,
          // Language selection: convert id to array
          languages: form.languages === 'both' ? ['Mandarin','English'] : form.languages === 'zh' ? ['Mandarin'] : ['English'],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.professionalId) setProfessionalId(data.professionalId)
      setView('listed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-gray-50 border border-gray-200 focus:border-orange-400'

  // ── Login gate ────────────────────────────────────────────────────────────
  if (!authLoading && !user) {
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
              {isZh ? '请先登录，然后填写入驻信息。' : 'Please sign in first, then complete your listing.'}
            </p>
          </div>
        </div>
        <LoginGateModal
          onClose={() => { window.location.href = '/professionals' }}
          redirectAfter="/join"
          subtitle={{
            zh: '入驻需要账号，方便你日后管理和更新你的专业资料。',
            en: 'You need an account to list your business — so you can manage your profile later.',
          }}
        />
      </div>
    )
  }

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
                    value={form.businessName} onChange={e => { set('businessName', e.target.value); setEnConfirmed(false); setShowTranslationPanel(false) }}
                    placeholder={isZh ? '你的公司或商号名称' : 'Your company or trading name'}
                    required className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '联系人姓名 *' : 'Contact Name *'}</label>
                  <input
                    value={form.contactName} onChange={e => { set('contactName', e.target.value); setEnConfirmed(false); setShowTranslationPanel(false) }}
                    placeholder={isZh ? '你的姓名' : 'Your name'}
                    required className={inputClass}
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
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '服务语言' : 'Service Language'}</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'en', label: isZh ? '仅英文' : 'English only', langs: ['English'] },
                      { id: 'zh', label: isZh ? '仅中文' : 'Mandarin only', langs: ['Mandarin'] },
                      { id: 'both', label: isZh ? '中英双语' : 'Mandarin & English', langs: ['Mandarin', 'English'] },
                    ].map(opt => (
                      <button key={opt.id} type="button"
                        onClick={() => set('languages', opt.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          form.languages === opt.id
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{isZh ? '网站' : 'Website'}</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-orange-400 overflow-hidden">
                    <span className="px-3 text-sm text-gray-400 shrink-0 border-r border-gray-200 bg-gray-100 py-2.5">https://</span>
                    <input
                      type="text"
                      value={form.website.replace(/^https?:\/\//, '')}
                      onChange={e => set('website', e.target.value)}
                      placeholder="yourcompany.com.au"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>
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
                value={form.description} onChange={e => { set('description', e.target.value); setEnConfirmed(false); setShowTranslationPanel(false) }}
                placeholder={isZh
                  ? '简单介绍你的业务——专长、经验年数、擅长的项目类型等...'
                  : 'Tell us about your business — specialties, years of experience, types of projects you handle...'}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm resize-none bg-gray-50 border border-gray-200 focus:border-orange-400"
              />

              {/* Bilingual: Generate English Version */}
              {(form.businessName || form.description) && (
                <div className="mt-4">
                  {!showTranslationPanel ? (
                    <div>
                      <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                        {isZh
                          ? '💡 我们平台上有本地澳洲用户（非华人），提供英文版本能让更多业主找到你、联系你。'
                          : '💡 Our platform has local Australian users too. Adding an English version helps more homeowners find and contact you.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateTranslation}
                        disabled={translating}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-4 py-2.5 transition-all disabled:opacity-60"
                      >
                        {translating
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> {isZh ? '生成中...' : 'Generating...'}</>
                          : <><Globe className="w-4 h-4" /> {isZh ? '一键生成英文版本' : 'Generate English Version'}</>}
                      </button>
                    </div>
                  ) : (
                    <div className="border border-blue-200 rounded-2xl overflow-hidden bg-blue-50/30">
                      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">{isZh ? '英文版本确认' : 'English Version — Review & Confirm'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setShowTranslationPanel(false); setEnConfirmed(false) }}
                          className="text-xs text-blue-400 hover:text-blue-600"
                        >
                          {isZh ? '收起' : 'Hide'}
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Company name choices */}
                        {translation && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                              {isZh ? '公司名称（英文）' : 'Business Name (English)'}
                            </label>
                            <div className="space-y-2">
                              {[
                                { key: 'original' as const, label: isZh ? '保留中文原名' : 'Keep original', value: translation.businessName.original },
                                { key: 'pinyin' as const, label: isZh ? '拼音音译' : 'Pinyin transliteration', value: translation.businessName.pinyin },
                                ...(translation.businessName.suggested !== translation.businessName.pinyin
                                  ? [{ key: 'suggested' as const, label: isZh ? '英文含义译名' : 'English meaning', value: translation.businessName.suggested }]
                                  : []),
                                { key: 'custom' as const, label: isZh ? '自定义' : 'Custom', value: '' },
                              ].map(opt => (
                                <label key={opt.key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${enBusinessNameChoice === opt.key ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                  <input
                                    type="radio"
                                    name="enBusinessName"
                                    checked={enBusinessNameChoice === opt.key}
                                    onChange={() => setEnBusinessNameChoice(opt.key)}
                                    className="accent-blue-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs text-gray-500">{opt.label}: </span>
                                    {opt.key !== 'custom' && <span className="text-sm font-medium text-gray-800">{opt.value}</span>}
                                    {opt.key === 'custom' && (
                                      <input
                                        type="text"
                                        value={enBusinessNameCustom}
                                        onChange={e => { setEnBusinessNameCustom(e.target.value); setEnBusinessNameChoice('custom') }}
                                        onClick={() => setEnBusinessNameChoice('custom')}
                                        placeholder={isZh ? '输入你想要的英文名称' : 'Type your preferred English name'}
                                        className="ml-1 text-sm bg-transparent border-b border-gray-300 focus:border-blue-400 focus:outline-none text-gray-800 w-48"
                                      />
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                            {translation.businessName.note && (
                              <p className="text-xs text-gray-400 mt-1.5 pl-1">💡 {translation.businessName.note}</p>
                            )}
                          </div>
                        )}

                        {/* Contact name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">
                            {isZh ? '联系人姓名（英文）' : 'Contact Name (English)'}
                          </label>
                          <input
                            type="text"
                            value={enContactName}
                            onChange={e => setEnContactName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 focus:border-blue-400 focus:outline-none text-gray-800"
                          />
                          {translation?.contactName.note && (
                            <p className="text-xs text-gray-400 mt-1 pl-1">💡 {translation.contactName.note}</p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1.5">
                            <span>{isZh ? '业务介绍（英文）' : 'Business Description (English)'}</span>
                            {translation && (
                              <span className="text-gray-400 font-normal">{isZh ? '置信度' : 'Confidence'}: {translation.description.confidence}%</span>
                            )}
                          </label>
                          <textarea
                            value={enDescription}
                            onChange={e => setEnDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 focus:border-blue-400 focus:outline-none text-gray-800 resize-none"
                          />
                        </div>

                        {/* Confirm / Re-generate */}
                        <div className="flex items-center gap-3 pt-1">
                          {!enConfirmed ? (
                            <button
                              type="button"
                              onClick={() => setEnConfirmed(true)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
                            >
                              <Check className="w-4 h-4" />
                              {isZh ? '确认使用此英文版本' : 'Use This English Version'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
                              <CheckCircle className="w-4 h-4" />
                              {isZh ? '英文版本已确认' : 'English version confirmed'}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleGenerateTranslation}
                            disabled={translating}
                            className="text-xs text-blue-500 hover:text-blue-700 underline disabled:opacity-50"
                          >
                            {translating ? (isZh ? '生成中...' : 'Regenerating...') : (isZh ? '重新生成' : 'Regenerate')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

  // ── Step 2: Listed — Success ─────────────────────────────────────────────
  if (view === 'listed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/professionals" backLabel={isZh ? '返回' : 'Back'} currentPath="/join" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {isZh ? '✅ 收录成功！' : "✅ You're Listed!"}
            </h1>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              {isZh
                ? '你的公司信息已收录到专业人士目录中，业主可以直接看到并联系你。'
                : 'Your business is now in the professional directory — homeowners can find and contact you directly.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/professionals"
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {isZh ? '浏览专业人士目录' : 'Browse Directory'}
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl text-gray-600 font-medium transition-colors bg-gray-100 hover:bg-gray-200 border border-gray-200"
              >
                {isZh ? '进入我的后台' : 'Go to Dashboard'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback (should not reach here)
  return null
}
