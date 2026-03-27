'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
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

  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
