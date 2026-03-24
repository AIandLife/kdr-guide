'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MessageSquare, BadgeCheck, Clock, MapPin, Loader2, Send, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  kdr: { zh: '推倒重建', en: 'Knockdown Rebuild' },
  renovation: { zh: '翻新改造', en: 'Renovation' },
  'granny-flat': { zh: 'Granny Flat', en: 'Granny Flat' },
  council: { zh: 'Council 审批', en: 'Council Approval' },
  builder: { zh: '找建筑商', en: 'Finding a Builder' },
  cost: { zh: '成本预算', en: 'Costs & Budget' },
  experience: { zh: '经验分享', en: 'Experiences' },
}

interface Post {
  id: string
  title: string
  body: string
  category: string
  suburb: string | null
  author_name: string
  author_badge: string | null
  author_business: string | null
  user_id: string | null
  reply_count: number
  upvotes: number
  created_at: string
}

interface Reply {
  id: string
  body: string
  author_name: string
  author_badge: string | null
  author_business: string | null
  user_id: string | null
  upvotes: number
  created_at: string
}

function timeAgo(iso: string, zh: boolean) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return zh ? `${mins}分钟前` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return zh ? `${hrs}小时前` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return zh ? `${days}天前` : `${days}d ago`
  return zh ? `${Math.floor(days / 30)}个月前` : `${Math.floor(days / 30)}mo ago`
}

function AuthorBlock({ name, badge, business, lang, compact = false }: {
  name: string; badge: string | null; business: string | null; lang: string; compact?: boolean
}) {
  const isZh = lang === 'zh'
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'mb-1'}`}>
      <span className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>{name}</span>
      {badge === 'verified_pro' && (
        <>
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
            <BadgeCheck className="w-3 h-3" />
            {isZh ? '认证专业人士' : 'Verified Pro'}
          </span>
          {business && (
            <span className="text-xs text-blue-600 font-medium">{business}</span>
          )}
          <a
            href={`/professionals?q=${encodeURIComponent(business || name)}`}
            className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium border border-orange-200 rounded-full px-2 py-0.5 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {isZh ? '查看主页' : 'View profile'}
          </a>
        </>
      )}
      {badge === 'owner' && (
        <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5 font-medium">
          {isZh ? '已建房' : 'Built'}
        </span>
      )}
    </div>
  )
}

function PostDetail() {
  const params = useParams()
  const id = params?.id as string
  const { lang } = useLang()
  const { user } = useAuth()
  const isZh = lang === 'zh'

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyBody, setReplyBody] = useState('')
  const [replyName, setReplyName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('forum_posts').select('*').eq('id', id).single(),
      supabase.from('forum_replies').select('*').eq('post_id', id).order('created_at', { ascending: true }),
    ]).then(([{ data: p }, { data: r }]) => {
      setPost(p)
      setReplies(r ?? [])
      setLoading(false)
    })
  }, [id])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyBody.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('forum_replies').insert({
      post_id: id,
      body: replyBody.trim(),
      author_name: replyName.trim() || (isZh ? '匿名用户' : 'Anonymous'),
      user_id: user?.id ?? null,
    })
    if (!error) {
      // reply_count updated via DB trigger or manually — skip RPC
      const { data: r } = await supabase.from('forum_replies').select('*').eq('post_id', id).order('created_at', { ascending: true })
      setReplies(r ?? [])
      setReplyBody('')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">{isZh ? '帖子不存在' : 'Post not found'}</p>
    </div>
  )

  const catLabel = CATEGORY_LABELS[post.category]
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/forum" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <a href="/forum" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isZh ? '返回社区' : 'Back to community'}
        </a>

        {/* Post */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {catLabel ? (isZh ? catLabel.zh : catLabel.en) : post.category}
            </span>
            {post.suburb && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />{post.suburb}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-5">{post.body}</p>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <AuthorBlock name={post.author_name} badge={post.author_badge} business={post.author_business} lang={lang} />
            <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />{timeAgo(post.created_at, isZh)}
            </span>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 px-1">
            {isZh ? `${replies.length} 条回复` : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
          </h2>
          {replies.map(reply => (
            <div key={reply.id} className={`rounded-2xl border p-4 ${
              reply.author_badge === 'verified_pro'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200'
            }`}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{reply.body}</p>
              <div className="flex items-center gap-3">
                <AuthorBlock name={reply.author_name} badge={reply.author_badge} business={reply.author_business} lang={lang} compact />
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />{timeAgo(reply.created_at, isZh)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reply form */}
        <form onSubmit={handleReply} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            {isZh ? '写回复' : 'Write a reply'}
          </h3>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder={isZh ? '分享你的经验或建议……' : 'Share your experience or advice…'}
            rows={4}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 resize-none mb-3"
          />
          <div className="flex gap-3">
            <input
              type="text"
              value={replyName}
              onChange={e => setReplyName(e.target.value)}
              placeholder={isZh ? '昵称（留空为匿名）' : 'Name (optional)'}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              disabled={submitting || !replyBody.trim()}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isZh ? '回复' : 'Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ForumPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    }>
      <PostDetail />
    </Suspense>
  )
}
