'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, ExternalLink, BadgeCheck, BadgeX, Phone, Mail } from 'lucide-react'

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

type Tab = 'forum' | 'professionals' | 'leads' | 'searches'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('leads')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [searches, setSearches] = useState<Search[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function login() {
    setLoading(true)
    setMessage('')
    const headers = { 'x-admin-secret': secret }
    const [r1, r2, r3, r4] = await Promise.all([
      fetch('/api/admin/forum', { headers }),
      fetch('/api/admin/professionals-list', { headers }),
      fetch('/api/admin/leads', { headers }),
      fetch('/api/admin/searches', { headers }),
    ])
    if (r1.status === 401) { setMessage('Wrong password.'); setLoading(false); return }
    const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
    setLeads(d3.leads || [])
    setSearches(d4.searches || [])
    setAuthed(true)
    setLoading(false)
  }

  async function reload() {
    setLoading(true)
    const headers = { 'x-admin-secret': secret }
    const [r1, r2, r3, r4] = await Promise.all([
      fetch('/api/admin/forum', { headers }),
      fetch('/api/admin/professionals-list', { headers }),
      fetch('/api/admin/leads', { headers }),
      fetch('/api/admin/searches', { headers }),
    ])
    const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
    setLeads(d3.leads || [])
    setSearches(d4.searches || [])
    setSelected(new Set())
    setLoading(false)
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} item(s)?`)) return
    const ids = Array.from(selected)
    const url = tab === 'forum' ? '/api/admin/forum' : '/api/admin/professionals-list'
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ ids }),
    })
    const data = await res.json()
    if (data.success) { setMessage(`✅ Deleted ${ids.length} item(s).`); await reload() }
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

  async function deleteAllDemo() {
    const items = tab === 'forum'
      ? posts.filter(p => p.is_demo).map(p => p.id)
      : professionals.filter(p => p.is_demo).map(p => p.id)
    if (items.length === 0) { setMessage('No demo data to delete.'); return }
    if (!confirm(`Delete ALL ${items.length} demo items?`)) return
    const url = tab === 'forum' ? '/api/admin/forum' : '/api/admin/professionals-list'
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
          <h1 className="text-xl font-bold text-white mb-2 text-center">澳洲建房圈 Admin</h1>
          <p className="text-slate-500 text-sm text-center mb-6">Forum · Professionals · Leads · Searches</p>
          <input
            type="password"
            placeholder="Admin password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {message && <p className="text-red-400 text-sm mb-3">{message}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold"
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

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'leads', label: '线索', count: leads.length },
    { id: 'searches', label: '查询记录', count: searches.length },
    { id: 'forum', label: '论坛帖子', count: posts.length },
    { id: 'professionals', label: '专业人士', count: professionals.length },
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
            <a href="/admin/suppliers" className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> Suppliers
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelected(new Set()) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label} ({t.count})
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
                <div key={pro.id} onClick={() => toggleSelect(pro.id)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${selected.has(pro.id) ? 'bg-red-500/10 border border-red-500/30' : 'border border-transparent hover:border-white/10'}`}
                  style={{ background: selected.has(pro.id) ? undefined : 'rgba(255,255,255,0.03)' }}
                >
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
