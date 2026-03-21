import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/language-context'

export const metadata: Metadata = {
  title: 'KDR Guide – Australia\'s Knockdown Rebuild Expert',
  description: 'Enter your address and find out if your property is eligible for knockdown rebuild in Australia. AI-powered feasibility check, cost estimates, and builder matching.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
