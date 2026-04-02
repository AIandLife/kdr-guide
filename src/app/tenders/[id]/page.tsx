'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Calendar, Clock, Landmark, Users,
  Loader2, AlertCircle, HardHat,
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import { PROFESSIONALS, CATEGORIES, type Professional } from '@/lib/professionals-data'
import { createClient } from '@/lib/supabase/client'

/** Decode HTML entities and strip HTML tags */
function cleanHtml(str: string): string {
  // Strip HTML tags
  let clean = str.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '')
  // Decode common HTML entities
  clean = clean.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  // Collapse multiple newlines
  clean = clean.replace(/\n{3,}/g, '\n\n').trim()
  return clean
}

// Category → professional role mapping for construction tenders
const TENDER_CATEGORY_TO_PRO: Record<string, string[]> = {
  Construction: ['builder', 'engineer', 'demolition', 'designer'],
  'Building Construction and Support and Maintenance and Repair Services': ['builder', 'engineer', 'demolition', 'designer'],
  Defence: ['builder', 'engineer'],
  Transport: ['builder', 'engineer'],
  'IT Services': [],
  Health: ['builder'],
  Education: ['builder', 'designer'],
  Environment: ['engineer'],
  'Professional Services': ['planner'],
}

function formatRelativeDate(dateStr: string | null, isZh: boolean): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return isZh ? '今天' : 'Today'
    if (diffDays === 1) return isZh ? '1天前' : '1 day ago'
    if (diffDays < 30) return isZh ? `${diffDays}天前` : `${diffDays} days ago`
    const diffMonths = Math.floor(diffDays / 30)
    return isZh ? `${diffMonths}个月前` : `${diffMonths} months ago`
  } catch {
    return ''
  }
}

function formatDate(dateStr: string | null, isZh: boolean): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(isZh ? 'zh-CN' : 'en-AU', {
      year: 'numeric',
      month: 'long',
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

interface TenderData {
  id: string
  atm_id: string | null
  title: string
  agency: string | null
  category_name: string
  close_date: string | null
  atm_type: string | null
  location: string | null
  description_en: string
  description_zh: string
  link: string
  is_construction: boolean
  published_at: string | null
  council_name: string | null
}

export default function TenderDetailPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const td = t.tenderDetail
  const isZh = lang === 'zh'
  const params = useParams()
  const tenderId = params.id as string

  const [tender, setTender] = useState<TenderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [dbProfessionals, setDbProfessionals] = useState<Professional[]>([])

  // Fetch DB professionals
  useEffect(() => {
    const supabase = createClient()
    async function fetchPros() {
      const { data } = await supabase
        .from('professionals')
        .select('business_name, category, state, regions, specialties, verified, featured, description, description_en, website, wechat, phone, is_demo, languages')
        .limit(200)
      if (data) {
        setDbProfessionals(
          data.map((p: Record<string, unknown>) => ({
            slug: (p.business_name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: p.business_name as string,
            category: p.category as string,
            state: p.state as string,
            regions: (p.regions as string[]) || [],
            specialties: (p.specialties as string[]) || [],
            verified: p.verified as boolean,
            featured: p.featured as boolean,
            description: p.description as string,
            descriptionEn: (p.description_en as string | null) || null,
            website: p.website as string | null,
            wechat: p.wechat as string | null,
            phone: p.phone as string | null,
            is_demo: p.is_demo as boolean,
            languages: (p.languages as string[]) || [],
          }))
        )
      }
    }
    fetchPros()
  }, [])

  // Fetch tender data (static, no AI call)
  useEffect(() => {
    async function fetchTender() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('government_tenders')
          .select('id, atm_id, title, agency, category_name, close_date, atm_type, location, description_en, description_zh, link, is_construction, published_at, council_name')
          .eq('id', tenderId)
          .single()

        if (fetchError || !data) {
          setError(td.notFound)
          setLoading(false)
          return
        }

        setTender(data as TenderData)
      } catch {
        setError(td.loadError)
      } finally {
        setLoading(false)
      }
    }
    if (tenderId) fetchTender()
  }, [tenderId, td.notFound, td.loadError])

  // Get recommended professionals for this tender
  function getRecommendedPros(): Professional[] {
    if (!tender) return []
    const categories = TENDER_CATEGORY_TO_PRO[tender.category_name] || (tender.is_construction ? ['builder', 'engineer'] : [])
    if (categories.length === 0) return []

    const catSet = new Set(categories)
    const allPros = [...PROFESSIONALS, ...dbProfessionals]
    const matched = allPros.filter((p) => catSet.has(p.category))
    // Deduplicate
    const seen = new Set<string>()
    const unique = matched.filter((p) => {
      if (seen.has(p.slug)) return false
      seen.add(p.slug)
      return true
    })
    unique.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
    return unique.slice(0, 6)
  }

  if (loading) {
    return (
      <>
        <SiteNav currentPath="/tenders" />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{td.loading}</p>
          </div>
        </main>
      </>
    )
  }

  if (error || !tender) {
    return (
      <>
        <SiteNav currentPath="/tenders" />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">{error || td.notFound}</p>
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {td.backToList}
            </Link>
          </div>
        </main>
      </>
    )
  }

  const recommendedPros = getRecommendedPros()

  return (
    <>
      <SiteNav currentPath="/tenders" />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            {/* Back button */}
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {td.backToList}
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {tender.is_construction && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <HardHat className="w-3 h-3" />
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
              {tender.atm_type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {tender.atm_type}
                </span>
              )}
            </div>

            {/* Primary title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-snug">
              {cleanHtml(isZh ? (tender.description_zh || tender.title) : tender.title)}
            </h1>

            {/* Secondary: only show English subtitle in Chinese mode */}
            {isZh && (
              <p className="text-gray-500 text-sm sm:text-base mb-4">{cleanHtml(tender.title)}</p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              {tender.council_name && (
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-teal-500" />
                  <span className="text-teal-700 font-medium">{tender.council_name}</span>
                </span>
              )}
              {tender.agency && !tender.council_name && (
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-gray-400" />
                  {tender.agency}
                </span>
              )}
              {tender.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {td.published} {formatDate(tender.published_at, isZh)}
                </span>
              )}
              {tender.close_date && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {td.closeDate} {formatDate(tender.close_date, isZh)}
                </span>
              )}
              {tender.location && (
                <span className="flex items-center gap-1.5">
                  📍 {tender.location}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Primary content block - matches current language */}
          {isZh ? (
            <>
              {tender.description_zh && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📋 中文概要
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{tender.description_zh}</p>
                </div>
              )}
              {tender.description_en && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">📄 英文原文</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{cleanHtml(tender.description_en)}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {tender.description_en && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">📄 Description</h2>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">{cleanHtml(tender.description_en)}</p>
                </div>
              )}
            </>
          )}

          {/* External link */}
          {tender.link && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 sm:p-6 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3">{td.viewOriginalHint}</p>
              <a
                href={tender.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                {td.viewOnAusTender}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Recommended Professionals */}
          {recommendedPros.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                {td.recProsTitle}
              </h2>
              <p className="text-sm text-gray-500 mb-5">{td.recProsSubtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedPros.map((pro) => {
                  const cat = CATEGORIES.find((c) => c.id === pro.category)
                  const stateSlug = pro.state.toLowerCase()
                  return (
                    <div key={pro.slug} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900 flex-1 truncate">
                          {pro.name}
                        </span>
                        {pro.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                            {t.feasibility.recProsVerified}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-orange-600 font-medium mb-1">
                        {cat ? (isZh ? cat.labelZh : cat.label) : pro.category}
                      </span>
                      <span className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {!isZh && pro.descriptionEn ? pro.descriptionEn : pro.description}
                      </span>
                      <Link
                        href={`/professionals/${stateSlug}/${pro.slug}`}
                        className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 transition-colors"
                      >
                        {t.feasibility.recProsContact} →
                      </Link>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 text-center">
                <Link
                  href="/professionals"
                  className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {t.feasibility.recProsViewAll} →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
