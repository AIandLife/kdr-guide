import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ausbuildcircle.com'
  const now = new Date()

  return [
    { url: base,                         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/feasibility`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guide`,              lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/articles`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/professionals`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/suppliers`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/forum`,              lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/join`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    // Articles
    { url: `${base}/articles/kdr-cost-guide-australia`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/council-approval-kdr-australia`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/knockdown-rebuild-vs-renovate`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/choosing-kdr-builder-australia`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/heritage-overlay-kdr`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/granny-flat-rules-australia`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/kdr-finance-construction-loan`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/articles/geotech-report-kdr-guide`,              lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/articles/independent-building-inspector-kdr`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/articles/fixed-price-vs-cost-plus-contracts`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/articles/asbestos-removal-kdr-australia`,        lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
