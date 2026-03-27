import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find KDR Builders, Designers & Planners Near You | AusBuildCircle',
  description: 'Browse verified knockdown rebuild specialists, town planners, designers, and tradespeople across Australia. Get quotes from professionals in your area.',
}

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
