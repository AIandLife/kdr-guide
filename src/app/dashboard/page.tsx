'use client'

// Smart redirect: detect pro vs homeowner and redirect accordingly
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export default function DashboardRedirect() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) { window.location.href = '/login?next=/dashboard'; return }

    const supabase = createClient()
    supabase.from('professionals').select('id').eq('user_id', user.id).single().then(({ data }) => {
      window.location.href = data ? '/dashboard/pro' : '/dashboard/homeowner'
    })
  }, [user, loading])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  )
}
