'use client'

import { use } from 'react'
import { Clock, ChevronRight, Tag } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { ARTICLES, CATEGORY_LABELS } from '@/lib/articles-data'

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  green:  'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink:   'bg-pink-100 text-pink-700 border-pink-200',
  cyan:   'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'

  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">{isZh ? '文章未找到' : 'Article not found'}</p>
          <a href="/articles" className="text-orange-500 hover:text-orange-600">{isZh ? '返回文章列表' : 'Back to articles'}</a>
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
    <div className="min-h-screen bg-gray-50">
      <SiteNav backHref="/articles" backLabel={isZh ? '所有文章' : 'All Articles'} currentPath="/articles" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {isZh ? cat.zh : cat.en}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {isZh ? `${article.readMinutes} 分钟阅读` : `${article.readMinutes} min read`}
          </div>
          <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {isZh ? article.titleZh : article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-200">
          {isZh ? article.excerptZh : article.excerpt}
        </p>

        {/* Author line */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 text-sm font-bold">{article.author[0]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{article.author}</p>
            <p className="text-xs text-gray-400">{isZh ? article.authorRoleZh : article.authorRole}</p>
          </div>
        </div>

        {/* Article content */}
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: isZh ? article.contentZh : article.content }}
        />

        {/* Tags */}
        <div className="mt-10 pt-8 flex flex-wrap items-center gap-2 border-t border-gray-200">
          <Tag className="w-4 h-4 text-gray-400" />
          {(isZh ? article.tagsZh : article.tags).map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {tag}
            </span>
          ))}
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {isZh ? '相关文章' : 'Related Articles'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <a
                  key={rel.slug}
                  href={`/articles/${rel.slug}`}
                  className="rounded-xl p-4 transition-all hover:-translate-y-0.5 group bg-white border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-2 group-hover:text-orange-500 transition-colors">
                    {isZh ? rel.titleZh : rel.title}
                  </p>
                  <p className="text-xs text-gray-400">{isZh ? `${rel.readMinutes} 分钟` : `${rel.readMinutes} min`}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center bg-orange-50 border border-orange-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isZh ? '查询你的地块可行性' : 'Check Your Block\'s Feasibility'}
          </h2>
          <p className="text-gray-500 text-sm mb-5">
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
