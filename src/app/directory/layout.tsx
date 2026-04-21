import type { Metadata } from 'next'

const title = '服务目录 — 专业人士与建材供应商 | AusBuildCircle'
const description = '找建筑商、设计师、Town Planner、建材供应商 — 澳洲建房专业人士和建材供应商统一目录。'
const url = 'https://ausbuildcircle.com/directory'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/directory' },
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

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
