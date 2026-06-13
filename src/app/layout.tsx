import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import './globals.css'
import { LangProvider } from '@/lib/language-context'
import { AuthProvider } from '@/lib/auth-context'
import FeedbackWidget from '@/components/FeedbackWidget'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import type { Lang } from '@/lib/i18n'

export const metadata: Metadata = {
  metadataBase: new URL('https://ausbuildcircle.com'),
  title: 'AusBuildCircle 澳洲建房圈 – Australia\'s Home Renovation & Rebuild Platform',
  description: 'AI feasibility reports for knockdown rebuild, renovation, extension, granny flat and dual occupancy — all 537 councils, free. No signup required.',
  icons: { icon: '/logo-icon.png' },
  openGraph: {
    title: 'AusBuildCircle 澳洲建房圈 – Knockdown Rebuild & Renovation Platform',
    description: 'AI feasibility reports, verified builders, and building material suppliers for knockdown rebuild, renovation, extension and granny flat projects across Australia.',
    url: 'https://ausbuildcircle.com',
    siteName: 'AusBuildCircle 澳洲建房圈',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AusBuildCircle 澳洲建房圈',
    description: 'AI feasibility reports, verified builders, and building material suppliers for knockdown rebuild, renovation, extension and granny flat projects across Australia.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('kdr-lang')?.value
  // Chinese-first product: honour an explicit choice (cookie), otherwise detect
  // the visitor's browser language so Chinese browsers land in Chinese and
  // English browsers / crawlers land in English.
  let initialLang: Lang = 'en'
  if (langCookie === 'zh' || langCookie === 'en') {
    initialLang = langCookie
  } else {
    const accept = (await headers()).get('accept-language') || ''
    if (/^zh\b|[,;]\s*zh\b|\bzh-/i.test(accept)) initialLang = 'zh'
  }

  return (
    <html lang={initialLang === 'zh' ? 'zh' : 'en'}>
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <GoogleAnalytics />
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
