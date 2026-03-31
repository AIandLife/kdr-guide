import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Government Construction Tenders | AusBuildCircle 澳洲建房圈',
  description: 'Latest Australian government construction and building tenders from AusTender. Updated daily with AI-powered Chinese summaries.',
}

export default function TendersLayout({ children }: { children: React.ReactNode }) {
  return children
}
