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
    // First try user_id match, fallback to email match (for accounts joined before login)
    supabase.from('professionals').select('id, user_id').eq('user_id', user.id).maybeSingle().then(async ({ data }) => {
      if (data) { router.push('/dashboard/pro'); return }
      // Fallback: match by email and auto-bind user_id
      const { data: byEmail } = await supabase.from('professionals').select('id').eq('email', user.email!).maybeSingle()
      if (byEmail) {
        // Bind user_id for future lookups
        await supabase.from('professionals').update({ user_id: user.id }).eq('email', user.email!)
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
