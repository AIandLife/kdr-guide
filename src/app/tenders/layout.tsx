import type { Metadata } from 'next'

const title = 'Government Construction Tenders | AusBuildCircle 澳洲建房圈'
const description = 'Latest Australian government construction and building tenders from AusTender. Updated daily with AI-powered Chinese summaries.'
const url = 'https://ausbuildcircle.com/tenders'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/tenders' },
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

export default function TendersLayout({ children }: { children: React.ReactNode }) {
  return children
}
