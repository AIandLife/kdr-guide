import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Builder Community Forum — Ask Questions, Share Experiences | AusBuildCircle',
  description: 'Join Australia\'s home building community. Ask questions about knockdown rebuild, renovations, council approvals, and costs. Connect with homeowners and professionals.',
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children
}
