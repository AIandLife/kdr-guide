'use client'

import { useState } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { ARTICLES, CATEGORY_LABELS, type ArticleCategory } from '@/lib/articles-data'

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  green:  'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink:   'bg-pink-100 text-pink-700 border-pink-200',
  cyan:   'bg-cyan-100 text-cyan-700 border-cyan-200',
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
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/articles" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isZh ? '建房攻略' : 'Build Knowledge Hub'}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
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
              : { background: 'white', color: '#374151', border: '1px solid #e5e7eb' }}
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
                  : { background: 'white', color: '#374151', border: '1px solid #e5e7eb' }}
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
                className="group flex flex-col rounded-2xl overflow-hidden transition-all bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-orange-200"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Category badge */}
                  <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-4 ${colorClass}`}>
                    {isZh ? cat.zh : cat.en}
                  </div>

                  <h2 className="font-bold text-gray-900 text-lg leading-snug mb-3 group-hover:text-orange-500 transition-colors flex-1">
                    {isZh ? article.titleZh : article.title}
                  </h2>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                    {isZh ? article.excerptZh : article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {isZh ? `${article.readMinutes} 分钟阅读` : `${article.readMinutes} min read`}
                    </div>
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>

                <div className="px-6 pb-5">
                  <div className="flex items-center gap-1 text-sm font-medium text-orange-500 group-hover:gap-2 transition-all">
                    {isZh ? '阅读文章' : 'Read article'}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-2xl p-8 text-center bg-orange-50 border border-orange-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isZh ? '准备好查询你的地块了吗？' : 'Ready to check your block?'}
          </h2>
          <p className="text-gray-500 mb-6">
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
