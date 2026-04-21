import type { Metadata } from 'next'

const title = 'Builder Community Forum — Ask Questions, Share Experiences | AusBuildCircle'
const description = "Join Australia's home building community. Ask questions about knockdown rebuild, renovations, council approvals, and costs. Connect with homeowners and professionals."
const url = 'https://ausbuildcircle.com/forum'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/forum' },
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

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children
}
