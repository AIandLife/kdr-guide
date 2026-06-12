import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '对接大厅 · 业主需求板 | 澳洲建房圈 AusBuildCircle',
  description:
    '澳洲建房需求对接大厅：业主免费发布推倒重建、奶奶房、双拼、翻新扩建需求（只显示区域，不公开门牌和联系方式），认证商家响应后由业主自己挑选联系。',
  alternates: { canonical: 'https://ausbuildcircle.com/board' },
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return children
}
