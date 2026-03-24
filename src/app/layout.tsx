import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/language-context'
import { AuthProvider } from '@/lib/auth-context'
import FeedbackWidget from '@/components/FeedbackWidget'

export const metadata: Metadata = {
  title: 'AusBuildCircle 澳洲建房圈 – Australia\'s Knockdown Rebuild Expert',
  description: 'Enter your address and find out if your property is eligible for knockdown rebuild in Australia. AI-powered feasibility check, cost estimates, and builder matching.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <LangProvider>
          <AuthProvider>
            {children}
            <FeedbackWidget />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  )
}
