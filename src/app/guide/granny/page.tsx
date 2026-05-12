'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Home, ClipboardList, Ruler, FileText, Zap, Hammer, Building2, Wrench } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { SiteNav } from '@/components/SiteNav'

type State = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'Other' | null
type LotBand = 'lt450' | '450-600' | 'gte600' | null
type Zone = 'R2' | 'R3' | 'RU5' | 'unsure' | null
type Restriction = 'heritage' | 'flood' | 'bushfire' | 'none' | null

const STAGES_ZH = [
  { id: 1, icon: Ruler,       color: 'emerald', title: '资格核实',        duration: '1–2 周', summary: '上面的选择器走一遍 + 申请 10.7 证书核实地役权 / 限制' },
  { id: 2, icon: ClipboardList,color: 'emerald', title: '设计',           duration: '2–4 周', summary: '面积 ≤ 60㎡ · 独立出入口 · 退缩 0.9–3m · BASIX 节能' },
  { id: 3, icon: FileText,    color: 'emerald', title: '审批',           duration: '2–8 周', summary: '符合 SEPP → CDC (10 工作日) · 不符 → DA' },
  { id: 4, icon: Zap,         color: 'emerald', title: '公共设施接驳',     duration: '与设计并行', summary: '水 / 电 / 燃气 / 排污 — 最容易超支的一项，可单独申请独立表' },
  { id: 5, icon: Hammer,      color: 'emerald', title: '施工',           duration: '14–20 周', summary: '比 KDR 短得多 · 预制方案可压到 8–12 周' },
  { id: 6, icon: Home,        color: 'emerald', title: '验收 / 出租 / 税务', duration: '1–2 周', summary: 'OC 签发 + 找会计做 CGT 主居豁免测算 + 出租注册' },
]

const STAGES_EN = [
  { id: 1, icon: Ruler,       color: 'emerald', title: 'Eligibility check',  duration: '1–2 weeks', summary: 'Run the qualifier above + order Section 10.7 to verify easements and overlays' },
  { id: 2, icon: ClipboardList,color: 'emerald', title: 'Design',             duration: '2–4 weeks', summary: '≤60sqm floor area · separate entry · 0.9–3m setbacks · BASIX compliance' },
  { id: 3, icon: FileText,    color: 'emerald', title: 'Approval',            duration: '2–8 weeks', summary: 'SEPP-compliant → CDC (10 business days) · otherwise → DA' },
  { id: 4, icon: Zap,         color: 'emerald', title: 'Utility connections', duration: 'parallel with design', summary: 'Water / power / gas / sewer — the most commonly underestimated cost' },
  { id: 5, icon: Hammer,      color: 'emerald', title: 'Construction',         duration: '14–20 weeks', summary: 'Much shorter than KDR · prefab options can compress to 8–12 weeks' },
  { id: 6, icon: Home,        color: 'emerald', title: 'Handover / rent / tax', duration: '1–2 weeks', summary: 'OC issued + accountant for CGT main residence apportionment + rental setup' },
]

export default function GrannyFlatPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const stages = isZh ? STAGES_ZH : STAGES_EN

  const [state, setState] = useState<State>(null)
  const [lot, setLot] = useState<LotBand>(null)
  const [zone, setZone] = useState<Zone>(null)
  const [restriction, setRestriction] = useState<Restriction>(null)

  const answered = state && lot && zone && restriction
  const qualifies =
    state === 'NSW' &&
    (lot === '450-600' || lot === 'gte600') &&
    (zone === 'R2' || zone === 'R3') &&
    restriction === 'none'

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/guide/granny" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
          <div className="text-xs text-emerald-600 tracking-wider font-semibold">GRANNY FLAT · SECONDARY DWELLING</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800 mt-2">
            {isZh ? '奶奶房 / 独立辅助住宅' : 'Granny Flat / Secondary Dwelling'}
          </h1>
          <p className="text-gray-700 mt-3">
            {isZh
              ? '在现有院子里加一个独立小房子。NSW SEPP 路径最快 10 个工作日 CDC 审批，预算典型 $120k–$250k，总周期 14–20 周。'
              : 'Add a self-contained dwelling in your existing yard. NSW SEPP fast-track CDC in 10 business days, typical budget $120k–$250k, total 14–20 weeks.'}
          </p>
        </div>

        {/* Qualifier */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🧭 {isZh ? 'SEPP CDC 资格选择器' : 'SEPP CDC Eligibility Check'}
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
              {isZh ? '按规则 · 不靠 AI' : 'Rule-based · No AI'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            {isZh ? '30 秒答完，直接出结论。' : '30 seconds. Direct answer.'}
          </p>

          {/* Q1 State */}
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-900 mb-2">① {isZh ? '你的地块在哪个州？' : 'Which state?'}</div>
            <div className="flex gap-2 flex-wrap">
              {(['NSW', 'VIC', 'QLD', 'WA', 'Other'] as State[]).map(s => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    state === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {s === 'Other' ? (isZh ? 'SA / ACT / TAS' : 'SA / ACT / TAS') : s}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 Lot */}
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-900 mb-2">② {isZh ? '地块面积？' : 'Lot size?'}</div>
            <div className="flex gap-2 flex-wrap">
              {(['lt450', '450-600', 'gte600'] as LotBand[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLot(l)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    lot === l ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {l === 'lt450' ? '< 450㎡' : l === '450-600' ? '450–600㎡' : '≥ 600㎡'}
                </button>
              ))}
            </div>
          </div>

          {/* Q3 Zone */}
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-900 mb-2">③ {isZh ? '分区？' : 'Zone?'}</div>
            <div className="flex gap-2 flex-wrap">
              {([
                { v: 'R2',     label: isZh ? 'R2 低密度住宅' : 'R2 Low Density Residential' },
                { v: 'R3',     label: isZh ? 'R3 中密度' : 'R3 Medium Density' },
                { v: 'RU5',    label: isZh ? 'RU5 乡村' : 'RU5 Village / Rural' },
                { v: 'unsure', label: isZh ? '不确定' : 'Not sure' },
              ] as { v: Zone; label: string }[]).map(z => (
                <button
                  key={z.v}
                  onClick={() => setZone(z.v)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    zone === z.v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q4 Restrictions */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-900 mb-2">④ {isZh ? '以下任一项是否命中？' : 'Any overlay restrictions?'}</div>
            <div className="flex gap-2 flex-wrap">
              {([
                { v: 'heritage', label: isZh ? '遗产保护区' : 'Heritage' },
                { v: 'flood',    label: isZh ? '洪水规划区' : 'Flood' },
                { v: 'bushfire', label: isZh ? '丛林火灾区' : 'Bushfire' },
                { v: 'none',     label: isZh ? '都没有' : 'None of these' },
              ] as { v: Restriction; label: string }[]).map(r => (
                <button
                  key={r.v}
                  onClick={() => setRestriction(r.v)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    restriction === r.v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {answered && (
            <div className={`rounded-xl border-2 p-5 ${qualifies ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="flex items-start gap-3">
                {qualifies ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={`text-base font-semibold ${qualifies ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {qualifies
                      ? (isZh ? '✅ 大概率符合 NSW SEPP CDC 快速通道' : '✅ Likely eligible for NSW SEPP CDC fast-track')
                      : (isZh ? '⚠️ 大概率不符合 CDC 路径 — 仍可能走 DA' : '⚠️ Likely NOT eligible for CDC — DA pathway may still apply')}
                  </div>
                  <div className={`text-sm mt-3 leading-relaxed ${qualifies ? 'text-emerald-900' : 'text-amber-900'}`}>
                    {qualifies ? (
                      isZh ? (
                        <>
                          · 奶奶房面积上限 60㎡ · 退缩 0.9–3m · 与主房 ≥ 3m<br />
                          · CDC 审批约 10 个工作日 · 总周期 14–20 周<br />
                          · 预算建议 <b>$200k–$280k</b>（含 10% 预备金，已包含公共设施接驳）
                        </>
                      ) : (
                        <>
                          · Granny flat max 60sqm · 0.9–3m setbacks · ≥3m from main dwelling<br />
                          · CDC approval ~10 business days · total timeline 14–20 weeks<br />
                          · Budget guidance <b>$200k–$280k</b> (10% contingency, includes utility connections)
                        </>
                      )
                    ) : isZh ? (
                      <>
                        · 你的地块情况不符合 NSW SEPP 自动通过条件<br />
                        · 仍可申请 DA — 取决于 Council LEP 对辅助住宅的具体规定<br />
                        · 建议先咨询当地 Town Planner，确认是否可走 DA 路径
                      </>
                    ) : (
                      <>
                        · Your lot does not meet NSW SEPP auto-approval rules<br />
                        · A DA pathway may still apply — depends on council LEP for secondary dwellings<br />
                        · Recommend consulting a local Town Planner first
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap text-xs">
                    <a href="/professionals?category=planner" className="px-3 py-1.5 bg-white border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50">
                      {isZh ? '联系 Town Planner →' : 'Contact a Town Planner →'}
                    </a>
                    <a href="/professionals?category=builder" className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                      {isZh ? '联系奶奶房专业建筑商 →' : 'Contact a granny flat builder →'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stages */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isZh ? '奶奶房 6 个阶段' : 'Granny Flat — 6 Stages'}
          </h2>
          <p className="text-sm text-gray-500">
            {isZh ? '从资格核实到出租 — 比推倒重建快 3–4 倍' : 'From eligibility to rental — 3–4× faster than KDR'}
          </p>
        </div>

        <div className="space-y-3">
          {stages.map(stage => (
            <div key={stage.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <stage.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-emerald-600">STAGE {stage.id}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
                  <span className="text-xs text-gray-500">· {stage.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{stage.summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-emerald-50 rounded-2xl p-6 border border-emerald-200 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold text-gray-900">
              {isZh ? '准备好开始了？' : 'Ready to start?'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isZh ? '联系做过奶奶房项目的本地建筑商和 Town Planner' : 'Connect with builders and planners who have delivered granny flats locally'}
            </p>
          </div>
          <a href="/professionals" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700">
            {isZh ? '浏览建筑商' : 'Browse Builders'}
          </a>
        </div>
      </div>
    </div>
  )
}
