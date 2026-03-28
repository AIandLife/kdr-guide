import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { LangProvider } from '@/lib/language-context'
import { AuthProvider } from '@/lib/auth-context'
import FeedbackWidget from '@/components/FeedbackWidget'
import type { Lang } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'AusBuildCircle 澳洲建房圈 – Australia\'s Home Renovation & Rebuild Platform',
  description: 'AI feasibility reports for knockdown rebuild, renovation, extension, granny flat and dual occupancy — all 537 councils, free. No signup required.',
  icons: { icon: '/logo-icon.png' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('kdr-lang')?.value
  const initialLang: Lang = langCookie === 'zh' ? 'zh' : 'en'

  return (
    <html lang={initialLang === 'zh' ? 'zh' : 'en'}>
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <LangProvider initialLang={initialLang}>
          <AuthProvider>
            {children}
            <FeedbackWidget />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  )
}
