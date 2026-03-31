import { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articles-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ausbuildcircle.com'
  const now = new Date()

  const states = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt']

  return [
    { url: base,                         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/feasibility`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/professionals`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/suppliers`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/articles`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/guide`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/join`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/suppliers/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/forum`,              lastModified: now, changeFrequency: 'daily',   priority: 0.5 },
    ...states.map(s => ({
      url: `${base}/professionals/${s}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...ARTICLES.map(a => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${base}/privacy`,            lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`,              lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
