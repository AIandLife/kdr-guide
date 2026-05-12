'use client'

import { ClipboardList, DollarSign, FileText, Hammer, Building2, Home, Search } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { SiteNav } from '@/components/SiteNav'

const STAGES_ZH = [
  { id: 1, icon: Search,        title: '范围与现状评估',  duration: '2–4 周',  summary: '旧屋的结构、石棉、旧水电、遗产限制 — 这些"看不见"的部分决定了真正预算' },
  { id: 2, icon: ClipboardList, title: '设计与造价',      duration: '4–8 周',  summary: '$1,500–$4,500/㎡ 视范围而定 · 结构动 vs 不动是最大分叉' },
  { id: 3, icon: FileText,      title: '审批',           duration: '2–24 周', summary: 'Building Permit / DA / Heritage Approval — 范围决定路径' },
  { id: 4, icon: Hammer,        title: '拆除与剥离',      duration: '1–3 周',  summary: '局部拆 · 石棉合规 · 临时支撑 · 旧屋开了才知道隐藏问题' },
  { id: 5, icon: Building2,     title: '施工',           duration: '12–30 周', summary: '工期不确定性最大的阶段 — 旧屋打开后的发现常常改变计划' },
  { id: 6, icon: Home,          title: '验收',           duration: '1–2 周',  summary: '缺陷清单 · 质保期 · 与业主共同确认完工' },
]

const STAGES_EN = [
  { id: 1, icon: Search,        title: 'Scope & condition assessment', duration: '2–4 weeks',  summary: 'Structure, asbestos, old services, heritage — the invisible parts that drive real budget' },
  { id: 2, icon: ClipboardList, title: 'Design & costing',              duration: '4–8 weeks',  summary: '$1,500–$4,500/sqm depending on scope · structural vs cosmetic is the biggest fork' },
  { id: 3, icon: FileText,      title: 'Approval',                      duration: '2–24 weeks', summary: 'Building Permit / DA / Heritage Approval — scope determines pathway' },
  { id: 4, icon: Hammer,        title: 'Demolition & strip-out',        duration: '1–3 weeks',  summary: 'Partial demo · asbestos compliance · temporary support · hidden issues surface here' },
  { id: 5, icon: Building2,     title: 'Construction',                  duration: '12–30 weeks', summary: 'Highest schedule uncertainty — discoveries during opening up often change plans' },
  { id: 6, icon: Home,          title: 'Completion',                    duration: '1–2 weeks',  summary: 'Defect list · warranty period · sign-off with owner' },
]

const COSTS_ZH = [
  {
    tier: '表面翻新',
    scope: '厨卫翻新 + 油漆 + 地板 + 灯具',
    cost: '$80k–$200k',
    duration: '8–16 周',
    permit: '通常 Building Permit 即可',
    color: 'blue',
  },
  {
    tier: '结构翻新',
    scope: '动墙 + 加房 + 加卫浴 + 改格局',
    cost: '$200k–$600k',
    duration: '16–30 周',
    permit: '多数走 DA',
    color: 'indigo',
  },
  {
    tier: '全面改造',
    scope: '拆 50%+ / 加层 / 重做立面',
    cost: '$500k–$1.2m',
    duration: '30–50 周',
    permit: '必走 DA · 接近 KDR 复杂度',
    color: 'purple',
  },
]

const COSTS_EN = [
  { tier: 'Cosmetic renovation', scope: 'Kitchen/bath refresh + paint + flooring + lighting',  cost: '$80k–$200k',  duration: '8–16 weeks',  permit: 'Building Permit typically sufficient', color: 'blue' },
  { tier: 'Structural renovation', scope: 'Move walls + add rooms + add bathrooms + replan',    cost: '$200k–$600k', duration: '16–30 weeks', permit: 'DA in most councils',                  color: 'indigo' },
  { tier: 'Full remodel',          scope: 'Demolish 50%+ / add storey / re-skin facade',         cost: '$500k–$1.2m', duration: '30–50 weeks', permit: 'DA required · KDR-level complexity',    color: 'purple' },
]

export default function RenovationPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const stages = isZh ? STAGES_ZH : STAGES_EN
  const costs = isZh ? COSTS_ZH : COSTS_EN

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/guide/renovation" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="text-xs text-blue-700 tracking-wider font-semibold">MAJOR RENOVATION</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mt-2">
            {isZh ? '翻新 / 改造' : 'Major Renovation'}
          </h1>
          <p className="text-gray-700 mt-3">
            {isZh
              ? '保留主体结构，重新装修 / 加层 / 改格局。旧屋打开后才会暴露真正的成本 — 这里我们用 3 档参照表代替"AI 报告"，因为没有图纸和现场，AI 给不出有用的判断。'
              : 'Keep the main structure, redo finishes / add a storey / replan. Real costs only emerge once walls open — we use a 3-tier reference table here instead of an "AI report", because without plans and a site visit AI cannot deliver useful judgement.'}
          </p>
        </div>

        {/* Cost reference */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-700" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isZh ? '翻新成本参照表' : 'Renovation cost reference'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            {isZh ? '比 AI 报告更实用 — 直接告诉你不同范围的钱、时间和审批路径' : 'More useful than AI — tells you cost / duration / approval pathway by scope tier'}
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {costs.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Tier {i + 1}</div>
                <h3 className="text-lg font-semibold text-gray-900">{c.tier}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{c.scope}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">{isZh ? '预算' : 'Budget'}</span><span className="font-semibold text-gray-900">{c.cost}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{isZh ? '周期' : 'Duration'}</span><span className="text-gray-900">{c.duration}</span></div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">{c.permit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stages */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isZh ? '翻新 6 个阶段' : 'Renovation — 6 Stages'}
          </h2>
          <p className="text-sm text-gray-500">
            {isZh ? '从现状评估到验收 — 不同 Tier 的时长跨度最大' : 'From assessment to handover — duration spread is widest here'}
          </p>
        </div>

        <div className="space-y-3">
          {stages.map(stage => (
            <div key={stage.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <stage.icon className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-blue-700">STAGE {stage.id}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
                  <span className="text-xs text-gray-500">· {stage.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{stage.summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-blue-50 rounded-2xl p-6 border border-blue-200 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold text-gray-900">
              {isZh ? '准备好聊翻新方案？' : 'Ready to discuss your renovation?'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isZh ? '建议先找做过类似翻新规模的建筑商和设计师现场评估' : 'Get on-site assessments from builders and designers experienced at your scope tier'}
            </p>
          </div>
          <a href="/professionals" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            {isZh ? '浏览建筑商' : 'Browse Builders'}
          </a>
        </div>
      </div>
    </div>
  )
}
