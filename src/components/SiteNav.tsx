'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

interface SiteNavProps {
  backHref?: string
  backLabel?: string
  currentPath?: string
}

export function SiteNav({ backHref, backLabel, currentPath }: SiteNavProps) {
  const { lang } = useLang()
  const t = translations[lang]
  const isZh = lang === 'zh'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loading } = useAuth()

  const links = [
    { href: '/guide',         label: t.nav.guide },
    { href: '/articles',      label: t.nav.articles },
    { href: '/professionals', label: t.nav.professionals },
    { href: '/suppliers',     label: t.nav.suppliers },
    { href: '/forum',         label: t.nav.forum },
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  const avatarLetter = user?.email?.[0].toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Left: back button or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <>
              <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">{backLabel ?? t.nav.home}</span>
              </Link>
              <div className="w-px h-5 bg-gray-200 shrink-0" />
            </>
          )}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt="AusBuildCircle" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-gray-900 hidden sm:block">{t.nav.brand}</span>
          </Link>
        </div>

        {/* Centre: desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map(link => {
            const active = currentPath === link.href
            return (
              <Link key={link.href} href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: active ? '#f97316' : '#374151',
                  background: active ? '#fff7ed' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right: lang toggle + CTA/user + mobile menu */}
        <div className="flex items-center gap-2 shrink-0">
          <LangToggle />
          <Link href="/feasibility"
            className="hidden sm:inline-flex items-center bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-200">
            {t.nav.cta}
          </Link>

          {/* User avatar / login */}
          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center hover:bg-orange-400 transition-colors"
                >
                  {avatarLetter}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">{user.email}</p>
                    <Link href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      {isZh ? '我的后台' : 'My Dashboard'}
                    </Link>
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      {isZh ? '退出登录' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100">
                <User className="w-4 h-4" />
                {isZh ? '登录' : 'Sign in'}
              </Link>
            )
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 pb-1 space-y-2">
            <Link href="/feasibility"
              className="block w-full text-center bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {t.nav.cta}
            </Link>
            {user ? (
              <Link href="/dashboard/pro"
                className="block w-full text-center border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                {isZh ? '我的后台' : 'My Dashboard'}
              </Link>
            ) : (
              <Link href="/login"
                className="block w-full text-center border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                {isZh ? '登录' : 'Sign in'}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
