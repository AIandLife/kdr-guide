'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, Clock, MessageSquare, Shield, Edit3,
  AlertCircle, Building2, Phone, Globe, PartyPopper, Save, X, Loader2,
  Mail as MailIcon, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'

interface ProProfile {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  category: string
  state: string
  regions: string[]
  description: string
  verified: boolean
  verification_status: 'free' | 'pending' | 'verified'
  website: string
  wechat: string
}

interface Enquiry {
  id: string
  professional_name: string
  suburb: string
  project_type: string
  message: string
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string
  status: string
  created_at: string
}

interface ApplicationInfo {
  paid_at: string | null
  stripe_subscription_id: string | null
}

// ── Profile Editor Component ──────────────────────────────────────────────
function ProfileEditor({
  profile,
  isZh,
  onSaved,
}: {
  profile: ProProfile
  isZh: boolean
  onSaved: (updated: Partial<ProProfile>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    business_name: profile.business_name || '',
    contact_name: profile.contact_name || '',
    phone: profile.phone || '',
    website: profile.website || '',
    wechat: profile.wechat || '',
    description: profile.description || '',
  })

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || 'Update failed')
      } else {
        onSaved(form)
        setEditing(false)
      }
    } catch {
      setSaveError('Network error')
    }
    setSaving(false)
  }

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { multiline?: boolean; placeholder?: string }
  ) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {opts?.multiline ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3}
          placeholder={opts.placeholder}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-orange-400 resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts?.placeholder}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
        />
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{isZh ? '我的主页信息' : 'My listing details'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{isZh ? '这些信息会在专业人士目录中公开展示。' : 'Shown publicly on your professional listing.'}</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-200 rounded-xl px-3 py-1.5 hover:bg-orange-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isZh ? '编辑' : 'Edit'}
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {editing ? (
          <div className="space-y-4">
            {field(isZh ? '公司名称' : 'Business name', 'business_name')}
            {field(isZh ? '联系人姓名' : 'Contact name', 'contact_name')}
            {field(isZh ? '电话' : 'Phone', 'phone', { placeholder: '+61 4xx xxx xxx' })}
            {field(isZh ? '网站' : 'Website', 'website', { placeholder: 'https://...' })}
            {field(isZh ? 'WeChat ID' : 'WeChat ID', 'wechat')}
            {field(
              isZh ? '业务介绍' : 'About your business',
              'description',
              {
                multiline: true,
                placeholder: isZh ? '简要描述你的服务、专长和服务区域...' : 'Describe your services, expertise and coverage areas...',
              }
            )}

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isZh ? '保存' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setSaveError('') }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                {isZh ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoRow label={isZh ? '公司名称' : 'Business name'} value={form.business_name} />
            <InfoRow label={isZh ? '联系人' : 'Contact'} value={form.contact_name} />
            <InfoRow label={isZh ? '邮箱' : 'Email'} value={profile.email} />
            <InfoRow label={isZh ? '类别' : 'Category'} value={profile.category} />
            <InfoRow label={isZh ? '州' : 'State'} value={profile.state} />
            {form.phone && <InfoRow label={isZh ? '电话' : 'Phone'} icon={<Phone className="w-3.5 h-3.5" />} value={form.phone} />}
            {form.website && <InfoRow label={isZh ? '网站' : 'Website'} icon={<Globe className="w-3.5 h-3.5" />} value={form.website} />}
            {form.wechat && <InfoRow label="WeChat" value={form.wechat} />}
            {form.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{isZh ? '业务介绍' : 'About'}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{form.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-gray-900 flex items-center gap-1.5">{icon}{value || '—'}</p>
    </div>
  )
}

// ── Verify Tab Component ─────────────────────────────────────────────────
function VerifyTab({
  profile,
  isZh,
  justPaid,
  subscriptionExpiry,
  formatDate,
}: {
  profile: ProProfile
  isZh: boolean
  justPaid: boolean
  subscriptionExpiry: Date | null
  formatDate: (iso: string) => string
}) {
  const [form, setForm] = useState({
    abn: '',
    licenseNumber: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'annual',
          email: profile.email,
          businessName: profile.business_name,
          professionalId: profile.id,
          abn: form.abn.trim(),
          licenseNumber: form.licenseNumber.trim(),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setSubmitError(data.error || '发生错误，请重试')
        setSubmitting(false)
      }
    } catch {
      setSubmitError('网络错误，请重试')
      setSubmitting(false)
    }
  }

  if (profile.verification_status === 'verified') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-10 h-10 text-green-500 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{isZh ? '已认证' : "You're Verified!"}</h3>
            <p className="text-sm text-gray-500 mb-3">{isZh ? '你的主页已显示认证徽章，搜索结果优先排名。' : 'Your listing shows a Verified badge and ranks above unverified profiles.'}</p>
            {subscriptionExpiry && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {isZh ? '认证有效期至：' : 'Verified until: '}
                  <strong>{formatDate(subscriptionExpiry.toISOString())}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (profile.verification_status === 'pending') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
        <Clock className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">{isZh ? '认证审核中' : 'Verification in progress'}</h3>
        <p className="text-sm text-gray-500">
          {isZh
            ? justPaid
              ? '我们已收到你的付款。资质核实中，通常 1–2 个工作日完成，请耐心等待。'
              : '你的认证申请正在审核中，通常 1–2 个工作日完成。'
            : 'We\'re verifying your credentials. Usually takes 1–2 business days.'}
        </p>
      </div>
    )
  }

  // Free — show the verification form
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-gray-900">{isZh ? '申请认证徽章' : 'Apply for Verified Badge'}</h3>
        </div>
        <p className="text-xs text-gray-400 ml-8">
          {isZh
            ? '认证后你的主页优先展示，获得认证徽章，建立更强的信任感。'
            : 'Get a verified badge and rank higher in search results.'}
        </p>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Benefits */}
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-700 mb-2">{isZh ? '认证专业人士享受：' : 'Verified members get:'}</p>
          <ul className="space-y-1">
            {(isZh
              ? ['✅ 搜索结果优先排名', '✅ 主页显示认证徽章', '✅ 增加业主信任度', '✅ 更多询盘机会']
              : ['✅ Priority ranking in search', '✅ Verified badge on your listing', '✅ More enquiries from homeowners']
            ).map((item, i) => (
              <li key={i} className="text-xs text-orange-800">{item}</li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">{isZh ? 'ABN（澳大利亚商业号码）' : 'ABN (Australian Business Number)'}</label>
          <input
            type="text"
            value={form.abn}
            onChange={e => setForm(f => ({ ...f, abn: e.target.value }))}
            placeholder="12 345 678 901"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">{isZh ? '执照号 / 注册号' : 'Licence / Registration Number'}</label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
            placeholder="e.g. BLD123456"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
          />
        </div>

        {submitError && <p className="text-xs text-red-500">{submitError}</p>}

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {isZh ? '提交认证申请 →' : 'Submit & Pay →'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            {isZh ? '付款后进入人工审核，1–2 个工作日出结果' : 'Payment required — reviewed within 1–2 business days'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────
function ProDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('verified') === '1'
  const [profile, setProfile] = useState<ProProfile | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [sentEnquiries, setSentEnquiries] = useState<Enquiry[]>([])
  const [appInfo, setAppInfo] = useState<ApplicationInfo | null>(null)
  const [fetching, setFetching] = useState(true)
  const tabParam = searchParams.get('tab') as 'enquiries' | 'sent' | 'profile' | 'verify' | null
  const [activeTab, setActiveTab] = useState<'enquiries' | 'sent' | 'profile' | 'verify'>(
    justPaid ? 'verify' : (tabParam || 'enquiries')
  )
  const [markingReplied, setMarkingReplied] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    // Try user_id match first; fallback to server-side email binding
    supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()
      .then(async ({ data: byId }) => {
        if (!byId && user.email) {
          // Use server-side API to bind (validates email from auth token)
          const res = await fetch('/api/profile/bind', { method: 'POST' })
          const result = await res.json()
          if (result.bound && result.professionalId) {
            const { data: bound } = await supabase.from('professionals').select('*').eq('id', result.professionalId).maybeSingle()
            return bound
          }
          return null
        }
        return byId
      })
      .then((prof) => {
        setProfile(prof ?? null)
        if (!prof?.business_name) {
          setFetching(false)
          return
        }
        // Fetch received enquiries + sent enquiries + application info in parallel
        Promise.all([
          supabase.from('contact_requests').select('*')
            .or(`professional_id.eq.${prof.id},professional_name.eq.${prof.business_name}`)
            .order('created_at', { ascending: false }),
          supabase.from('contact_requests').select('*')
            .eq('homeowner_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('kdr_professional_applications')
            .select('paid_at, stripe_subscription_id')
            .eq('email', prof.email)
            .order('paid_at', { ascending: false })
            .limit(1)
            .single(),
        ]).then(([{ data: enqs }, { data: sent }, { data: app }]) => {
          setEnquiries(enqs ?? [])
          setSentEnquiries(sent ?? [])
          setAppInfo(app ?? null)
          setFetching(false)
        })
      })
  }, [user])

  if (loading) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{isZh ? '请先登录' : 'Please sign in first'}</p>
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">{isZh ? '去登录 →' : 'Sign in →'}</Link>
        </div>
      </div>
    )
  }

  const handleMarkReplied = async (enquiryId: string) => {
    setMarkingReplied(enquiryId)
    try {
      const res = await fetch('/api/enquiries/mark-replied', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId }),
      })
      if (res.ok) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: 'replied' } : e))
      }
    } catch (err) {
      console.error('Failed to mark replied:', err)
    }
    setMarkingReplied(null)
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(isZh ? 'zh-CN' : 'en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  // Subscription expiry: paid_at + 1 year
  const subscriptionExpiry = appInfo?.paid_at
    ? new Date(new Date(appInfo.paid_at).getTime() + 365 * 24 * 60 * 60 * 1000)
    : null
  const now = new Date()
  const daysUntilExpiry = subscriptionExpiry
    ? Math.ceil((subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30

  const statusBadge = (status: string) => {
    if (status === 'verified') {
      if (isExpired) return <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertCircle className="w-3.5 h-3.5" />{isZh ? '认证已过期' : 'Subscription expired'}</span>
      if (isExpiringSoon) return <span className="flex items-center gap-1 text-xs text-orange-500 font-medium"><Clock className="w-3.5 h-3.5" />{isZh ? `认证将在 ${daysUntilExpiry} 天后到期` : `Renew in ${daysUntilExpiry} days`}</span>
      return <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" />{isZh ? '已认证' : 'Verified'}</span>
    }
    if (status === 'pending') return <span className="flex items-center gap-1 text-xs text-orange-500 font-medium"><Clock className="w-3.5 h-3.5" />{isZh ? '审核中' : 'Pending'}</span>
    return <span className="flex items-center gap-1 text-xs text-gray-400"><AlertCircle className="w-3.5 h-3.5" />{isZh ? '免费版' : 'Free listing'}</span>
  }

  const newEnquiries = enquiries.filter(e => e.status === 'new' || e.status === 'sent' || !e.status).length

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/dashboard/pro" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile ? profile.business_name : (isZh ? '个人中心' : 'My Account')}
            </h1>
            <div className="flex items-center gap-2">
              {profile ? statusBadge(profile.verification_status) : (
                <span className="text-sm text-gray-400">{user.email}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!profile && (
              <Link href="/join"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Building2 className="w-4 h-4" />
                {isZh ? '创建我的主页' : 'Create my listing'}
              </Link>
            )}
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
            >
              <LogOut className="w-4 h-4" />
              {isZh ? '退出' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* Payment success banner */}
        {justPaid && (
          <div className="mb-6 rounded-2xl bg-orange-50 border border-orange-200 px-5 py-4 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                {isZh ? '🎉 付款成功！认证申请审核中。' : '🎉 Payment received! Your application is under review.'}
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                {isZh ? '我们正在核实你的资质，1–2 个工作日内完成审核并通知你。' : 'We\'ll verify your credentials within 1–2 business days and notify you by email.'}
              </p>
            </div>
          </div>
        )}


        {/* Stats row (show to all professionals with a profile) */}
        {profile && enquiries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{enquiries.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isZh ? '总询盘' : 'Total enquiries'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{newEnquiries}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isZh ? '未回复' : 'Awaiting reply'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              {subscriptionExpiry ? (
                <>
                  <p className="text-sm font-bold text-gray-900">{subscriptionExpiry.toLocaleDateString(isZh ? 'zh-CN' : 'en-AU', { month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isZh ? '认证到期' : 'Renews'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-green-600">✓</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isZh ? '已认证' : 'Verified'}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* No profile yet */}
        {!fetching && !profile && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isZh ? '你还没有创建业务主页' : 'No listing yet'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isZh ? '填写你的业务信息，免费收录进澳洲建房圈专业人士目录。' : 'Fill in your business details to get listed in our professional directory for free.'}
            </p>
            <Link href="/join"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              {isZh ? '免费创建主页 →' : 'Create listing — free →'}
            </Link>
          </div>
        )}

        {/* Tabs (only if profile exists) */}
        {profile && (
          <>
            <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm w-fit">
              {([
                ['enquiries', isZh ? '收到的询盘' : 'Enquiries', MessageSquare],
                ...(sentEnquiries.length > 0 ? [['sent', isZh ? '发出的咨询' : 'Sent', MessageSquare]] as const : []),
                ['profile',   isZh ? '编辑资料' : 'My Profile', Edit3],
                ['verify',    isZh ? '认证' : 'Verification', Shield],
              ] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === key ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {key === 'enquiries' && newEnquiries > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {newEnquiries}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Enquiries Tab ── */}
            {activeTab === 'enquiries' && (
              <div className="space-y-3">
                {enquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                    <MessageSquare className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">{isZh ? '还没有收到询盘' : 'No enquiries yet'}</p>
                    <p className="text-xs text-gray-400 mt-1">{isZh ? '业主在目录里找到你后可以直接发询盘给你。' : 'Homeowners who find you in the directory can send you a quote request.'}</p>
                  </div>
                ) : (
                  enquiries.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
                            {e.suburb && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{e.suburb}</span>}
                            {e.project_type && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{e.project_type}</span>}
                          </div>
                          {e.homeowner_name && (
                            <p className="text-sm font-medium text-gray-900 mb-1">{e.homeowner_name}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {e.homeowner_email && (
                              <a href={`mailto:${e.homeowner_email}`} className="flex items-center gap-1 text-orange-500 hover:underline">
                                <MailIcon className="w-3 h-3" />
                                {e.homeowner_email}
                              </a>
                            )}
                            {e.homeowner_phone && (
                              <a href={`tel:${e.homeowner_phone}`} className="hover:text-gray-700">{e.homeowner_phone}</a>
                            )}
                          </div>
                          {e.message && <p className="text-sm text-gray-600 mt-2">{e.message}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                            e.status === 'replied' ? 'bg-green-100 text-green-600' :
                            e.status === 'read' ? 'bg-blue-100 text-blue-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {e.status === 'replied' ? (isZh ? '已回复' : 'Replied') :
                             e.status === 'read' ? (isZh ? '已读' : 'Read') :
                             (isZh ? '新询盘' : 'New')}
                          </span>
                          {e.status !== 'replied' && (
                            <button
                              onClick={() => handleMarkReplied(e.id)}
                              disabled={markingReplied === e.id}
                              className="text-xs text-gray-400 hover:text-green-600 flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {markingReplied === e.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle className="w-3 h-3" />}
                              {isZh ? '标记已回复' : 'Mark replied'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Sent Enquiries Tab ── */}
            {activeTab === 'sent' && (
              <div className="space-y-3">
                {sentEnquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                    <MessageSquare className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">{isZh ? '还没有发出过询盘' : 'No sent enquiries yet'}</p>
                  </div>
                ) : (
                  sentEnquiries.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
                            {e.suburb && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{e.suburb}</span>}
                            {e.project_type && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{e.project_type}</span>}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{e.professional_name}</p>
                          {e.message && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{e.message}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${
                          e.status === 'replied' ? 'bg-green-100 text-green-600' :
                          e.status === 'read' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {e.status === 'replied' ? (isZh ? '已回复' : 'Replied') :
                           e.status === 'read' ? (isZh ? '已查看' : 'Read') :
                           (isZh ? '已发送' : 'Sent')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <ProfileEditor
                profile={profile}
                isZh={isZh}
                onSaved={(updated) => setProfile(prev => prev ? { ...prev, ...updated } : prev)}
              />
            )}

            {/* ── Verification Tab ── */}
            {activeTab === 'verify' && (
              <VerifyTab profile={profile} isZh={isZh} justPaid={justPaid} subscriptionExpiry={subscriptionExpiry} formatDate={formatDate} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ProDashboardPage() {
  return (
    <Suspense>
      <ProDashboard />
    </Suspense>
  )
}
