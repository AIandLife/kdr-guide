'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye, EyeOff, RefreshCw, Database, Tag } from 'lucide-react'
import { SUPPLIERS } from '@/lib/suppliers-data'

interface SupplierRow {
  id: string
  created_at: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  wechat: string | null
  abn: string | null
  category: string
  origin: string
  description: string | null
  states: string[]
  specialties: string[]
  status: string
  asic_number: string | null
  business_license_note: string | null
  verification_note: string | null
  admin_notes: string | null
  verified_at: string | null
}

const STATUS_STYLES: Record<string, string> = {
  unverified:     'bg-gray-500/20 text-gray-400',
  pending_review: 'bg-yellow-500/20 text-yellow-400',
  verified:       'bg-green-500/20 text-green-400',
  rejected:       'bg-red-500/20 text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  unverified:     'Unverified',
  pending_review: 'Pending Review',
  verified:       'Verified',
  rejected:       'Rejected',
}

export default function AdminSuppliersPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function load(sk: string) {
    setLoading(true)
    const res = await fetch('/api/admin/suppliers/list', {
      headers: { 'x-admin-secret': sk },
    })
    if (res.status === 401) {
      setMessage('Wrong password.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setSuppliers(data.suppliers || [])
    setAuthed(true)
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id + action)
    const res = await fetch('/api/admin/approve-supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, action, adminNotes: notes[id] || '' }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage(`✅ ${action === 'approve' ? 'Approved' : 'Rejected'} — email sent.`)
      await load(secret)
    } else {
      setMessage(`Error: ${data.error}`)
    }
    setActionLoading(null)
  }

  const filtered = filter === 'all' ? suppliers : suppliers.filter(s => s.status === filter)

  const counts = {
    all: suppliers.length,
    unverified: suppliers.filter(s => s.status === 'unverified').length,
    pending_review: suppliers.filter(s => s.status === 'pending_review').length,
    verified: suppliers.filter(s => s.status === 'verified').length,
    rejected: suppliers.filter(s => s.status === 'rejected').length,
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-bold text-white mb-6 text-center">澳洲建房圈 Admin</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(secret)}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {message && <p className="text-red-400 text-sm mb-3">{message}</p>}
          <button
            onClick={() => load(secret)}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-colors"
            style={{ background: '#f97316' }}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1117', color: '#e2e8f0' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Supplier Listings Admin</h1>
          <button onClick={() => load(secret)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Curated directory stats */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-white">Curated Supplier Directory</span>
            <span className="text-xs text-slate-500">(static data, not DB submissions)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Listings', value: SUPPLIERS.length, color: '#f97316' },
              { label: 'Real Businesses', value: SUPPLIERS.filter(s => s.seeded === true).length, color: '#22c55e' },
              { label: 'Placeholders', value: SUPPLIERS.filter(s => s.seeded === false).length, color: '#94a3b8' },
              { label: 'Featured', value: SUPPLIERS.filter(s => s.featured).length, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUPPLIERS.filter(s => s.seeded === false).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Tag className="w-3 h-3" /> {s.name}
              </span>
            ))}
            {SUPPLIERS.filter(s => s.seeded === false).length > 0 && (
              <span className="text-xs text-slate-500 self-center">← placeholders to replace with real businesses</span>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c' }}>
            {message}
          </div>
        )}

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={filter === key ? { background: '#f97316', color: 'white' } : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            >
              {key === 'all' ? 'All' : STATUS_LABELS[key]} ({count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-center py-12">No listings found.</p>
          )}
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Row header */}
              <div className="flex items-center gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{s.business_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{s.category}</span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{s.origin}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {s.contact_name} · {s.email} · {new Date(s.created_at).toLocaleDateString('en-AU')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(s.status === 'pending_review' || s.status === 'unverified') && (
                    <>
                      <button
                        onClick={() => handleAction(s.id, 'approve')}
                        disabled={actionLoading === s.id + 'approve'}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === s.id + 'approve' ? '…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(s.id, 'reject')}
                        disabled={actionLoading === s.id + 'reject'}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                      >
                        <XCircle className="w-4 h-4" />
                        {actionLoading === s.id + 'reject' ? '…' : 'Reject'}
                      </button>
                    </>
                  )}
                  {s.status === 'verified' && (
                    <span className="flex items-center gap-1 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" /> Active
                    </span>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {expanded === s.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === s.id && (
                <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {[
                      ['Phone', s.phone],
                      ['Website', s.website],
                      ['WeChat', s.wechat],
                      ['ABN', s.abn],
                      ['ASIC / Registration', s.asic_number],
                      ['States', s.states?.join(', ')],
                    ].map(([label, val]) => val ? (
                      <div key={label as string}>
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className="text-sm text-white break-all">{val as string}</p>
                      </div>
                    ) : null)}
                  </div>
                  {s.description && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Description</p>
                      <p className="text-sm text-slate-300">{s.description}</p>
                    </div>
                  )}
                  {(s.business_license_note || s.verification_note) && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                      <p className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Verification documents
                      </p>
                      {s.business_license_note && <p className="text-sm text-slate-300">{s.business_license_note}</p>}
                      {s.verification_note && <p className="text-sm text-slate-300 mt-1">{s.verification_note}</p>}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Admin notes (sent in email)</p>
                    <textarea
                      value={notes[s.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [s.id]: e.target.value }))}
                      placeholder="Optional notes for the supplier…"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
