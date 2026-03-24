'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const CATEGORIES = [
  { id: 'help', zh: '求助', en: 'Help Needed' },
  { id: 'progress', zh: '晒进度', en: 'Build Journal' },
  { id: 'recommendation', zh: '推荐 & 避坑', en: 'Reviews & Tips' },
  { id: 'kdr', zh: '推倒重建', en: 'Knockdown Rebuild' },
  { id: 'renovation', zh: '翻新改造', en: 'Renovation' },
  { id: 'granny-flat', zh: 'Granny Flat', en: 'Granny Flat' },
  { id: 'council', zh: 'Council 审批', en: 'Council Approval' },
  { id: 'builder', zh: '找建筑商', en: 'Finding a Builder' },
  { id: 'materials', zh: '建材选购', en: 'Materials & Products' },
  { id: 'cost', zh: '成本预算', en: 'Costs & Budget' },
  { id: 'experience', zh: '经验分享', en: 'Experiences' },
]

interface Props {
  lang: string
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

export default function NewPostModal({ lang, user, onClose, onSuccess }: Props) {
  const isZh = lang === 'zh'
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('kdr')
  const [city, setCity] = useState('')
  const [suburb, setSuburb] = useState('')
  const [authorName, setAuthorName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('forum_posts').insert({
      title: title.trim(),
      body: body.trim(),
      category,
      city: city || null,
      suburb: suburb.trim() || null,
      author_name: authorName.trim() || (isZh ? '匿名用户' : 'Anonymous'),
      user_id: user?.id ?? null,
    })
    if (err) { setError(err.message); setSubmitting(false); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {isZh ? '发一个新帖' : 'New Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  category === cat.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
              >
                {isZh ? cat.zh : cat.en}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isZh ? '标题（简洁描述你的问题或经历）' : 'Title — describe your question or experience'}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
          />

          {/* Body */}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={isZh ? '详细描述……背景、遇到的问题、想知道什么' : 'Share details — context, what happened, what you want to know…'}
            required
            rows={5}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 resize-none"
          />

          {/* City + Suburb */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
            >
              <option value="">{isZh ? '📍 城市（可选）' : '📍 City (optional)'}</option>
              <option value="sydney">{isZh ? '悉尼' : 'Sydney'}</option>
              <option value="melbourne">{isZh ? '墨尔本' : 'Melbourne'}</option>
              <option value="brisbane">{isZh ? '布里斯班' : 'Brisbane'}</option>
              <option value="perth">{isZh ? '珀斯' : 'Perth'}</option>
              <option value="adelaide">{isZh ? '阿德莱德' : 'Adelaide'}</option>
              <option value="gold-coast">{isZh ? '黄金海岸' : 'Gold Coast'}</option>
              <option value="newcastle">{isZh ? '纽卡斯尔' : 'Newcastle'}</option>
              <option value="darwin">{isZh ? '达尔文' : 'Darwin'}</option>
              <option value="other">{isZh ? '其他城市' : 'Other'}</option>
            </select>
            <input
              type="text"
              value={suburb}
              onChange={e => setSuburb(e.target.value)}
              placeholder={isZh ? '具体区域（可选）' : 'Suburb (optional)'}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Name */}
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder={isZh ? '昵称（留空为匿名）' : 'Name (leave blank for anonymous)'}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !title.trim() || !body.trim()}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isZh ? '发布帖子' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
