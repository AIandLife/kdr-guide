'use client'

import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, ExternalLink, BadgeCheck, BadgeX, Phone, Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ForumPost {
  id: string
  title: string
  author_name: string
  category: string
  city: string | null
  is_demo: boolean
  created_at: string
  reply_count: number
}

interface Professional {
  id: string
  business_name: string
  contact_name: string
  email: string
  category: string
  state: string
  verified: boolean
  verification_status: string
  is_demo: boolean
  created_at: string
  abn: string | null
  license_type: string | null
  license_number: string | null
  years_experience: number | null
  verification_submitted_at: string | null
}

interface Supplier {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  wechat: string | null
  category: string
  origin: string
  states: string[]
  description: string | null
  status: string
  abn: string | null
  google_rating: number | null
  google_reviews: number | null
  featured: boolean
  created_at: string
}

interface Lead {
  id: string
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string | null
  professional_name: string
  professional_category: string
  suburb: string | null
  project_type: string | null
  status: string
  created_at: string
}

interface Search {
  id: string
  suburb: string
  state: string | null
  lot_size: number | null
  project_type: string | null
  council: string | null
  feasibility_score: number | null
  created_at: string
}

interface SupplierInquiry {
  id: string
  supplier_name: string
  supplier_category: string | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  suburb: string | null
  project_type: string | null
  products_needed: string
  quantity_estimate: string | null
  timeline: string | null
  message: string | null
  created_at: string
}

interface AdminTender {
  id: string
  title: string
  description_zh: string
  category_name: string
  source: string
  is_construction: boolean
  published_at: string | null
  link: string
  guid: string
}

type Tab = 'forum' | 'professionals' | 'suppliers' | 'leads' | 'supplier-inquiries' | 'searches' | 'tenders' | 'newsletter'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('leads')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [supplierInquiries, setSupplierInquiries] = useState<SupplierInquiry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searches, setSearches] = useState<Search[]>([])
  const [adminTenders, setAdminTenders] = useState<AdminTender[]>([])
  const [showAddTender, setShowAddTender] = useState(false)
  const [tenderForm, setTenderForm] = useState({
    title: '',
    description_en: '',
    description_zh: '',
    category_name: 'Construction',
    source: 'nsw',
    agency: '',
    location: '',
    link: '',
    close_date: '',
    is_construction: true,
  })
  const [tenderSaving, setTenderSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [nlForm, setNlForm] = useState({
    issueNumber: 1,
    heroTitle: '',
    heroTitleEn: '',
    heroBody: '',
    heroBodyEn: '',
    heroCtaLabel: '免费分析我的地块 / Analyse My Suburb',
    heroCtaUrl: 'https://ausbuildcircle.com/feasibility',
    quickBites: [
      { zh: '', en: '' },
      { zh: '', en: '' },
      { zh: '', en: '' },
    ],
    buildTip: { zh: '', en: '' },
    communityQ: { question: '', answer: '' },
    platformUpdate: { zh: '', en: '' },
  })
  const [nlSending, setNlSending] = useState(false)
  const [nlResult, setNlResult] = useState('')
  const [nlPreview, setNlPreview] = useState(false)

  // On mount: check if already logged in via Google
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === 'recommendforterry@gmail.com') {
        fetchAdminSecret()
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAdminSecret() {
    const res = await fetch('/api/admin/auth')
    if (res.status === 403) { setAuthError('Not authorized.'); return }
    const { secret: s } = await res.json()
    setSecret(s)
    await loadData(s)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setAuthError('')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    })
  }

  async function loadData(s: string) {
    setLoading(true)
    const headers = { 'x-admin-secret': s }
    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
      fetch('/api/admin/forum', { headers }),
      fetch('/api/admin/professionals-list', { headers }),
      fetch('/api/admin/leads', { headers }),
      fetch('/api/admin/searches', { headers }),
      fetch('/api/admin/suppliers/list', { headers }),
      fetch('/api/admin/supplier-inquiries', { headers }),
      fetch('/api/admin/tenders', { headers }),
    ])
    const [d1, d2, d3, d4, d5, d6, d7] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json(), r5.json(), r6.json(), r7.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
    setLeads(d3.leads || [])
    setSearches(d4.searches || [])
    setSuppliers(d5.suppliers || [])
    setSupplierInquiries(d6.inquiries || [])
    setAdminTenders(d7.tenders || [])
    setAuthed(true)
    setLoading(false)
  }

  async function login() {
    setLoading(true)
    setMessage('')
    const headers = { 'x-admin-secret': secret }
    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
      fetch('/api/admin/forum', { headers }),
      fetch('/api/admin/professionals-list', { headers }),
      fetch('/api/admin/leads', { headers }),
      fetch('/api/admin/searches', { headers }),
      fetch('/api/admin/suppliers/list', { headers }),
      fetch('/api/admin/supplier-inquiries', { headers }),
      fetch('/api/admin/tenders', { headers }),
    ])
    if (r1.status === 401) { setMessage('Wrong password.'); setLoading(false); return }
    const [d1, d2, d3, d4, d5, d6, d7] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json(), r5.json(), r6.json(), r7.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
    setLeads(d3.leads || [])
    setSearches(d4.searches || [])
    setSuppliers(d5.suppliers || [])
    setSupplierInquiries(d6.inquiries || [])
    setAdminTenders(d7.tenders || [])
    setAuthed(true)
    setLoading(false)
  }

  async function saveTender() {
    setTenderSaving(true)
    try {
      const res = await fetch('/api/admin/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify(tenderForm),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Tender added successfully')
        setShowAddTender(false)
        setTenderForm({
          title: '', description_en: '', description_zh: '', category_name: 'Construction',
          source: 'nsw', agency: '', location: '', link: '', close_date: '', is_construction: true,
        })
        await reload()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (err) {
      setMessage(`Error: ${String(err)}`)
    }
    setTenderSaving(false)
  }

  async function reload() {
    await loadData(secret)
    setSelected(new Set())
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} item(s)?`)) return
    const ids = Array.from(selected)
    const url = tab === 'forum' ? '/api/admin/forum' : tab === 'suppliers' ? '/api/admin/suppliers/list' : tab === 'tenders' ? '/api/admin/tenders' : '/api/admin/professionals-list'
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ ids }),
    })
    const data = await res.json()
    if (data.success || data.deleted) { setMessage(`Deleted ${ids.length} item(s).`); await reload() }
    else setMessage(`Error: ${data.error}`)
  }

  async function toggleVerify(id: string, currentlyVerified: boolean) {
    const res = await fetch('/api/admin/professionals-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, verified: !currentlyVerified }),
    })
    const data = await res.json()
    if (data.success) {
      setProfessionals(prev => prev.map(p => p.id === id
        ? { ...p, verified: !currentlyVerified, verification_status: !currentlyVerified ? 'verified' : 'free' }
        : p
      ))
      setMessage(`✅ ${!currentlyVerified ? 'Verified' : 'Unverified'} successfully.`)
    } else {
      setMessage(`Error: ${data.error}`)
    }
  }

  async function approveRejectPro(id: string, action: 'approve' | 'reject', adminNote?: string) {
    const res = await fetch('/api/admin/professionals-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, action, adminNote: adminNote || '' }),
    })
    const data = await res.json()
    if (data.success) {
      setProfessionals(prev => prev.map(p => p.id === id
        ? { ...p, verified: action === 'approve', verification_status: action === 'approve' ? 'verified' : 'free' }
        : p
      ))
      setMessage(`✅ ${action === 'approve' ? 'Approved — email sent to professional.' : 'Rejected — email sent.'}`)
    } else {
      setMessage(`Error: ${data.error}`)
    }
  }

  async function deleteAllDemo() {
    const items = tab === 'forum'
      ? posts.filter(p => p.is_demo).map(p => p.id)
      : professionals.filter(p => p.is_demo).map(p => p.id)
    if (items.length === 0) { setMessage('No demo data to delete.'); return }
    if (!confirm(`Delete ALL ${items.length} demo items?`)) return
    const url = tab === 'forum' ? '/api/admin/forum' : tab === 'suppliers' ? '/api/admin/suppliers/list' : '/api/admin/professionals-list'
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ ids: items }),
    })
    const data = await res.json()
    if (data.success) { setMessage(`✅ Deleted ${items.length} demo items.`); await reload() }
    else setMessage(`Error: ${data.error}`)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAllDemo() {
    const demoIds = tab === 'forum'
      ? posts.filter(p => p.is_demo).map(p => p.id)
      : professionals.filter(p => p.is_demo).map(p => p.id)
    setSelected(new Set(demoIds))
  }

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-slate-500'
    if (score >= 7) return 'text-green-400'
    if (score >= 4) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-bold text-white mb-1 text-center">澳洲建房圈 Admin</h1>
          <p className="text-slate-500 text-sm text-center mb-8">Leads · Searches · Forum · Newsletter</p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-4 transition-colors"
            style={{ background: 'white', color: '#111' }}
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            使用 Google 登录
          </button>

          {authError && <p className="text-red-400 text-sm mb-3 text-center">{authError}</p>}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs text-slate-600">或输入密码</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <input
            type="password"
            placeholder="Admin password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none mb-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {message && <p className="text-red-400 text-sm mb-3">{message}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: '#f97316' }}
          >
            {loading ? 'Loading…' : 'Log In'}
          </button>
          <div className="mt-4 text-center">
            <a href="/admin/suppliers" className="text-slate-500 text-xs hover:text-slate-300 flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" /> Suppliers Admin
            </a>
          </div>
        </div>
      </div>
    )
  }

  const demoPosts = posts.filter(p => p.is_demo).length
  const demoPros = professionals.filter(p => p.is_demo).length

  async function sendNewsletter() {
    if (!confirm(`确认发送 Issue #${nlForm.issueNumber} 给所有订阅者？`)) return
    setNlSending(true)
    setNlResult('')
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(nlForm),
    })
    const data = await res.json()
    if (data.sent !== undefined) setNlResult(`✅ 已发送 ${data.sent} 封，失败 ${data.failed}`)
    else setNlResult(`❌ 错误: ${data.error}`)
    setNlSending(false)
  }

  const pendingPros = professionals.filter(p => p.verification_status === 'pending').length

  const TABS: { id: Tab; label: string; count: number; alert?: boolean }[] = [
    { id: 'leads', label: '专业人士询盘', count: leads.length },
    { id: 'supplier-inquiries', label: '建材商询价', count: supplierInquiries.length },
    { id: 'searches', label: '查询记录', count: searches.length },
    { id: 'forum', label: '论坛帖子', count: posts.length },
    { id: 'professionals', label: '专业人士', count: professionals.length, alert: pendingPros > 0 },
    { id: 'suppliers', label: '建材商', count: suppliers.length },
    { id: 'tenders', label: '招标管理', count: adminTenders.length },
    { id: 'newsletter', label: '发 Newsletter', count: 0 },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0d1117', color: '#e2e8f0' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">澳洲建房圈 Admin</h1>
            <p className="text-slate-400 text-sm mt-1">
              线索 {leads.length} · 查询 {searches.length} · 论坛 {posts.length} · 专业人士 {professionals.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={reload} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelected(new Set()) }}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label} ({t.count})
              {t.alert && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-[#0d1117]" />
              )}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {message}
          </div>
        )}

        {/* ── LEADS TAB ── */}
        {tab === 'leads' && (
          <div className="space-y-2">
            {leads.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">暂无线索记录</p>
            )}
            {leads.map(lead => (
              <div key={lead.id} className="px-4 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded px-2 py-0.5 font-medium">
                        {lead.project_type || '未知项目'}
                      </span>
                      {lead.suburb && (
                        <span className="text-xs text-blue-400 bg-blue-500/10 rounded px-2 py-0.5">
                          📍 {lead.suburb}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(lead.created_at).toLocaleString('zh-AU', { timeZone: 'Australia/Sydney', dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">房东</p>
                        <p className="text-sm text-white font-medium">{lead.homeowner_name}</p>
                        <a href={`mailto:${lead.homeowner_email}`} className="text-xs text-orange-400 flex items-center gap-1 hover:text-orange-300">
                          <Mail className="w-3 h-3" />{lead.homeowner_email}
                        </a>
                        {lead.homeowner_phone && (
                          <a href={`tel:${lead.homeowner_phone}`} className="text-xs text-slate-400 flex items-center gap-1 hover:text-white">
                            <Phone className="w-3 h-3" />{lead.homeowner_phone}
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">联系的专业人士</p>
                        <p className="text-sm text-white">{lead.professional_name}</p>
                        <p className="text-xs text-slate-500">{lead.professional_category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SUPPLIER INQUIRIES TAB ── */}
        {tab === 'supplier-inquiries' && (
          <div className="space-y-2">
            {supplierInquiries.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">暂无建材商询价记录</p>
            )}
            {supplierInquiries.map(inq => (
              <div key={inq.id} className="px-4 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded px-2 py-0.5 font-medium">
                      {inq.supplier_name}
                    </span>
                    {inq.suburb && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 rounded px-2 py-0.5">
                        📍 {inq.suburb}
                      </span>
                    )}
                    {inq.project_type && (
                      <span className="text-xs text-slate-400 bg-white/5 rounded px-2 py-0.5">{inq.project_type}</span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(inq.created_at).toLocaleString('zh-AU', { timeZone: 'Australia/Sydney', dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">买家</p>
                    <p className="text-sm text-white font-medium">{inq.buyer_name}</p>
                    <a href={`mailto:${inq.buyer_email}`} className="text-xs text-orange-400 flex items-center gap-1 hover:text-orange-300">
                      <Mail className="w-3 h-3" />{inq.buyer_email}
                    </a>
                    {inq.buyer_phone && (
                      <a href={`tel:${inq.buyer_phone}`} className="text-xs text-slate-400 flex items-center gap-1 hover:text-white">
                        <Phone className="w-3 h-3" />{inq.buyer_phone}
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">询价内容</p>
                    <p className="text-sm text-slate-300">{inq.products_needed}</p>
                    {inq.quantity_estimate && <p className="text-xs text-slate-500 mt-0.5">数量：{inq.quantity_estimate}</p>}
                    {inq.timeline && <p className="text-xs text-slate-500 mt-0.5">时间线：{inq.timeline}</p>}
                    {inq.message && <p className="text-xs text-slate-500 mt-0.5 italic">"{inq.message}"</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SEARCHES TAB ── */}
        {tab === 'searches' && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <p className="text-xs text-slate-500">共 {searches.length} 条查询记录（最新500条）</p>
              {/* suburb frequency summary */}
              {searches.length > 0 && (() => {
                const freq: Record<string, number> = {}
                searches.forEach(s => { freq[s.suburb] = (freq[s.suburb] || 0) + 1 })
                const top5 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
                return (
                  <div className="flex flex-wrap gap-2">
                    {top5.map(([suburb, count]) => (
                      <span key={suburb} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
                        {suburb} ×{count}
                      </span>
                    ))}
                  </div>
                )
              })()}
            </div>
            <div className="space-y-1.5">
              {searches.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-white font-medium">{s.suburb}</p>
                      <p className="text-xs text-slate-500">{s.state || '—'} · {s.council || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-300">{s.project_type || 'kdr'}</p>
                      <p className="text-xs text-slate-500">{s.lot_size ? `${s.lot_size} m²` : '未填面积'}</p>
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${scoreColor(s.feasibility_score)}`}>
                        {s.feasibility_score ? `${s.feasibility_score}/10` : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {new Date(s.created_at).toLocaleString('zh-AU', { timeZone: 'Australia/Sydney', dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {searches.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-12">暂无查询记录（新的搜索会自动出现在这里）</p>
              )}
            </div>
          </div>
        )}

        {/* ── FORUM TAB ── */}
        {tab === 'forum' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={selectAllDemo} className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                全选 Demo ({demoPosts})
              </button>
              {selected.size > 0 && (
                <button onClick={deleteSelected} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> 删除选中 ({selected.size})
                </button>
              )}
              <button onClick={deleteAllDemo} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1 ml-auto">
                <Trash2 className="w-3.5 h-3.5" /> 一键清除全部 Demo
              </button>
            </div>
            <div className="space-y-2">
              {posts.map(post => (
                <div key={post.id} onClick={() => toggleSelect(post.id)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${selected.has(post.id) ? 'bg-red-500/10 border border-red-500/30' : 'border border-transparent hover:border-white/10'}`}
                  style={{ background: selected.has(post.id) ? undefined : 'rgba(255,255,255,0.03)' }}
                >
                  <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)} onClick={e => e.stopPropagation()} className="mt-1 accent-orange-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {post.is_demo && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 font-medium">DEMO</span>}
                      <span className="text-xs text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{post.category}</span>
                      {post.city && <span className="text-xs text-blue-400">{post.city}</span>}
                    </div>
                    <p className="text-sm text-white font-medium truncate">{post.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{post.author_name} · {post.reply_count} replies · {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PROFESSIONALS TAB ── */}
        {tab === 'professionals' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={selectAllDemo} className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                全选 Demo ({demoPros})
              </button>
              {selected.size > 0 && (
                <button onClick={deleteSelected} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> 删除选中 ({selected.size})
                </button>
              )}
              <button onClick={deleteAllDemo} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1 ml-auto">
                <Trash2 className="w-3.5 h-3.5" /> 一键清除全部 Demo
              </button>
            </div>
            <div className="space-y-2">
              {professionals.map(pro => (
                <div key={pro.id} style={{ background: selected.has(pro.id) ? undefined : 'rgba(255,255,255,0.03)' }}
                  className={`rounded-xl transition-colors ${selected.has(pro.id) ? 'bg-red-500/10 border border-red-500/30' : 'border border-transparent hover:border-white/10'}`}
                >
                  <div className="flex items-start gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === pro.id ? null : pro.id)}>
                    <input type="checkbox" checked={selected.has(pro.id)} onChange={() => toggleSelect(pro.id)} onClick={e => e.stopPropagation()} className="mt-1 accent-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {pro.is_demo && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 font-medium">DEMO</span>}
                        <span className="text-xs text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{pro.category}</span>
                        <span className="text-xs text-slate-500">{pro.state}</span>
                        <span className={`text-xs rounded px-1.5 py-0.5 ${pro.verified ? 'bg-green-500/20 text-green-400' : pro.verification_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {pro.verified ? '✅ verified' : pro.verification_status}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">{pro.business_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{pro.contact_name} · {pro.email} · {new Date(pro.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleVerify(pro.id, pro.verified) }}
                      title={pro.verified ? '取消认证' : '手动认证'}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${pro.verified ? 'text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-500 hover:bg-green-500/20 hover:text-green-400'}`}
                    >
                      {pro.verified ? <BadgeCheck className="w-5 h-5" /> : <BadgeX className="w-5 h-5" />}
                    </button>
                  </div>
                  {expandedId === pro.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-1 space-y-2 text-xs text-slate-400">
                      <p><span className="text-slate-500">Email:</span> {pro.email}</p>
                      <p><span className="text-slate-500">State:</span> {pro.state} · <span className="text-slate-500">Category:</span> {pro.category}</p>
                      <p><span className="text-slate-500">Status:</span> {pro.verification_status} · Verified: {pro.verified ? 'Yes' : 'No'} · Demo: {pro.is_demo ? 'Yes' : 'No'}</p>
                      <p><span className="text-slate-500">Created:</span> {new Date(pro.created_at).toLocaleString()}</p>
                      {pro.verification_status === 'pending' && (
                        <div className="rounded-xl p-3 mt-2 space-y-1.5" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                          <p className="text-yellow-400 font-semibold text-xs">📋 提交的认证资质</p>
                          {pro.abn && <p><span className="text-slate-500">ABN：</span>{pro.abn}</p>}
                          {pro.license_type && <p><span className="text-slate-500">执照类型：</span>{pro.license_type}</p>}
                          {pro.license_number && <p><span className="text-slate-500">执照号：</span>{pro.license_number}</p>}
                          {pro.years_experience && <p><span className="text-slate-500">从业年限：</span>{pro.years_experience} 年</p>}
                          {pro.verification_submitted_at && <p><span className="text-slate-500">提交时间：</span>{new Date(pro.verification_submitted_at).toLocaleString()}</p>}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => approveRejectPro(pro.id, 'approve')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                            >
                              <BadgeCheck className="w-3.5 h-3.5" /> 批准认证
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('拒绝原因（可选，会发给专业人士）：') ?? undefined
                                approveRejectPro(pro.id, 'reject', reason)
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                            >
                              <BadgeX className="w-3.5 h-3.5" /> 拒绝
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SUPPLIERS TAB ── */}
        {tab === 'suppliers' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              {selected.size > 0 && (
                <button onClick={deleteSelected} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> 删除选中 ({selected.size})
                </button>
              )}
            </div>
            <div className="space-y-2">
              {suppliers.map(sup => (
                <div key={sup.id} style={{ background: selected.has(sup.id) ? undefined : 'rgba(255,255,255,0.03)' }}
                  className={`rounded-xl transition-colors ${selected.has(sup.id) ? 'bg-red-500/10 border border-red-500/30' : 'border border-transparent hover:border-white/10'}`}
                >
                  <div className="flex items-start gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === sup.id ? null : sup.id)}>
                    <input type="checkbox" checked={selected.has(sup.id)} onChange={() => toggleSelect(sup.id)} onClick={e => e.stopPropagation()} className="mt-1 accent-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{sup.category}</span>
                        <span className="text-xs text-slate-500">{sup.origin}</span>
                        <span className={`text-xs rounded px-1.5 py-0.5 ${sup.status === 'verified' ? 'bg-green-500/20 text-green-400' : sup.status === 'unverified' ? 'bg-slate-500/20 text-slate-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {sup.status}
                        </span>
                        {sup.featured && <span className="text-xs bg-orange-500/20 text-orange-400 rounded px-1.5 py-0.5">⭐ featured</span>}
                      </div>
                      <p className="text-sm text-white font-medium">{sup.business_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sup.contact_name} · {sup.email} · {new Date(sup.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={async e => {
                        e.stopPropagation()
                        const newStatus = sup.status === 'verified' ? 'unverified' : 'verified'
                        await fetch('/api/admin/approve-supplier', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
                          body: JSON.stringify({ id: sup.id, action: newStatus === 'verified' ? 'approve' : 'reject' }),
                        })
                        setSuppliers(prev => prev.map(s => s.id === sup.id ? { ...s, status: newStatus } : s))
                        setMessage(`✅ ${sup.business_name} 状态已更新为 ${newStatus}`)
                      }}
                      title={sup.status === 'verified' ? '取消认证' : '手动认证'}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${sup.status === 'verified' ? 'text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-500 hover:bg-green-500/20 hover:text-green-400'}`}
                    >
                      {sup.status === 'verified' ? <BadgeCheck className="w-5 h-5" /> : <BadgeX className="w-5 h-5" />}
                    </button>
                  </div>
                  {expandedId === sup.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-1 space-y-1 text-xs text-slate-400">
                      <p><span className="text-slate-500">Phone:</span> {sup.phone || '—'}</p>
                      <p><span className="text-slate-500">Email:</span> {sup.email}</p>
                      <p><span className="text-slate-500">Website:</span> {sup.website || '—'}</p>
                      <p><span className="text-slate-500">WeChat:</span> {sup.wechat || '—'}</p>
                      <p><span className="text-slate-500">ABN:</span> {sup.abn || '—'}</p>
                      <p><span className="text-slate-500">States:</span> {sup.states?.join(', ') || '—'}</p>
                      <p><span className="text-slate-500">Category:</span> {sup.category} · Origin: {sup.origin}</p>
                      {sup.google_rating && <p><span className="text-slate-500">Google:</span> {sup.google_rating}★ ({sup.google_reviews} reviews)</p>}
                      {sup.description && <p><span className="text-slate-500">Description:</span> {sup.description}</p>}
                      <p><span className="text-slate-500">Created:</span> {new Date(sup.created_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))}
              {suppliers.length === 0 && <p className="text-slate-500 text-sm text-center py-8">暂无建材商数据</p>}
            </div>
          </>
        )}

        {/* ── TENDERS TAB ── */}
        {tab === 'tenders' && (
          <div className="space-y-4">
            {/* Add Tender Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddTender(!showAddTender)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  {showAddTender ? 'Cancel' : '+ Add Tender'}
                </button>
                {selected.size > 0 && (
                  <button onClick={deleteSelected} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                    Delete ({selected.size})
                  </button>
                )}
              </div>
              <span className="text-slate-400 text-sm">
                Total: {adminTenders.length} | Manual: {adminTenders.filter(t => t.source === 'manual' || !['austender'].includes(t.source)).length}
              </span>
            </div>

            {/* Add Tender Form */}
            {showAddTender && (
              <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-bold">Add Tender</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-xs mb-1 block">Title (English) *</label>
                    <input
                      value={tenderForm.title}
                      onChange={e => setTenderForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="e.g. School Building Renovation - Parramatta"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-xs mb-1 block">Description (Chinese)</label>
                    <textarea
                      value={tenderForm.description_zh}
                      onChange={e => setTenderForm(prev => ({ ...prev, description_zh: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      rows={3}
                      placeholder="Chinese summary for the listing"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-xs mb-1 block">Description (English)</label>
                    <textarea
                      value={tenderForm.description_en}
                      onChange={e => setTenderForm(prev => ({ ...prev, description_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      rows={2}
                      placeholder="Optional English description"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Source</label>
                    <select
                      value={tenderForm.source}
                      onChange={e => setTenderForm(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="nsw">NSW eTendering</option>
                      <option value="vic">VIC Buying</option>
                      <option value="qld">QLD QTenders</option>
                      <option value="council">Council</option>
                      <option value="school">School</option>
                      <option value="manual">Other / Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Category</label>
                    <select
                      value={tenderForm.category_name}
                      onChange={e => setTenderForm(prev => ({ ...prev, category_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="Construction">Construction</option>
                      <option value="IT Services">IT Services</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Defence">Defence</option>
                      <option value="Transport">Transport</option>
                      <option value="Environment">Environment</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Agency</label>
                    <input
                      value={tenderForm.agency}
                      onChange={e => setTenderForm(prev => ({ ...prev, agency: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="e.g. NSW Education"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Location</label>
                    <input
                      value={tenderForm.location}
                      onChange={e => setTenderForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="e.g. Sydney, NSW"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Link</label>
                    <input
                      value={tenderForm.link}
                      onChange={e => setTenderForm(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Close Date</label>
                    <input
                      type="date"
                      value={tenderForm.close_date}
                      onChange={e => setTenderForm(prev => ({ ...prev, close_date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={tenderForm.is_construction}
                      onChange={e => setTenderForm(prev => ({ ...prev, is_construction: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label className="text-slate-300 text-sm">Construction related</label>
                  </div>
                </div>
                <button
                  onClick={saveTender}
                  disabled={tenderSaving || !tenderForm.title}
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {tenderSaving ? 'Saving...' : 'Save Tender'}
                </button>
              </div>
            )}

            {/* Tender List */}
            {adminTenders.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">No tenders yet</p>
            )}
            {adminTenders.map(tender => (
              <div
                key={tender.id}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(tender.id)}
                  onChange={() => toggleSelect(tender.id)}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tender.source === 'austender' ? 'bg-blue-900 text-blue-300' :
                      tender.source === 'nsw' ? 'bg-purple-900 text-purple-300' :
                      tender.source === 'council' ? 'bg-green-900 text-green-300' :
                      tender.source === 'school' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {tender.source}
                    </span>
                    {tender.is_construction && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-900 text-orange-300">construction</span>
                    )}
                    {tender.category_name && (
                      <span className="text-slate-500 text-xs">{tender.category_name}</span>
                    )}
                    {tender.published_at && (
                      <span className="text-slate-600 text-xs">{new Date(tender.published_at).toLocaleDateString('en-AU')}</span>
                    )}
                  </div>
                  {tender.description_zh && (
                    <p className="text-slate-200 text-sm mb-1">{tender.description_zh}</p>
                  )}
                  <p className="text-slate-400 text-xs truncate">{tender.title}</p>
                  {tender.link && (
                    <a href={tender.link} target="_blank" rel="noopener noreferrer" className="text-orange-400 text-xs hover:underline mt-1 inline-block">
                      View source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Newsletter Tab ── */}
        {tab === 'newsletter' && (
          <div className="space-y-5">
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-white font-bold mb-4">发送 Newsletter</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">期号 Issue #</label>
                  <input type="number" value={nlForm.issueNumber} onChange={e => setNlForm(f => ({ ...f, issueNumber: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">焦点标题（中文）</label>
                  <input value={nlForm.heroTitle} onChange={e => setNlForm(f => ({ ...f, heroTitle: e.target.value }))} placeholder="例：推倒重建费用全解析..."
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hero Title (English)</label>
                  <input value={nlForm.heroTitleEn} onChange={e => setNlForm(f => ({ ...f, heroTitleEn: e.target.value }))} placeholder="e.g. The real cost of KDR in 2025..."
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">焦点正文（中文）</label>
                  <textarea rows={3} value={nlForm.heroBody} onChange={e => setNlForm(f => ({ ...f, heroBody: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hero Body (English)</label>
                  <textarea rows={3} value={nlForm.heroBodyEn} onChange={e => setNlForm(f => ({ ...f, heroBodyEn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-2 font-semibold">市场速报 Quick Bites（3条）</p>
              {nlForm.quickBites.map((b, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                  <input value={b.zh} onChange={e => setNlForm(f => { const qb = [...f.quickBites]; qb[i] = { ...qb[i], zh: e.target.value }; return { ...f, quickBites: qb } })}
                    placeholder={`速报 ${i + 1}（中文）`} className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input value={b.en} onChange={e => setNlForm(f => { const qb = [...f.quickBites]; qb[i] = { ...qb[i], en: e.target.value }; return { ...f, quickBites: qb } })}
                    placeholder={`Bite ${i + 1} (English)`} className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              ))}

              <p className="text-xs text-slate-400 mb-2 mt-4 font-semibold">省钱建造 Build Smart Tip</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <textarea rows={2} value={nlForm.buildTip.zh} onChange={e => setNlForm(f => ({ ...f, buildTip: { ...f.buildTip, zh: e.target.value } }))}
                  placeholder="提示内容（中文）" className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <textarea rows={2} value={nlForm.buildTip.en} onChange={e => setNlForm(f => ({ ...f, buildTip: { ...f.buildTip, en: e.target.value } }))}
                  placeholder="Tip content (English)" className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <p className="text-xs text-slate-400 mb-2 font-semibold">社区问答（可选）</p>
              <div className="space-y-2 mb-4">
                <input value={nlForm.communityQ.question} onChange={e => setNlForm(f => ({ ...f, communityQ: { ...f.communityQ, question: e.target.value } }))}
                  placeholder="问题 Question" className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <textarea rows={2} value={nlForm.communityQ.answer} onChange={e => setNlForm(f => ({ ...f, communityQ: { ...f.communityQ, answer: e.target.value } }))}
                  placeholder="解答 Answer" className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              {nlResult && <p className="text-sm mb-4" style={{ color: nlResult.startsWith('✅') ? '#4ade80' : '#f87171' }}>{nlResult}</p>}

              <div className="flex gap-3">
                <button onClick={sendNewsletter} disabled={nlSending || !nlForm.heroTitle}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                  style={{ background: '#f97316' }}>
                  {nlSending ? '发送中...' : `🚀 发送给所有订阅者`}
                </button>
                <button onClick={() => setNlPreview(!nlPreview)} className="px-4 py-2.5 rounded-xl text-slate-300 text-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {nlPreview ? '隐藏预览' : '预览邮件'}
                </button>
              </div>
            </div>

            {nlPreview && nlForm.heroTitle && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs text-slate-400 px-4 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>邮件预览（实际发送效果）</p>
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body>${
                    (() => { try {
                      const { renderNewsletter } = require('@/lib/newsletter/template')
                      return renderNewsletter({ ...nlForm, unsubscribeToken: 'preview-token' })
                    } catch { return '<p style="padding:20px;color:#999">预览不可用，保存后部署查看</p>' } }
                    )()
                  }</body></html>`}
                  className="w-full bg-white"
                  style={{ height: '600px', border: 'none' }}
                  title="Newsletter Preview"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
