import type { Metadata } from 'next'

const title = 'Knockdown Rebuild Process Guide — Every Step Explained | AusBuildCircle'
const description = 'The complete Australian knockdown rebuild guide. From first question to moving in — council approvals, costs, timelines, and who you need to hire.'
const url = 'https://ausbuildcircle.com/guide'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/guide' },
  openGraph: {
    title,
    description,
    url,
    siteName: 'AusBuildCircle 澳洲建房圈',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.jpg'],
  },
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
