'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, Clock, MessageSquare, Shield, Edit3,
  AlertCircle, Building2, Phone, Globe, PartyPopper, Save, X, Loader2,
  RefreshCw, TrendingUp, Mail as MailIcon
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
    const supabase = createClient()
    const { error } = await supabase
      .from('professionals')
      .update(form)
      .eq('id', profile.id)
    if (error) {
      setSaveError(error.message)
    } else {
      onSaved(form)
      setEditing(false)
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

// ── Main Dashboard ────────────────────────────────────────────────────────
function ProDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('verified') === '1'
  const [profile, setProfile] = useState<ProProfile | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [appInfo, setAppInfo] = useState<ApplicationInfo | null>(null)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'enquiries' | 'profile' | 'verify'>(justPaid ? 'verify' : 'enquiries')
  const [checkingOut, setCheckingOut] = useState(false)
  const [markingReplied, setMarkingReplied] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    // Try user_id match first; fallback to email (handles direct navigation bypassing /dashboard binder)
    supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()
      .then(async ({ data: byId }) => {
        if (!byId && user.email) {
          const { data: byEmail } = await supabase.from('professionals').select('*').eq('email', user.email).maybeSingle()
          if (byEmail) {
            await supabase.from('professionals').update({ user_id: user.id }).eq('email', user.email)
            return byEmail
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
        // Fetch enquiries + application info in parallel
        Promise.all([
          supabase.from('contact_requests').select('*')
            .eq('professional_name', prof.business_name)
            .order('created_at', { ascending: false }),
          supabase.from('kdr_professional_applications')
            .select('paid_at, stripe_subscription_id')
            .eq('email', prof.email)
            .order('paid_at', { ascending: false })
            .limit(1)
            .single(),
        ]).then(([{ data: enqs }, { data: app }]) => {
          setEnquiries(enqs ?? [])
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

  const handleCheckout = async () => {
    setCheckingOut(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'annual', email: user?.email, businessName: profile?.business_name }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckingOut(false)
  }

  const handleMarkReplied = async (enquiryId: string) => {
    setMarkingReplied(enquiryId)
    const supabase = createClient()
    await supabase.from('contact_requests').update({ status: 'replied' }).eq('id', enquiryId)
    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: 'replied' } : e))
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
              {profile ? profile.business_name : (isZh ? '我的后台' : 'My Dashboard')}
            </h1>
            <div className="flex items-center gap-2">
              {profile ? statusBadge(profile.verification_status) : (
                <span className="text-sm text-gray-400">{user.email}</span>
              )}
            </div>
          </div>
          {!profile && (
            <Link href="/join"
              className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <Building2 className="w-4 h-4" />
              {isZh ? '创建我的主页' : 'Create my listing'}
            </Link>
          )}
        </div>

        {/* Payment success banner */}
        {justPaid && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">
                {isZh ? '🎉 支付成功！认证已即时生效。' : '🎉 Payment received! You are now verified.'}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {isZh ? '你的主页现已显示认证徽章，并获得优先排名。' : 'Your listing now shows a Verified badge and ranks above others.'}
              </p>
            </div>
          </div>
        )}

        {/* Expiry warning banner */}
        {profile && (isExpired || isExpiringSoon) && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${isExpired ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
              <div>
                <p className={`font-semibold text-sm ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                  {isExpired
                    ? (isZh ? '认证订阅已过期' : 'Subscription expired')
                    : (isZh ? `认证将在 ${daysUntilExpiry} 天后到期` : `Verification expires in ${daysUntilExpiry} days`)}
                </p>
                <p className={`text-xs mt-0.5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {isExpired
                    ? (isZh ? '你的主页已失去认证徽章和优先排名。续费后立即恢复。' : 'Your listing has lost its Verified badge and priority ranking. Renew to restore.')
                    : (isZh ? '续费以保持认证徽章和优先排名。' : 'Renew to keep your Verified badge and priority ranking.')}
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
            >
              {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isZh ? '立即续费' : 'Renew Now'}
            </button>
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
              {isZh ? '填写你的业务信息，免费收录进 KDR 专业人士目录。' : 'Fill in your business details to get listed in our professional directory for free.'}
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
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm w-fit">
              {([
                ['enquiries', isZh ? '收到的询盘' : 'Enquiries', MessageSquare],
                ['profile',   isZh ? '编辑资料' : 'My Profile', Edit3],
                ['verify',    isZh ? '认证' : 'Verification', Shield],
              ] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
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
                    <p className="text-xs text-gray-400 mt-1 mb-4">{isZh ? '认证后你的主页会优先展示，吸引更多业主联系你。' : 'Get verified to rank higher and attract more homeowners.'}</p>
                    {profile?.verification_status !== 'verified' && (
                      <button onClick={() => setActiveTab('verify')} className="text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-200 rounded-xl px-4 py-2 hover:bg-orange-50 transition-colors">
                        {isZh ? '立即申请认证 →' : 'Get Verified →'}
                      </button>
                    )}
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
              <div className="space-y-4">
                {profile.verification_status === 'verified' && !isExpired ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-10 h-10 text-green-500 shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{isZh ? '已认证' : 'You\'re Verified!'}</h3>
                        <p className="text-sm text-gray-500 mb-3">{isZh ? '你的主页已显示认证徽章，搜索结果优先排名。' : 'Your listing shows a Verified badge and ranks above unverified profiles.'}</p>
                        {subscriptionExpiry && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {isZh ? `认证有效期至：` : 'Verified until: '}
                              <strong>{formatDate(subscriptionExpiry.toISOString())}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="mt-4 pt-4 border-t border-green-200 flex items-center justify-between gap-4">
                        <p className="text-sm text-orange-700">
                          {isZh ? `认证将在 ${daysUntilExpiry} 天后到期，续费以保持优先排名。` : `Expires in ${daysUntilExpiry} days — renew to keep priority ranking.`}
                        </p>
                        <button onClick={handleCheckout} disabled={checkingOut}
                          className="shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                          {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          {isZh ? '续费' : 'Renew'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : profile.verification_status === 'pending' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
                    <Clock className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">{isZh ? '认证审核中' : 'Verification in progress'}</h3>
                    <p className="text-sm text-gray-500">{isZh ? '我们正在核实你的资质，通常 1–2 个工作日完成。' : 'We\'re verifying your credentials. Usually takes 1–2 business days.'}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        {isZh ? '认证的好处' : 'Why get verified?'}
                      </h3>
                      <div className="space-y-3">
                        {[
                          { icon: '✅', en: 'Verified badge shown to all homeowners', zh: '向所有业主显示已认证徽章' },
                          { icon: '⭐', en: 'Priority ranking in search results', zh: '搜索结果优先排名' },
                          { icon: '📞', en: 'Phone, website & WeChat visible on listing', zh: '联系方式对业主可见' },
                          { icon: '🎯', en: 'Direct enquiry emails sent to you', zh: '询盘直接发送到你的邮箱' },
                        ].map((b, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-lg">{b.icon}</span>
                            <p className="text-sm text-gray-700">{isZh ? b.zh : b.en}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                      <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                        <h3 className="font-bold text-gray-900">{isZh ? '申请认证' : 'Apply for Verification'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{isZh ? '付款后认证即时生效，主页立即显示认证徽章。' : 'Verification is instant after payment.'}</p>
                      </div>
                      <div className="px-6 py-5">
                        <div className="rounded-xl border-2 border-orange-400 bg-orange-50 p-5 text-center mb-5">
                          <p className="text-3xl font-bold text-gray-900">$199</p>
                          <p className="text-sm text-gray-500 mt-1">{isZh ? '/ 年（AUD）· 仅 $16.6/月' : '/ year (AUD) · just $16.60/mo'}</p>
                          <p className="text-xs text-orange-500 font-medium mt-1">{isZh ? '年付最优惠，随时取消续订' : 'Best value · cancel anytime'}</p>
                        </div>
                        <button
                          onClick={handleCheckout}
                          disabled={checkingOut}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                        >
                          {checkingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isZh ? '立即认证 · AUD $199/年 →' : 'Get Verified · AUD $199/year →'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
