'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Clock, Building2, ChevronRight, HardHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { SiteNav } from '@/components/SiteNav'
import { useLang } from '@/lib/language-context'

interface ContactRecord {
  id: string
  professional_name: string
  professional_category: string
  suburb: string
  project_type: string
  message: string
  status: string
  created_at: string
}

export default function HomeownerDashboard() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('contact_requests')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setContacts(data ?? [])
        setFetching(false)
      })
  }, [user])

  if (loading) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{isZh ? '请先登录' : 'Please sign in first'}</p>
          <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">{isZh ? '去登录 →' : 'Sign in →'}</a>
        </div>
      </div>
    )
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isZh
      ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/dashboard/homeowner" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isZh ? '我的联系记录' : 'My Contacts'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isZh ? '你联系过的建房专业人士' : 'Professionals you\'ve reached out to'}
          </p>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse h-20" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 mb-2">{isZh ? '你还没有联系过任何专业人士' : 'No contacts yet'}</p>
            <a href="/professionals" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
              {isZh ? '浏览专业人士目录 →' : 'Browse professionals →'}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{c.professional_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                          {c.professional_category}
                        </span>
                        {c.suburb && <span className="text-xs text-gray-400">{c.suburb}</span>}
                        {c.project_type && <span className="text-xs text-gray-400">· {c.project_type}</span>}
                      </div>
                      {c.message && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{c.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(c.created_at)}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'replied' ? 'bg-green-100 text-green-600' :
                      c.status === 'read' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {c.status === 'replied' ? (isZh ? '已回复' : 'Replied') :
                       c.status === 'read' ? (isZh ? '已查看' : 'Read') :
                       (isZh ? '已发送' : 'Sent')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-5 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">{isZh ? '还没查过你的地块可行性？' : 'Haven\'t checked your block yet?'}</p>
          <a href="/feasibility" className="shrink-0 flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm">
            {isZh ? '免费查询 →' : 'Free check →'} <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Professional CTA */}
        <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HardHat className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">
              {isZh ? '你是建房专业人士？免费将你的业务收录进目录。' : 'Are you a build professional? Get your business listed for free.'}
            </p>
          </div>
          <a href="/dashboard/pro" className="shrink-0 flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold text-sm whitespace-nowrap">
            {isZh ? '申请入驻 →' : 'Get listed →'}
          </a>
        </div>
      </div>
    </div>
  )
}
