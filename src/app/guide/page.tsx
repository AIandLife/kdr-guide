'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ChevronDown, ChevronRight,
  ClipboardList, Ruler, FileText, Hammer, Zap, Home, DollarSign, Building2
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { SiteNav } from '@/components/SiteNav'

const STAGES = [
  {
    id: 1,
    icon: Ruler,
    title: 'Site Assessment',
    color: 'blue',
    duration: '2–4 weeks',
    summary: 'Understand what your site allows before spending any money.',
    steps: [
      { title: 'Get a Section 10.7 Certificate (NSW) / Planning Certificate', detail: 'This official document from your council reveals all overlays: heritage, flood, bushfire, biodiversity, road widening. In VIC it\'s called a Planning Certificate. Cost: ~$100-200. Essential before anything else.' },
      { title: 'Check your LEP / Planning Scheme zone', detail: 'Residential zones (R2/R3 in NSW, Neighbourhood Residential in VIC) have specific rules on density, height, setbacks, and minimum lot sizes. Find yours on the council planning map.' },
      { title: 'Measure your lot dimensions', detail: 'Confirm frontage width, depth, and total area. Minimum lot size varies by council: as low as 200sqm in some inner-city zones to 600sqm+ in outer suburbs.' },
      { title: 'Check for easements and covenants', detail: 'Drainage, services, and utility easements can restrict where you build. Title search reveals these. Talk to a surveyor.' },
      { title: 'Engage a Geotechnical Engineer if needed', detail: 'Sloped blocks, known reactive clay soils, or flood-prone areas may need a geotech/soil classification report. This affects your slab type and foundation costs.' },
    ]
  },
  {
    id: 2,
    icon: DollarSign,
    title: 'Feasibility & Finance',
    color: 'green',
    duration: '2–6 weeks',
    summary: 'Make sure the numbers work before committing.',
    steps: [
      { title: 'Calculate total project cost', detail: 'Include: Demolition ($20k–50k), new build ($2,400–$4,500/sqm for most capital cities in 2024–26 — the old $1,800/sqm figure is pre-2022 and no longer realistic), Council DA/CDC fees ($5k–15k), Section 7.11 infrastructure contributions ($8k–30k — often missed), consultant fees, soil test ($3k–8k), surveying ($2k–5k), stormwater OSD tank ($8k–15k), landscaping, contingency (10–15%).' },
      { title: 'Assess finance options', detail: 'KDR typically uses a Construction Loan (drawn in stages) rather than a standard home loan. Talk to a mortgage broker who specialises in construction finance. Pre-approval before committing to a builder is critical.' },
      { title: 'Owner-builder vs licensed builder', detail: 'Owner-builders save money but face significant risk, insurance challenges, and resale complications. For most homeowners, using a licensed builder is strongly recommended.' },
      { title: 'Compare build cost vs buy new', detail: 'In most major cities, KDR is cheaper than buying an equivalent new home in the same suburb. The land is already yours — you\'re just paying for the build.' },
    ]
  },
  {
    id: 3,
    icon: ClipboardList,
    title: 'Design & Town Planning',
    color: 'purple',
    duration: '4–12 weeks',
    summary: 'Get your plans right before going to council.',
    steps: [
      { title: 'Engage a Town Planner', detail: 'Before an architect or draftsperson, consult a town planner. They know your council\'s specific rules and can tell you what\'s approvable vs what will get rejected. Especially critical for heritage areas or large projects.' },
      { title: 'Choose your design path', detail: 'Option A: Volume Builder — faster, cheaper, limited customisation. Option B: Custom Architect — more expensive, longer, fully tailored. For most KDR, a good draftsperson + building designer hits the sweet spot.' },
      { title: 'BASIX / Energy efficiency requirements', detail: 'NSW requires BASIX certificate for all new homes. VIC requires NatHERS 7-star rating. These affect insulation, window sizes, rainwater tanks, solar. Design with these in mind from the start.' },
      { title: 'Get preliminary builder quotes', detail: 'Share concept plans with 2-3 builders early to reality-check costs before investing in full working drawings.' },
    ]
  },
  {
    id: 4,
    icon: FileText,
    title: 'Council Approval (DA or CDC)',
    color: 'yellow',
    duration: '8–52 weeks',
    summary: 'The longest and most uncertain stage — plan for delays.',
    steps: [
      { title: 'CDC (Complying Development Certificate) — Faster path (NSW only)', detail: 'In NSW, if your build meets all rules as of right under the Housing SEPP 2021, a CDC can be approved by a private certifier in as little as 10 business days. Cost: ~$3,000–8,000. Critical: CDC is NOT available if your lot is in a heritage conservation area, flood planning level, or bushfire zone. VIC, QLD, WA, SA, and ACT have no CDC equivalent — they use Building Permits, Planning Permits, or Deemed-to-Comply pathways instead.' },
      { title: 'DA (Development Application) — Full council review', detail: 'Required if CDC isn\'t available, or in all non-NSW states. Statutory timeframes: NSW 40–60 business days, but real-world times are often 6–18 months in complex councils. Inner Sydney (Inner West, Woollahra, North Sydney) averages 12–18 months. Heritage items, neighbour objections, or design review panel referrals can add further months. Build this reality into your finance and living arrangements plan.' },
      { title: 'Pre-DA meeting — do not skip this', detail: 'Before lodging a DA, request a pre-DA meeting with council (most charge $200–500). Bring your concept plans and site details. A 1-hour meeting with a council planner can reveal fatal issues (heritage constraints, setback problems, tree issues) before you spend $15,000 on plans. Ask specifically: "What are the key issues for this site?" and "Is CDC available for this lot?"' },
      { title: 'Neighbour notifications and objections', detail: 'DAs are publicly notified for 14–21 days. Neighbours can object in writing. Heritage, character area, dual occupancy, and second storey additions attract the most objections. Serious objections can trigger a Planning Panel referral (NSW, for contentious matters). Talk to your neighbours before lodging — it genuinely reduces risk.' },
      { title: 'Construction Certificate (CC)', detail: 'After DA approval, you still need a CC (construction certificate) before you can build. Involves detailed engineering drawings, structural plans, and certifier sign-off.' },
    ]
  },
  {
    id: 5,
    icon: Hammer,
    title: 'Demolition',
    color: 'red',
    duration: '1–3 weeks',
    summary: 'The exciting part — down it comes.',
    steps: [
      { title: 'Demolition permit — sequence matters', detail: 'Important: you cannot legally demolish a dwelling until you have approval (either a CDC or a DA, or a standalone demolition approval subject to the same zoning rules). The common advice to "submit demolition permit before DA approval" means apply simultaneously — not that you can demolish before approval is granted. Doing so is an illegal demolition and can result in significant fines and council enforcement action.' },
      { title: 'Asbestos testing and removal', detail: 'Pre-1987 homes almost certainly contain asbestos — fibro sheeting, floor tiles, roof sheeting, pipe lagging. Licensed asbestos removalist (Class A licence for friable asbestos) required by law. For a typical Strathfield, Box Hill, or Sunnybank home, budget $8,000–25,000 for asbestos survey + removal before any demolition begins. This is consistently the most underestimated demolition cost.' },
      { title: 'Service disconnections', detail: 'Arrange disconnection of water, gas, electricity, and NBN before demolition. Typically 4-8 weeks lead time with utilities. Don\'t leave this to the last minute.' },
      { title: 'Concrete slab removal', detail: 'If keeping the slab, have a structural engineer assess it first. Most new builds require a new slab. Slab removal adds $5,000-$15,000 but ensures clean foundations.' },
      { title: 'Site preparation', detail: 'After demolition: site levelling, boundary pegs, and survey marks for builder. Site access, temporary fencing, and council hoarding requirements if near a footpath.' },
    ]
  },
  {
    id: 6,
    icon: Building2,
    title: 'Construction',
    color: 'orange',
    duration: '20–40 weeks',
    summary: 'Your builder takes over — stay engaged but trust the process.',
    steps: [
      { title: 'Construction stages and progress payments', detail: 'Standard stages: Base/Slab, Frame, Lock-Up, Fixing, Practical Completion. Each triggers a progress payment. Have your lender or a building inspector verify each stage before paying.' },
      { title: 'Independent building inspector', detail: 'Hire your own inspector to check work at key stages. Not the same as the certifier (who works for compliance, not your interests). Costs $300-$600 per inspection — worth every cent.' },
      { title: 'Principal\'s Certifier (PC)', detail: 'You appoint a Principal Certifier (usually private) who inspects and certifies work at critical stages: slab, frame, waterproofing, final. In NSW this replaced the old PCA role.' },
      { title: 'Trades coordination', detail: 'Your builder coordinates: concreters, framers, roofers, plumbers (rough-in and final), electricians (rough-in and final), insulators, plasterers, tilers, painters, cabinetmakers. Site meetings every 2-4 weeks recommended.' },
      { title: 'Variations', detail: 'Change orders kill budgets. Agree everything in writing before it happens. Reasonable variations: site issues, owner-requested changes. Unreasonable: builder error should be their cost.' },
    ]
  },
  {
    id: 7,
    icon: Home,
    title: 'Handover & Occupation',
    color: 'emerald',
    duration: '2–4 weeks',
    summary: 'Final checks, fixes, and moving in.',
    steps: [
      { title: 'Practical Completion Inspection (PCI)', detail: 'Walk through with your builder and create a defect list (the "list"). This is normal — expect 20-100 minor items on a new build. Builder must fix before final payment.' },
      { title: 'Occupation Certificate (OC)', detail: 'The OC is issued by your Principal Certifier after final inspections. You legally cannot move in without it. Convert your construction loan to a home loan once it\'s issued.' },
      { title: 'Statutory warranty period — varies by state', detail: 'NSW: 6 years major defects, 2 years other defects. VIC: 10 years structural defects under the Domestic Building Contracts Act (strongest protection in Australia). QLD: 6 years 6 months (QBCC). WA: 6 years. SA: 5 years structural. Document every defect in writing with photos and date-stamps. Verbal requests are not enforceable.' },
      { title: 'Final connections and setup', detail: 'Meter connections (electricity, gas), NBN installation, council footpath and driveway reinstatement. Allow 4-6 weeks post-OC for all services to be connected.' },
      { title: 'Maintenance period', detail: 'New homes settle. Expect minor cracking in plaster and grout (normal). Major structural issues are warranty items. Keep your defect list and follow up methodically.' },
    ]
  },
  {
    id: 8,
    icon: Zap,
    title: 'Key Trades & Who Does What',
    color: 'cyan',
    duration: 'Throughout project',
    summary: 'Know who to hire and when.',
    steps: [
      { title: 'Town Planner', detail: 'Navigates council rules, writes planning reports, manages DA process. Engage before design. Cost: $2,000-$10,000+ for complex sites.' },
      { title: 'Licensed Builder (HIA/MBA member preferred)', detail: 'Manages construction from slab to handover. Get 3 quotes. Check licence on state government portal. Review the contract carefully — use a standard HIA or MBA contract.' },
      { title: 'Structural Engineer', detail: 'Designs footings and slab for your soil type. Required for CC. Also needed for anything non-standard: sloped blocks, steel frames, unusual spans.' },
      { title: 'Plumber (plumbing and drainage)', detail: 'Rough-in runs pipes before slab pour and through frame. Final connects fixtures. Must be licensed. Stormwater connection to council drain requires Council approval.' },
      { title: 'Electrician', detail: 'Rough-in runs cables through frame. Final connects switchboard and fixtures. Must be licensed. Separate electrical certificate of compliance issued for each stage.' },
      { title: 'Surveyor (Registered)', detail: 'Sets out boundary marks before construction, certifies finished building position for OC. Required. Cost: ~$2,000-$5,000.' },
      { title: 'Private Building Certifier / Principal Certifier', detail: 'Issues CDC or approves CC, inspects at key stages, issues OC. Required by law. Shop around for pricing and responsiveness.' },
      { title: 'Landscaper (optional but recommended)', detail: 'Driveway, paths, turf, plants, fencing. Often the last 5% of cost but major impact on liveability. Budget 3-5% of build cost.' },
    ]
  },
]

const STAGES_ZH = [
  {
    id: 1, icon: Ruler, title: '现场评估', color: 'blue', duration: '2–4 周',
    summary: '在花任何钱之前，先搞清楚你的地块允许什么。',
    steps: [
      { title: '获取 Section 10.7 证书（NSW）/ Planning Certificate（VIC）', detail: '这份来自 Council 的官方文件会列出所有限制条款：遗产保护、洪水区、灌木火灾区、生物多样性保护、道路拓宽计划等。费用约 $100–200，是所有步骤的第一步，必须做。' },
      { title: '查询你的分区规定（LEP / Planning Scheme）', detail: '住宅分区（NSW 的 R2/R3，VIC 的 Neighbourhood Residential）对容积率、建筑高度、退缩距离和最小地块面积都有具体规定。在 Council 的规划地图上查询你的地块。' },
      { title: '确认地块尺寸', detail: '确认地块正面宽度、深度和总面积。不同 Council 的最小地块要求差异很大：内城区低至 200㎡，外郊区可能要求 600㎡ 以上。' },
      { title: '检查地役权（Easement）和限制性条款（Covenant）', detail: '排水、管道、电力线等地役权会限制建筑位置。产权调查（Title Search）可以查到这些信息。建议咨询测量师。' },
      { title: '如有需要，聘请岩土工程师', detail: '有坡度的地块、已知的膨胀土区域或洪水易发区，可能需要岩土/土壤分类报告。这会影响地基类型和基础费用。' },
    ]
  },
  {
    id: 2, icon: DollarSign, title: '可行性与融资', color: 'green', duration: '2–6 周',
    summary: '在做任何承诺之前，先确认数字是否合理。',
    steps: [
      { title: '计算项目总费用', detail: '包含：拆除费（$20k–50k）、新建费（2024–26 年各首府城市约 $2,400–$4,500/㎡，以前的 $1,800/㎡ 是 2022 年前数据，现已不准确）、Council DA/CDC 费（$5k–15k）、Section 7.11 基础设施贡献费（$8k–30k，经常被忽略）、顾问费、土壤检测（$3k–8k）、测量费（$2k–5k）、雨水截流箱 OSD（$8k–15k）、园艺景观、10–15% 预备金。' },
      { title: '了解建筑贷款选项', detail: 'KDR 通常使用"建筑贷款"（Construction Loan），按施工阶段分批放款，而非一次性普通房贷。建议找专注建筑融资的贷款经纪，在确认 Builder 之前先获得预批。' },
      { title: '业主自建 vs 持牌建筑商', detail: '自建可以省钱，但风险高、保险复杂、转售困难。对大多数业主而言，使用持牌建筑商是更稳妥的选择。' },
      { title: '对比 KDR vs 买新房', detail: '在大多数主要城市，在同一 Suburb 推倒重建，比直接购买同等新房更便宜。因为土地已经是你的，你只需要支付建筑费用。' },
    ]
  },
  {
    id: 3, icon: ClipboardList, title: '设计与城市规划', color: 'purple', duration: '4–12 周',
    summary: '在提交 Council 申请之前，先把方案做对。',
    steps: [
      { title: '聘请 Town Planner（城市规划师）', detail: '在找建筑师或制图师之前，先咨询一位 Town Planner。他们了解你所在 Council 的具体规定，可以告诉你哪些方案可以通过、哪些会被拒绝。在遗产区或大型项目中尤为关键。' },
      { title: '选择设计路径', detail: '选项A：量产建筑商（Volume Builder）— 更快、更便宜，但定制空间有限。选项B：定制建筑师 — 费用较高、周期较长，但完全个性化。对大多数 KDR 项目，一位好的制图师加建筑设计师是性价比最高的组合。' },
      { title: 'BASIX / 节能要求', detail: 'NSW 所有新建住宅须提交 BASIX 证书；VIC 要求 NatHERS 7 星评级。这些会影响保温层、窗户尺寸、雨水箱和太阳能板。从方案初期就应考虑这些要求。' },
      { title: '提前获取 Builder 初步报价', detail: '在完成施工图之前，把概念方案发给 2–3 家建筑商，核实费用是否在预算范围内。这样可以避免图纸完成后才发现超支。' },
    ]
  },
  {
    id: 4, icon: FileText, title: 'Council 审批（DA 或 CDC）', color: 'yellow', duration: '8–52 周',
    summary: '整个流程中最长、最不确定的阶段——做好延误的心理准备。',
    steps: [
      { title: 'CDC（合规建设证书）— 仅适用于 NSW 的快速审批路径', detail: '在 NSW，如果你的方案完全符合 Housing SEPP 2021 的所有规定，CDC 可由私人核查员最快 10 个工作日审批，无需 Council 介入。费用约 $3,000–8,000。重要提示：如果你的地块位于遗产保护区、洪水规划区或丛林火灾区，CDC 不适用。VIC、QLD、WA、SA 和 ACT 没有 CDC 制度——它们分别使用 Building Permit、Planning Permit 或 Deemed-to-Comply 审批路径。' },
      { title: 'DA（开发申请）— 完整的 Council 审查流程', detail: '不符合 CDC 条件时，或在 NSW 以外的所有州，都需要提交 DA。法定审批期限：NSW 40–60 个工作日，但实际往往需要 6–18 个月。内悉尼地区（内西区、Woollahra、North Sydney）平均需要 12–18 个月。遗产问题、邻居投诉或设计委员会审查都可能进一步延期。请在融资计划和临时住所安排中充分预留这段时间。' },
      { title: 'Pre-DA 会议——这一步不能省', detail: '在正式递交 DA 前，先向 Council 申请一次 Pre-DA 会议（大多数 Council 收费 $200–500）。带上概念方案和地块资料去参会。1 小时的会议可能揭露致命问题——遗产限制、退缩不足、树木保护令——在你花费 $15,000 出图之前。务必明确问：「这块地有哪些主要限制？」以及「这块地是否可以走 CDC？」' },
      { title: '邻居通知与反对意见', detail: 'DA 会在 14–21 天内公开通知。邻居可以书面提出反对意见。遗产区、特色区、双拼申请和二层加建最容易引发投诉。严重投诉可能触发规划委员会复议（NSW）。正式递交前主动和邻居沟通，能有效降低风险。' },
      { title: 'Construction Certificate（建筑证书）', detail: '获得 DA 批准后，仍需申请建筑证书（CC）才能开工。需要详细的工程图纸、结构设计和核查员签字确认。' },
    ]
  },
  {
    id: 5, icon: Hammer, title: '拆除', color: 'red', duration: '1–3 周',
    summary: '激动人心的时刻——推倒开始了。',
    steps: [
      { title: '拆除许可——顺序非常重要', detail: '重要提示：在获得批准之前（CDC、DA，或独立拆除许可），法律上不允许拆除任何住宅。「在 DA 批准前先递交拆除申请」意思是同步递交，而不是未获批就可以先拆。未经批准擅自拆除属于违法行为，可面临高额罚款和 Council 执法处置。' },
      { title: '石棉检测与清除（最常被低估的费用）', detail: '1987 年以前的房屋几乎必然含有石棉——纤维水泥板、地砖、屋顶材料、管道包覆等。法律规定必须由持牌石棉清除承包商处理（松散型石棉需 Class A 执照）。对 Strathfield、Box Hill 或 Sunnybank 的典型住宅而言，石棉调查加清除预算 $8,000–25,000，这是拆除阶段最常被忽视的成本项。' },
      { title: '公共设施断开', detail: '拆除前需安排断开水、燃气、电力和 NBN。各公用事业公司通常需要 4–8 周提前通知。不要等到最后一刻才安排。' },
      { title: '混凝土地基处理', detail: '如果打算保留原有地基，须请结构工程师先评估。大多数新建工程需要全新地基。拆除旧地基会增加 $5,000–15,000，但可确保基础干净牢固。' },
      { title: '场地准备', detail: '拆除完成后：场地平整、边界桩和测量标记。如果靠近人行道，还需临时围栏和 Council 的围挡许可。' },
    ]
  },
  {
    id: 6, icon: Building2, title: '施工', color: 'orange', duration: '20–40 周',
    summary: '建筑商接手了——保持参与，但要信任流程。',
    steps: [
      { title: '施工阶段与进度付款', detail: '标准阶段：地基/板、框架、封闭（Lock-Up）、装修、实际完工。每个阶段触发一笔进度款。在付款前，让你的贷款机构或独立验房师确认每个阶段的完成情况。' },
      { title: '独立建筑检查员', detail: '自行聘请一位独立检查员在关键阶段检查施工质量。他不同于核查员（核查员代表合规，而非你的利益）。每次检查费用 $300–600，物有所值。' },
      { title: 'Principal Certifier（主要认证员）', detail: '你需要指定一位主要认证员（通常是私人机构），他负责在关键阶段检查并认证工程：地基、框架、防水、最终完工。在 NSW，这一角色已取代原来的 PCA。' },
      { title: '各工种协调', detail: '建筑商负责协调：混凝土工、框架工、屋面工、水管工（粗装和精装）、电工（粗装和精装）、隔热层、抹灰工、瓦工、油漆工、橱柜工。建议每 2–4 周进行一次现场会议。' },
      { title: '变更单（Variations）', detail: '变更单是预算超支的最大杀手。任何变更都必须事先以书面形式确认。合理变更包括：场地问题、业主主动要求的更改。建筑商自身的错误应由其承担费用。' },
    ]
  },
  {
    id: 7, icon: Home, title: '验收与入住', color: 'emerald', duration: '2–4 周',
    summary: '最后检查、修复缺陷，然后搬入新家。',
    steps: [
      { title: '实际完工检查（PCI）', detail: '与建筑商一起进行验收，制作缺陷清单（"punch list"）。这是正常的——新建房屋通常有 20–100 个小问题。建筑商必须在收到最终付款前完成修复。' },
      { title: '入住证书（OC）', detail: '入住证书由你的主要认证员在最终检查后签发。没有 OC，你在法律上不能入住。OC 签发后，将建筑贷款转换为普通房贷。' },
      { title: '法定质保期——各州不同，务必了解', detail: 'NSW：重大缺陷 6 年，其他缺陷 2 年。VIC：结构缺陷 10 年（《家庭建筑合同法》，澳洲保护力度最强）。QLD：6 年 6 个月（QBCC）。WA：6 年。SA：结构缺陷 5 年。所有缺陷必须以书面方式记录，并附照片和日期。口头要求无法律效力。' },
      { title: '最终接驳与设置', detail: '电表、燃气表接驳，NBN 安装，Council 要求的人行道和车道修复。OC 签发后，所有服务接驳通常还需 4–6 周。' },
      { title: '维护期', detail: '新房会有沉降。石膏和瓷砖出现轻微裂缝属于正常现象。重大结构问题属于质保项目。保留好缺陷清单并逐一跟进处理。' },
    ]
  },
  {
    id: 8, icon: Zap, title: '各工种职责说明', color: 'cyan', duration: '贯穿整个项目',
    summary: '了解该找谁、什么时候找。',
    steps: [
      { title: 'Town Planner（城市规划师）', detail: '负责解读 Council 规定、撰写规划报告、管理 DA 流程。在设计之前就应聘请。费用：$2,000–10,000+（复杂地块更高）。' },
      { title: '持牌建筑商（建议选 HIA/MBA 会员）', detail: '负责从地基到交房的全程施工管理。获取 3 家报价对比。在州政府网站查验施工执照。仔细阅读合同——建议使用 HIA 或 MBA 标准合同。' },
      { title: '结构工程师', detail: '根据你的土壤类型设计地基和地板。申请建筑证书（CC）必须提供。也适用于非标准结构：有坡度的地块、钢结构框架、特殊跨度等。' },
      { title: '持牌水管工（管道与排水）', detail: '粗装阶段在地基浇筑前和框架中铺设管道；精装阶段连接卫浴设备。必须持牌。雨水接入 Council 排水系统需要 Council 审批。' },
      { title: '持牌电工', detail: '粗装阶段在框架中铺设电缆；精装阶段连接配电箱和用电设备。必须持牌。每个阶段完成后单独出具电气合规证书。' },
      { title: '注册测量师', detail: '施工前标定边界桩，施工完成后认证建筑位置（用于获取 OC）。依法必须聘请。费用约 $2,000–5,000。' },
      { title: '私人建筑认证员 / 主要认证员', detail: '签发 CDC 或审批 CC，在关键阶段进行检查，最终签发入住证书（OC）。依法必须聘请。建议货比三家，比较价格和服务效率。' },
      { title: '景观设计师（可选，但强烈建议）', detail: '负责车道、小径、草坪、绿化和围栏。通常是总费用的最后 5%，但对居住品质影响巨大。预算建议为建筑费用的 3–5%。' },
    ]
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-600' },
  green:   { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200',  badge: 'bg-green-100 text-green-600' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200', badge: 'bg-purple-100 text-purple-600' },
  yellow:  { bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-600' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',    badge: 'bg-red-100 text-red-600' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-600' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-600' },
}

export default function GuidePage() {
  const [openStages, setOpenStages] = useState<number[]>([1])

  const toggle = (id: number) => {
    setOpenStages(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const { lang } = useLang()
  const t = translations[lang]
  const activeStages = lang === 'zh' ? STAGES_ZH : STAGES

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav currentPath="/guide" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.guide.h1}</h1>
          <p className="text-gray-500 text-lg">{t.guide.subtitle}</p>
        </div>

        {/* Total duration banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{lang === 'zh' ? '项目总时长' : 'Typical Total Duration'}</p>
              <p className="text-2xl font-bold text-gray-900">{lang === 'zh' ? '12–24 个月' : '12–24 months'}</p>
            </div>
          </div>
          <div className="sm:border-l sm:border-orange-200 sm:pl-4 text-sm text-gray-600">
            {lang === 'zh'
              ? '从第一步评估到拿到入住证书（OC）。遗产区、复杂地块或 DA 审批延误可能超过 24 个月。请在融资和住房安排上预留足够缓冲。'
              : 'From first site assessment to Occupation Certificate. Heritage areas, complex sites, or DA delays can push beyond 24 months. Plan your finance and temporary accommodation accordingly.'}
          </div>
        </div>

        {/* Overview timeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 overflow-x-auto shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t.guide.overviewLabel}</h2>
          <div className="flex items-center gap-2 min-w-max">
            {activeStages.map((stage, i) => {
              const c = COLOR_MAP[stage.color]
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(stage.id)}
                    className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors', c.bg, c.border, 'border')}
                  >
                    <stage.icon className={cn('w-4 h-4', c.text)} />
                    <span className={cn('text-xs font-medium whitespace-nowrap', c.text)}>{stage.id}. {stage.title.split(' ')[0]}</span>
                  </button>
                  {i < STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stages accordion */}
        <div className="space-y-4">
          {activeStages.map(stage => {
            const c = COLOR_MAP[stage.color]
            const isOpen = openStages.includes(stage.id)
            return (
              <div key={stage.id} className={cn('bg-white border rounded-2xl overflow-hidden transition-all shadow-sm', isOpen ? c.border : 'border-gray-200')}>
                <button
                  onClick={() => toggle(stage.id)}
                  className="w-full flex items-center gap-4 p-6 text-left"
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                    <stage.icon className={cn('w-6 h-6', c.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', c.badge)}>{lang === 'zh' ? '阶段' : 'Stage'} {stage.id}</span>
                      <span className="text-xs text-gray-400">{stage.duration}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{stage.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{stage.summary}</p>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-gray-400 shrink-0 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="h-px bg-gray-100 mb-4" />
                    {stage.steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', c.bg)}>
                          <CheckCircle className={cn('w-4 h-4', c.text)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{step.title}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                    {/* Contextual CTAs at key decision stages */}
                    {stage.id === 2 && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-orange-800 font-medium">
                          {lang === 'zh' ? '不确定你的地块能否重建？先查一下。' : 'Not sure if your block is feasible? Check it for free.'}
                        </p>
                        <Link href="/feasibility" className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          {lang === 'zh' ? '免费查询我的地块 →' : 'Run a Free Feasibility Check →'}
                        </Link>
                      </div>
                    )}
                    {stage.id === 3 && (
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-purple-800 font-medium">
                          {lang === 'zh' ? '需要找 Town Planner 或建筑设计师？' : 'Need a Town Planner or building designer?'}
                        </p>
                        <Link href="/professionals" className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          {lang === 'zh' ? '查看已认证专业人士 →' : 'Browse Verified Professionals →'}
                        </Link>
                      </div>
                    )}
                    {stage.id === 4 && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-yellow-800 font-medium">
                          {lang === 'zh' ? '需要 Town Planner 处理你的 DA？' : 'Need a Town Planner to manage your DA?'}
                        </p>
                        <Link href="/professionals?category=Town+Planner" className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          {lang === 'zh' ? '找 Town Planner →' : 'Find a Town Planner →'}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.guide.ctaTitle}</h2>
          <p className="text-gray-500 mb-6">{t.guide.ctaSubtitle}</p>
          <Link href="/feasibility" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            {t.guide.ctaBtn}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
