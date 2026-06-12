'use client'

/**
 * 微信 H5 商家入驻页 — /ruzhu
 *
 * Designed for the WeChat in-app browser (~375px), reached via QR code in
 * WeChat groups. Deliberately different from /join:
 *   - NO login wall (biggest drop-off killer in WeChat)
 *   - Chinese only, mobile-first, large touch targets
 *   - WeChat ID is the primary contact field
 *   - Posts to the same /api/join pipeline (status=pending, admin review)
 */

import { useState } from 'react'
import {
  CheckCircle, Loader2, ChevronRight,
  HardHat, PenTool, FileText, Hammer, Ruler, Zap, Droplets, DollarSign, Briefcase, Paintbrush,
} from 'lucide-react'

const CATEGORIES = [
  { id: 'Builder', label: '建筑商 Builder', icon: HardHat },
  { id: 'Building Designer', label: '设计师 / 建筑师', icon: PenTool },
  { id: 'Town Planner', label: '城市规划师', icon: FileText },
  { id: 'Demolition', label: '拆房', icon: Hammer },
  { id: 'Structural Engineer', label: '结构工程师', icon: Ruler },
  { id: 'Electrician', label: '电工', icon: Zap },
  { id: 'Plumber', label: '水管工', icon: Droplets },
  { id: 'Finance Broker', label: '贷款经纪', icon: DollarSign },
  { id: 'Surveyor', label: '测量师', icon: Briefcase },
  { id: 'Other', label: '其他（瓦工/油漆/园艺…）', icon: Paintbrush },
]

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT', 'All Australia']

const track = (name: string, params?: Record<string, unknown>) => {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', name, params)
  } catch { /* analytics must never break the form */ }
}

export default function RuzhuPage() {
  const [form, setForm] = useState({
    category: '', businessName: '', contactName: '', wechat: '',
    phone: '', email: '', state: 'NSW', regions: '', description: '',
    languages: 'both',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { setError('请先选择你的业务类别'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone || undefined,
          wechat: form.wechat,
          state: form.state,
          category: form.category,
          regions: form.regions.split(/[,，、]/).map(r => r.trim()).filter(Boolean),
          description: form.description || undefined,
          languages: form.languages === 'both' ? ['Mandarin', 'English'] : ['Mandarin'],
          source: 'wechat_h5',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失败，请稍后再试')
      track('merchant_join_submitted', { category: form.category, state: form.state, source: 'wechat_h5' })
      setDone(true)
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  // 16px+ font on inputs prevents iOS auto-zoom inside the WeChat browser
  const inputClass = 'w-full px-4 py-3.5 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto px-5 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">提交成功！</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            我们会尽快审核（通常 1-2 个工作日）。审核通过后，
            <strong className="text-gray-700">{form.businessName}</strong> 会展示在
            「找专业人士」目录中，正在规划建房的业主可以直接联系你。
          </p>
          <div className="rounded-2xl bg-white border border-gray-200 p-5 text-left mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">接下来：</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex gap-2"><span>📋</span><span>审核结果会发到 <strong>{form.email}</strong></span></li>
              <li className="flex gap-2"><span>🎁</span><span>前 3 个月免费展示，不绑卡、不自动扣费</span></li>
              <li className="flex gap-2"><span>📞</span><span>业主询盘会直接发给你</span></li>
            </ul>
          </div>
          <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5">
            <p className="text-sm text-gray-700 leading-relaxed">
              👋 群里有同行也在做建房相关生意？<br />
              <strong>把这个页面转发给他们</strong>，早入驻早展示。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-50 to-gray-50 px-5 pt-8 pb-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
            2 分钟入驻<br />让找建房服务的业主找到你
          </h1>
          <p className="text-sm text-gray-500 mb-4">澳洲建房圈 · 建房服务商目录</p>
          <div className="flex justify-center gap-2 flex-wrap text-xs">
            {['✅ 免费收录', '🎁 前 3 个月免费', '📞 询盘直达'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-white border border-orange-200 text-gray-700 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-5 pb-12 space-y-5">
        {error && (
          <div className="rounded-xl p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
        )}

        {/* Category */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">你是做什么的？ <span className="text-red-500">*</span></h2>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id} type="button"
                onClick={() => { set('category', cat.id); setError('') }}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                  form.category === cat.id
                    ? 'text-orange-600 bg-orange-50 border-2 border-orange-400'
                    : 'text-gray-600 bg-gray-50 border-2 border-gray-100'
                }`}
              >
                <cat.icon className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">基本信息</h2>
          <div>
            <label className={labelClass}>公司 / 商号名称 <span className="text-red-500">*</span></label>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
              placeholder="中文或英文都可以" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>怎么称呼你 <span className="text-red-500">*</span></label>
            <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
              placeholder="例如：张师傅 / Kevin" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>微信号 <span className="text-red-500">*</span></label>
            <input value={form.wechat} onChange={e => set('wechat', e.target.value)}
              placeholder="业主主要通过微信联系你" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>手机号</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="04XX XXX XXX（选填）" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>邮箱 <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="用于接收审核结果和业主询盘" required className={inputClass} />
          </div>
        </div>

        {/* Service area */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">服务范围</h2>
          <div>
            <label className={labelClass}>主要在哪个州 <span className="text-red-500">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {STATES.map(s => (
                <button key={s} type="button" onClick={() => set('state', s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.state === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                  {s === 'All Australia' ? '全澳' : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>主要服务区域</label>
            <input value={form.regions} onChange={e => set('regions', e.target.value)}
              placeholder="例如：Sydney 全城 / Parramatta, Blacktown" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>服务语言</label>
            <div className="flex gap-2">
              {[
                { id: 'both', label: '中英都行' },
                { id: 'zh', label: '主要说中文' },
              ].map(opt => (
                <button key={opt.id} type="button" onClick={() => set('languages', opt.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.languages === opt.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-1.5">一句话介绍（选填）</h2>
          <p className="text-xs text-gray-400 mb-3">随便写两句就行，AI 会帮你整理成专业介绍</p>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="例如：做了 10 年 granny flat，悉尼西区为主，有 Builder 牌照"
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
            ? <><Loader2 className="w-5 h-5 animate-spin" /> 提交中...</>
            : <><ChevronRight className="w-5 h-5" /> 免费提交入驻</>}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          提交即表示同意我们审核并展示你的商家信息。<br />
          前 3 个月免费，不需要绑卡，到期前我们会先联系你。
        </p>
      </form>
    </div>
  )
}

function Header() {
  return (
    <div className="bg-white border-b border-gray-100 px-5 py-3.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <span className="font-bold text-gray-900">🏗️ 澳洲建房圈</span>
        <span className="text-xs text-gray-400">ausbuildcircle.com</span>
      </div>
    </div>
  )
}
