'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, BadgeCheck, ChevronDown, ChevronUp, Upload, ExternalLink } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'

interface SupplierListing {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  wechat: string | null
  abn: string | null
  category: string
  states: string[]
  specialties: string[]
  description: string | null
  status: string
  created_at: string
}

export default function SupplierAccountPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const { user, loading: authLoading } = useAuth()

  const [listing, setListing] = useState<SupplierListing | null>(null)
  const [loadingListing, setLoadingListing] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [regType, setRegType] = useState<'au' | 'cn'>('au')
  const [abn, setAbn] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    if (!user) return
    fetch(`/api/suppliers/account?email=${encodeURIComponent(user.email ?? '')}`)
      .then(r => r.json())
      .then(data => {
        if (data.listing) setListing(data.listing)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingListing(false))
  }, [user])

  async function submitVerification() {
    if (!listing) return
    setSubmitting(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/suppliers/verify-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          businessName: listing.business_name,
          contactName: listing.contact_name,
          email: listing.email,
          regType,
          abn: regType === 'au' ? abn : undefined,
          licenseNumber: regType === 'cn' ? licenseNumber : undefined,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
      setListing(prev => prev ? { ...prev, status: 'pending_review' } : prev)
    } catch (e: unknown) {
      setVerifyError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-colors bg-gray-50 border border-gray-200 focus:border-orange-400"

  // Auth loading
  if (authLoading || loadingListing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isZh ? '请先登录' : 'Sign in to continue'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isZh ? '需要登录才能管理你的商家信息。' : 'You need to sign in to manage your listing.'}
          </p>
          <a href="/suppliers/register"
            className="px-8 py-3.5 rounded-xl text-white font-semibold text-base inline-block"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
            {isZh ? '返回' : 'Go back'}
          </a>
        </div>
      </div>
    )
  }

  // No listing found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isZh ? '还没有商家档案' : 'No listing found'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isZh
              ? '你的账号还没有关联建材商家。点击下方免费入驻目录。'
              : 'Your account doesn\'t have a supplier listing yet. Register for free below.'}
          </p>
          <a href="/suppliers/register"
            className="px-8 py-3.5 rounded-xl text-white font-semibold text-base inline-block"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
            {isZh ? '免费入驻目录' : 'List Your Business'}
          </a>
        </div>
      </div>
    )
  }

  const isVerified = listing?.status === 'verified'
  const isPendingReview = listing?.status === 'pending_review'
  const isApproved = listing?.status === 'approved' || listing?.status === 'unverified'

  const statusLabel = isVerified
    ? (isZh ? '✅ 已认证' : '✅ Verified')
    : isPendingReview
    ? (isZh ? '⏳ 认证审核中' : '⏳ Verification pending')
    : (isZh ? '📋 已收录' : '📋 Listed')

  const statusColor = isVerified ? 'text-green-700 bg-green-50 border-green-200'
    : isPendingReview ? 'text-orange-700 bg-orange-50 border-orange-200'
    : 'text-gray-700 bg-gray-50 border-gray-200'

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav backHref="/suppliers" backLabel={isZh ? '建材目录' : 'Suppliers'} currentPath="/suppliers" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {isZh ? '我的商家信息' : 'My Listing'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isZh ? '管理你在建材目录中的公司档案' : 'Manage your business profile in the supplier directory'}
          </p>
        </div>

        {/* Listing card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{listing?.business_name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{listing?.contact_name} · {listing?.email}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {listing?.category && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{isZh ? '类别' : 'Category'}</p>
                <p className="text-gray-700 font-medium capitalize">{listing.category}</p>
              </div>
            )}
            {listing?.states?.length ? (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{isZh ? '服务地区' : 'States'}</p>
                <p className="text-gray-700 font-medium">{listing.states.join(', ')}</p>
              </div>
            ) : null}
            {listing?.phone && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{isZh ? '电话' : 'Phone'}</p>
                <p className="text-gray-700 font-medium">{listing.phone}</p>
              </div>
            )}
            {listing?.website && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{isZh ? '网站' : 'Website'}</p>
                <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-orange-500 font-medium flex items-center gap-1 hover:text-orange-600">
                  {isZh ? '访问' : 'Visit'} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {listing?.description && (
            <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>

        {/* Verified badge section */}
        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800">{isZh ? '认证商家' : 'Verified Business'}</p>
              <p className="text-sm text-green-700 mt-0.5">
                {isZh
                  ? '你的商家已通过认证，认证徽章显示在目录中。'
                  : 'Your business is verified. Your badge is showing in the directory.'}
              </p>
            </div>
          </div>
        )}

        {isPendingReview && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-2xl">
              ⏳
            </div>
            <div>
              <p className="font-bold text-orange-800">{isZh ? '认证申请审核中' : 'Verification in review'}</p>
              <p className="text-sm text-orange-700 mt-0.5">
                {isZh
                  ? '我们正在处理你的申请，通常 1–2 个工作日内完成。'
                  : 'We\'re reviewing your application — usually 1–2 business days.'}
              </p>
            </div>
          </div>
        )}

        {/* Get Verified — shown for non-verified, non-pending */}
        {isApproved && !submitted && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setVerifyOpen(v => !v)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {isZh ? '申请认证徽章' : 'Apply for Verified Badge'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isZh
                      ? '提交资料后，认证徽章将显示在你的商家档案上'
                      : 'Submit your details and we\'ll add a verified badge to your profile'}
                  </p>
                </div>
              </div>
              {verifyOpen
                ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {verifyOpen && (
              <div className="px-6 pb-6 pt-2 space-y-5 border-t border-gray-100">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {isZh ? '企业注册地' : 'Business registration'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { val: 'au' as const, label: isZh ? '🇦🇺 澳洲企业' : '🇦🇺 Australian' },
                      { val: 'cn' as const, label: isZh ? '🇨🇳 中国企业' : '🇨🇳 China-based' },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => setRegType(opt.val)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={regType === opt.val
                          ? { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }
                          : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {regType === 'au' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">ABN</label>
                    <input value={abn} onChange={e => setAbn(e.target.value)}
                      placeholder="XX XXX XXX XXX"
                      className={inputClass} />
                  </div>
                )}

                {regType === 'cn' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      {isZh ? '营业执照号 / 统一社会信用代码' : 'Business licence / Unified Social Credit Code'}
                    </label>
                    <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                      placeholder="91XXXXXXXXXXXXXXXXXX"
                      className={inputClass} />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    {isZh ? '补充说明（可选）' : 'Additional notes (optional)'}
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder={isZh
                      ? '可粘贴 Google Drive / Dropbox 文件链接，或填写其他补充信息…'
                      : 'Paste a Google Drive / Dropbox document link, or add any notes…'}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none resize-none bg-gray-50 border border-gray-200 focus:border-orange-400" />
                </div>

                {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}

                <button
                  onClick={submitVerification}
                  disabled={submitting || (regType === 'au' && !abn.trim()) || (regType === 'cn' && !licenseNumber.trim())}
                  className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
                >
                  <BadgeCheck className="w-4 h-4" />
                  {submitting
                    ? (isZh ? '提交中…' : 'Submitting…')
                    : (isZh ? '提交认证申请' : 'Submit Verification Request')}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  {isZh
                    ? '提交后我们会审核资料并联系你，通常 1–2 个工作日内。'
                    : 'We\'ll review your details and follow up — usually within 1–2 business days.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submitted confirmation */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-green-800">{isZh ? '申请已提交！' : 'Application submitted!'}</p>
              <p className="text-sm text-green-700 mt-0.5">
                {isZh
                  ? '我们收到了你的认证申请，将在 1–2 个工作日内与你联系。'
                  : 'We\'ve received your verification request and will be in touch within 1–2 business days.'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/suppliers" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← {isZh ? '返回建材目录' : 'Back to directory'}
          </a>
        </div>
      </div>
    </div>
  )
}
