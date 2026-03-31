'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Clock, Building2, ChevronRight, HardHat, FileText,
  MapPin, Plus, LogOut, Shield, Store, Search, BadgeCheck, AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'

// ── Types ────────────────────────────────────────────────────────────────────

interface ContactRecord {
  id: string
  professional_name: string
  professional_category: string
  suburb: string
  project_type: string
  message: string
  status: string
  created_at: string
}

interface SavedReport {
  id: string
  suburb: string
  state: string
  project_type: string
  feasibility_score: number
  feasibility_label: string
  total_cost_min: number | null
  total_cost_max: number | null
  created_at: string
}

interface SupplierEnquirySent {
  id: string
  supplier_name: string
  supplier_category: string | null
  products_needed: string
  suburb: string | null
  project_type: string | null
  created_at: string
}

interface ProInfo {
  id: string
  user_id: string | null
  name: string
  business_name: string
  verified: boolean
  verification_status: string
  category: string
  email: string
}

interface SupplierInfo {
  id: string
  business_name: string
  status: string
  category: string
  email: string
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function UnifiedDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'

  const [fetching, setFetching] = useState(true)

  // Role detection
  const [proInfo, setProInfo] = useState<ProInfo | null>(null)
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null)

  // Professional data
  const [proEnquiryCount, setProEnquiryCount] = useState(0)
  const [proNewEnquiryCount, setProNewEnquiryCount] = useState(0)

  // Supplier data
  const [supplierEnquiryCount, setSupplierEnquiryCount] = useState(0)

  // Homeowner data
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [reports, setReports] = useState<SavedReport[]>([])
  const [supplierEnquiriesSent, setSupplierEnquiriesSent] = useState<SupplierEnquirySent[]>([])

  useEffect(() => {
    if (loading) return
    if (!user) return

    const supabase = createClient()

    async function loadAll() {
      // 1. Check professional status (user_id match first, then email)
      let pro: ProInfo | null = null
      const { data: proById } = await supabase
        .from('professionals')
        .select('id, user_id, name, business_name, verified, verification_status, category, email')
        .eq('user_id', user!.id)
        .maybeSingle()

      if (proById) {
        pro = proById
      } else if (user!.email) {
        // Try email match
        const { data: proByEmail } = await supabase
          .from('professionals')
          .select('id, user_id, name, business_name, verified, verification_status, category, email')
          .eq('email', user!.email)
          .maybeSingle()
        if (proByEmail) {
          pro = proByEmail
          // Also try to bind via API
          fetch('/api/profile/bind', { method: 'POST' }).catch(() => {})
        }
      }
      setProInfo(pro)

      // 2. Check supplier status (user_id match first, then email)
      let supplier: SupplierInfo | null = null
      const { data: supById } = await supabase
        .from('supplier_listings')
        .select('id, business_name, status, category, email')
        .eq('user_id', user!.id)
        .maybeSingle()

      if (supById) {
        supplier = supById
      } else if (user!.email) {
        const { data: supByEmail } = await supabase
          .from('supplier_listings')
          .select('id, business_name, status, category, email')
          .eq('email', user!.email)
          .maybeSingle()
        if (supByEmail) supplier = supByEmail
      }
      setSupplierInfo(supplier)

      // 3. Load homeowner data (always)
      const [contactsRes, reportsRes, supplierEnqRes] = await Promise.all([
        supabase
          .from('contact_requests')
          .select('*')
          .eq('homeowner_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('feasibility_reports')
          .select('id, suburb, state, project_type, feasibility_score, feasibility_label, total_cost_min, total_cost_max, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('supplier_inquiries')
          .select('id, supplier_name, supplier_category, products_needed, suburb, project_type, created_at')
          .eq('homeowner_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setContacts(contactsRes.data ?? [])
      setReports(reportsRes.data ?? [])
      setSupplierEnquiriesSent(supplierEnqRes.data ?? [])

      // 4. Load professional enquiry count if applicable
      if (pro) {
        const { data: proEnqs } = await supabase
          .from('contact_requests')
          .select('id, status')
          .or(`professional_id.eq.${pro.id},professional_name.eq.${pro.business_name}`)
        if (proEnqs) {
          setProEnquiryCount(proEnqs.length)
          setProNewEnquiryCount(proEnqs.filter(e => e.status === 'new' || e.status === 'sent' || !e.status).length)
        }
      }

      // 5. Load supplier enquiry count if applicable
      if (supplier) {
        const { count } = await supabase
          .from('supplier_inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', supplier.id)
        setSupplierEnquiryCount(count ?? 0)
      }

      setFetching(false)
    }

    loadAll()
  }, [user, loading])

  if (loading) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{isZh ? '请先登录' : 'Please sign in first'}</p>
          <Link href="/login?next=/dashboard" className="text-orange-500 hover:text-orange-600 font-medium">
            {isZh ? '去登录 →' : 'Sign in →'}
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isZh
      ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const scoreColor = (score: number) =>
    score >= 7 ? 'text-green-600 bg-green-50' : score >= 5 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'

  const isPro = !!proInfo
  const isSupplier = !!supplierInfo

  const proVerificationLabel = () => {
    if (!proInfo) return ''
    const vs = proInfo.verification_status
    if (vs === 'verified') return isZh ? '已认证' : 'Verified'
    if (vs === 'pending') return isZh ? '审核中' : 'Pending'
    return isZh ? '未认证' : 'Unverified'
  }

  const supplierStatusLabel = () => {
    if (!supplierInfo) return ''
    const s = supplierInfo.status
    if (s === 'verified') return isZh ? '已认证' : 'Verified'
    if (s === 'pending_review') return isZh ? '审核中' : 'Pending'
    return isZh ? '已收录' : 'Listed'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/dashboard" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isZh ? '个人中心' : 'My Account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isZh ? `欢迎回来，${user.email}` : `Welcome back, ${user.email}`}
            </p>
            {/* Role badges */}
            {!fetching && (isPro || isSupplier) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {isPro && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium">
                    <HardHat className="w-3 h-3" />
                    {isZh ? '专业人士' : 'Professional'}
                  </span>
                )}
                {isSupplier && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">
                    <Store className="w-3 h-3" />
                    {isZh ? '建材商' : 'Supplier'}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            {isZh ? '退出' : 'Sign out'}
          </button>
        </div>

        {/* Quick action cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8`}>
          {/* Professional management card */}
          {isPro && (
            <Link href="/dashboard/pro"
              className="flex items-center gap-3 bg-white border border-cyan-200 hover:border-cyan-400 rounded-2xl p-4 transition-colors group"
            >
              <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                <HardHat className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{isZh ? '管理专业人士资料' : 'Manage Professional Profile'}</p>
                <p className="text-xs text-gray-400">
                  {proNewEnquiryCount > 0
                    ? (isZh ? `${proNewEnquiryCount} 条新询盘` : `${proNewEnquiryCount} new enquiries`)
                    : (isZh ? '编辑资料 · 查看询盘 · 认证' : 'Edit profile · View enquiries')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          )}

          {/* Supplier management card */}
          {isSupplier && (
            <Link href="/suppliers/account"
              className="flex items-center gap-3 bg-white border border-orange-200 hover:border-orange-400 rounded-2xl p-4 transition-colors group"
            >
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{isZh ? '管理建材商资料' : 'Manage Supplier Listing'}</p>
                <p className="text-xs text-gray-400">
                  {supplierEnquiryCount > 0
                    ? (isZh ? `${supplierEnquiryCount} 条询价` : `${supplierEnquiryCount} enquiries`)
                    : (isZh ? '查看商家信息 · 认证' : 'View listing · Verification')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          )}

          {/* New feasibility check */}
          <Link href="/feasibility"
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl p-4 transition-colors group"
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{isZh ? '新建可行性查询' : 'New Feasibility Check'}</p>
              <p className="text-xs text-orange-100">{isZh ? '免费 · 2 分钟出报告' : 'Free · results in 2 min'}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Find professionals */}
          <Link href="/professionals"
            className="flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 transition-colors group"
          >
            <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{isZh ? '找专业人士' : 'Find Professionals'}</p>
              <p className="text-xs text-gray-400">{isZh ? '认证 Builder / 规划师 / 工程师' : 'Verified builders & planners'}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {fetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <>
            {/* ══════ Professional Summary Section ══════ */}
            {isPro && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-cyan-500" />
                    {isZh ? '专业人士管理' : 'Professional Management'}
                  </h2>
                  <Link href="/dashboard/pro" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    {isZh ? '详细管理 →' : 'Full dashboard →'}
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{proInfo!.business_name || proInfo!.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{proInfo!.category}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${
                      proInfo!.verification_status === 'verified'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : proInfo!.verification_status === 'pending'
                        ? 'text-orange-700 bg-orange-50 border-orange-200'
                        : 'text-gray-600 bg-gray-50 border-gray-200'
                    }`}>
                      {proInfo!.verification_status === 'verified' && <BadgeCheck className="w-3 h-3 inline mr-1" />}
                      {proInfo!.verification_status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                      {proInfo!.verification_status === 'free' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                      {proVerificationLabel()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{proEnquiryCount}</p>
                      <p className="text-xs text-gray-400">{isZh ? '总询盘' : 'Total enquiries'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-orange-500">{proNewEnquiryCount}</p>
                      <p className="text-xs text-gray-400">{isZh ? '待回复' : 'Awaiting reply'}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══════ Supplier Summary Section ══════ */}
            {isSupplier && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-400" />
                    {isZh ? '建材商管理' : 'Supplier Management'}
                  </h2>
                  <Link href="/suppliers/account" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    {isZh ? '详细管理 →' : 'Full dashboard →'}
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{supplierInfo!.business_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{supplierInfo!.category}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${
                      supplierInfo!.status === 'verified'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : supplierInfo!.status === 'pending_review'
                        ? 'text-orange-700 bg-orange-50 border-orange-200'
                        : 'text-gray-600 bg-gray-50 border-gray-200'
                    }`}>
                      {supplierInfo!.status === 'verified' && <BadgeCheck className="w-3 h-3 inline mr-1" />}
                      {supplierInfo!.status === 'pending_review' && <Clock className="w-3 h-3 inline mr-1" />}
                      {supplierStatusLabel()}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{supplierEnquiryCount}</p>
                    <p className="text-xs text-gray-400">{isZh ? '收到的询价' : 'Enquiries received'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* ══════ Feasibility Reports ══════ */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  {isZh ? '我的可行性报告' : 'My Feasibility Reports'}
                </h2>
                <Link href="/feasibility" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  {isZh ? '新建查询 +' : 'New check +'}
                </Link>
              </div>
              {reports.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm mb-4">
                    {isZh ? '还没有保存的报告。运行一次可行性查询，报告会自动保存。' : 'No saved reports yet. Run a feasibility check and it will be saved here.'}
                  </p>
                  <Link href="/feasibility"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {isZh ? '免费查询我的地块' : 'Check my block — free'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <Link
                      key={r.id}
                      href={`/feasibility?suburb=${encodeURIComponent(r.suburb)}&state=${r.state || ''}&projectType=${r.project_type || 'kdr'}`}
                      className="block bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{r.suburb}{r.state ? `, ${r.state}` : ''}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {r.project_type && (
                                <span className="text-xs text-gray-400 capitalize">{r.project_type.replace('-', ' ')}</span>
                              )}
                              {r.total_cost_min && r.total_cost_max && (
                                <span className="text-xs text-gray-400">
                                  · ${Math.round(r.total_cost_min / 1000)}k–${Math.round(r.total_cost_max / 1000)}k
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {r.feasibility_label && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${scoreColor(r.feasibility_score)}`}>
                              {r.feasibility_label}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* ══════ Professionals Contacted ══════ */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-500" />
                  {isZh ? '我联系过的专业人士' : 'Professionals Contacted'}
                </h2>
                <Link href="/professionals" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  {isZh ? '浏览目录 →' : 'Browse directory →'}
                </Link>
              </div>
              {contacts.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <Building2 className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm mb-4">
                    {isZh ? '还没有联系过专业人士。' : 'No professional contacts yet.'}
                  </p>
                  <Link href="/professionals"
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    {isZh ? '浏览专业人士目录 →' : 'Browse professionals →'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{c.professional_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                                {c.professional_category}
                              </span>
                              {c.suburb && <span className="text-xs text-gray-400">{c.suburb}</span>}
                              {c.project_type && <span className="text-xs text-gray-400">· {c.project_type}</span>}
                            </div>
                            {c.message && (
                              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{c.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(c.created_at)}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            c.status === 'replied' ? 'bg-green-100 text-green-600' :
                            c.status === 'read' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {c.status === 'replied' ? (isZh ? '已回复' : 'Replied') :
                             c.status === 'read' ? (isZh ? '已查看' : 'Read') :
                             (isZh ? '已发送' : 'Sent')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ══════ Supplier Enquiries Sent ══════ */}
            {supplierEnquiriesSent.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    {isZh ? '我发出的建材询价' : 'Supplier Enquiries Sent'}
                  </h2>
                  <Link href="/suppliers" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    {isZh ? '浏览建材商 →' : 'Browse suppliers →'}
                  </Link>
                </div>
                <div className="space-y-3">
                  {supplierEnquiriesSent.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{e.supplier_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {e.supplier_category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{e.supplier_category}</span>
                              )}
                              {e.suburb && <span className="text-xs text-gray-400">{e.suburb}</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{e.products_needed}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                            {isZh ? '已发送' : 'Sent'}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Join CTA — only show if NOT already a pro AND NOT already a supplier */}
        {!fetching && (!isPro || !isSupplier) && (
          <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HardHat className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500">
                {isZh
                  ? (isPro ? '你还可以作为建材商入驻目录。' : isSupplier ? '你还可以作为专业人士入驻目录。' : '你是建房专业人士或建材商？免费将你的业务收录进目录。')
                  : (isPro ? 'You can also list as a supplier.' : isSupplier ? 'You can also join as a professional.' : 'Are you a building professional or supplier? Get listed for free.')}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              {!isPro && (
                <Link href="/join" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold text-sm whitespace-nowrap">
                  {isZh ? '专业人士入驻 →' : 'Join as Professional →'}
                </Link>
              )}
              {!isSupplier && (
                <Link href="/suppliers/register" className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold text-sm whitespace-nowrap">
                  {isZh ? '建材商入驻 →' : 'List as Supplier →'}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
