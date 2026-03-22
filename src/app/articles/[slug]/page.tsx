'use client'

import { use } from 'react'
import { ArrowLeft, Building2, Clock, ChevronRight, Tag } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import { ARTICLES, CATEGORY_LABELS } from '@/lib/articles-data'

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  pink:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'

  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="text-center">
          <p className="text-slate-400 text-xl mb-4">{isZh ? '文章未找到' : 'Article not found'}</p>
          <a href="/articles" className="text-orange-400 hover:text-orange-300">{isZh ? '返回文章列表' : 'Back to articles'}</a>
        </div>
      </div>
    )
  }

  const cat = CATEGORY_LABELS[article.category]
  const colorClass = COLOR_MAP[cat.color]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isZh
      ? `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const related = ARTICLES
    .filter(a => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0d1117 100%)' }}>
      {/* Nav */}
      <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/articles" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isZh ? '所有文章' : 'All Articles'}
            </a>
            <div className="w-px h-5 bg-gray-700" />
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">{t.nav.brand}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <a href="/feasibility" className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20">
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {isZh ? cat.zh : cat.en}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {isZh ? `${article.readMinutes} 分钟阅读` : `${article.readMinutes} min read`}
          </div>
          <span className="text-xs text-slate-600">{formatDate(article.date)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          {isZh ? article.titleZh : article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-slate-400 leading-relaxed mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {isZh ? article.excerptZh : article.excerpt}
        </p>

        {/* Author line */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <span className="text-orange-400 text-sm font-bold">{article.author[0]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{article.author}</p>
            <p className="text-xs text-slate-500">{isZh ? article.authorRoleZh : article.authorRole}</p>
          </div>
        </div>

        {/* Article content */}
        <div
          className="prose-article"
          style={{ color: '#cbd5e1' }}
          dangerouslySetInnerHTML={{ __html: isZh ? article.contentZh : article.content }}
        />

        {/* Tags */}
        <div className="mt-10 pt-8 flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Tag className="w-4 h-4 text-slate-500" />
          {(isZh ? article.tagsZh : article.tags).map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-white mb-5">
              {isZh ? '相关文章' : 'Related Articles'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <a
                  key={rel.slug}
                  href={`/articles/${rel.slug}`}
                  className="rounded-xl p-4 transition-all hover:-translate-y-0.5 group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <p className="text-sm font-semibold text-white leading-snug mb-2 group-hover:text-orange-300 transition-colors">
                    {isZh ? rel.titleZh : rel.title}
                  </p>
                  <p className="text-xs text-slate-500">{isZh ? `${rel.readMinutes} 分钟` : `${rel.readMinutes} min`}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <h2 className="text-xl font-bold text-white mb-2">
            {isZh ? '查询你的地块可行性' : 'Check Your Block\'s Feasibility'}
          </h2>
          <p className="text-slate-400 text-sm mb-5">
            {isZh ? '免费 AI 报告，2 分钟内出结果。覆盖全澳 537 个 Council。' : 'Free AI report in under 2 minutes. All 537 Australian councils covered.'}
          </p>
          <a
            href="/feasibility"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 24px rgba(249,115,22,0.3)' }}
          >
            {t.nav.cta}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
