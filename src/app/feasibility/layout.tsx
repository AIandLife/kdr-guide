import type { Metadata } from 'next'

const title = 'Free AI Feasibility Report — KDR, Dual Occ, Granny Flat | AusBuildCircle'
const description = 'Get an instant AI feasibility report for your suburb. Council rules, realistic costs, approval timelines, and next steps — free, no signup required.'
const url = 'https://ausbuildcircle.com/feasibility'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/feasibility' },
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

export default function FeasibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}
