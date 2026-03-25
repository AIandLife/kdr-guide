'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'
  const langs = navigator.languages || [navigator.language]
  for (const l of langs) {
    if (l.toLowerCase().startsWith('zh')) return 'zh'
  }
  return 'en'
}

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('kdr-lang') as Lang | null
    if (saved === 'en' || saved === 'zh') return saved
    return detectBrowserLang()
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('kdr-lang', l)
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
