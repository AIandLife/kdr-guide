import type { Metadata } from 'next'
import HomePageClient from '@/components/home/HomePageClient'

export const metadata: Metadata = {
  title: 'AusBuildCircle 澳洲建房圈 – Knockdown Rebuild, Renovation & Extension Platform',
  description: 'Free AI feasibility reports for knockdown rebuild, renovation, extension, granny flat and dual occupancy across all 537 Australian councils. No signup required.',
  openGraph: {
    title: 'AusBuildCircle 澳洲建房圈 – Knockdown Rebuild & Renovation Platform',
    description: 'Free AI feasibility reports for knockdown rebuild, renovation, extension, granny flat and dual occupancy across all 537 Australian councils.',
    url: 'https://ausbuildcircle.com',
    siteName: 'AusBuildCircle 澳洲建房圈',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AusBuildCircle 澳洲建房圈',
    description: 'Free AI feasibility reports for knockdown rebuild, renovation, extension, granny flat and dual occupancy across all 537 Australian councils.',
    images: ['/og.jpg'],
  },
  alternates: {
    canonical: 'https://ausbuildcircle.com',
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AusBuildCircle 澳洲建房圈",
  "url": "https://ausbuildcircle.com",
  "description": "Australia's knockdown rebuild and renovation platform for Chinese-speaking homeowners",
  "inLanguage": ["en-AU", "zh-Hans"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ausbuildcircle.com/feasibility?suburb={search_term_string}&state=NSW",
    "query-input": "required name=search_term_string"
  }
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AusBuildCircle 澳洲建房圈",
  "url": "https://ausbuildcircle.com",
  "description": "AI-powered knockdown rebuild, renovation, and home extension platform for Australian homeowners",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@ausbuildcircle.com",
    "contactType": "customer service",
    "availableLanguage": ["English", "Chinese"]
  },
  "sameAs": []
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <HomePageClient />
    </>
  )
}
