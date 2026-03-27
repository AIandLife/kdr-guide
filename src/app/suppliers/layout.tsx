import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Building Suppliers — Materials, Windows, Flooring & More | AusBuildCircle',
  description: 'Compare verified Australian building suppliers. Find the best deals on windows, flooring, roofing, kitchens, and more for your knockdown rebuild or renovation.',
}

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return children
}
