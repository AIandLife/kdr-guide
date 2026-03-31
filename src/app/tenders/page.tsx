'use client'

import { useState, useEffect, useMemo } from 'react'
import { ExternalLink, Search, Landmark, Calendar } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { createClient } from '@/lib/supabase/client'

interface Tender {
  id: string
  atm_id: string | null
  title: string
  category_name: string
  description_en: string
  description_zh: string
  link: string
  is_construction: boolean
  published_at: string | null
}

type FilterTab = 'all' | 'construction' | 'other'

function formatDate(dateStr: string | null, isZh: boolean): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(isZh ? 'zh-CN' : 'en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Construction: 'bg-orange-100 text-orange-700',
  'IT Services': 'bg-blue-100 text-blue-700',
  Health: 'bg-green-100 text-green-700',
  Education: 'bg-purple-100 text-purple-700',
  Defence: 'bg-red-100 text-red-700',
  Transport: 'bg-yellow-100 text-yellow-700',
  Environment: 'bg-emerald-100 text-emerald-700',
  'Professional Services': 'bg-indigo-100 text-indigo-700',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600'
}

export default function TendersPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'

  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function fetchTenders() {
      const { data, error } = await supabase
        .from('government_tenders')
        .select(
          'id, atm_id, title, category_name, description_en, description_zh, link, is_construction, published_at'
        )
        .order('published_at', { ascending: false })
        .limit(200)

      if (!error && data) {
        setTenders(data as Tender[])
      }
      setLoading(false)
    }
    fetchTenders()
  }, [])

  const filtered = useMemo(() => {
    let list = tenders
    if (filter === 'construction') {
      list = list.filter((t) => t.is_construction)
    } else if (filter === 'other') {
      list = list.filter((t) => !t.is_construction)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description_zh.toLowerCase().includes(q) ||
          t.description_en.toLowerCase().includes(q) ||
          t.category_name.toLowerCase().includes(q)
      )
    }
    return list
  }, [tenders, filter, search])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t.tenders.filterAll },
    { key: 'construction', label: t.tenders.filterConstruction },
    { key: 'other', label: t.tenders.filterOther },
  ]

  return (
    <>
      <SiteNav currentPath="/tenders" />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-center gap-3 mb-3">
              <Landmark className="w-7 h-7 text-orange-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t.tenders.h1}
              </h1>
            </div>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
              {t.tenders.subtitle}
            </p>
          </div>
        </section>

        {/* Filters & Search */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.tenders.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tender List */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : tenders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t.tenders.emptyState}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t.tenders.noResults}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((tender) => (
                <div
                  key={tender.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {tender.is_construction && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {t.tenders.construction}
                      </span>
                    )}
                    {tender.category_name && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tender.category_name)}`}
                      >
                        {tender.category_name}
                      </span>
                    )}
                    {tender.published_at && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {t.tenders.published}{' '}
                        {formatDate(tender.published_at, isZh)}
                      </span>
                    )}
                  </div>

                  {/* Chinese summary (primary) */}
                  {tender.description_zh && (
                    <p className="text-gray-900 text-sm sm:text-base leading-relaxed mb-1.5">
                      {tender.description_zh}
                    </p>
                  )}

                  {/* English title (secondary) */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">
                    {tender.title}
                  </p>

                  {/* Link */}
                  {tender.link && (
                    <a
                      href={tender.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors"
                    >
                      {t.tenders.viewOnAusTender}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
