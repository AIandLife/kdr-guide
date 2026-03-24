'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, ChevronRight, MapPin, BadgeCheck, Flame, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import NewPostModal from './NewPostModal'

const CATEGORIES = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'kdr', zh: '推倒重建', en: 'Knockdown Rebuild' },
  { id: 'renovation', zh: '翻新改造', en: 'Renovation' },
  { id: 'granny-flat', zh: 'Granny Flat', en: 'Granny Flat' },
  { id: 'council', zh: 'Council 审批', en: 'Council Approval' },
  { id: 'builder', zh: '找建筑商', en: 'Finding a Builder' },
  { id: 'cost', zh: '成本预算', en: 'Costs & Budget' },
  { id: 'experience', zh: '经验分享', en: 'Experiences' },
]

interface Post {
  id: string
  title: string
  body: string
  category: string
  suburb: string | null
  author_name: string
  author_badge: string | null
  author_business: string | null
  reply_count: number
  upvotes: number
  pinned: boolean
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

function AuthorBadge({ badge, business, lang }: { badge: string | null; business: string | null; lang: string }) {
  if (!badge) return null
  if (badge === 'verified_pro') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
        <BadgeCheck className="w-3 h-3" />
        {business || (lang === 'zh' ? '认证专业人士' : 'Verified Pro')}
      </span>
    )
  }
  if (badge === 'owner') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5 font-medium">
        {lang === 'zh' ? '已建房' : 'Built'}
      </span>
    )
  }
  return null
}

export default function ForumPage() {
  const { lang } = useLang()
  const { user } = useAuth()
  const isZh = lang === 'zh'
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  const fetchPosts = async () => {
    const supabase = createClient()
    let q = supabase
      .from('forum_posts')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    if (activeCategory !== 'all') q = q.eq('category', activeCategory)
    const { data } = await q
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [activeCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/forum" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isZh ? '建房圈社区' : 'Build Community'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isZh ? '已建房的业主分享经验，专业人士在线答疑' : 'Homeowners share experiences, professionals answer questions'}
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {isZh ? '发帖' : 'New Post'}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {isZh ? cat.zh : cat.en}
            </button>
          ))}
        </div>

        {/* Post list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse h-24" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 mb-4">{isZh ? '还没有帖子，来发第一帖吧' : 'No posts yet — be the first!'}</p>
            <button onClick={() => setShowNew(true)} className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              {isZh ? '发帖 →' : 'Post →'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <a
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-white rounded-2xl p-5 border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {post.pinned && (
                        <span className="text-xs bg-red-50 text-red-500 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                          {isZh ? '置顶' : 'Pinned'}
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                        {CATEGORIES.find(c => c.id === post.category)?.[isZh ? 'zh' : 'en'] ?? post.category}
                      </span>
                      {post.suburb && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{post.suburb}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{post.body}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="text-xs text-gray-500 font-medium">{post.author_name}</span>
                      <AuthorBadge badge={post.author_badge} business={post.author_business} lang={lang} />
                      <span className="text-xs text-gray-400 flex items-center gap-0.5 ml-auto">
                        <Clock className="w-3 h-3" />{timeAgo(post.created_at, isZh)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0 ml-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.reply_count}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{post.upvotes}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <NewPostModal
          lang={lang}
          user={user}
          onClose={() => setShowNew(false)}
          onSuccess={() => { setShowNew(false); fetchPosts() }}
        />
      )}
    </div>
  )
}
