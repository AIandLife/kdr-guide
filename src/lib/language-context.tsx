'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Lang } from './i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  toggle: () => {},
})

export function LangProvider({ children, initialLang = 'en' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = (l: Lang) => {
    setLangState(l)
    // Write to both localStorage and cookie so server can read on next request
    try { localStorage.setItem('kdr-lang', l) } catch {}
    document.cookie = `kdr-lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
  }

  const toggle = () => setLang(lang === 'en' ? 'zh' : 'en')

  // Honour an explicit ?lang= in the URL (shared/deep links) so a zh link lands
  // in Chinese regardless of cookie/browser default. Runs once on mount.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('lang')
      if ((p === 'zh' || p === 'en') && p !== lang) setLang(p)
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
