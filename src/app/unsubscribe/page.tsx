'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Building2 } from 'lucide-react'

function UnsubscribePage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')

  const content = {
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: '已成功退订',
      titleEn: 'Unsubscribed successfully',
      body: '你已从我们的 Newsletter 列表中退订。我们不会再向你发送邮件通讯。',
      bodyEn: "You've been removed from our newsletter. We won't send you any more emails.",
    },
    invalid: {
      icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: '链接无效',
      titleEn: 'Invalid link',
      body: '此退订链接无效或已过期，请检查你的邮件中的链接。',
      bodyEn: 'This unsubscribe link is invalid or has expired. Please use the link in your email.',
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: '出现错误',
      titleEn: 'Something went wrong',
      body: '退订时遇到问题，请稍后重试或联系我们。',
      bodyEn: 'We encountered an error while unsubscribing you. Please try again or contact us.',
    },
  }

  const c = content[(status as keyof typeof content) ?? 'invalid'] ?? content.invalid

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AusBuildCircle</span>
          </a>
        </div>

        <div className={`rounded-2xl border ${c.border} ${c.bg} p-8 text-center`}>
          <div className="flex justify-center mb-4">{c.icon}</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h1>
          <p className="text-sm text-gray-500 mb-1">{c.titleEn}</p>
          <p className="text-sm text-gray-600 mt-4">{c.body}</p>
          <p className="text-xs text-gray-400 mt-1">{c.bodyEn}</p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          如有疑问请联系 <a href="mailto:noreply@ausbuildcircle.com" className="text-orange-500 hover:underline">noreply@ausbuildcircle.com</a>
        </p>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← 返回首页</a>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePageWrapper() {
  return (
    <Suspense>
      <UnsubscribePage />
    </Suspense>
  )
}
