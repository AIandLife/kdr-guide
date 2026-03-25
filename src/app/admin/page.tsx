'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, ExternalLink, BadgeCheck, BadgeX } from 'lucide-react'

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

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'forum' | 'professionals'>('forum')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function login() {
    setLoading(true)
    setMessage('')
    const [r1, r2] = await Promise.all([
      fetch('/api/admin/forum', { headers: { 'x-admin-secret': secret } }),
      fetch('/api/admin/professionals-list', { headers: { 'x-admin-secret': secret } }),
    ])
    if (r1.status === 401) { setMessage('Wrong password.'); setLoading(false); return }
    const [d1, d2] = await Promise.all([r1.json(), r2.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
    setAuthed(true)
    setLoading(false)
  }

  async function reload() {
    setLoading(true)
    const [r1, r2] = await Promise.all([
      fetch('/api/admin/forum', { headers: { 'x-admin-secret': secret } }),
      fetch('/api/admin/professionals-list', { headers: { 'x-admin-secret': secret } }),
    ])
    const [d1, d2] = await Promise.all([r1.json(), r2.json()])
    setPosts(d1.posts || [])
    setProfessionals(d2.professionals || [])
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

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-bold text-white mb-2 text-center">澳洲建房圈 Admin</h1>
          <p className="text-slate-500 text-sm text-center mb-6">Forum &amp; Professionals</p>
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

  return (
    <div className="min-h-screen" style={{ background: '#0d1117', color: '#e2e8f0' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">澳洲建房圈 Admin</h1>
            <p className="text-slate-400 text-sm mt-1">
              Forum: {posts.length} posts ({demoPosts} demo) · Professionals: {professionals.length} ({demoPros} demo)
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
        <div className="flex gap-2 mb-6">
          {(['forum', 'professionals'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(new Set()) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'forum' ? `论坛帖子 (${posts.length})` : `专业人士 (${professionals.length})`}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={selectAllDemo}
            className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
          >
            全选 Demo ({tab === 'forum' ? demoPosts : demoPros})
          </button>
          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> 删除选中 ({selected.size})
            </button>
          )}
          <button
            onClick={deleteAllDemo}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> 一键清除全部 Demo
          </button>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {message}
          </div>
        )}

        {/* Forum Posts */}
        {tab === 'forum' && (
          <div className="space-y-2">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => toggleSelect(post.id)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  selected.has(post.id)
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'border border-transparent hover:border-white/10'
                }`}
                style={{ background: selected.has(post.id) ? undefined : 'rgba(255,255,255,0.03)' }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-1 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {post.is_demo && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 font-medium">DEMO</span>
                    )}
                    <span className="text-xs text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{post.category}</span>
                    {post.city && <span className="text-xs text-blue-400">{post.city}</span>}
                  </div>
                  <p className="text-sm text-white font-medium truncate">{post.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{post.author_name} · {post.reply_count} replies · {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Professionals */}
        {tab === 'professionals' && (
          <div className="space-y-2">
            {professionals.map(pro => (
              <div
                key={pro.id}
                onClick={() => toggleSelect(pro.id)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  selected.has(pro.id)
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'border border-transparent hover:border-white/10'
                }`}
                style={{ background: selected.has(pro.id) ? undefined : 'rgba(255,255,255,0.03)' }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(pro.id)}
                  onChange={() => toggleSelect(pro.id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-1 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {pro.is_demo && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 font-medium">DEMO</span>
                    )}
                    <span className="text-xs text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{pro.category}</span>
                    <span className="text-xs text-slate-500">{pro.state}</span>
                    <span className={`text-xs rounded px-1.5 py-0.5 ${
                      pro.verified ? 'bg-green-500/20 text-green-400' :
                      pro.verification_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{pro.verified ? '✅ verified' : pro.verification_status}</span>
                  </div>
                  <p className="text-sm text-white font-medium">{pro.business_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pro.contact_name} · {pro.email} · {new Date(pro.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleVerify(pro.id, pro.verified) }}
                  title={pro.verified ? '取消认证' : '手动认证'}
                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                    pro.verified
                      ? 'text-green-400 hover:bg-red-500/20 hover:text-red-400'
                      : 'text-slate-500 hover:bg-green-500/20 hover:text-green-400'
                  }`}
                >
                  {pro.verified ? <BadgeCheck className="w-5 h-5" /> : <BadgeX className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
