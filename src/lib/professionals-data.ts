import { HardHat, FileText, Building2, Ruler, Zap, Droplets, DollarSign, Briefcase, PenTool, type LucideIcon } from 'lucide-react'

export interface Professional {
  slug: string
  name: string
  category: string
  state: string
  regions: string[]
  specialties: string[]
  verified: boolean
  featured: boolean
  description: string
  website: string | null
  wechat: string | null
  phone?: string | null
  is_demo?: boolean
  languages?: string[]
}

export interface Category {
  id: string
  label: string
  labelZh: string
  icon: LucideIcon
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'builder',     label: 'Builders',            labelZh: '建筑商',     icon: HardHat,    color: 'orange' },
  { id: 'designer',   label: 'Building Designers',   labelZh: '建筑设计师', icon: PenTool,    color: 'indigo' },
  { id: 'planner',    label: 'Town Planners',         labelZh: '城市规划师', icon: FileText,   color: 'blue'   },
  { id: 'demolition', label: 'Demolition',            labelZh: '拆房商',     icon: Building2,  color: 'red'    },
  { id: 'engineer',   label: 'Engineers',             labelZh: '结构工程师', icon: Ruler,      color: 'purple' },
  { id: 'electrician',label: 'Electricians',          labelZh: '电工',       icon: Zap,        color: 'yellow' },
  { id: 'plumber',    label: 'Plumbers',              labelZh: '水管工',     icon: Droplets,   color: 'cyan'   },
  { id: 'finance',    label: 'Finance Brokers',       labelZh: '贷款经纪',   icon: DollarSign, color: 'green'  },
  { id: 'other',      label: 'Other',                 labelZh: '其他',       icon: Briefcase,  color: 'gray'   },
]

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const raw: Omit<Professional, 'slug'>[] = [
  // ── BUILDERS ──
  {
    name: 'Metricon Homes',
    category: 'builder', state: 'VIC',
    regions: ['Melbourne', 'Sydney', 'Brisbane', 'Adelaide'],
    specialties: ['Knockdown Rebuild', 'Display Homes', 'Custom Design'],
    verified: true, featured: true,
    description: "Australia's largest home builder. Extensive KDR and new-home range across VIC, NSW, QLD, and SA. Volume pricing with full design studio.",
    website: 'metricon.com.au', wechat: null,
  },
  {
    name: 'GJ Gardner Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Brisbane', 'Perth', 'All States'],
    specialties: ['Knockdown Rebuild', 'Renovation', 'Custom Homes', 'Granny Flat'],
    verified: true, featured: true,
    description: 'National franchise builder operating across all states. Strong KDR and renovation track record. Local franchise owners with national brand backing.',
    website: 'gjgardner.com.au', wechat: null,
  },
  {
    name: 'McDonald Jones Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong'],
    specialties: ['Knockdown Rebuild', 'Dual Occupancy', 'Custom Homes'],
    verified: true, featured: false,
    description: 'Award-winning NSW builder known for quality finishes and KDR expertise across Greater Sydney and regional NSW. HIA award winner multiple years.',
    website: 'mcdonaldjones.com.au', wechat: null,
  },
  {
    name: 'Clarendon Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'ACT', 'South East NSW'],
    specialties: ['Knockdown Rebuild', 'Townhouses', 'Heritage Area Builds'],
    verified: true, featured: false,
    description: 'Premium NSW and ACT builder with deep experience navigating Sydney council requirements, heritage overlays, and dual-occupancy projects.',
    website: 'clarendonhomes.com.au', wechat: null,
  },
  {
    name: 'Plantation Homes',
    category: 'builder', state: 'QLD',
    regions: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Ipswich'],
    specialties: ['Knockdown Rebuild', 'Flood Rebuild', 'Queenslander Renovation'],
    verified: true, featured: false,
    description: 'Queensland specialist builder with proven KDR expertise across SEQ. Strong flood-zone and bush-fire overlay knowledge for QLD councils.',
    website: 'plantationhomes.com.au', wechat: null,
  },
  {
    name: 'Dale Alcock Homes',
    category: 'builder', state: 'WA',
    regions: ['Perth Metro', 'South West WA', 'All Perth Councils'],
    specialties: ['Knockdown Rebuild', 'Split Level', 'R-Codes Compliance'],
    verified: true, featured: false,
    description: "Western Australia's trusted KDR builder. Deep expertise in Perth R-Codes, knock-down and rebuild process, and all metro council requirements.",
    website: 'dalealcock.com.au', wechat: null,
  },
  {
    name: 'Simonds Homes',
    category: 'builder', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Ballarat', 'Adelaide'],
    specialties: ['Knockdown Rebuild', 'Townhouses', 'Energy Efficiency'],
    verified: true, featured: false,
    description: 'Major Victorian and SA builder. Established KDR program with 7-star energy efficiency options. Strong presence across Melbourne metro and regional VIC.',
    website: 'simonds.com.au', wechat: null,
  },
  {
    name: 'Rawson Homes',
    category: 'builder', state: 'NSW',
    regions: ['Sydney', 'Hunter Valley', 'Illawarra', 'Shoalhaven'],
    specialties: ['Knockdown Rebuild', 'Dual Occupancy', 'Acreage Homes'],
    verified: true, featured: false,
    description: 'NSW-focused builder with specialist KDR team. Strong in Sydney western and southern suburbs. Dual-occupancy and multi-dwelling experience.',
    website: 'rawsonhomes.com.au', wechat: null,
  },
  // ── BUILDING DESIGNERS ──
  {
    name: 'Buildplan Design Studio',
    category: 'designer', state: 'NSW',
    regions: ['Sydney', 'Wollongong', 'Central Coast'],
    specialties: ['KDR Design', 'Dual Occupancy', 'Granny Flat', 'DA Drawings'],
    verified: true, featured: true,
    description: 'Registered building designers specialising in KDR and dual occupancy projects across Greater Sydney. Full design and documentation service from concept to DA-ready plans.',
    website: null, wechat: null,
  },
  {
    name: 'Blueprint Residential Design',
    category: 'designer', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Mornington Peninsula'],
    specialties: ['Custom Home Design', 'KDR', 'Extensions', 'Planning Permit Drawings'],
    verified: true, featured: false,
    description: 'Melbourne-based residential designers with 15+ years of custom home and KDR experience. Coordinate with structural engineers and town planners for a seamless approval process.',
    website: null, wechat: null,
  },
  {
    name: 'ProDraft Building Designers',
    category: 'designer', state: 'QLD',
    regions: ['Brisbane', 'Gold Coast', 'Sunshine Coast'],
    specialties: ['House Plans', 'KDR', 'Granny Flat', 'Council Submissions'],
    verified: true, featured: false,
    description: 'QLD-licensed building designers providing full design documentation for KDR, dual occupancy, and secondary dwellings. Experienced with Brisbane City Plan 2014.',
    website: null, wechat: null,
  },
  {
    name: 'Form & Function Architects',
    category: 'designer', state: 'WA',
    regions: ['Perth', 'Fremantle', 'Swan Valley'],
    specialties: ['Architectural Design', 'KDR', 'Heritage Areas', 'Custom Homes'],
    verified: true, featured: false,
    description: 'Registered architects providing full residential design services across Perth metropolitan area. Heritage area specialists with JDAP/LDAP submission experience.',
    website: null, wechat: null,
  },
  // ── TOWN PLANNERS ──
  {
    name: 'Urban Planning Solutions',
    category: 'planner', state: 'NSW',
    regions: ['Sydney', 'All NSW'],
    specialties: ['DA Applications', 'Heritage', 'Rezoning', 'CDC'],
    verified: true, featured: false,
    description: 'Registered town planners with extensive council knowledge across all Sydney LGAs. Heritage, flood, and bushfire DA specialists.',
    website: null, wechat: null,
  },
  {
    name: 'Meridian Planning Consultants',
    category: 'planner', state: 'VIC',
    regions: ['Melbourne', 'Mornington Peninsula', 'Yarra Valley'],
    specialties: ['Planning Permits', 'Heritage Overlays', 'VCAT Appeals'],
    verified: true, featured: false,
    description: 'Melbourne planning consultants with 20+ years navigating complex overlays and permit applications for residential builds and KDR projects.',
    website: null, wechat: null,
  },
  // ── DEMOLITION ──
  {
    name: 'Precise Demolition',
    category: 'demolition', state: 'NSW',
    regions: ['Sydney', 'Hunter Valley', 'Illawarra'],
    specialties: ['Residential Demo', 'Asbestos Removal', 'Concrete Slab', 'Site Clearance'],
    verified: true, featured: false,
    description: 'Licensed residential demolition contractor. Asbestos removal certified, full insurance, and council permit management included.',
    website: null, wechat: null,
  },
  // ── ENGINEERS ──
  {
    name: 'Structural Solutions Engineering',
    category: 'engineer', state: 'VIC',
    regions: ['Melbourne', 'Geelong', 'Ballarat'],
    specialties: ['Slab Design', 'Frame Engineering', 'Reactive Soil'],
    verified: true, featured: false,
    description: 'NER registered structural engineer. Specialises in residential KDR structural design including H2 and M-D reactive soil sites.',
    website: null, wechat: null,
  },
  // ── FINANCE ──
  {
    name: 'KDR Finance Brokers',
    category: 'finance', state: 'NSW',
    regions: ['All Australia'],
    specialties: ['Construction Loans', 'Owner Builder Finance', 'Bridging Loans'],
    verified: true, featured: true,
    description: 'Specialised mortgage brokers for KDR and construction finance. Access to 30+ lenders. Progress draw management included.',
    website: null, wechat: null,
  },
]

export const PROFESSIONALS: Professional[] = raw.map(p => ({ ...p, slug: slug(p.name) }))

export function getProfessionalBySlug(s: string): Professional | undefined {
  return PROFESSIONALS.find(p => p.slug === s)
}

export function getProfessionalsByState(state: string): Professional[] {
  const s = state.toUpperCase()
  return PROFESSIONALS.filter(p => p.state === s || p.regions.includes('All Australia'))
}

export const STATE_INFO: Record<string, { name: string; city: string; blurb: string; blurbZh: string }> = {
  NSW: {
    name: 'New South Wales',
    city: 'Sydney',
    blurb: 'NSW has Australia\'s most complex planning rules — multiple heritage overlays, flood and bushfire zones, and a mix of CDC and DA pathways. Find KDR-specialist professionals who know Sydney and regional NSW councils.',
    blurbZh: '新南威尔士州拥有澳洲最复杂的规划规则——多种遗产叠加区、洪水和丛林火灾区，以及 CDC 和 DA 双重申请路径。找到熟悉悉尼及新州各地方议会的 KDR 专业人士。',
  },
  VIC: {
    name: 'Victoria',
    city: 'Melbourne',
    blurb: 'Victoria\'s planning scheme is among the most permissive for medium-density residential development. Melbourne\'s inner suburbs offer strong KDR opportunities with well-established pathways for building designers, planners and builders.',
    blurbZh: '维多利亚州的规划方案是澳洲对中密度住宅开发最为宽松的之一。墨尔本内城区提供强劲的推倒重建机会，建筑设计师、规划师和建筑商的审批路径清晰。',
  },
  QLD: {
    name: 'Queensland',
    city: 'Brisbane',
    blurb: 'Queensland\'s diverse councils — from Brisbane City to Gold Coast and Sunshine Coast — each have their own planning rules. Local expertise matters. Find QLD-savvy professionals for your KDR or renovation project.',
    blurbZh: '昆士兰州各地方议会——从布里斯班市到黄金海岸和阳光海岸——各有其独特的规划规则。本地专业知识至关重要。',
  },
  WA: {
    name: 'Western Australia',
    city: 'Perth',
    blurb: 'Western Australia uses R-Codes (Residential Design Codes) as the state-wide planning framework. Perth\'s established suburbs are prime KDR territory. Find WA-licensed builders and designers who know Perth metro councils.',
    blurbZh: '西澳大利亚使用 R-Codes（住宅设计规范）作为全州规划框架。珀斯成熟郊区是推倒重建的理想区域。',
  },
  SA: {
    name: 'South Australia',
    city: 'Adelaide',
    blurb: 'South Australia runs the PDI Act 2016 through the PlanSA portal — one of Australia\'s most modernised planning systems. Adelaide\'s inner ring suburbs are undergoing significant KDR-driven densification.',
    blurbZh: '南澳大利亚通过 PlanSA 门户运行 PDI Act 2016——澳洲现代化程度最高的规划系统之一。阿德莱德内环郊区正经历显著的推倒重建密集化趋势。',
  },
  ACT: {
    name: 'Australian Capital Territory',
    city: 'Canberra',
    blurb: 'The ACT operates under a leasehold land system and Territory Plan. Canberra\'s urban infill strategy makes KDR and dual-occupancy projects increasingly viable across RZ1 and RZ2 zones.',
    blurbZh: '澳大利亚首都领地采用租赁土地制度和领地规划。堪培拉的城市填充战略使 RZ1 和 RZ2 区域的推倒重建和双住宅项目日益可行。',
  },
  TAS: {
    name: 'Tasmania',
    city: 'Hobart',
    blurb: 'Tasmania uses the Tasmanian Planning Scheme. Hobart\'s inner suburbs — Battery Point, Glebe, Sandy Bay — have strong KDR demand with heritage considerations to manage.',
    blurbZh: '塔斯马尼亚使用塔斯马尼亚规划方案。霍巴特内城区——Battery Point、Glebe、Sandy Bay——推倒重建需求强劲，需关注遗产保护事宜。',
  },
  NT: {
    name: 'Northern Territory',
    city: 'Darwin',
    blurb: 'The NT Planning Scheme governs Darwin and surrounding areas. Darwin\'s tropical climate and building requirements mean cyclone-rated construction is essential for all KDR projects.',
    blurbZh: '北领地规划方案管辖达尔文及周边地区。达尔文的热带气候和建筑要求意味着所有推倒重建项目都需要达到气旋标准的建造。',
  },
}
