import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '商家入驻 · 澳洲建房圈 AusBuildCircle',
  description:
    '澳洲建房圈商家入驻：Builder、设计师、规划师、拆房、水电等建房服务商免费收录，2 分钟提交，审核后展示给正在规划建房的业主。',
  alternates: { canonical: 'https://ausbuildcircle.com/ruzhu' },
}

export default function RuzhuLayout({ children }: { children: React.ReactNode }) {
  return children
}
