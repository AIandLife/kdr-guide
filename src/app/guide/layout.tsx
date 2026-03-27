import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knockdown Rebuild Process Guide — Every Step Explained | AusBuildCircle',
  description: 'The complete Australian knockdown rebuild guide. From first question to moving in — council approvals, costs, timelines, and who you need to hire.',
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
