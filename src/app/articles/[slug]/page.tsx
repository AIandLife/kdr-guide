'use client'

import { use } from 'react'
import { Clock, ChevronRight, Tag, Users } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { ARTICLES, CATEGORY_LABELS, type ArticleCategory } from '@/lib/articles-data'

// Maps article category → professional directory pre-filter
const PRO_CTA: Record<ArticleCategory, {
  category: string
  en: { title: string; desc: string; btn: string }
  zh: { title: string; desc: string; btn: string }
} | null> = {
  finance: {
    category: 'finance',
    en: { title: 'Need a Construction Loan?', desc: 'Connect with finance brokers who specialise in KDR and construction lending.', btn: 'Find a Finance Broker →' },
    zh: { title: '需要建筑贷款？', desc: '联系专注于推倒重建和建筑贷款的贷款经纪。', btn: '寻找贷款经纪 →' },
  },
  planning: {
    category: 'planner',
    en: { title: 'Need a Town Planner?', desc: 'A registered town planner can navigate DA/CDC requirements and council overlays for you.', btn: 'Find a Town Planner →' },
    zh: { title: '需要城市规划师？', desc: '注册城市规划师可以帮你处理 DA/CDC 申请和 Council 各类限制条款。', btn: '寻找城市规划师 →' },
  },
  construction: {
    category: 'builder',
    en: { title: 'Ready to Find a Builder?', desc: 'Browse verified KDR-specialist builders in your state.', btn: 'Find a Builder →' },
    zh: { title: '准备好寻找建筑商了吗？', desc: '浏览你所在州的经过认证的 KDR 专业建筑商。', btn: '寻找建筑商 →' },
  },
  zoning: {
    category: 'planner',
    en: { title: 'Questions About Zoning?', desc: 'A town planner can assess your block\'s zoning rules and development potential.', btn: 'Find a Town Planner →' },
    zh: { title: '有关于分区规划的问题？', desc: '城市规划师可以评估你地块的分区规定和开发潜力。', btn: '寻找城市规划师 →' },
  },
  materials: {
    category: 'builder',
    en: { title: 'Planning Your Build?', desc: 'Connect with KDR-specialist builders who can guide your material choices.', btn: 'Find a Builder →' },
    zh: { title: '正在规划建房？', desc: '联系 KDR 专业建筑商，他们可以帮你做出最合适的建材选择。', btn: '寻找建筑商 →' },
  },
  stories: {
    category: 'builder',
    en: { title: 'Inspired? Start Your Own KDR.', desc: 'Find verified builders in your area to discuss your project.', btn: 'Find a Builder →' },
    zh: { title: '受到启发了？开始你自己的推倒重建。', desc: '寻找你所在区域经过认证的建筑商，与他们讨论你的项目。', btn: '寻找建筑商 →' },
  },
}

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

        {/* Professional CTA — pre-filtered by article topic */}
        {PRO_CTA[article.category] && (() => {
          const cta = PRO_CTA[article.category]!
          const copy = isZh ? cta.zh : cta.en
          return (
            <div className="mt-10 rounded-2xl overflow-hidden border border-orange-200 bg-orange-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-7 py-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-0.5">{copy.title}</h3>
                    <p className="text-sm text-gray-500">{copy.desc}</p>
                  </div>
                </div>
                <a
                  href={`/professionals?category=${cta.category}`}
                  className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {copy.btn}
                </a>
              </div>
            </div>
          )
        })()}

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

        {/* Secondary CTA — feasibility check */}
        <div className="mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            {isZh ? '还没查过你的地块？免费 AI 可行性报告，2 分钟出结果。' : 'Haven\'t checked your block yet? Free AI feasibility report in 2 minutes.'}
          </p>
          <a
            href="/feasibility"
            className="shrink-0 inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            {t.nav.cta} <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
