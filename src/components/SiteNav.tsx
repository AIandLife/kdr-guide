'use client'

import { useState } from 'react'
import { Building2, ArrowLeft, Menu, X } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'

interface SiteNavProps {
  backHref?: string
  backLabel?: string
  currentPath?: string
}

export function SiteNav({ backHref, backLabel, currentPath }: SiteNavProps) {
  const { lang } = useLang()
  const t = translations[lang]
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/guide',         label: t.nav.guide },
    { href: '/professionals', label: t.nav.professionals },
    { href: '/articles',      label: t.nav.articles },
    { href: '/suppliers',     label: t.nav.suppliers },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Left: back button or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <>
              <a href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">{backLabel ?? t.nav.home}</span>
              </a>
              <div className="w-px h-5 bg-gray-200 shrink-0" />
            </>
          )}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">{t.nav.brand}</span>
          </a>
        </div>

        {/* Centre: desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map(link => {
            const active = currentPath === link.href
            return (
              <a key={link.href} href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: active ? '#f97316' : '#374151',
                  background: active ? '#fff7ed' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Right: lang toggle + CTA + mobile menu */}
        <div className="flex items-center gap-2 shrink-0">
          <LangToggle />
          <a href="/feasibility"
            className="hidden sm:inline-flex items-center bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-200">
            {t.nav.cta}
          </a>
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
            <a key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 pb-1">
            <a href="/feasibility"
              className="block w-full text-center bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {t.nav.cta}
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
