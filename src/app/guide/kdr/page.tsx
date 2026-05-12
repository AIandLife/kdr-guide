'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { SiteNav } from '@/components/SiteNav'

type Bilingual = { zh: string; en: string }
type SubTask = { title: Bilingual; detail: Bilingual }
type Stage = {
  id: number
  color: string
  title: Bilingual
  short: Bilingual
  duration: Bilingual
  summary: Bilingual
  subtasks: SubTask[]
}

// 数据沿用 src/app/guide/page.tsx 的 STAGES_ZH 原文 + 精简英文翻译
const STAGES: Stage[] = [
  {
    id: 1, color: '#3b82f6',
    title: { zh: '现场评估', en: 'Site Assessment' },
    short: { zh: '现场评估', en: 'Site' },
    duration: { zh: '2–4 周', en: '2–4w' },
    summary: { zh: '在花任何钱之前，先搞清楚你的地块允许什么', en: 'Understand what your site allows before spending money' },
    subtasks: [
      { title: { zh: '10.7 证书（NSW Section 10.7 Planning Certificate）', en: 'Section 10.7 Certificate' }, detail: { zh: '来自 Council 的官方文件，列出所有限制条款：遗产保护、洪水区、灌木火灾区、生物多样性保护、道路拓宽计划等。费用约 $100–200，是所有步骤的第一步，必须做。', en: 'Council official document listing all overlays: heritage, flood, bushfire, biodiversity, road widening. ~$100–200, mandatory first step.' } },
      { title: { zh: '查询分区规定（LEP / Planning Scheme）', en: 'Check LEP zoning' }, detail: { zh: '住宅分区（NSW 的 R2/R3，VIC 的 Neighbourhood Residential）对容积率、建筑高度、退缩距离和最小地块面积都有具体规定。在 Council 的规划地图上查询你的地块。', en: 'R2/R3 (NSW) or Neighbourhood Residential (VIC) zones define FSR, height, setbacks, min lot size. Search Council planning map.' } },
      { title: { zh: '确认地块尺寸', en: 'Confirm lot dimensions' }, detail: { zh: '确认地块正面宽度、深度和总面积。不同 Council 的最小地块要求差异很大：内城区低至 200㎡，外郊区可能要求 600㎡ 以上。', en: 'Frontage, depth, total area. Inner city 200sqm+, outer suburbs 600sqm+.' } },
      { title: { zh: '检查地役权和限制性条款', en: 'Easements & covenants' }, detail: { zh: '排水、管道、电力线等地役权会限制建筑位置。产权调查（Title Search）可以查到这些信息。建议咨询测量师。', en: 'Drainage / utility easements restrict building location. Title Search reveals these. Consult surveyor.' } },
      { title: { zh: '岩土工程师（如需）', en: 'Geotechnical engineer (if needed)' }, detail: { zh: '有坡度的地块、已知的膨胀土区域或洪水易发区，可能需要岩土/土壤分类报告。这会影响地基类型和基础费用。', en: 'Sloped lots, reactive clay, flood-prone areas need soil classification. Affects slab type and cost.' } },
    ],
  },
  {
    id: 2, color: '#16a34a',
    title: { zh: '可行性与融资', en: 'Feasibility & Finance' },
    short: { zh: '融资', en: 'Finance' },
    duration: { zh: '2–6 周', en: '2–6w' },
    summary: { zh: '在做任何承诺之前，先确认数字是否合理', en: 'Confirm numbers before committing' },
    subtasks: [
      { title: { zh: '计算项目总费用', en: 'Calculate total cost' }, detail: { zh: '包含：拆除 $20–50k · 新建 $2,400–4,500/㎡ · Council DA/CDC $5–15k · Section 7.11 $8–30k（经常忽略）· 顾问/土壤/测量 · 园艺景观 · 10–15% 预备金。', en: 'Demo $20–50k · Build $2,400–4,500/sqm · DA/CDC $5–15k · S7.11 $8–30k (often missed) · consultants · 10–15% contingency.' } },
      { title: { zh: '建筑贷款选项', en: 'Construction loan' }, detail: { zh: 'KDR 通常使用建筑贷款（Construction Loan），按施工阶段分批放款。建议找专门 Broker，确认 Builder 之前先获得预批。', en: 'Drawn in stages, not standard mortgage. Use construction-finance broker. Pre-approval before committing to builder.' } },
      { title: { zh: '业主自建 vs 持牌建筑商', en: 'Owner-builder vs licensed' }, detail: { zh: '自建可以省钱，但风险高、保险复杂、转售困难。对大多数业主，使用持牌建筑商更稳妥。', en: 'Self-build saves money but high risk, insurance complications, resale issues. Most owners → licensed builder.' } },
      { title: { zh: '对比 KDR vs 买新房', en: 'KDR vs buying new' }, detail: { zh: '在大多数主要城市，同 Suburb 推倒重建比直接购买同等新房更便宜。土地已是你的，只付建筑费。', en: 'In most cities, KDR is cheaper than buying equivalent new in the same suburb. You already own the land.' } },
    ],
  },
  {
    id: 3, color: '#9333ea',
    title: { zh: '设计与城市规划', en: 'Design & Town Planning' },
    short: { zh: '设计规划', en: 'Design' },
    duration: { zh: '4–12 周', en: '4–12w' },
    summary: { zh: '在提交 Council 申请之前，先把方案做对', en: 'Get plans right before lodging' },
    subtasks: [
      { title: { zh: '聘请 Town Planner（城市规划师）', en: 'Engage a Town Planner' }, detail: { zh: '在找建筑师前先咨询 Town Planner。他们懂 Council 规定，能判断方案是否可通过。遗产区或大型项目尤为关键。', en: 'Before architect, consult a planner. They know Council rules and approvability. Critical for heritage / large projects.' } },
      { title: { zh: '选择设计路径', en: 'Choose design path' }, detail: { zh: 'Volume Builder 更快、更便宜，定制空间有限。定制建筑师贵但完全个性化。多数 KDR，制图师 + 建筑设计师性价比最高。', en: 'Volume Builder faster, cheaper, limited customisation. Architect pricier, fully tailored. Most KDR: draftsperson + designer hits sweet spot.' } },
      { title: { zh: 'BASIX / NatHERS 节能要求', en: 'BASIX / NatHERS energy' }, detail: { zh: 'NSW 所有新建住宅须提交 BASIX 证书；VIC 要求 NatHERS 7 星评级。影响保温、玻璃、雨水箱、太阳能。从方案初期就考虑。', en: 'NSW requires BASIX, VIC requires NatHERS 7-star. Affects insulation, windows, rainwater, solar. Design from day one.' } },
      { title: { zh: '提前获取 Builder 报价', en: 'Builder preliminary quotes' }, detail: { zh: '在完成施工图之前，把概念方案发给 2–3 家建筑商，核实费用是否在预算范围内。避免图纸完成后才发现超支。', en: 'Share concept plans with 2–3 builders early. Reality-check costs before full working drawings.' } },
    ],
  },
  {
    id: 4, color: '#ca8a04',
    title: { zh: 'Council 审批（DA 或 CDC）', en: 'Council Approval (DA or CDC)' },
    short: { zh: 'Council 审批', en: 'Approval' },
    duration: { zh: '8–52 周', en: '8–52w' },
    summary: { zh: '最长最不确定的阶段 — 预留缓冲', en: 'Longest and most uncertain stage — plan for delays' },
    subtasks: [
      { title: { zh: 'CDC 合规建设证书（仅 NSW 快速审批）', en: 'CDC fast-track (NSW only)' }, detail: { zh: 'NSW 完全符合 Housing SEPP 2021 时，CDC 可由私人核查员 10 个工作日审批，无需 Council 介入。$3,000–8,000。遗产 / 洪水 / 丛火区不适用。VIC/QLD/WA/SA/ACT 无 CDC 制度。', en: 'NSW SEPP-compliant: private certifier approves in 10 business days. $3–8k. Not in heritage/flood/bushfire. Other states have no CDC.' } },
      { title: { zh: 'DA 完整流程', en: 'DA full review' }, detail: { zh: '不符 CDC 或 NSW 以外的所有州。法定 40–60 工作日，实际 6–18 个月。内悉尼 12–18 个月。遗产、邻居投诉、设计委员会都可能延期。', en: 'When not CDC-eligible. Statutory 40–60 days, real-world 6–18 months. Inner Sydney 12–18 months.' } },
      { title: { zh: 'Pre-DA 会议（不能省）', en: 'Pre-DA meeting (don\'t skip)' }, detail: { zh: '向 Council 申请 Pre-DA 会议（$200–500）。1 小时可揭露致命问题——遗产限制、退缩不足、树木保护令——在你花 $15,000 出图之前。', en: 'Request Pre-DA meeting ($200–500). 1 hour can reveal fatal issues before $15,000 in plans.' } },
      { title: { zh: '邻居通知与反对', en: 'Neighbour notification' }, detail: { zh: 'DA 公开通知 14–21 天。邻居书面反对意见严重时可能触发规划委员会复议。遗产区、二层加建最容易引发投诉。', en: 'DA public notice 14–21 days. Serious objections may trigger Planning Panel. Heritage / 2-storey additions attract most.' } },
      { title: { zh: 'Construction Certificate', en: 'Construction Certificate' }, detail: { zh: 'DA 批准后仍需 CC 才能开工。需要详细工程图、结构设计和认证员签字。', en: 'After DA, still need CC to start. Detailed engineering drawings, structural plans, certifier sign-off.' } },
    ],
  },
  {
    id: 5, color: '#dc2626',
    title: { zh: '拆除', en: 'Demolition' },
    short: { zh: '拆除', en: 'Demo' },
    duration: { zh: '1–3 周', en: '1–3w' },
    summary: { zh: '激动人心的时刻 — 推倒开始了', en: 'The exciting part' },
    subtasks: [
      { title: { zh: '拆除许可顺序很重要', en: 'Demolition permit sequence' }, detail: { zh: '在获得批准之前（CDC/DA/独立拆除许可），法律上不允许拆除。未经批准擅自拆除属违法，可面临罚款和强制复原。', en: 'Cannot legally demolish until approval. Unauthorised demo = fines + reinstatement orders.' } },
      { title: { zh: '石棉清除（最被低估的费用）', en: 'Asbestos removal' }, detail: { zh: '1987 前住宅几乎必含石棉。法律规定持牌承包商处理（松散型需 Class A 执照）。$8,000–25,000，常被低估。', en: 'Pre-1987 homes almost certainly contain asbestos. Licensed removalist required (Class A for friable). $8–25k.' } },
      { title: { zh: '公共设施断开', en: 'Service disconnections' }, detail: { zh: '拆除前需安排断开水、燃气、电力和 NBN。各公用事业公司通常需要 4–8 周提前通知。', en: 'Water / gas / power / NBN — utilities need 4–8 weeks lead time.' } },
      { title: { zh: '地基处理', en: 'Slab removal' }, detail: { zh: '保留旧地基须工程师评估。大多数新建需要全新地基。拆除旧地基 $5,000–15,000。', en: 'If keeping slab, engineer assesses first. Most need new slab. Removal +$5–15k.' } },
      { title: { zh: '场地准备', en: 'Site preparation' }, detail: { zh: '场地平整、边界桩和测量标记。如果靠近人行道，还需临时围栏和 Council 围挡许可。', en: 'Levelling, boundary pegs, survey marks. Near footpath: temp fencing + Council hoarding permit.' } },
    ],
  },
  {
    id: 6, color: '#ea580c',
    title: { zh: '施工', en: 'Construction' },
    short: { zh: '施工', en: 'Build' },
    duration: { zh: '20–40 周', en: '20–40w' },
    summary: { zh: '建筑商接手 — 保持参与，但要信任流程', en: 'Builder takes over — stay engaged but trust the process' },
    subtasks: [
      { title: { zh: '5 阶段进度款', en: '5-stage progress payments' }, detail: { zh: '标准阶段：地基/板、框架、封闭、装修、实际完工。每阶段触发进度款。付款前让贷款机构或独立验房师确认。', en: 'Slab · Frame · Lock-up · Fixing · Practical Completion. Each triggers payment. Lender or inspector verifies first.' } },
      { title: { zh: '独立建筑检查员', en: 'Independent inspector' }, detail: { zh: '自行聘请独立检查员在关键阶段检查质量。他不同于核查员（核查员代表合规非业主利益）。$300–600/次。', en: 'Hire your own inspector for key stages. Different from certifier (compliance, not your interest). $300–600 each.' } },
      { title: { zh: 'Principal Certifier', en: 'Principal Certifier' }, detail: { zh: '指定主要认证员，关键阶段检查并认证：地基、框架、防水、最终完工。NSW 已取代原 PCA。', en: 'Inspects and certifies at critical stages: slab, frame, waterproofing, final. NSW replaced old PCA.' } },
      { title: { zh: '各工种协调', en: 'Trades coordination' }, detail: { zh: '建筑商协调：混凝土工、框架工、屋面工、水管工、电工、隔热层、抹灰工、瓦工、油漆工、橱柜工。每 2–4 周现场会议。', en: 'Builder coordinates concreters, framers, roofers, plumbers, electricians, insulators, plasterers, tilers, painters, cabinetmakers. Site meetings every 2–4 weeks.' } },
      { title: { zh: 'Variation 变更单（最大预算杀手）', en: 'Variations (budget killer)' }, detail: { zh: '变更必须事先书面 + 签字。Builder 错误的修复不算业主变更。每周对账，避免月底一次性收到 $30k+ 变更单。', en: 'All changes in writing before they happen. Builder errors not on owner. Weekly reconciliation avoids $30k+ surprises.' } },
    ],
  },
  {
    id: 7, color: '#059669',
    title: { zh: '验收与入住', en: 'Handover & Occupation' },
    short: { zh: '验收入住', en: 'Handover' },
    duration: { zh: '2–4 周', en: '2–4w' },
    summary: { zh: '最后检查、修复缺陷，然后搬入', en: 'Final checks, fixes, and moving in' },
    subtasks: [
      { title: { zh: 'PCI 实际完工检查', en: 'Practical Completion Inspection' }, detail: { zh: '与建筑商一起验收，制作缺陷清单（punch list）。新建房屋通常 20–100 个小问题。建筑商必须在最终付款前完成修复。', en: 'Walk-through with builder, defect list. 20–100 minor items normal. Builder must fix before final payment.' } },
      { title: { zh: 'OC 入住证书', en: 'Occupation Certificate' }, detail: { zh: '入住证书由主要认证员在最终检查后签发。没 OC 法律上不能入住。OC 后建筑贷款转普通房贷。', en: 'Issued by Principal Certifier after final inspection. Cannot move in without OC. Convert loan to home loan.' } },
      { title: { zh: '法定质保期（各州不同）', en: 'Statutory warranty (varies)' }, detail: { zh: 'NSW 6 年大缺陷 / 2 年其他。VIC 10 年结构（最强）。QLD 6.5 年。WA 6 年。SA 5 年结构。所有缺陷书面 + 照片 + 日期记录。', en: 'NSW: 6yr major / 2yr other · VIC: 10yr structural · QLD: 6.5yr · WA: 6yr · SA: 5yr. Document with photos + dates.' } },
      { title: { zh: '最终接驳与设置', en: 'Final connections' }, detail: { zh: '电表、燃气表接驳，NBN 安装，Council 要求的人行道和车道修复。OC 签发后还需 4–6 周。', en: 'Meter connections, NBN, footpath/driveway reinstatement. 4–6 weeks post-OC.' } },
      { title: { zh: '维护期', en: 'Maintenance period' }, detail: { zh: '新房会有沉降。石膏和瓷砖出现轻微裂缝属于正常现象。重大结构问题属于质保项目。保留缺陷清单跟进。', en: 'New homes settle. Minor cracking normal. Major structural issues = warranty. Keep defect list, track.' } },
    ],
  },
  {
    id: 8, color: '#0891b2',
    title: { zh: '各工种职责说明', en: 'Key Trades & Who Does What' },
    short: { zh: '各工种', en: 'Trades' },
    duration: { zh: '贯穿全程', en: 'All stages' },
    summary: { zh: '了解该找谁、什么时候找', en: 'Know who to hire and when' },
    subtasks: [
      { title: { zh: 'Town Planner（城市规划师）', en: 'Town Planner' }, detail: { zh: '解读 Council 规定、撰写规划报告、管理 DA 流程。设计之前聘请。费用 $2,000–10,000+（复杂地块更高）。', en: 'Navigates Council rules, writes planning reports, manages DA. Engage before design. $2k–10k+.' } },
      { title: { zh: '持牌建筑商（HIA/MBA 会员）', en: 'Licensed Builder (HIA/MBA)' }, detail: { zh: '全程施工管理。3 家报价对比。州政府网站查执照。仔细阅读合同——建议使用 HIA 或 MBA 标准合同。', en: 'Manages construction slab to handover. 3 quotes. Verify licence on state portal. Use HIA/MBA standard contract.' } },
      { title: { zh: '结构工程师', en: 'Structural Engineer' }, detail: { zh: '根据土壤类型设计地基和地板。CC 必需。也适用非标准结构：坡地、钢结构框架、特殊跨度。', en: 'Designs footings and slab for soil type. Required for CC. Also non-standard structures.' } },
      { title: { zh: '持牌水管工 / 电工', en: 'Plumber / Electrician' }, detail: { zh: '粗装铺设管道/电缆；精装连接卫浴/配电。必须持牌。每阶段单独合规证书。', en: 'Rough-in pipes/cables, final connections. Licensed. Separate certificate per stage.' } },
      { title: { zh: '测量师 + 认证员 + 景观', en: 'Surveyor + Certifier + Landscaper' }, detail: { zh: '测量师 $2k–5k 标定边界 + 认证完工（OC 必需）。私人认证员签 CDC / 审 CC / 出 OC。景观占 3–5%，对居住品质影响巨大。', en: 'Surveyor $2k–5k sets boundaries + certifies (OC). Private certifier issues CDC/approves CC/OC. Landscaping 3–5% of budget.' } },
    ],
  },
]

// Chevron clip-paths（inline 避免 Tailwind arbitrary value 配置）
const CLIP_MIDDLE = 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'
const CLIP_FIRST  = 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)'
const CLIP_END    = 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)'

export default function KDRPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const router = useRouter()

  const [stage, setStage] = useState(1)
  const [address, setAddress] = useState('')

  const current = STAGES.find(s => s.id === stage) || STAGES[0]
  const total = STAGES.length

  const pickStage = (n: number) => setStage(n)
  const navStage = (delta: number) => setStage(prev => Math.max(1, Math.min(total, prev + delta)))

  const goAI = () => {
    if (!address.trim()) return
    const m = address.match(/,\s*([A-Za-z' ]+?)\s+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)/i)
    const suburb = m ? m[1].trim() : ''
    const state = m ? m[2].toUpperCase() : 'NSW'
    router.push(`/feasibility?address=${encodeURIComponent(address)}&suburb=${encodeURIComponent(suburb)}&state=${state}&projectType=kdr`)
  }

  const prev = stage > 1 ? STAGES[stage - 2] : null
  const next = stage < total ? STAGES[stage] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/guide/kdr" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-5 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          {isZh ? '返回首页' : 'Back to home'}
        </Link>

        <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm">

          {/* Hero + KPI */}
          <div className="bg-gradient-to-br from-orange-50 to-white px-6 sm:px-8 py-7 border-b border-orange-100">
            <div className="text-xs text-orange-600 tracking-[0.2em] font-semibold">KNOCKDOWN REBUILD</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              {isZh ? '推倒重建' : 'Knockdown Rebuild'}
            </h1>
            <p className="text-gray-600 mt-3 leading-relaxed">
              {isZh
                ? '把现有旧房推倒、原地重建新房。整个流程变量最多 — 所以 AI 在这里最帮上忙。'
                : 'Demolish and rebuild on the same lot. Highest variability — AI helps most here.'}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-white border border-orange-100 rounded-xl p-3 sm:p-4">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider">{isZh ? '总周期' : 'Duration'}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  12–24 <span className="text-sm font-medium text-gray-500">{isZh ? '个月' : 'months'}</span>
                </div>
              </div>
              <div className="bg-white border border-orange-100 rounded-xl p-3 sm:p-4">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider">{isZh ? '典型预算' : 'Typical Budget'}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  $600k–$2m<span className="text-sm font-medium text-gray-500">+</span>
                </div>
              </div>
              <div className="bg-white border border-orange-100 rounded-xl p-3 sm:p-4">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider">{isZh ? '关键阶段' : 'Stages'}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">8</div>
              </div>
            </div>
          </div>

          {/* Chevron + mini AI CTA */}
          <div id="kdr-chevron" className="px-6 sm:px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{isZh ? '推倒重建全流程' : 'The full KDR process'}</div>
                <h2 className="text-lg font-semibold text-gray-900 mt-0.5">
                  {isZh ? '8 阶段流水线 · 点击切换下方详情' : '8-stage pipeline · click to switch panel below'}
                </h2>
              </div>
              <div className="text-xs text-gray-500">Stage {stage} of {total}</div>
            </div>

            <div className="overflow-x-auto pb-1.5 -mx-2 px-2">
              <div className="flex items-stretch min-w-[760px] sm:min-w-0">
                {STAGES.map((s, i) => {
                  const isLast = i === STAGES.length - 1
                  const isFirst = i === 0
                  const active = s.id === stage
                  const clip = isLast ? CLIP_END : (isFirst ? CLIP_FIRST : CLIP_MIDDLE)
                  return (
                    <button
                      key={s.id}
                      onClick={() => pickStage(s.id)}
                      className="relative flex-1 min-w-[120px] text-white text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      style={{
                        background: s.color,
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.06))',
                        clipPath: clip,
                        marginRight: isLast ? 0 : '-10px',
                        padding: isFirst
                          ? '0.85rem 0.7rem 0.85rem 1.1rem'
                          : isLast
                            ? '0.85rem 1.1rem 0.85rem 1.5rem'
                            : '0.85rem 0.7rem 0.85rem 1.5rem',
                        minHeight: 80,
                        transform: active ? 'translateY(-4px) scale(1.03)' : 'none',
                        filter: active ? 'brightness(1.15)' : 'brightness(1)',
                        zIndex: active ? 10 : 'auto',
                      }}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-85">
                        Stage {s.id}{isLast ? ' · END' : ''}
                      </div>
                      <div className="text-sm font-semibold leading-tight mt-0.5">
                        {s.short[isZh ? 'zh' : 'en']}
                      </div>
                      <div className="text-[10px] opacity-85 mt-0.5">{s.duration[isZh ? 'zh' : 'en']}</div>
                      {isLast && (
                        <CheckCircle className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-55 pointer-events-none" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mini AI CTA */}
            <div className="mt-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-gray-700 flex-1">
                {isZh ? (
                  <>💡 已经懂建房？想直接看 <b className="text-orange-700">&ldquo;你家&rdquo;</b> 能盖什么、要多少钱</>
                ) : (
                  <>💡 Already know the process? Jump straight to AI feasibility for <b className="text-orange-700">your lot</b></>
                )}
              </div>
              <a href="#ai-section" className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                {isZh ? '直接看 AI 报告 ↓' : 'Go to AI report ↓'}
              </a>
            </div>
          </div>

          {/* Tab Panel：当前阶段详情 */}
          <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
            <div className="mb-5">
              <div className="text-xs text-gray-400 uppercase tracking-wider">{isZh ? '阶段详情' : 'Stage details'}</div>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {isZh ? '8 阶段子任务详情' : '8 stages · drill down'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isZh ? '点上方 chevron 切换 · 一次只显示一个阶段 · 读完点底部「下一阶段 →」' : 'Click chevron above to switch · only one stage shown · click "next →" at bottom'}
              </p>
            </div>

            <div
              key={current.id}
              className="bg-white border-2 rounded-2xl overflow-hidden"
              style={{ borderColor: current.color + '33', animation: 'fadeSlide .25s ease' }}
            >
              <div className="p-5 flex items-center gap-4" style={{ background: current.color + '0d' }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-semibold"
                  style={{ background: current.color + '22', color: current.color }}
                >
                  {current.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: current.color + '22', color: current.color }}
                    >
                      Stage {current.id}
                    </span>
                    <span className="text-[11px] text-gray-400">{current.duration[isZh ? 'zh' : 'en']}</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{current.title[isZh ? 'zh' : 'en']}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{current.summary[isZh ? 'zh' : 'en']}</div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="h-px bg-gray-100 mb-4 mt-1"></div>
                <div className="space-y-4 text-sm">
                  {current.subtasks.map((st, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: current.color + '22', color: current.color }}
                      >✓</div>
                      <div>
                        <div className="font-semibold text-gray-900">{st.title[isZh ? 'zh' : 'en']}</div>
                        <div className="text-gray-500 leading-relaxed mt-1">{st.detail[isZh ? 'zh' : 'en']}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 底部 nav */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => navStage(-1)}
                disabled={stage === 1}
                className="text-xs sm:text-sm text-gray-600 px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors"
              >
                {prev ? (
                  <>← <span className="text-gray-400 mr-1">Stage {prev.id}</span><b>{prev.short[isZh ? 'zh' : 'en']}</b></>
                ) : (isZh ? '← 第一阶段' : '← First stage')}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono">Stage {stage} of {total}</span>
                <a href="#kdr-chevron" className="text-[11px] text-gray-400 hover:text-gray-600">↑ {isZh ? '回流水线' : 'Back to chevrons'}</a>
              </div>
              <button
                onClick={() => navStage(1)}
                disabled={stage === total}
                className="text-xs sm:text-sm text-gray-600 px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors"
              >
                {next ? (
                  <><b>{next.short[isZh ? 'zh' : 'en']}</b><span className="text-gray-400 ml-1">Stage {next.id}</span> →</>
                ) : (isZh ? '最后一阶段 →' : 'Last stage →')}
              </button>
            </div>
          </div>

          {/* AI 可行性分析 */}
          <div id="ai-section" className="px-6 sm:px-8 py-8 border-b border-gray-100 bg-gradient-to-br from-orange-50/40 to-white">
            <div className="flex items-start gap-3 mb-5">
              <Sparkles className="w-7 h-7 text-orange-500 shrink-0 mt-1" />
              <div>
                <div className="text-xs text-orange-600 uppercase tracking-wider font-semibold">
                  {isZh ? 'AI 可行性分析' : 'AI Feasibility Analysis'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {isZh ? '看完流程，看你家具体能盖什么' : 'Now check what YOUR lot specifically allows'}
                </h2>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {isZh
                    ? '上面 8 阶段是通用流程 · AI 自动查 NSW Planning Portal · 告诉你具体能盖多大、要多少钱、多久能住'
                    : '8 stages above = general process · AI auto-queries NSW Planning Portal · tells you size, cost, timeline'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-orange-300 bg-white p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {isZh ? '输入你家完整地址' : 'Enter your full address'}
              </label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="12 Albert St, Strathfield NSW 2135"
                className="w-full text-sm bg-white border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400"
                onKeyDown={e => e.key === 'Enter' && goAI()}
              />
              <button
                onClick={goAI}
                disabled={!address.trim()}
                className="w-full mt-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold"
              >
                {isZh ? '让 AI 看看我家能盖什么 →' : 'Let AI check my lot →'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {isZh
                  ? 'AI 自动查：分区 · 容积率 · 高度 · 退缩 · 遗产 · 洪水 · 丛火'
                  : 'AI auto-queries: zoning · FSR · height · setbacks · heritage · flood · bushfire'}
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="px-6 sm:px-8 py-8 text-center bg-gradient-to-br from-orange-50 to-orange-100">
            <h3 className="text-xl font-bold text-gray-900">
              {isZh ? '准备开始你的 KDR 项目？' : 'Ready to start your KDR?'}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {isZh ? '先让 AI 帮你判断地块可行性，再联系本地 Builder 报价' : 'Get AI feasibility first, then contact local builders'}
            </p>
            <a
              href="#ai-section"
              className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl"
            >
              {isZh ? '免费生成 AI 可行性报告 →' : 'Generate free AI report →'}
            </a>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
