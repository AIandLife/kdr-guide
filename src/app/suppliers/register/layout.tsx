import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your Business | AusBuildCircle 澳洲建房圈',
  description: 'List your building materials business in the AusBuildCircle supplier directory. Free to join.',
}

export default function SupplierRegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
