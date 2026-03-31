import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '服务目录 | AusBuildCircle',
  description: '找建筑商、设计师、Town Planner、建材供应商 — 澳洲建房专业人士和建材供应商目录',
}

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
