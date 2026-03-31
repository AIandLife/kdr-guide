'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login?next=/dashboard'); return }

    const supabase = createClient()
    // First try user_id match, fallback to server-side email binding
    supabase.from('professionals').select('id, user_id').eq('user_id', user.id).maybeSingle().then(async ({ data }) => {
      if (data) { router.push('/dashboard/pro'); return }
      // Use server-side API to bind (validates email from auth token, not client)
      const res = await fetch('/api/profile/bind', { method: 'POST' })
      const result = await res.json()
      if (result.bound) {
        router.push('/dashboard/pro')
      } else {
        router.push('/dashboard/homeowner')
      }
    })
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  )
}
