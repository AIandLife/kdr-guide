'use client'

import { useState } from 'react'
import {
  ArrowLeft, Building2, CheckCircle, HelpCircle, Globe,
  Mail, Phone, Star, ChevronRight, MapPin
} from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import {
  SUPPLIERS, SUPPLIER_CATEGORIES, rankSuppliers,
  type SupplierCategory, type SupplierOrigin
} from '@/lib/suppliers-data'

const ORIGIN_LABELS: Record<SupplierOrigin, { en: string; zh: string; color: string }> = {
  local:  { en: 'Australian',    zh: '澳洲本地', color: 'text-green-400 bg-green-500/10' },
  china:  { en: 'China Import',  zh: '中国进口', color: 'text-red-400 bg-red-500/10' },
  europe: { en: 'European',      zh: '欧洲进口', color: 'text-blue-400 bg-blue-500/10' },
  multi:  { en: 'Multi-Origin',  zh: '多产地',   color: 'text-purple-400 bg-purple-500/10' },
}

const CATEGORY_COLORS: Record<string, string> = {
  blue:   'bg-blue-500/10 text-blue-400',
  orange: 'bg-orange-500/10 text-orange-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  gray:   'bg-gray-500/10 text-gray-400',
  purple: 'bg-purple-500/10 text-purple-400',
  cyan:   'bg-cyan-500/10 text-cyan-400',
  red:    'bg-red-500/10 text-red-400',
  green:  'bg-green-500/10 text-green-400',
}

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
            color={i <= full || (half && i === full + 1) ? '#fbbf24' : '#4b5563'}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{rating.toFixed(1)}</span>
      <span className="text-xs text-slate-600">({reviews.toLocaleString()})</span>
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

  const ranked = rankSuppliers(SUPPLIERS)

  const filtered = ranked.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false
    if (activeOrigin !== 'all' && s.origin !== activeOrigin) return false
    if (verifiedOnly && !s.verified) return false
    return true
  })

  const categories = Object.entries(SUPPLIER_CATEGORIES) as [SupplierCategory, typeof SUPPLIER_CATEGORIES[SupplierCategory]][]

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
            {isZh ? '建材商目录' : 'Building Materials Directory'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            {isZh
              ? '地板、门窗、油漆、厨卫配件——找到适合你推倒重建项目的本地和进口建材供应商。认证商家已通过资质核查。'
              : 'Flooring, windows, paint, kitchen, and bathroom — find local and imported suppliers for your KDR project. Verified suppliers have passed our vetting process.'}
          </p>
        </div>

        {/* Verification explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm mb-1">
                {isZh ? '已认证供应商' : 'Verified Suppliers'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isZh
                  ? '已提交营业资质，Google 评分 4.0 以上，获我们团队核实推荐。优先排名，获得认证徽章。'
                  : 'Business credentials verified, Google rating 4.0+, reviewed by our team. Priority ranking and verification badge displayed.'}
              </p>
            </div>
          </div>
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <HelpCircle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm mb-1">
                {isZh ? '未认证列表' : 'Unverified Listings'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isZh
                  ? '免费收录，但资质未经我们核实。建议在交易前自行尽职调查。'
                  : 'Free to list, but credentials have not been independently verified by us. We recommend doing your own due diligence before transacting.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Category filter */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase font-medium mb-3 tracking-wide">
              {isZh ? '类别' : 'Category'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={activeCategory === 'all' ? { background: '#f97316', color: 'white' } : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
              >
                {isZh ? '全部' : 'All'}
              </button>
              {categories.map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={activeCategory === key
                    ? { background: '#f97316', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
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
              <p className="text-xs text-slate-500 uppercase font-medium mb-3 tracking-wide">
                {isZh ? '产地' : 'Origin'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'local', 'china', 'europe', 'multi'] as const).map(orig => (
                  <button
                    key={orig}
                    onClick={() => setActiveOrigin(orig)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={activeOrigin === orig ? { background: '#f97316', color: 'white' } : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
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
                  style={{ background: verifiedOnly ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: verifiedOnly ? '22px' : '2px' }}
                  />
                </div>
                <span className="text-sm text-slate-300">
                  {isZh ? '只显示已认证' : 'Verified only'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-5">
          {isZh ? `显示 ${filtered.length} 个供应商` : `Showing ${filtered.length} supplier${filtered.length !== 1 ? 's' : ''}`}
          {filtered.filter(s => s.verified).length > 0 && (
            <span className="text-green-400 ml-2">
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
                className="rounded-2xl p-5 flex flex-col transition-all"
                style={{
                  background: supplier.verified ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  border: supplier.verified ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white leading-tight truncate">{supplier.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {supplier.verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isZh ? '已认证' : 'Verified'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
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
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
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
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* States served */}
                <div className="flex items-center gap-1 text-xs text-slate-600 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {supplier.states.join(' · ')}
                </div>

                {/* Contact links (only for verified) */}
                {supplier.verified ? (
                  <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {supplier.website && (
                      <a
                        href={`https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {isZh ? '访问网站' : 'Website'}
                      </a>
                    )}
                    {supplier.phone && (
                      <a
                        href={`tel:${supplier.phone}`}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {supplier.phone}
                      </a>
                    )}
                    {supplier.email && (
                      <a
                        href={`mailto:${supplier.email}`}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {isZh ? '发送邮件' : 'Email'}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 text-xs text-slate-600 italic" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {isZh ? '联系方式未经核实，请自行尽职调查。' : 'Contact details unverified. Please do your own due diligence.'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <p className="text-lg">{isZh ? '暂无符合条件的供应商。' : 'No suppliers match your filters.'}</p>
            <p className="text-sm mt-2">{isZh ? '请尝试其他筛选条件。' : 'Try adjusting the filters above.'}</p>
          </div>
        )}

        {/* List Your Business CTA */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {isZh ? '你是建材供应商？免费收录你的业务' : 'Are you a building materials supplier? List for free'}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isZh
                  ? '填写基本信息即可免费上架。申请认证后，联系方式和网站将对买家可见，并获得优先排名。'
                  : 'Submit your basic info to list for free. Apply for verification to show contact details and get priority ranking.'}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span>✓ {isZh ? '免费收录' : 'Free listing'}</span>
                <span>✓ {isZh ? '认证后展示联系方式' : 'Contact shown after verification'}</span>
                <span>✓ {isZh ? '认证费 AUD $99/年' : 'Verification: AUD $99/year'}</span>
              </div>
            </div>
            <a
              href="/suppliers/register"
              className="shrink-0 inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
            >
              {isZh ? '立即收录' : 'List My Business'}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
