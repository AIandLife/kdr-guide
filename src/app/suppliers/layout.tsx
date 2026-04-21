import type { Metadata } from 'next'

const title = 'Compare Building Suppliers — Materials, Windows, Flooring & More | AusBuildCircle'
const description = 'Compare verified Australian building suppliers. Find the best deals on windows, flooring, roofing, kitchens, and more for your knockdown rebuild or renovation.'
const url = 'https://ausbuildcircle.com/suppliers'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/suppliers' },
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

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return children
}
