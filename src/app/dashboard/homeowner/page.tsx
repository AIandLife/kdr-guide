'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Clock, Building2, ChevronRight, HardHat, FileText, MapPin, Plus, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'

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

interface SupplierEnquiry {
  id: string
  supplier_name: string
  supplier_category: string | null
  products_needed: string
  suburb: string | null
  project_type: string | null
  created_at: string
}

export default function HomeownerDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [reports, setReports] = useState<SavedReport[]>([])
  const [supplierEnquiries, setSupplierEnquiries] = useState<SupplierEnquiry[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    Promise.all([
      supabase
        .from('contact_requests')
        .select('*')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('feasibility_reports')
        .select('id, suburb, state, project_type, feasibility_score, feasibility_label, total_cost_min, total_cost_max, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('supplier_inquiries')
        .select('id, supplier_name, supplier_category, products_needed, suburb, project_type, created_at')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(([{ data: contactData }, { data: reportData }, { data: supplierData }]) => {
      setContacts(contactData ?? [])
      setReports(reportData ?? [])
      setSupplierEnquiries(supplierData ?? [])
      setFetching(false)
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

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isZh
      ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const scoreColor = (score: number) =>
    score >= 7 ? 'text-green-600 bg-green-50' : score >= 5 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/dashboard/homeowner" />

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

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
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
          <Link href="/professionals"
            className="flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 transition-colors group"
          >
            <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
              <HardHat className="w-5 h-5 text-cyan-600" />
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
            {/* Saved Reports */}
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

            {/* Contact Requests */}
            <section>
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

            {/* Supplier Enquiries */}
            {supplierEnquiries.length > 0 && (
              <section className="mt-8">
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
                  {supplierEnquiries.map(e => (
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

        {/* Pro CTA */}
        <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HardHat className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">
              {isZh ? '你是建房专业人士或建材商？免费将你的业务收录进目录。' : 'Are you a building professional or supplier? Get listed for free.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/join" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold text-sm whitespace-nowrap">
              {isZh ? '专业人士入驻 →' : 'Join as Professional →'}
            </Link>
            <Link href="/suppliers/register" className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold text-sm whitespace-nowrap">
              {isZh ? '建材商入驻 →' : 'List as Supplier →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
