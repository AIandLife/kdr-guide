'use client'

import { useState } from 'react'
import { ArrowLeft, Building2, CheckCircle, ChevronRight, HelpCircle, Upload } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import { SUPPLIER_CATEGORIES } from '@/lib/suppliers-data'

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

  const [step, setStep] = useState(1) // 1=basic, 2=contact, 3=verify, 4=done
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
    email: '',
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

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const toggleState = (s: string) => {
    set('states', form.states.includes(s) ? form.states.filter(x => x !== s) : [...form.states, s])
  }

  const categories = Object.entries(SUPPLIER_CATEGORIES)

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
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
          category: form.category,
          origin: form.origin,
          description: form.description || undefined,
          states: form.states,
          specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
          asicNumber: form.asicNumber || undefined,
          businessLicenseNote: form.businessLicenseNote || undefined,
          verificationNote: form.verificationNote || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
      setStep(4)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0d1117 100%)' }}>
      {/* Nav */}
      <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/suppliers" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isZh ? '建材目录' : 'Suppliers'}
            </a>
            <div className="w-px h-5 bg-gray-700" />
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isZh ? '申请加入建材目录' : 'List Your Business'}
          </h1>
          <p className="text-slate-400">
            {isZh
              ? '免费收录。填写基本信息后，你的公司名称即出现在目录中。如需展示联系方式，可申请认证。'
              : 'Free to list. Your business name appears in the directory immediately. Apply for verification to show contact details.'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-0 mb-10">
            {[
              { n: 1, label: isZh ? '基本信息' : 'Business Info' },
              { n: 2, label: isZh ? '联系方式' : 'Contact' },
              { n: 3, label: isZh ? '认证资料' : 'Verification' },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={step >= n
                      ? { background: '#f97316', color: 'white' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#64748b' }}
                  >
                    {step > n ? <CheckCircle className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-sm hidden sm:block ${step >= n ? 'text-white' : 'text-slate-600'}`}>{label}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px mx-3" style={{ background: step > n ? '#f97316' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Business Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">{isZh ? '公司名称 *' : 'Business Name *'}</label>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                placeholder={isZh ? '你的公司名称' : 'Your business name'}
                className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">{isZh ? '类别 *' : 'Category *'}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(([key, cat]) => (
                  <button key={key} type="button" onClick={() => set('category', key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={form.category === key
                      ? { background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.5)', color: '#fb923c' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                  >
                    <span>{cat.icon}</span>
                    <span>{isZh ? cat.zh : cat.en}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">{isZh ? '产地 / 来源 *' : 'Origin *'}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ORIGINS.map(o => (
                  <button key={o.value} type="button" onClick={() => set('origin', o.value)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={form.origin === o.value
                      ? { background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.5)', color: '#fb923c' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                  >
                    {isZh ? o.zh : o.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">{isZh ? '服务州/地区（可多选）' : 'States served (select all that apply)'}</label>
              <div className="flex flex-wrap gap-2">
                {STATES.map(s => (
                  <button key={s} type="button" onClick={() => toggleState(s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={form.states.includes(s)
                      ? { background: '#f97316', color: 'white' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {isZh ? '专长（用逗号分隔）' : 'Specialties (comma-separated)'}
              </label>
              <input value={form.specialties} onChange={e => set('specialties', e.target.value)}
                placeholder={isZh ? '如：双层玻璃, 铝合金框架, 定制尺寸' : 'e.g. Double Glazing, Aluminium Frames, Custom Sizes'}
                className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">{isZh ? '公司简介' : 'Business description'}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={isZh ? '简单介绍你的公司和产品…' : 'Brief description of your business and products…'}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none resize-none"
                style={inputStyle} />
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

        {/* STEP 2 — Contact (hidden until verified) */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <HelpCircle className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                {isZh
                  ? '以下联系方式已安全保存，但在通过认证前不会对外显示。认证后，访问目录的用户才能看到这些信息。'
                  : 'These details are saved securely but not shown publicly until your listing is verified. After verification, visitors to the directory can see them.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{isZh ? '联系人姓名 *' : 'Contact name *'}</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
                  placeholder={isZh ? '你的姓名' : 'Your name'}
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">{isZh ? '邮箱 *' : 'Email *'}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{isZh ? '电话' : 'Phone'}</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="0400 000 000"
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">{isZh ? '微信号' : 'WeChat ID'}</label>
                <input value={form.wechat} onChange={e => set('wechat', e.target.value)}
                  placeholder={isZh ? '你的微信号' : 'WeChat username'}
                  className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{isZh ? '公司网站' : 'Website'}</label>
                <input value={form.website} onChange={e => set('website', e.target.value)}
                  placeholder="yourcompany.com.au"
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">ABN</label>
                <input value={form.abn} onChange={e => set('abn', e.target.value)}
                  placeholder="XX XXX XXX XXX"
                  className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-slate-400 font-medium transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {isZh ? '上一步' : 'Back'}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.contactName || !form.email}
                className="flex-1 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {isZh ? '下一步：认证资料' : 'Next: Verification'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Verification (optional) */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Verification explain */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                {isZh ? '为什么要认证？' : 'Why get verified?'}
              </h3>
              <ul className="text-sm text-slate-400 space-y-1.5 leading-relaxed">
                <li>✓ {isZh ? '在目录中展示联系方式、网站和微信' : 'Show contact details, website, and WeChat in the directory'}</li>
                <li>✓ {isZh ? '获得"已认证"徽章，提升信任度' : 'Verified badge — increases trust with homeowners'}</li>
                <li>✓ {isZh ? '优先排名，出现在未认证商家前面' : 'Priority ranking — appear above unverified listings'}</li>
                <li>✓ {isZh ? '后续推荐算法中获得更高权重' : 'Higher weight in our recommendation algorithm'}</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                {isZh ? '认证费用：AUD $99/年（审核通过后收取）' : 'Verification fee: AUD $99/year (charged after approval)'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-5">
                <div
                  onClick={() => set('wantsVerification', !form.wantsVerification)}
                  className="w-10 h-5 rounded-full relative transition-all cursor-pointer shrink-0"
                  style={{ background: form.wantsVerification ? '#f97316' : 'rgba(255,255,255,0.1)' }}
                >
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: form.wantsVerification ? '22px' : '2px' }} />
                </div>
                <span className="text-sm text-slate-300">
                  {isZh ? '我现在想申请认证' : 'I want to apply for verification now'}
                </span>
              </label>
            </div>

            {form.wantsVerification && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    {isZh ? 'ABN / ASIC 公司注册号（澳洲企业）' : 'ABN / ASIC Company Number (Australian businesses)'}
                  </label>
                  <input value={form.asicNumber} onChange={e => set('asicNumber', e.target.value)}
                    placeholder={isZh ? '如：ACN 123 456 789' : 'e.g. ACN 123 456 789'}
                    className={inputClass} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    {isZh ? '营业执照信息（中国企业）' : 'Business registration details (China-based businesses)'}
                  </label>
                  <input value={form.businessLicenseNote} onChange={e => set('businessLicenseNote', e.target.value)}
                    placeholder={isZh ? '营业执照统一社会信用代码' : 'Unified Social Credit Code'}
                    className={inputClass} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {isZh ? '补充说明（文件链接或备注）' : 'Additional notes or document links'}
                  </label>
                  <textarea value={form.verificationNote} onChange={e => set('verificationNote', e.target.value)}
                    placeholder={isZh
                      ? '可粘贴 Google Drive / Dropbox 链接，或填写任何补充信息…'
                      : 'You can paste a Google Drive / Dropbox link to your documents, or add any notes…'}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none resize-none"
                    style={inputStyle} />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm px-1">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-slate-400 font-medium transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {isZh ? '上一步' : 'Back'}
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {submitting
                  ? (isZh ? '提交中…' : 'Submitting…')
                  : (isZh ? '提交信息' : 'Submit Listing')}
              </button>
            </div>

            <p className="text-xs text-slate-600 text-center">
              {isZh
                ? '点击提交即表示你同意我们展示你的公司名称及描述（不含联系方式，直至通过认证）。'
                : 'By submitting you agree to your business name and description being shown in the directory. Contact details remain hidden until verified.'}
            </p>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && result && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {isZh ? '提交成功！' : 'Listing submitted!'}
            </h2>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
              {result.status === 'pending_review'
                ? (isZh
                    ? '我们已收到你的认证申请，将在 2 个工作日内审核并回复。'
                    : 'Your verification application has been received. We\'ll review and respond within 2 business days.')
                : (isZh
                    ? '你的公司名称现已收录在建材目录中（未认证状态）。如需展示联系方式，请申请认证。'
                    : 'Your business name is now listed in our directory (unverified). Apply for verification to show your contact details.')}
            </p>

            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-slate-500 mb-2">{isZh ? '当前状态' : 'Current status'}</p>
              <p className="font-semibold text-white">
                {result.status === 'pending_review'
                  ? (isZh ? '⏳ 等待审核' : '⏳ Pending review')
                  : (isZh ? '🔍 未认证（已收录）' : '🔍 Unverified (listed)')}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isZh ? '我们已向你的邮箱发送确认邮件。' : 'A confirmation email has been sent to you.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/suppliers"
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
                {isZh ? '查看建材目录' : 'View Directory'}
              </a>
              <a href="/"
                className="px-6 py-3 rounded-xl text-slate-400 font-medium transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {isZh ? '返回首页' : 'Back to Home'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
