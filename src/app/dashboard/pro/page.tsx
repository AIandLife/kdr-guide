'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle, Clock, MessageSquare, Shield, Edit3,
  AlertCircle, ChevronRight, Building2, Phone, Globe, PartyPopper
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
  status: string
  created_at: string
}

function ProDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('verified') === '1'
  const [profile, setProfile] = useState<ProProfile | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'enquiries' | 'profile' | 'verify'>(justPaid ? 'verify' : 'enquiries')
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('professionals').select('*').eq('user_id', user.id).single()
      .then(({ data: prof }) => {
        setProfile(prof ?? null)
        if (!prof?.business_name) {
          setFetching(false)
          return
        }
        // Only fetch enquiries addressed to this professional
        supabase.from('contact_requests').select('*')
          .eq('professional_name', prof.business_name)
          .order('created_at', { ascending: false })
          .then(({ data: enqs }) => {
            setEnquiries(enqs ?? [])
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
          <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">{isZh ? '去登录 →' : 'Sign in →'}</a>
        </div>
      </div>
    )
  }

  const handleCheckout = async (plan: 'annual' | 'monthly') => {
    setCheckingOut(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, email: user?.email, businessName: profile?.business_name }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckingOut(false)
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(isZh ? 'zh-CN' : 'en-AU', { day: 'numeric', month: 'short' })

  const statusBadge = (status: string) => {
    if (status === 'verified') return <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" />{isZh ? '已认证' : 'Verified'}</span>
    if (status === 'pending') return <span className="flex items-center gap-1 text-xs text-orange-500 font-medium"><Clock className="w-3.5 h-3.5" />{isZh ? '审核中' : 'Pending'}</span>
    return <span className="flex items-center gap-1 text-xs text-gray-400"><AlertCircle className="w-3.5 h-3.5" />{isZh ? '免费版' : 'Free listing'}</span>
  }

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
            <a href="/join"
              className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <Building2 className="w-4 h-4" />
              {isZh ? '创建我的主页' : 'Create my listing'}
            </a>
          )}
        </div>

        {/* Payment success banner */}
        {justPaid && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">
                {isZh ? '🎉 支付成功！认证申请已提交。' : '🎉 Payment received! Verification application submitted.'}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {isZh ? '我们将在 1–2 个工作日内完成审核，审核通过后你的主页会显示认证徽章。' : 'We\'ll review and verify your listing within 1–2 business days.'}
              </p>
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
            <a href="/join"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              {isZh ? '免费创建主页 →' : 'Create listing — free →'}
            </a>
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
                  {key === 'enquiries' && enquiries.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {enquiries.length}
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
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
                            {e.suburb && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{e.suburb}</span>}
                            {e.project_type && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{e.project_type}</span>}
                          </div>
                          {e.message && <p className="text-sm text-gray-700 mt-1">{e.message}</p>}
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-1 rounded-lg font-medium ${
                          e.status === 'replied' ? 'bg-green-100 text-green-600' :
                          e.status === 'read' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {e.status === 'replied' ? (isZh ? '已回复' : 'Replied') :
                           e.status === 'read' ? (isZh ? '已读' : 'Read') :
                           (isZh ? '新询盘' : 'New')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">{isZh ? '你的主页信息' : 'Your listing details'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{isZh ? '这些信息会在专业人士目录中展示。' : 'This information is shown on your public listing.'}</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <InfoRow label={isZh ? '公司名称' : 'Business name'} value={profile.business_name} />
                  <InfoRow label={isZh ? '联系人' : 'Contact'} value={profile.contact_name} />
                  <InfoRow label={isZh ? '邮箱' : 'Email'} value={profile.email} />
                  {profile.phone && <InfoRow label={isZh ? '电话' : 'Phone'} icon={<Phone className="w-3.5 h-3.5" />} value={profile.phone} />}
                  {profile.website && <InfoRow label={isZh ? '网站' : 'Website'} icon={<Globe className="w-3.5 h-3.5" />} value={profile.website} />}
                  <InfoRow label={isZh ? '类别' : 'Category'} value={profile.category} />
                  <InfoRow label={isZh ? '州' : 'State'} value={profile.state} />
                  {profile.description && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">{isZh ? '业务介绍' : 'About'}</p>
                      <p className="text-sm text-gray-700">{profile.description}</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <a href="/join"
                    className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    <Edit3 className="w-4 h-4" />
                    {isZh ? '更新我的信息' : 'Update my details'}
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* ── Verification Tab ── */}
            {activeTab === 'verify' && (
              <div className="space-y-4">
                {profile.verification_status === 'verified' ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">{isZh ? '已认证' : 'You\'re Verified!'}</h3>
                    <p className="text-sm text-gray-500">{isZh ? '你的主页已显示认证徽章，搜索结果优先排名。' : 'Your listing shows a Verified badge and ranks above unverified profiles.'}</p>
                  </div>
                ) : profile.verification_status === 'pending' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
                    <Clock className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">{isZh ? '认证审核中' : 'Verification in progress'}</h3>
                    <p className="text-sm text-gray-500">{isZh ? '我们正在核实你的资质，通常 1–2 个工作日完成。' : 'We\'re verifying your credentials. Usually takes 1–2 business days.'}</p>
                  </div>
                ) : (
                  <>
                    {/* Benefits */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">{isZh ? '认证的好处' : 'Why get verified?'}</h3>
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

                    {/* Pricing + action — ONLY visible to professionals in their own dashboard */}
                    <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                      <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                        <h3 className="font-bold text-gray-900">{isZh ? '申请认证' : 'Apply for Verification'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{isZh ? '提交材料后，我们会在 1–2 个工作日内完成审核。' : 'Submit your documents and we\'ll verify within 1–2 business days.'}</p>
                      </div>
                      <div className="px-6 py-5">
                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="relative rounded-xl border-2 border-orange-400 bg-orange-50 p-4 text-center">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              {isZh ? '推荐' : 'Best Value'}
                            </span>
                            <p className="text-2xl font-bold text-gray-900">$99</p>
                            <p className="text-xs text-gray-500">{isZh ? '/ 年（AUD）' : '/ year (AUD)'}</p>
                            <p className="text-xs text-orange-500 font-medium mt-0.5">{isZh ? '仅 $8.25/月' : '$8.25/mo'}</p>
                          </div>
                          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">$12</p>
                            <p className="text-xs text-gray-500">{isZh ? '/ 月（AUD）' : '/ month (AUD)'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{isZh ? '随时取消' : 'Cancel anytime'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleCheckout('annual')}
                            disabled={checkingOut}
                            className="flex flex-col items-center justify-center py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
                            <span>{isZh ? '年付 $99' : '$99 / year'}</span>
                            <span className="text-xs font-normal opacity-80">{isZh ? '最优惠' : 'Best value'}</span>
                          </button>
                          <button
                            onClick={() => handleCheckout('monthly')}
                            disabled={checkingOut}
                            className="flex flex-col items-center justify-center py-3 rounded-xl border-2 border-orange-400 text-orange-500 font-semibold text-sm transition-all hover:bg-orange-50 disabled:opacity-60">
                            <span>{isZh ? '月付 $12' : '$12 / month'}</span>
                            <span className="text-xs font-normal opacity-70">{isZh ? '随时取消' : 'Cancel anytime'}</span>
                          </button>
                        </div>
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

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-gray-900 flex items-center gap-1.5">{icon}{value}</p>
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
