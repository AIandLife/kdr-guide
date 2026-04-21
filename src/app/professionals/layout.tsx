import type { Metadata } from 'next'

const title = 'Find KDR Builders, Designers & Planners Near You | AusBuildCircle'
const description = 'Browse verified knockdown rebuild specialists, town planners, designers, and tradespeople across Australia. Get quotes from professionals in your area.'
const url = 'https://ausbuildcircle.com/professionals'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/professionals' },
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

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
