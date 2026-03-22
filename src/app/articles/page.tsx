'use client'

import { useState } from 'react'
import { ArrowLeft, Building2, Clock, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import { ARTICLES, CATEGORY_LABELS, type ArticleCategory } from '@/lib/articles-data'

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  pink:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export default function ArticlesPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'

  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory)

  const categories = Object.entries(CATEGORY_LABELS) as [ArticleCategory, typeof CATEGORY_LABELS[ArticleCategory]][]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isZh
      ? `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0d1117 100%)' }}>
      {/* Nav */}
      <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.nav.home}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            {isZh ? 'KDR 知识库' : 'KDR Knowledge Hub'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            {isZh
              ? '推倒重建的实用指南、真实案例和专业建议，帮助你做出更明智的决策。'
              : 'Practical guides, real case studies, and expert advice to help you navigate your knockdown rebuild with confidence.'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeCategory === 'all'
              ? { background: '#f97316', color: 'white' }
              : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {isZh ? '全部' : 'All'}
          </button>
          {categories.map(([key, cat]) => {
            const active = activeCategory === key
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={active
                  ? { background: '#f97316', color: 'white' }
                  : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {isZh ? cat.zh : cat.en}
              </button>
            )
          })}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(article => {
            const cat = CATEGORY_LABELS[article.category]
            const colorClass = COLOR_MAP[cat.color]
            return (
              <a
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Category badge */}
                  <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-4 ${colorClass}`}>
                    {isZh ? cat.zh : cat.en}
                  </div>

                  <h2 className="font-bold text-white text-lg leading-snug mb-3 group-hover:text-orange-300 transition-colors flex-1">
                    {isZh ? article.titleZh : article.title}
                  </h2>

                  <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">
                    {isZh ? article.excerptZh : article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {isZh ? `${article.readMinutes} 分钟阅读` : `${article.readMinutes} min read`}
                    </div>
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>

                <div className="px-6 pb-5">
                  <div className="flex items-center gap-1 text-sm font-medium text-orange-400 group-hover:gap-2 transition-all">
                    {isZh ? '阅读文章' : 'Read article'}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isZh ? '准备好查询你的地块了吗？' : 'Ready to check your block?'}
          </h2>
          <p className="text-slate-400 mb-6">
            {isZh
              ? '把所有知识化为行动——输入你的区域，获取 AI 可行性报告。'
              : 'Turn knowledge into action — get a personalised AI feasibility report for your suburb.'}
          </p>
          <a
            href="/feasibility"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
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
