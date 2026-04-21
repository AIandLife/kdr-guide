import { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articles-data'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600 // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://ausbuildcircle.com'
  const now = new Date()
  const states = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt']

  // Pull tenders (best-effort; skip if Supabase is unavailable)
  let tenderEntries: MetadataRoute.Sitemap = []
  try {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    if (url && key) {
      const supabase = createClient(url, key)
      const { data } = await supabase
        .from('government_tenders')
        .select('id, updated_at, created_at')
        .eq('is_construction', true)
        .order('created_at', { ascending: false })
        .limit(500)
      if (data) {
        tenderEntries = data.map(t => ({
          url: `${base}/tenders/${t.id}`,
          lastModified: new Date(t.updated_at || t.created_at || now),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        }))
      }
    }
  } catch {
    // ignore — sitemap should never break the build
  }

  const latestArticleDate = ARTICLES.reduce((max, a) => {
    const d = new Date(a.date)
    return d > max ? d : max
  }, new Date(0))

  return [
    { url: base,                         lastModified: latestArticleDate.getTime() ? latestArticleDate : now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/feasibility`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/professionals`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/suppliers`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/directory`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/tenders`,            lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/articles`,           lastModified: latestArticleDate.getTime() ? latestArticleDate : now, changeFrequency: 'weekly', priority: 0.7 },
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
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...tenderEntries,
    { url: `${base}/privacy`,            lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`,              lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
