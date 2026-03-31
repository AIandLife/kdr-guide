'use client'

import { useLang } from '@/lib/language-context'
import { cn } from '@/lib/cn'

export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
      <button
        onClick={() => setLang('en')}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
          lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang('zh')}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
          lang === 'zh' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
        )}
      >
        中文
      </button>
    </div>
  )
}
