import type { Metadata } from 'next'

const title = 'Build Knowledge Hub — Guides & Resources | AusBuildCircle 澳洲建房圈'
const description = 'Expert guides on knockdown rebuild, renovation, financing, council approvals, and more.'
const url = 'https://ausbuildcircle.com/articles'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/articles' },
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

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
