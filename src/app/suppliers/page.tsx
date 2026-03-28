'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle, HelpCircle, Globe,
  Mail, Phone, Star, ChevronRight, MapPin, MessageCircle
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'
import {
  SUPPLIERS, SUPPLIER_CATEGORIES, rankSuppliers,
  type SupplierCategory, type SupplierOrigin, type Supplier
} from '@/lib/suppliers-data'

// Shape returned by /api/suppliers/list for DB entries
interface DbSupplier {
  id: string
  business_name: string
  category: string
  origin: string
  description: string | null
  states: string[]
  specialties: string[]
  status: string
  featured: boolean
  reliability_score: number
  website: string | null
  phone: string | null
  wechat: string | null
  email: string | null
  google_rating: number | null
  google_reviews: number | null
}

function dbToSupplier(d: DbSupplier): Supplier {
  return {
    id: d.id,
    name: d.business_name,
    category: d.category as SupplierCategory,
    origin: (d.origin || 'local') as SupplierOrigin,
    description: d.description || '',
    descriptionZh: d.description || '',
    states: d.states || [],
    specialties: d.specialties || [],
    specialtiesZh: d.specialties || [],
    verified: d.status === 'verified',
    verifiedNote: d.status === 'verified' ? 'Self-verified via AusBuildCircle' : undefined,
    googleRating: d.google_rating ?? undefined,
    googleReviews: d.google_reviews ?? undefined,
    website: d.website ?? undefined,
    phone: d.phone ?? undefined,
    email: d.email ?? undefined,
    featured: d.featured,
    reliabilityScore: d.reliability_score ?? 50,
  }
}

const ORIGIN_LABELS: Record<SupplierOrigin, { en: string; zh: string; color: string }> = {
  local:  { en: 'Australian',    zh: '澳洲本地', color: 'text-green-700 bg-green-100' },
  china:  { en: 'China Import',  zh: '中国进口', color: 'text-red-700 bg-red-100' },
  europe: { en: 'European',      zh: '欧洲进口', color: 'text-blue-700 bg-blue-100' },
  multi:  { en: 'Multi-Origin',  zh: '多产地',   color: 'text-purple-700 bg-purple-100' },
}

const CATEGORY_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-600',
  cyan:   'bg-cyan-100 text-cyan-600',
  red:    'bg-red-100 text-red-600',
  green:  'bg-green-100 text-green-600',
  pink:   'bg-pink-100 text-pink-600',
  stone:  'bg-stone-100 text-stone-600',
}

const HARD_CATEGORIES = ['windows-doors','flooring','paint','tiles','kitchen','plumbing','electrical','roofing','insulation']
const SOFT_CATEGORIES = ['curtains-blinds','custom-wardrobes','landscaping','outdoor-paving']

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            fill={i <= full ? '#fbbf24' : 'none'}
            color={i <= full || (half && i === full + 1) ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
    </div>
  )
}

export default function SuppliersPage() {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'

  const [activeCategory, setActiveCategory] = useState<SupplierCategory | 'all'>('all')
  const [activeOrigin, setActiveOrigin] = useState<SupplierOrigin | 'all'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    fetch('/api/suppliers/list')
      .then(r => r.json())
      .then(data => {
        if (data.suppliers) setDbSuppliers(data.suppliers.map(dbToSupplier))
      })
      .catch(() => {/* non-fatal, fall back to static only */})
  }, [])

  // Merge: static curated + DB-submitted (deduplicate by name)
  const staticNames = new Set(SUPPLIERS.map(s => s.name.toLowerCase()))
  const uniqueDb = dbSuppliers.filter(s => !staticNames.has(s.name.toLowerCase()))
  const allSuppliers = [...SUPPLIERS, ...uniqueDb]

  const ranked = rankSuppliers(allSuppliers)

  const filtered = ranked.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false
    if (activeOrigin !== 'all' && s.origin !== activeOrigin) return false
    if (verifiedOnly && !s.verified) return false
    return true
  })

  const categories = Object.entries(SUPPLIER_CATEGORIES) as [SupplierCategory, typeof SUPPLIER_CATEGORIES[SupplierCategory]][]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/suppliers" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isZh ? '建材商目录' : 'Building Materials Directory'}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {isZh
              ? '地板、门窗、油漆、厨卫配件——找到适合你推倒重建项目的本地和进口建材供应商。认证商家已通过资质核查。'
              : 'Flooring, windows, paint, kitchen, and bathroom — find local and imported suppliers for your KDR project. Verified suppliers have passed our vetting process.'}
          </p>
        </div>

        {/* Social proof bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { icon: '🏭', en: '60+ suppliers listed', zh: '60+ 家供应商已收录' },
            { icon: '✅', en: 'Verified suppliers prioritised', zh: '认证商家优先展示' },
            { icon: '🌏', en: 'Local & China imports covered', zh: '澳洲本地 + 中国进口全覆盖' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <span>{item.icon}</span>
              <span>{isZh ? item.zh : item.en}</span>
            </div>
          ))}
          <Link href="/suppliers/register" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 transition-colors rounded-lg px-3 py-2">
            <span className="text-lg leading-none">+</span>
            <span>{isZh ? '新商家申请入驻' : 'List your business'}</span>
          </Link>
        </div>

        {/* Verification explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-4 flex items-start gap-3 bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {isZh ? '已认证供应商' : 'Verified Suppliers'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isZh
                  ? '已提交营业资质，Google 评分良好，获我们团队核实推荐。优先排名，获得认证徽章。'
                  : 'Business credentials verified, strong Google rating, reviewed by our team. Priority ranking and verification badge displayed.'}
              </p>
            </div>
          </div>
          <div className="rounded-xl p-4 flex items-start gap-3 bg-white border border-gray-200">
            <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {isZh ? '未认证列表' : 'Unverified Listings'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isZh
                  ? '免费收录，但资质未经我们核实。建议在交易前自行尽职调查。'
                  : 'Free to list, but credentials have not been independently verified by us. We recommend doing your own due diligence before transacting.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 mb-8 bg-white border border-gray-200 shadow-sm">
          {/* Category filter */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setActiveCategory('all')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={activeCategory === 'all' ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
              >
                {isZh ? '全部' : 'All'}
              </button>
            </div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2 tracking-wide">{isZh ? '硬装建材' : 'Construction & Finishes'}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.filter(([key]) => HARD_CATEGORIES.includes(key)).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={activeCategory === key ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                >
                  <span>{cat.icon}</span>
                  {isZh ? cat.zh : cat.en}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2 tracking-wide">{isZh ? '软装 & 户外' : 'Soft Furnishings & Outdoor'}</p>
            <div className="flex flex-wrap gap-2">
              {categories.filter(([key]) => SOFT_CATEGORIES.includes(key)).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={activeCategory === key ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                >
                  <span>{cat.icon}</span>
                  {isZh ? cat.zh : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* Origin + verified filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3 tracking-wide">
                {isZh ? '产地' : 'Origin'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'local', 'china', 'europe', 'multi'] as const).map(orig => (
                  <button
                    key={orig}
                    onClick={() => setActiveOrigin(orig)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={activeOrigin === orig ? { background: '#f97316', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                  >
                    {orig === 'all'
                      ? (isZh ? '全部' : 'All')
                      : (isZh ? ORIGIN_LABELS[orig].zh : ORIGIN_LABELS[orig].en)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:ml-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setVerifiedOnly(v => !v)}
                  className="w-10 h-5 rounded-full relative transition-all cursor-pointer"
                  style={{ background: verifiedOnly ? '#22c55e' : '#e5e7eb' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: verifiedOnly ? '22px' : '2px' }}
                  />
                </div>
                <span className="text-sm text-gray-700">
                  {isZh ? '只显示已认证' : 'Verified only'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          {isZh ? `显示 ${filtered.length} 个供应商` : `Showing ${filtered.length} supplier${filtered.length !== 1 ? 's' : ''}`}
          {filtered.filter(s => s.verified).length > 0 && (
            <span className="text-green-600 ml-2">
              · {filtered.filter(s => s.verified).length} {isZh ? '已认证' : 'verified'}
            </span>
          )}
        </p>

        {/* Supplier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map(supplier => {
            const cat = SUPPLIER_CATEGORIES[supplier.category]
            const orig = ORIGIN_LABELS[supplier.origin]
            const catColor = CATEGORY_COLORS[cat.color]
            return (
              <div
                key={supplier.id}
                className="rounded-2xl p-5 flex flex-col bg-white shadow-sm transition-all"
                style={{
                  border: supplier.verified ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 leading-tight truncate">{supplier.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {supplier.verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isZh ? '已认证' : 'Verified'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {isZh ? '未认证' : 'Unverified'}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orig.color}`}>
                        {isZh ? orig.zh : orig.en}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${catColor}`}>
                    {cat.icon}
                  </div>
                </div>

                {/* Category badge */}
                <div className="mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor}`}>
                    {isZh ? cat.zh : cat.en}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  {isZh ? supplier.descriptionZh : supplier.description}
                </p>

                {/* Google Rating */}
                {supplier.googleRating && supplier.googleReviews && (
                  <div className="mb-3">
                    <StarRating rating={supplier.googleRating} reviews={supplier.googleReviews} />
                  </div>
                )}

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(isZh ? supplier.specialtiesZh : supplier.specialties).slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {s}
                    </span>
                  ))}
                </div>

                {/* States served */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {supplier.states.join(' · ')}
                </div>

                {/* Contact links (only for verified) */}
                {supplier.verified ? (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {supplier.website && (
                      <a
                        href={`https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 transition-colors font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {isZh ? '访问网站' : 'Website'}
                      </a>
                    )}
                    {supplier.phone && (
                      <a
                        href={`tel:${supplier.phone}`}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {supplier.phone}
                      </a>
                    )}
                    {supplier.email && (
                      <a
                        href={`mailto:${supplier.email}`}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {isZh ? '发送邮件' : 'Email'}
                      </a>
                    )}
                    {supplier.wechat && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600">
                        <MessageCircle className="w-3.5 h-3.5" />
                        微信: {supplier.wechat}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 text-xs text-gray-400 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="italic">{isZh ? '联系方式未经核实，请自行尽职调查。' : 'Contact details unverified. Please do your own due diligence.'}</span>
                    <Link href="/suppliers/register" className="shrink-0 text-orange-500 hover:text-orange-600 font-medium not-italic">
                      {isZh ? '申请认证 →' : 'Get Verified →'}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{isZh ? '暂无符合条件的供应商。' : 'No suppliers match your filters.'}</p>
            <p className="text-sm mt-2">{isZh ? '请尝试其他筛选条件。' : 'Try adjusting the filters above.'}</p>
          </div>
        )}

        {/* B2B entry point */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <Link href="/suppliers/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            <span className="text-xl leading-none">+</span>
            {isZh ? '新商家申请入驻' : 'List your business'}
          </Link>
        </div>
      </div>
    </div>
  )
}
