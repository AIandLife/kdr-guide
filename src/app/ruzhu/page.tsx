'use client'

/**
 * 商家入驻 H5 — /ruzhu
 *
 * Mobile-first, login-free onboarding reached via QR codes. Trilingual:
 *   zh (default — WeChat groups), vi (Vietnamese tradies — FB groups), en.
 * Per HIA 2024, Mandarin is the #1 non-English language in construction;
 * Vietnamese tradies cluster in finishing trades (tiling/painting/rendering).
 *
 * Contact-field rules differ by audience: zh requires WeChat (phone optional),
 * vi/en require phone (WeChat optional). Language choice is tracked in GA to
 * decide locale #4 with data.
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle, Loader2, ChevronRight,
  HardHat, PenTool, FileText, Hammer, Ruler, Zap, Droplets, DollarSign, Briefcase, Paintbrush,
} from 'lucide-react'

type Lang = 'zh' | 'vi' | 'en'

const CATEGORY_ICONS = {
  Builder: HardHat, 'Building Designer': PenTool, 'Town Planner': FileText,
  Demolition: Hammer, 'Structural Engineer': Ruler, Electrician: Zap,
  Plumber: Droplets, 'Finance Broker': DollarSign, Surveyor: Briefcase, Other: Paintbrush,
} as const

const CATEGORY_LABELS: Record<string, Record<Lang, string>> = {
  Builder:               { zh: '建筑商 Builder', vi: 'Thầu xây dựng (Builder)', en: 'Builder' },
  'Building Designer':   { zh: '设计师 / 建筑师', vi: 'Thiết kế / Kiến trúc sư', en: 'Designer / Architect' },
  'Town Planner':        { zh: '城市规划师', vi: 'Quy hoạch (Town Planner)', en: 'Town Planner' },
  Demolition:            { zh: '拆房', vi: 'Phá dỡ nhà', en: 'Demolition' },
  'Structural Engineer': { zh: '结构工程师', vi: 'Kỹ sư kết cấu', en: 'Structural Engineer' },
  Electrician:           { zh: '电工', vi: 'Thợ điện', en: 'Electrician' },
  Plumber:               { zh: '水管工', vi: 'Thợ nước', en: 'Plumber' },
  'Finance Broker':      { zh: '贷款经纪', vi: 'Môi giới vay (Broker)', en: 'Finance Broker' },
  Surveyor:              { zh: '测量师', vi: 'Đo đạc (Surveyor)', en: 'Surveyor' },
  Other:                 { zh: '其他（瓦工/油漆/园艺…）', vi: 'Khác (ốp lát / sơn / sân vườn…)', en: 'Other (tiling / painting / landscaping…)' },
}

const T: Record<Lang, Record<string, string>> = {
  zh: {
    headerSub: 'ausbuildcircle.com',
    title1: '2 分钟入驻',
    title2: '让找建房服务的业主找到你',
    subtitle: '澳洲建房圈 · 建房服务商目录',
    chip1: '✅ 免费收录', chip2: '🎁 前 3 个月免费', chip3: '📞 询盘直达',
    catTitle: '你是做什么的？',
    basicTitle: '基本信息',
    businessName: '公司 / 商号名称', businessNamePh: '中文或英文都可以',
    contactName: '怎么称呼你', contactNamePh: '例如：张师傅 / Kevin',
    wechat: '微信号', wechatPh: '业主主要通过微信联系你',
    phone: '手机号', phonePh: '04XX XXX XXX（选填）',
    email: '邮箱', emailPh: '用于接收审核结果和业主询盘',
    areaTitle: '服务范围',
    stateLabel: '主要在哪个州', allAu: '全澳',
    regions: '主要服务区域', regionsPh: '例如：Sydney 全城 / Parramatta, Blacktown',
    langLabel: '服务语言（可多选）',
    introTitle: '一句话介绍（选填）',
    introHint: '随便写两句就行，AI 会帮你整理成专业介绍',
    introPh: '例如：做了 10 年 granny flat，悉尼西区为主，有 Builder 牌照',
    submit: '免费提交入驻', submitting: '提交中...',
    footer1: '提交即表示同意我们审核并展示你的商家信息。',
    footer2: '前 3 个月免费，不需要绑卡，到期前我们会先联系你。',
    doneTitle: '提交成功！',
    doneBody1: '我们会尽快审核（通常 1-2 个工作日）。审核通过后，',
    doneBody2: '会展示在「找专业人士」目录中，正在规划建房的业主可以直接联系你。',
    nextTitle: '接下来：',
    next1: '审核结果会发到', next2: '🎁 前 3 个月免费展示，不绑卡、不自动扣费', next3: '📞 业主询盘会直接发给你',
    shareTitle: '👋 群里有同行也在做建房相关生意？',
    shareBody: '把这个页面转发给他们，早入驻早展示。',
    errCategory: '请先选择你的业务类别',
    errGeneric: '提交失败，请稍后再试',
  },
  vi: {
    headerSub: 'ausbuildcircle.com',
    title1: 'Đăng ký trong 2 phút',
    title2: 'Để chủ nhà đang chuẩn bị xây nhà tìm thấy bạn',
    subtitle: 'AusBuildCircle · Danh bạ dịch vụ xây dựng Úc',
    chip1: '✅ Đăng miễn phí', chip2: '🎁 3 tháng đầu miễn phí', chip3: '📞 Khách liên hệ thẳng bạn',
    catTitle: 'Bạn làm nghề gì?',
    basicTitle: 'Thông tin cơ bản',
    businessName: 'Tên công ty / thương hiệu', businessNamePh: 'Tiếng Việt hoặc tiếng Anh đều được',
    contactName: 'Tên bạn', contactNamePh: 'VD: Anh Tuấn / David',
    wechat: 'WeChat (không bắt buộc)', wechatPh: 'Nếu bạn dùng WeChat',
    phone: 'Số điện thoại', phonePh: '04XX XXX XXX',
    email: 'Email', emailPh: 'Nhận kết quả duyệt và liên hệ từ khách',
    areaTitle: 'Khu vực làm việc',
    stateLabel: 'Bang nào là chính', allAu: 'Toàn Úc',
    regions: 'Khu vực chính', regionsPh: 'VD: Sydney / Bankstown, Cabramatta',
    langLabel: 'Ngôn ngữ phục vụ (chọn nhiều)',
    introTitle: 'Giới thiệu ngắn (không bắt buộc)',
    introHint: 'Viết vài dòng là đủ, AI sẽ giúp chỉnh thành giới thiệu chuyên nghiệp',
    introPh: 'VD: 10 năm kinh nghiệm ốp lát, làm chủ yếu khu Tây Nam Sydney, có ABN',
    submit: 'Gửi đăng ký — Miễn phí', submitting: 'Đang gửi...',
    footer1: 'Gửi đăng ký nghĩa là bạn đồng ý cho chúng tôi duyệt và hiển thị thông tin doanh nghiệp.',
    footer2: '3 tháng đầu miễn phí, không cần thẻ, chúng tôi sẽ liên hệ trước khi hết hạn.',
    doneTitle: 'Đã gửi thành công!',
    doneBody1: 'Chúng tôi sẽ duyệt sớm (thường 1-2 ngày làm việc). Sau khi duyệt, ',
    doneBody2: 'sẽ hiển thị trong danh bạ — chủ nhà đang chuẩn bị xây sẽ liên hệ thẳng bạn.',
    nextTitle: 'Tiếp theo:',
    next1: 'Kết quả duyệt sẽ gửi về', next2: '🎁 3 tháng đầu hiển thị miễn phí, không cần thẻ', next3: '📞 Khách hàng sẽ liên hệ thẳng bạn',
    shareTitle: '👋 Bạn bè cũng làm nghề xây dựng?',
    shareBody: 'Chia sẻ trang này cho họ — đăng ký sớm, hiển thị sớm.',
    errCategory: 'Vui lòng chọn nghề của bạn trước',
    errGeneric: 'Gửi thất bại, vui lòng thử lại',
  },
  en: {
    headerSub: 'ausbuildcircle.com',
    title1: 'Get listed in 2 minutes',
    title2: 'Let homeowners planning a build find you',
    subtitle: 'AusBuildCircle · Building services directory',
    chip1: '✅ Free listing', chip2: '🎁 First 3 months free', chip3: '📞 Enquiries straight to you',
    catTitle: 'What do you do?',
    basicTitle: 'Basic details',
    businessName: 'Business / trading name', businessNamePh: 'Your company or trading name',
    contactName: 'Your name', contactNamePh: 'e.g. Dave',
    wechat: 'WeChat (optional)', wechatPh: 'If you use WeChat',
    phone: 'Phone', phonePh: '04XX XXX XXX',
    email: 'Email', emailPh: 'For review results and enquiries',
    areaTitle: 'Service area',
    stateLabel: 'Primary state', allAu: 'All Australia',
    regions: 'Main regions', regionsPh: 'e.g. Sydney / Parramatta, Blacktown',
    langLabel: 'Service languages (select all)',
    introTitle: 'Short intro (optional)',
    introHint: 'A couple of lines is fine — AI tidies it into a professional description',
    introPh: 'e.g. 10 years building granny flats across western Sydney, licensed builder',
    submit: 'Submit — Free', submitting: 'Submitting...',
    footer1: 'By submitting you agree to us reviewing and displaying your business listing.',
    footer2: 'First 3 months free, no card needed — we contact you before it ends.',
    doneTitle: 'Submitted!',
    doneBody1: 'We review quickly (usually 1-2 business days). Once approved, ',
    doneBody2: 'will appear in the directory where homeowners planning a build can contact you directly.',
    nextTitle: 'What happens next:',
    next1: 'Review result goes to', next2: '🎁 First 3 months listed free, no card, no auto-charge', next3: '📞 Homeowner enquiries come straight to you',
    shareTitle: '👋 Know others in the building trade?',
    shareBody: 'Share this page with them — early listings show first.',
    errCategory: 'Please pick your trade first',
    errGeneric: 'Submission failed, please try again',
  },
}

// Languages a merchant can SERVE clients in — multi-select, independent of the
// UI language they happen to be filling the form in. Stored in professionals.languages.
const SERVICE_LANGUAGES: { value: string; label: Record<Lang, string> }[] = [
  { value: 'Mandarin',   label: { zh: '中文（普通话）', vi: 'Tiếng Trung', en: 'Mandarin' } },
  { value: 'Cantonese',  label: { zh: '粤语', vi: 'Tiếng Quảng Đông', en: 'Cantonese' } },
  { value: 'English',    label: { zh: 'English', vi: 'English', en: 'English' } },
  { value: 'Vietnamese', label: { zh: 'Tiếng Việt（越南语）', vi: 'Tiếng Việt', en: 'Vietnamese' } },
]

// Pre-selected service languages based on the UI locale the merchant arrived in
const DEFAULT_LANGS: Record<Lang, string[]> = {
  zh: ['Mandarin', 'English'],
  vi: ['Vietnamese', 'English'],
  en: ['English'],
}

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT', 'All Australia']

const track = (name: string, params?: Record<string, unknown>) => {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', name, params)
  } catch { /* analytics must never break the form */ }
}

function RuzhuPageInner() {
  const params = useSearchParams()
  const [lang, setLang] = useState<Lang>('zh')

  const [serviceLangs, setServiceLangs] = useState<string[]>(DEFAULT_LANGS.zh)

  useEffect(() => {
    const l = params.get('lang')
    if (l === 'vi' || l === 'en') { setLang(l); setServiceLangs(DEFAULT_LANGS[l]) }
  }, [params])

  const t = T[lang]
  const wechatRequired = lang === 'zh'

  const [form, setForm] = useState({
    category: '', businessName: '', contactName: '', wechat: '',
    phone: '', email: '', state: 'NSW', regions: '', description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))
  const toggleServiceLang = (v: string) =>
    setServiceLangs(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const switchLang = (l: Lang) => {
    setLang(l)
    setServiceLangs(DEFAULT_LANGS[l])
    track('ruzhu_lang_switch', { lang: l })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { setError(t.errCategory); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    setSubmitting(true)
    setError('')
    try {
      const languages = serviceLangs.length ? serviceLangs : DEFAULT_LANGS[lang]
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone || undefined,
          wechat: form.wechat || undefined,
          state: form.state,
          category: form.category,
          regions: form.regions.split(/[,，、]/).map(r => r.trim()).filter(Boolean),
          description: form.description || undefined,
          languages,
          source: lang === 'zh' ? 'wechat_h5' : `ruzhu_${lang}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.errGeneric)
      track('merchant_join_submitted', { category: form.category, state: form.state, source: 'ruzhu', lang })
      setDone(true)
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  // 16px+ font on inputs prevents iOS auto-zoom inside in-app browsers
  const inputClass = 'w-full px-4 py-3.5 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  const header = (
    <div className="bg-white border-b border-gray-100 px-5 py-3.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <span className="font-bold text-gray-900">🏗️ {lang === 'zh' ? '澳洲建房圈' : 'AusBuildCircle'}</span>
        <div className="flex gap-1">
          {([['zh', '中文'], ['vi', 'Việt'], ['en', 'EN']] as [Lang, string][]).map(([l, label]) => (
            <button key={l} onClick={() => switchLang(l)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                lang === l ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        {header}
        <div className="max-w-md mx-auto px-5 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.doneTitle}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {t.doneBody1}<strong className="text-gray-700">{form.businessName}</strong> {t.doneBody2}
          </p>
          <div className="rounded-2xl bg-white border border-gray-200 p-5 text-left mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">{t.nextTitle}</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex gap-2"><span>📋</span><span>{t.next1} <strong>{form.email}</strong></span></li>
              <li>{t.next2}</li>
              <li>{t.next3}</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5">
            <p className="text-sm text-gray-700 leading-relaxed">
              {t.shareTitle}<br /><strong>{t.shareBody}</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {header}

      <div className="bg-gradient-to-b from-orange-50 to-gray-50 px-5 pt-8 pb-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
            {t.title1}<br />{t.title2}
          </h1>
          <p className="text-sm text-gray-500 mb-4">{t.subtitle}</p>
          <div className="flex justify-center gap-2 flex-wrap text-xs">
            {[t.chip1, t.chip2, t.chip3].map(c => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-white border border-orange-200 text-gray-700 font-medium">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-5 pb-12 space-y-5">
        {error && (
          <div className="rounded-xl p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
        )}

        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">{t.catTitle} <span className="text-red-500">*</span></h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_LABELS).map(([id, labels]) => {
              const Icon = CATEGORY_ICONS[id as keyof typeof CATEGORY_ICONS]
              return (
                <button
                  key={id} type="button"
                  onClick={() => { set('category', id); setError('') }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                    form.category === id
                      ? 'text-orange-600 bg-orange-50 border-2 border-orange-400'
                      : 'text-gray-600 bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{labels[lang]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">{t.basicTitle}</h2>
          <div>
            <label className={labelClass}>{t.businessName} <span className="text-red-500">*</span></label>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
              placeholder={t.businessNamePh} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.contactName} <span className="text-red-500">*</span></label>
            <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
              placeholder={t.contactNamePh} required className={inputClass} />
          </div>
          {wechatRequired ? (
            <>
              <div>
                <label className={labelClass}>{t.wechat} <span className="text-red-500">*</span></label>
                <input value={form.wechat} onChange={e => set('wechat', e.target.value)}
                  placeholder={t.wechatPh} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.phone}</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder={t.phonePh} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelClass}>{t.phone} <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder={t.phonePh} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.wechat}</label>
                <input value={form.wechat} onChange={e => set('wechat', e.target.value)}
                  placeholder={t.wechatPh} className={inputClass} />
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>{t.email} <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder={t.emailPh} required className={inputClass} />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">{t.areaTitle}</h2>
          <div>
            <label className={labelClass}>{t.stateLabel} <span className="text-red-500">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {STATES.map(s => (
                <button key={s} type="button" onClick={() => set('state', s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.state === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                  {s === 'All Australia' ? t.allAu : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>{t.regions}</label>
            <input value={form.regions} onChange={e => set('regions', e.target.value)}
              placeholder={t.regionsPh} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.langLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {SERVICE_LANGUAGES.map(opt => {
                const on = serviceLangs.includes(opt.value)
                return (
                  <button key={opt.value} type="button" onClick={() => toggleServiceLang(opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                      on ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                    {opt.label[lang]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-1.5">{t.introTitle}</h2>
          <p className="text-xs text-gray-400 mb-3">{t.introHint}</p>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder={t.introPh}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none bg-gray-50 border border-gray-200 focus:border-orange-400" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
        >
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</>
            : <><ChevronRight className="w-5 h-5" /> {t.submit}</>}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          {t.footer1}<br />{t.footer2}
        </p>
      </form>
    </div>
  )
}

export default function RuzhuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RuzhuPageInner />
    </Suspense>
  )
}
