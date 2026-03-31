import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Knowledge Hub — Guides & Resources | AusBuildCircle 澳洲建房圈',
  description: 'Expert guides on knockdown rebuild, renovation, financing, council approvals, and more.',
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
