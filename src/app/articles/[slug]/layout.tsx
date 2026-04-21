import type { Metadata } from 'next'
import { ARTICLES } from '@/lib/articles-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) {
    return { title: 'Article Not Found | AusBuildCircle 澳洲建房圈' }
  }

  return {
    title: `${article.title} | AusBuildCircle 澳洲建房圈`,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://ausbuildcircle.com/articles/${slug}`,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      siteName: 'AusBuildCircle 澳洲建房圈',
      images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: ['/og.jpg'],
    },
  }
}

export default function ArticleSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  // Unwrap params to get slug for JSON-LD
  // We need to render JSON-LD server-side, so we use an async component pattern
  return (
    <>
      <ArticleJsonLd params={params} />
      {children}
    </>
  )
}

async function ArticleJsonLd({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: ['https://ausbuildcircle.com/og.jpg'],
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'AusBuildCircle',
      url: 'https://ausbuildcircle.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AusBuildCircle',
      url: 'https://ausbuildcircle.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ausbuildcircle.com/logo-icon.png',
      },
    },
    mainEntityOfPage: `https://ausbuildcircle.com/articles/${slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
