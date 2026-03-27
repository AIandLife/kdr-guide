import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { LangProvider } from '@/lib/language-context'
import { AuthProvider } from '@/lib/auth-context'
import FeedbackWidget from '@/components/FeedbackWidget'
import type { Lang } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'AusBuildCircle 澳洲建房圈 – Australia\'s Knockdown Rebuild Expert',
  description: 'Enter your address and find out if your property is eligible for knockdown rebuild in Australia. AI-powered feasibility check, cost estimates, and builder matching.',
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
