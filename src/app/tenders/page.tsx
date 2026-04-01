'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Landmark, Calendar, Clock, HardHat, ChevronRight } from 'lucide-react'
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
  close_date: string | null
  source: string
  council_name: string | null
}

type FilterTab = string // 'all' | 'construction' | category names

const CATEGORY_COLORS: Record<string, string> = {
  Construction: 'bg-orange-100 text-orange-700 border-orange-200',
  'IT Services': 'bg-blue-100 text-blue-700 border-blue-200',
  Health: 'bg-green-100 text-green-700 border-green-200',
  Education: 'bg-purple-100 text-purple-700 border-purple-200',
  Defence: 'bg-red-100 text-red-700 border-red-200',
  Transport: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Environment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Professional Services': 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

function getCategoryColor(category: string): string {
  // Check exact match first
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  // Check partial match
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return val
  }
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

// Professional tags for construction tenders
const CONSTRUCTION_PRO_TAGS_ZH = ['建筑商', '工程师', '设计师']
const CONSTRUCTION_PRO_TAGS_EN = ['Builders', 'Engineers', 'Designers']

function getRelativeDate(dateStr: string | null, isZh: boolean): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return isZh ? '今天' : 'Today'
    if (diffDays < 30) return isZh ? `${diffDays}天前` : `${diffDays}d ago`
    const diffMonths = Math.floor(diffDays / 30)
    return isZh ? `${diffMonths}个月前` : `${diffMonths}mo ago`
  } catch {
    return ''
  }
}

function getCloseDateInfo(
  dateStr: string | null,
  isZh: boolean
): { label: string; color: string } | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
      return {
        label: isZh ? '已截止' : 'Closed',
        color: 'bg-gray-100 text-gray-500 border-gray-200',
      }
    }
    if (diffDays <= 3) {
      return {
        label: isZh ? `${diffDays}天后截止` : `${diffDays}d left`,
        color: 'bg-red-100 text-red-700 border-red-200',
      }
    }
    if (diffDays <= 7) {
      return {
        label: isZh ? `${diffDays}天后截止` : `${diffDays}d left`,
        color: 'bg-orange-100 text-orange-700 border-orange-200',
      }
    }
    return {
      label: isZh ? `${diffDays}天后截止` : `${diffDays}d left`,
      color: 'bg-gray-100 text-gray-600 border-gray-200',
    }
  } catch {
    return null
  }
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
          'id, atm_id, title, category_name, description_en, description_zh, link, is_construction, published_at, close_date, source, council_name'
        )
        .eq('is_construction', true)
        .order('published_at', { ascending: false })
        .limit(200)

      if (!error && data) {
        setTenders(data as Tender[])
      }
      setLoading(false)
    }
    fetchTenders()
  }, [])

  // Classify construction tenders into sub-categories
  const CONSTRUCTION_SUBCATEGORIES: Record<string, { en: string; zh: string; keywords: string[] }> = {
    'new-build': { en: 'New Build', zh: '新建工程', keywords: ['building works', 'construction', 'new build', 'barracks', 'depot'] },
    'renovation': { en: 'Renovation', zh: '翻新修缮', keywords: ['refurbish', 'renovation', 'remediation', 'upgrade', 'repair', 'restore'] },
    'infrastructure': { en: 'Roads & Infrastructure', zh: '道路基建', keywords: ['road', 'infrastructure', 'bridge', 'civil', 'highway', 'transport'] },
    'maintenance': { en: 'Facility Maintenance', zh: '设施维护', keywords: ['maintenance', 'cleaning', 'security', 'materials handling', 'access equipment'] },
    'design': { en: 'Architecture & Design', zh: '建筑设计', keywords: ['architect', 'design', 'project management', 'planning', 'adviser'] },
  }

  function getSubCategory(tender: Tender): string {
    const text = (tender.title + ' ' + tender.description_en + ' ' + tender.category_name).toLowerCase()
    for (const [key, sub] of Object.entries(CONSTRUCTION_SUBCATEGORIES)) {
      if (sub.keywords.some(kw => text.includes(kw))) return key
    }
    return 'other'
  }

  const categoryTabs = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tenders) {
      const sub = getSubCategory(t)
      counts[sub] = (counts[sub] || 0) + 1
    }
    const tabs: { key: string; label: string; count: number }[] = [
      { key: 'all', label: isZh ? '全部' : 'All', count: tenders.length },
    ]
    for (const [key, sub] of Object.entries(CONSTRUCTION_SUBCATEGORIES)) {
      if (counts[key]) {
        tabs.push({ key, label: isZh ? sub.zh : sub.en, count: counts[key] })
      }
    }
    if (counts['other']) {
      tabs.push({ key: 'other', label: isZh ? '其他建筑' : 'Other', count: counts['other'] })
    }
    return tabs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenders, isZh])

  const filtered = useMemo(() => {
    let list = tenders
    if (filter !== 'all') {
      list = list.filter((t) => getSubCategory(t) === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description_zh || '').toLowerCase().includes(q) ||
          (t.description_en || '').toLowerCase().includes(q) ||
          (t.category_name || '').toLowerCase().includes(q) ||
          (t.council_name || '').toLowerCase().includes(q)
      )
    }
    return list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenders, filter, search])

  const constructionCount = tenders.length

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
            <div className="flex gap-1 flex-wrap bg-white rounded-xl border border-gray-200 p-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 opacity-70">({tab.count})</span>
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

          {/* Total count */}
          {!loading && tenders.length > 0 && (
            <div className="mt-3 text-sm text-gray-500">
              {isZh
                ? `共 ${filtered.length} ${t.tenders.totalCount}${constructionCount > 0 ? ` (其中 ${constructionCount} ${t.tenders.constructionCount})` : ''}`
                : `${filtered.length} ${t.tenders.totalCount}${constructionCount > 0 ? ` (${constructionCount} ${t.tenders.constructionCount})` : ''}`}
            </div>
          )}
        </div>

        {/* Tender List */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((tender) => {
                const closeInfo = getCloseDateInfo(tender.close_date, isZh)
                const relDate = getRelativeDate(tender.published_at, isZh)
                const proTags = isZh
                  ? CONSTRUCTION_PRO_TAGS_ZH
                  : CONSTRUCTION_PRO_TAGS_EN

                return (
                  <Link
                    key={tender.id}
                    href={`/tenders/${tender.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-orange-200 transition-all flex flex-col group"
                  >
                    {/* Top: badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {tender.category_name && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getCategoryColor(tender.category_name)}`}
                        >
                          {tender.category_name}
                        </span>
                      )}
                      {tender.is_construction && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                          <HardHat className="w-3 h-3" />
                          {t.tenders.construction}
                        </span>
                      )}
                      {closeInfo && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${closeInfo.color}`}
                        >
                          <Clock className="w-3 h-3" />
                          {closeInfo.label}
                        </span>
                      )}
                      {tender.source && tender.source !== 'austender' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-600 border border-purple-200">
                          {tender.source === 'nsw'
                            ? 'NSW'
                            : tender.source === 'vic'
                              ? 'VIC'
                              : tender.source === 'qld'
                                ? 'QLD'
                                : tender.source === 'council'
                                  ? (isZh ? t.tenders.council : 'Council')
                                  : tender.source === 'school'
                                    ? 'School'
                                    : tender.source.toUpperCase()}
                        </span>
                      )}
                      {tender.council_name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          {tender.council_name}
                        </span>
                      )}
                    </div>

                    {/* Primary title: zh in Chinese mode, en in English mode */}
                    <h3 className="text-gray-900 text-sm sm:text-[15px] font-semibold leading-snug mb-1.5 line-clamp-3 group-hover:text-orange-700 transition-colors">
                      {isZh ? (tender.description_zh || tender.title) : tender.title}
                    </h3>

                    {/* Secondary: show the other language */}
                    {isZh ? (
                      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{tender.title}</p>
                    ) : tender.description_zh ? (
                      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{tender.description_zh}</p>
                    ) : null}

                    {/* Professional tags for construction */}
                    {tender.is_construction && (
                      <div className="flex flex-wrap items-center gap-1 mb-3">
                        <span className="text-[11px] text-gray-400">
                          {t.tenders.suitableFor}
                        </span>
                        {proTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom: date + action */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                      {relDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {relDate}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 group-hover:text-orange-700 transition-colors ml-auto">
                        {t.tenders.viewDetail}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
