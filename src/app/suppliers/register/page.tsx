'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, ChevronRight, Upload, BadgeCheck, X } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { SUPPLIER_CATEGORIES } from '@/lib/suppliers-data'
import { useAuth } from '@/lib/auth-context'
import { LoginGateModal } from '@/components/LoginGateModal'

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT']
const ORIGINS = [
  { value: 'local',  en: 'Australian business', zh: '澳洲本地企业' },
  { value: 'china',  en: 'China-based / importing from China', zh: '中国企业 / 中国进口' },
  { value: 'europe', en: 'European business', zh: '欧洲企业' },
  { value: 'multi',  en: 'Multi-country operations', zh: '多国业务' },
]

export default function SupplierRegisterPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'
  const { user, loading: authLoading } = useAuth()
  const [showLoginGate, setShowLoginGate] = useState(false)

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ id: string; status: string } | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 1 — public info
    businessName: '',
    category: '',
    origin: 'local',
    states: [] as string[],
    specialties: '',
    description: '',
    // Step 2 — contact (hidden until verified)
    contactName: '',
    email: user?.email ?? '',
    phone: '',
    website: '',
    wechat: '',
    abn: '',
    // Step 3 — verification docs (optional)
    asicNumber: '',
    businessLicenseNote: '',
    verificationNote: '',
    wantsVerification: false,
  })
  const [verifyExpanded, setVerifyExpanded] = useState(false)

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const toggleState = (s: string) => {
    set('states', form.states.includes(s) ? form.states.filter(x => x !== s) : [...form.states, s])
  }

  const categories = Object.entries(SUPPLIER_CATEGORIES)

  async function registerListing() {
    const res = await fetch('/api/suppliers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: form.businessName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        website: form.website || undefined,
        wechat: form.wechat || undefined,
        abn: form.abn || undefined,
        asicNumber: form.asicNumber || undefined,
        businessLicenseNote: form.businessLicenseNote || undefined,
        verificationNote: form.verificationNote || undefined,
        category: form.category,
        origin: form.origin,
        description: form.description || undefined,
        states: form.states,
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        wantsVerification: false,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Submission failed')
    return data as { id: string; status: string }
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const data = await registerListing()
      setResult(data)
      setStep(4)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitWithVerify() {
    setSubmitting(true)
    setError('')
    try {
      const data = await registerListing()
      // Registered — now redirect to Stripe with the new listing ID
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'annual',
          email: form.email,
          businessName: form.businessName,
          supplierId: data.id,
          entityType: 'supplier',
          abn: form.abn || undefined,
          licenseNumberSupplier: form.asicNumber || undefined,
          regType: form.businessLicenseNote || 'au',
          notes: form.verificationNote || undefined,
        }),
      })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        throw new Error(checkoutData.error || 'Checkout failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed')
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-colors bg-gray-50 border border-gray-200 focus:border-orange-400"

  // Login gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isZh ? '请先登录' : 'Sign in to continue'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isZh ? '入驻建材目录需要登录账号，方便你日后管理你的商家信息。' : 'You need an account to list your business — so you can manage it later.'}
          </p>
          <button
            onClick={() => setShowLoginGate(true)}
            className="px-8 py-3.5 rounded-xl text-white font-semibold text-base"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
          >
            {isZh ? '登录 / 注册' : 'Sign in / Register'}
          </button>
        </div>
        {showLoginGate && (
          <LoginGateModal
            onClose={() => { setShowLoginGate(false); window.location.href = '/suppliers' }}
            redirectAfter="/suppliers/register"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isZh ? '申请加入建材目录' : 'List Your Business'}
          </h1>
          <p className="text-gray-500">
            {isZh
              ? '免费收录。填写基本信息和联系方式，审核通过后即出现在建材目录中。'
              : 'Free to list. Fill in your business info and contact details — you\'ll appear in the directory once approved.'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-0 mb-10">
            {[
              { n: 1, label: isZh ? '基本信息' : 'Business Info' },
              { n: 2, label: isZh ? '联系方式' : 'Contact' },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={step >= n
                      ? { background: '#f97316', color: 'white' }
                      : { background: '#e5e7eb', color: '#9ca3af' }}
                  >
                    {step > n ? <CheckCircle className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-sm hidden sm:block ${step >= n ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < 1 && <div className="flex-1 h-px mx-3" style={{ background: step > n ? '#f97316' : '#e5e7eb' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Business Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '公司名称 *' : 'Business Name *'}</label>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                placeholder={isZh ? '你的公司名称' : 'Your business name'}
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '类别 *' : 'Category *'}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(([key, cat]) => (
                  <button key={key} type="button" onClick={() => set('category', key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={form.category === key
                      ? { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }
                      : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                  >
                    <span>{cat.icon}</span>
                    <span>{isZh ? cat.zh : cat.en}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '产地 / 来源 *' : 'Origin *'}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ORIGINS.map(o => (
                  <button key={o.value} type="button" onClick={() => set('origin', o.value)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={form.origin === o.value
                      ? { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }
                      : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                  >
                    {isZh ? o.zh : o.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '服务州/地区（可多选）' : 'States served (select all that apply)'}</label>
              <div className="flex flex-wrap gap-2">
                {STATES.map(s => (
                  <button key={s} type="button" onClick={() => toggleState(s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={form.states.includes(s)
                      ? { background: '#f97316', color: 'white' }
                      : { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                {isZh ? '专长（用逗号分隔）' : 'Specialties (comma-separated)'}
              </label>
              <input value={form.specialties} onChange={e => set('specialties', e.target.value)}
                placeholder={isZh ? '如：双层玻璃, 铝合金框架, 定制尺寸' : 'e.g. Double Glazing, Aluminium Frames, Custom Sizes'}
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '公司简介' : 'Business description'}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={isZh ? '简单介绍你的公司和产品…' : 'Brief description of your business and products…'}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none resize-none bg-gray-50 border border-gray-200 focus:border-orange-400" />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.businessName || !form.category}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
            >
              {isZh ? '下一步：联系方式' : 'Next: Contact Details'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 — Contact */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 leading-relaxed font-medium">
                {isZh
                  ? '📋 填写联系方式后，你的公司信息将出现在建材目录中，潜在买家和业主可以直接看到并联系你。'
                  : '📋 Once you fill in your contact details, your business will appear in the directory — homeowners and buyers can find and reach you directly.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">{isZh ? '联系人姓名 *' : 'Contact name *'}</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
                  placeholder={isZh ? '你的姓名' : 'Your name'}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">{isZh ? '邮箱 *' : 'Email *'}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">{isZh ? '电话' : 'Phone'}</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="0400 000 000"
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">{isZh ? '微信号' : 'WeChat ID'}</label>
                <input value={form.wechat} onChange={e => set('wechat', e.target.value)}
                  placeholder={isZh ? '你的微信号' : 'WeChat username'}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{isZh ? '公司网站' : 'Website'}</label>
              <input value={form.website} onChange={e => set('website', e.target.value)}
                placeholder="yourcompany.com.au"
                className={inputClass} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-gray-600 font-medium transition-colors hover:bg-gray-200 bg-gray-100 border border-gray-200">
                {isZh ? '上一步' : 'Back'}
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.contactName || !form.email}
                className="flex-1 py-3.5 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {submitting ? (isZh ? '提交中…' : 'Submitting…') : (isZh ? '提交入驻' : 'Submit Listing')}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Verification choice */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {isZh ? '是否申请认证？' : 'Apply for Verification?'}
              </h2>
              <p className="text-sm text-gray-500">
                {isZh ? '选择适合你的方式，你可以随时回来升级。' : 'Choose what works for you — you can always upgrade later.'}
              </p>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free */}
              <div className="rounded-2xl p-5 bg-white border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">📋</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{isZh ? '免费收录' : 'Free Listing'}</p>
                    <p className="text-xs text-gray-400">{isZh ? '永久免费' : 'Always free'}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-gray-400 shrink-0" />{isZh ? '公司名称出现在目录' : 'Business name listed'}</li>
                  <li className="flex items-center gap-2 text-gray-600"><CheckCircle className="w-4 h-4 text-gray-400 shrink-0" />{isZh ? '分类和简介展示' : 'Category & description shown'}</li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="w-4 h-4 shrink-0" />{isZh ? '联系方式不对外显示' : 'Contact details hidden'}</li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="w-4 h-4 shrink-0" />{isZh ? '无认证徽章' : 'No verified badge'}</li>
                  <li className="flex items-center gap-2 text-gray-400"><X className="w-4 h-4 shrink-0" />{isZh ? '排名靠后' : 'Lower ranking'}</li>
                </ul>
              </div>

              {/* Verified */}
              <div className="rounded-2xl p-5 bg-orange-50 border-2 border-orange-300 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {isZh ? '推荐' : 'Recommended'}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{isZh ? '认证商家' : 'Verified Business'}</p>
                    <p className="text-xs text-orange-600">{isZh ? '$199/年' : '$199/yr'}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />{isZh ? '全部免费功能' : 'Everything in free'}</li>
                  <li className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />{isZh ? '电话、网站、微信对业主可见' : 'Phone, website & WeChat visible'}</li>
                  <li className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />{isZh ? '认证徽章，提升信任度' : 'Verified badge — builds trust'}</li>
                  <li className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />{isZh ? '搜索结果优先排名' : 'Priority ranking in search'}</li>
                  <li className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />{isZh ? 'AI 推荐算法优先加权' : 'Higher AI recommendation weight'}</li>
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            {!verifyExpanded && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? (isZh ? '提交中…' : 'Submitting…') : (isZh ? '跳过，先免费收录' : 'Skip — free listing only')}
                </button>
                <button
                  onClick={() => { set('wantsVerification', true); setVerifyExpanded(true) }}
                  className="flex-1 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  <BadgeCheck className="w-4 h-4" />
                  {isZh ? '立即申请认证 →' : 'Apply for Verification →'}
                </button>
              </div>
            )}

            {/* Verification form — shown after clicking "立即认证" */}
            {verifyExpanded && (
              <div className="space-y-5 rounded-2xl border-2 border-orange-200 p-5 bg-orange-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-orange-500" />
                    {isZh ? '认证申请材料' : 'Verification Documents'}
                  </h3>
                  <button onClick={() => { setVerifyExpanded(false); set('wantsVerification', false) }}
                    className="text-gray-400 hover:text-gray-600 text-xs">
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                </div>

                {/* Business type selector */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{isZh ? '注册地' : 'Business registration'}</label>
                  <div className="flex gap-2">
                    {[
                      { val: 'au', label: isZh ? '🇦🇺 澳洲企业' : '🇦🇺 Australian' },
                      { val: 'cn', label: isZh ? '🇨🇳 中国企业' : '🇨🇳 China-based' },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => set('businessLicenseNote', opt.val)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={form.businessLicenseNote === opt.val
                          ? { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }
                          : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.businessLicenseNote === 'au' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">ABN</label>
                    <input value={form.abn} onChange={e => set('abn', e.target.value)}
                      placeholder="XX XXX XXX XXX"
                      className={inputClass} />
                  </div>
                )}

                {form.businessLicenseNote === 'cn' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      {isZh ? '营业执照号 / 统一社会信用代码' : 'Business licence / Unified Social Credit Code'}
                    </label>
                    <input value={form.asicNumber} onChange={e => set('asicNumber', e.target.value)}
                      placeholder={isZh ? '91XXXXXXXXXXXXXXXXXX' : '91XXXXXXXXXXXXXXXXXX'}
                      className={inputClass} />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    {isZh ? '补充说明或文件链接（可选）' : 'Additional notes or document links (optional)'}
                  </label>
                  <textarea value={form.verificationNote} onChange={e => set('verificationNote', e.target.value)}
                    placeholder={isZh
                      ? '可粘贴 Google Drive / Dropbox 文件链接，或填写补充信息…'
                      : 'Paste a Google Drive / Dropbox link, or add any notes…'}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none resize-none bg-white border border-gray-200 focus:border-orange-400" />
                </div>

                {/* Pricing */}
                <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">$199</p>
                  <p className="text-sm text-gray-500 mt-0.5">{isZh ? '/ 年（AUD）' : '/ year (AUD)'}</p>
                  <p className="text-xs text-orange-500 font-medium mt-1">{isZh ? '认证有效期 12 个月' : '12-month verified status'}</p>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  onClick={submitWithVerify}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  <BadgeCheck className="w-4 h-4" />
                  {submitting
                    ? (isZh ? '跳转中…' : 'Redirecting…')
                    : (isZh ? '入驻并认证 · AUD $199/年' : 'List & Verify · AUD $199/yr')}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  {isZh ? '付款后进入人工审核，1–2 个工作日出结果' : 'Payment required — reviewed within 1–2 business days'}
                </p>
              </div>
            )}

            {error && !verifyExpanded && <p className="text-red-500 text-sm px-1">{error}</p>}

            <button onClick={() => setStep(2)}
              className="text-gray-400 hover:text-gray-600 text-sm w-full text-center transition-colors">
              ← {isZh ? '上一步' : 'Back'}
            </button>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && result && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {isZh ? '提交成功！' : 'Listing submitted!'}
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
              {isZh
                ? '你的公司信息已收录到建材目录中，买家和业主现在可以找到你了。'
                : 'Your business is now listed in the supplier directory — homeowners and buyers can find you.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/suppliers"
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                {isZh ? '浏览建材目录' : 'Browse Supplier Directory'}
              </a>
              <a href="/professionals"
                className="px-6 py-3 rounded-xl text-gray-600 font-medium transition-colors bg-gray-100 hover:bg-gray-200 border border-gray-200">
                {isZh ? '浏览专业人士目录' : 'Browse Professionals'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
