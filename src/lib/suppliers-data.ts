export type SupplierCategory =
  | 'windows-doors'
  | 'flooring'
  | 'paint'
  | 'tiles'
  | 'kitchen'
  | 'plumbing'
  | 'electrical'
  | 'roofing'
  | 'insulation'
  | 'landscaping'
  | 'curtains-blinds'
  | 'custom-wardrobes'
  | 'outdoor-paving'
  | 'other'

export type SupplierOrigin = 'local' | 'china' | 'europe' | 'multi'

export interface Supplier {
  id: string
  name: string
  category: SupplierCategory
  origin: SupplierOrigin
  description: string
  descriptionZh: string
  states: string[]           // States/territories served
  verified: boolean
  verifiedNote?: string      // Why they're verified (Google rating source, etc.)
  googleRating?: number      // 1–5
  googleReviews?: number
  website?: string
  email?: string
  phone?: string
  wechat?: string
  address?: string
  specialties: string[]
  specialtiesZh: string[]
  featured: boolean
  reliabilityScore: number
}

export const SUPPLIER_CATEGORIES: Record<SupplierCategory, { en: string; zh: string; icon: string; color: string }> = {
  'windows-doors':  { en: 'Windows & Doors',  zh: '门窗',     icon: '🪟', color: 'blue' },
  'flooring':       { en: 'Flooring',          zh: '地板',     icon: '🪵', color: 'orange' },
  'paint':          { en: 'Paint',             zh: '油漆',     icon: '🎨', color: 'yellow' },
  'tiles':          { en: 'Tiles & Stone',     zh: '瓷砖石材', icon: '🧱', color: 'gray' },
  'kitchen':        { en: 'Kitchen & Joinery', zh: '橱柜',     icon: '🍳', color: 'purple' },
  'plumbing':       { en: 'Plumbing & Fixtures', zh: '水管配件', icon: '🚿', color: 'cyan' },
  'electrical':     { en: 'Electrical',        zh: '电气',     icon: '⚡', color: 'yellow' },
  'roofing':        { en: 'Roofing',           zh: '屋顶',     icon: '🏠', color: 'red' },
  'insulation':     { en: 'Insulation',        zh: '隔热',     icon: '🌡️', color: 'green' },
  'landscaping':      { en: 'Landscaping',        zh: '景观绿化',   icon: '🌿', color: 'green' },
  'curtains-blinds':  { en: 'Curtains & Blinds',  zh: '窗帘百叶',   icon: '🪟', color: 'pink' },
  'custom-wardrobes': { en: 'Custom Wardrobes',    zh: '定制衣柜',   icon: '🚪', color: 'purple' },
  'outdoor-paving':   { en: 'Outdoor & Paving',   zh: '户外铺装',   icon: '🧱', color: 'stone' },
  'other':            { en: 'Other',              zh: '其他',       icon: '📦', color: 'gray' },
}

export const SUPPLIERS: Supplier[] = [
  // ── WINDOWS & DOORS ──
  {
    id: 'wideline-windows',
    name: 'Wideline Windows & Doors',
    category: 'windows-doors',
    origin: 'local',
    description: 'Australian-made aluminium windows and doors since 1955. Popular with volume builders across NSW and QLD for their double-glazed and thermally efficient range.',
    descriptionZh: '澳洲本土制造铝合金门窗，1955年创立。因其双层玻璃和隔热系列，深受新南威尔士和昆士兰批量建筑商青睐。',
    states: ['NSW', 'QLD', 'ACT'],
    verified: false,
    website: 'wideline.com.au',
    specialties: ['Double Glazing', 'Thermally Broken', 'Australian Made', 'Builder Supply'],
    specialtiesZh: ['双层玻璃', '隔热断桥', '澳洲本土制造', '建筑商供货'],
    featured: false,
    reliabilityScore: 82,
  },
  {
    id: 'unverified-windows-co',
    name: 'SydneyGlass Direct',
    category: 'windows-doors',
    origin: 'china',
    description: 'Importing aluminium windows and glass products direct from Guangdong factories.',
    descriptionZh: '直接从广东工厂进口铝合金窗户和玻璃产品。',
    states: ['NSW'],
    verified: false,
    specialties: ['Budget Windows', 'Glass Panels', 'Commercial'],
    specialtiesZh: ['经济型窗户', '玻璃板', '商业用途'],
    featured: false,
    reliabilityScore: 30,
  },
  {
    id: 'coastline-doors',
    name: 'Coastline Door & Frame',
    category: 'windows-doors',
    origin: 'local',
    description: 'Family-run door and frame manufacturer based in Newcastle, NSW. Specialising in entry doors, internal doors, and cavity sliders for residential builders.',
    descriptionZh: '位于新南威尔士州纽卡斯尔的家族门框制造商。专营入户门、内门和嵌入式推拉门，服务住宅建筑商。',
    states: ['NSW', 'QLD'],
    verified: false,
    specialties: ['Entry Doors', 'Internal Doors', 'Cavity Sliders', 'Custom Frames'],
    specialtiesZh: ['入户门', '内门', '嵌入式推拉门', '定制门框'],
    featured: false,
    reliabilityScore: 68,
  },

  // ── FLOORING ──
  {
    id: 'floorworld',
    name: 'Floorworld',
    category: 'flooring',
    origin: 'multi',
    description: 'National flooring dealer network specialising in Australian hardwood, engineered timber, and LVP. Independent stores with expert installation teams across major cities.',
    descriptionZh: '全国地板经销商网络，专注澳洲硬木、工程木地板和 LVP。独立门店配备专业安装团队，覆盖各大主要城市。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
    verified: false,
    website: 'floorworld.com.au',
    specialties: ['Australian Hardwood', 'Engineered Timber', 'LVP', 'Free Measure & Quote'],
    specialtiesZh: ['澳洲硬木', '工程木地板', 'LVP', '免费上门量尺报价'],
    featured: false,
    reliabilityScore: 80,
  },
  {
    id: 'lvp-direct',
    name: 'FloorXpert LVP',
    category: 'flooring',
    origin: 'multi',
    description: 'Specialist luxury vinyl plank supplier for residential KDR and renovation projects. Waterproof click-lock systems from leading Asian manufacturers.',
    descriptionZh: '住宅 KDR 和翻新项目专业豪华乙烯基地板供应商，提供来自亚洲领先厂商的防水卡扣系统。',
    states: ['NSW', 'VIC', 'QLD', 'WA'],
    verified: false,
    specialties: ['Luxury Vinyl Plank', 'Waterproof', 'Click-Lock', 'Budget-Friendly'],
    specialtiesZh: ['豪华乙烯基地板', '防水', '卡扣系统', '经济实惠'],
    featured: false,
    reliabilityScore: 45,
  },
  {
    id: 'choices-flooring',
    name: 'Choices Flooring',
    category: 'flooring',
    origin: 'multi',
    description: 'Australia\'s leading flooring franchise with 140+ stores. Full range of carpet, timber, laminate, vinyl, and tiles. Professional installation Australia-wide.',
    descriptionZh: '澳洲领先的地板连锁，拥有 140 家以上门店。提供地毯、木地板、强化地板、乙烯基地板和瓷砖全品类，提供全澳专业安装服务。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: false,
    website: 'choicesflooring.com.au',
    phone: '1300 246 437',
    specialties: ['Carpet', 'Timber', 'Laminate', 'LVP', 'Professional Install'],
    specialtiesZh: ['地毯', '木地板', '强化地板', 'LVP 地板', '专业安装'],
    featured: false,
    reliabilityScore: 88,
  },
  {
    id: 'prestige-timber-floors',
    name: 'Prestige Timber Floors',
    category: 'flooring',
    origin: 'local',
    description: 'Sydney-based hardwood flooring specialist offering Australian species like Spotted Gum and Blackbutt. Supply and installation for new builds and renovations.',
    descriptionZh: '悉尼硬木地板专家，提供斑纹桉和黑桦等澳洲本土树种。新建和翻新项目的供货与安装一站式服务。',
    states: ['NSW', 'ACT'],
    verified: false,
    specialties: ['Spotted Gum', 'Blackbutt', 'Hardwood Install', 'Sanding & Polishing'],
    specialtiesZh: ['斑纹桉', '黑桦木', '硬木安装', '打磨抛光'],
    featured: false,
    reliabilityScore: 72,
  },

  // ── TILES & STONE ──
  {
    id: 'tile-cloud',
    name: 'Tile Cloud',
    category: 'tiles',
    origin: 'multi',
    description: 'Online tile retailer with curated collections from Europe and Asia. Competitive pricing with sample ordering and delivery Australia-wide.',
    descriptionZh: '在线瓷砖零售商，精选欧洲和亚洲系列产品。价格具有竞争力，提供样品订购和全澳配送。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: false,
    website: 'tilecloud.com.au',
    specialties: ['Online Ordering', 'European Tiles', 'Large Format', 'Free Samples'],
    specialtiesZh: ['在线订购', '欧式瓷砖', '大规格砖', '免费样品'],
    featured: false,
    reliabilityScore: 82,
  },
  {
    id: 'stone-depot',
    name: 'Stone Depot Direct',
    category: 'tiles',
    origin: 'china',
    description: 'Direct importer of natural stone and engineered quartz from Chinese quarries and processors.',
    descriptionZh: '直接从中国采石场和加工厂进口天然石材和工程石英石。',
    states: ['NSW', 'VIC'],
    verified: false,
    specialties: ['Marble', 'Granite', 'Quartz', 'Benchtops'],
    specialtiesZh: ['大理石', '花岗岩', '石英石', '台面'],
    featured: false,
    reliabilityScore: 35,
  },
  {
    id: 'pacific-tile-gallery',
    name: 'Pacific Tile Gallery',
    category: 'tiles',
    origin: 'multi',
    description: 'Independent tile showroom in Melbourne\'s inner west. Curated range of porcelain, ceramic, and natural stone tiles for bathrooms and kitchens. Trade pricing for builders.',
    descriptionZh: '墨尔本内西区独立瓷砖展厅。精选卫浴和厨房用瓷质、陶瓷及天然石材砖。为建筑商提供贸易价格。',
    states: ['VIC'],
    verified: false,
    specialties: ['Porcelain Tiles', 'Bathroom Tiles', 'Kitchen Splashbacks', 'Trade Pricing'],
    specialtiesZh: ['瓷质砖', '卫浴瓷砖', '厨房后挡板', '贸易价格'],
    featured: false,
    reliabilityScore: 70,
  },

  // ── PAINT ──
  {
    id: 'haymes-paint',
    name: 'Haymes Paint',
    category: 'paint',
    origin: 'local',
    description: 'Australian-owned and operated paint manufacturer since 1935. Premium interior and exterior paints made in Ballarat, VIC. Popular with professional painters for coverage and durability.',
    descriptionZh: '澳洲本土油漆制造商，1935 年创立。优质室内外涂料，产自维多利亚州 Ballarat，以覆盖力和耐久性深受专业油漆工青睐。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS'],
    verified: false,
    website: 'haymespaint.com.au',
    phone: '1300 042 963',
    specialties: ['Interior Paint', 'Exterior Paint', 'Specialty Coatings', 'Colour Design Service'],
    specialtiesZh: ['室内涂料', '室外涂料', '特种涂料', '配色设计服务'],
    featured: false,
    reliabilityScore: 90,
  },
  {
    id: 'solver-paints',
    name: 'Solver Paints',
    category: 'paint',
    origin: 'local',
    description: 'Family-owned Australian paint company since 1927, based in Brisbane. Interior, exterior, and specialty coatings widely used by painters across QLD and northern NSW.',
    descriptionZh: '1927年创立的澳洲家族油漆企业，总部位于布里斯班。室内外及特种涂料在昆士兰和新南威尔士北部被专业油漆工广泛使用。',
    states: ['QLD', 'NSW', 'VIC', 'SA', 'WA'],
    verified: false,
    specialties: ['Interior Paint', 'Exterior Paint', 'Render Coatings', 'Timber Finishes'],
    specialtiesZh: ['室内涂料', '室外涂料', '粉刷涂层', '木材涂料'],
    featured: false,
    reliabilityScore: 78,
  },

  // ── KITCHEN & JOINERY ──
  {
    id: 'paramount-kitchens',
    name: 'Paramount Joinery & Kitchens',
    category: 'kitchen',
    origin: 'local',
    description: 'Custom kitchen and joinery workshop in Western Sydney. Design, manufacture, and install kitchens, vanities, and laundry cabinetry for KDR and renovation projects.',
    descriptionZh: '位于悉尼西区的定制厨房和细木工作坊。设计、制造和安装厨房、洗手台及洗衣房橱柜，服务推倒重建和翻新项目。',
    states: ['NSW'],
    verified: false,
    specialties: ['Custom Kitchens', 'Vanity Units', 'Laundry Cabinetry', 'Stone Benchtops'],
    specialtiesZh: ['定制厨房', '洗手台柜', '洗衣房橱柜', '石材台面'],
    featured: false,
    reliabilityScore: 74,
  },
  {
    id: 'pinnacle-surfaces',
    name: 'Pinnacle Board & Surface',
    category: 'kitchen',
    origin: 'local',
    description: 'Independent decorative panel and benchtop supplier based in Melbourne. Thermolaminated boards, compact laminate, and timber veneer for kitchen and joinery trades.',
    descriptionZh: '墨尔本独立装饰面板和台面供应商。为厨房和细木工行业提供热压成型板、高密度层压板和木皮面板。',
    states: ['VIC', 'SA', 'TAS'],
    verified: false,
    specialties: ['Laminate Benchtops', 'Thermolaminated Panels', 'Timber Veneer', 'Custom Colours'],
    specialtiesZh: ['层压台面', '热压成型面板', '木皮面板', '定制颜色'],
    featured: false,
    reliabilityScore: 65,
  },

  // ── PLUMBING ──
  {
    id: 'budget-plumbing-cn',
    name: 'DirectBath Imports',
    category: 'plumbing',
    origin: 'china',
    description: 'Wholesale importer of bathroom fixtures from Chinese manufacturers. Freestanding baths, vanities, and tapware.',
    descriptionZh: '从中国制造商批发进口浴室配件。独立式浴缸、洗手台和水龙头。',
    states: ['NSW', 'VIC'],
    verified: false,
    specialties: ['Freestanding Baths', 'Vanities', 'Budget Tapware'],
    specialtiesZh: ['独立式浴缸', '洗手台', '经济型水龙头'],
    featured: false,
    reliabilityScore: 28,
  },
  {
    id: 'southside-plumbing-supply',
    name: 'Southside Plumbing Supplies',
    category: 'plumbing',
    origin: 'local',
    description: 'Independent plumbing supply warehouse in south Melbourne. Toilets, basins, tapware, and hot water systems. Trade accounts available for registered builders.',
    descriptionZh: '墨尔本南区独立管道供应仓库。提供马桶、面盆、水龙头及热水系统，为注册建筑商提供贸易账户。',
    states: ['VIC'],
    verified: false,
    specialties: ['Toilets', 'Basins', 'Tapware', 'Hot Water Systems', 'Trade Accounts'],
    specialtiesZh: ['马桶', '面盆', '水龙头', '热水系统', '贸易账户'],
    featured: false,
    reliabilityScore: 70,
  },

  // ── ROOFING ──
  {
    id: 'topridge-roofing',
    name: 'TopRidge Metal Roofing',
    category: 'roofing',
    origin: 'local',
    description: 'Steel roofing and wall cladding supplier based in Penrith, NSW. Custom-cut corrugated and standing seam profiles for residential builds. BAL-rated options available.',
    descriptionZh: '位于新南威尔士州彭里斯的钢制屋顶和墙面覆层供应商。提供定制裁切波纹板和立缝型材，适用于住宅建设，提供 BAL 评级选项。',
    states: ['NSW', 'ACT'],
    verified: false,
    specialties: ['Steel Roofing', 'Corrugated Iron', 'Standing Seam', 'Wall Cladding', 'BAL Rated'],
    specialtiesZh: ['钢制屋顶', '波形铁', '立缝型材', '外墙覆层', 'BAL 评级'],
    featured: false,
    reliabilityScore: 72,
  },
  {
    id: 'heritage-roof-tiles',
    name: 'Heritage Roof Tile Co',
    category: 'roofing',
    origin: 'local',
    description: 'Specialist terracotta and concrete roof tile supplier in Brisbane. Wide range of profiles for new builds and heritage restorations across South-East QLD.',
    descriptionZh: '布里斯班红陶和混凝土屋顶瓦专业供应商。提供多种型材，适用于东南昆士兰地区的新建项目和遗产修复工程。',
    states: ['QLD'],
    verified: false,
    specialties: ['Terracotta Tiles', 'Concrete Tiles', 'Heritage Profiles', 'Flat Tiles'],
    specialtiesZh: ['红陶瓦', '混凝土瓦', '遗产风格型材', '平板瓦'],
    featured: false,
    reliabilityScore: 68,
  },

  // ── INSULATION ──
  {
    id: 'autex-acoustics',
    name: 'Autex Acoustics',
    category: 'insulation',
    origin: 'multi',
    description: 'Leading acoustic and thermal insulation manufacturer from New Zealand, widely used in Australian residential builds. GreenStuf\u00ae bulk insulation is a builder favourite for wall and ceiling applications.',
    descriptionZh: '来自新西兰的领先隔音隔热材料制造商，广泛用于澳洲住宅建设。GreenStuf\u00ae 散装隔热材料是建筑商在墙体和天花板应用中的首选。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: false,
    website: 'autex.com.au',
    specialties: ['Acoustic Insulation', 'GreenStuf\u00ae', 'Thermal Batts', 'Ceiling & Wall'],
    specialtiesZh: ['隔音材料', 'GreenStuf\u00ae', '隔热棉', '天花板和墙体'],
    featured: false,
    reliabilityScore: 80,
  },
  {
    id: 'enviro-insulation',
    name: 'Enviro Insulation Solutions',
    category: 'insulation',
    origin: 'local',
    description: 'Independent insulation installer and supplier in Adelaide. Glasswool batts, acoustic insulation, and underfloor insulation for residential new builds. NCC-compliant products.',
    descriptionZh: '阿德莱德独立隔热安装商和供应商。提供玻璃棉、隔音材料和地板隔热，适用于住宅新建项目，产品符合 NCC 标准。',
    states: ['SA', 'VIC'],
    verified: false,
    specialties: ['Glasswool Batts', 'Acoustic Batts', 'Underfloor Insulation', 'NCC Compliant'],
    specialtiesZh: ['玻璃棉', '隔音棉', '地板隔热', '符合 NCC'],
    featured: false,
    reliabilityScore: 65,
  },

  // ── LANDSCAPING ──
  {
    id: 'midland-brick',
    name: 'Midland Brick',
    category: 'landscaping',
    origin: 'local',
    description: 'Western Australia\'s leading brick and paver manufacturer. Clay bricks, concrete pavers, and retaining wall blocks for new home builds, driveways, and landscaping.',
    descriptionZh: '西澳领先的砖块和铺路砖制造商。粘土砖、混凝土铺路砖和挡土墙砌块，适用于新房建设、车道和景观工程。',
    states: ['WA', 'SA', 'VIC'],
    verified: false,
    website: 'midlandbrick.com.au',
    specialties: ['Clay Bricks', 'Concrete Pavers', 'Retaining Walls', 'Driveways', 'Garden Edging'],
    specialtiesZh: ['粘土砖', '混凝土铺路砖', '挡土墙', '车道', '花园边缘'],
    featured: false,
    reliabilityScore: 85,
  },
  {
    id: 'greenscape-supplies',
    name: 'Greenscape Landscape Supplies',
    category: 'landscaping',
    origin: 'local',
    description: 'Independent landscape supply yard in Sydney\'s Hills District. Pavers, retaining wall blocks, garden edging, mulch, and soil for residential projects.',
    descriptionZh: '位于悉尼山区的独立景观材料供应场。提供铺路砖、挡土墙块、花园边缘、覆盖物和土壤，适用于住宅项目。',
    states: ['NSW'],
    verified: false,
    specialties: ['Pavers', 'Retaining Walls', 'Garden Edging', 'Mulch', 'Topsoil'],
    specialtiesZh: ['铺路砖', '挡土墙', '花园边缘', '覆盖物', '表土'],
    featured: false,
    reliabilityScore: 70,
  },

  // ── CURTAINS & BLINDS ──
  {
    id: 'bettaview-blinds',
    name: 'Bettaview Blinds & Curtains',
    category: 'curtains-blinds',
    origin: 'local',
    description: 'Australian-owned blinds and curtains manufacturer supplying direct to homeowners and builders. Roller blinds, Roman blinds, sheer curtains, and blockout options. Free measure and quote service.',
    descriptionZh: '澳洲本土窗帘百叶制造商，直供业主和建筑商。提供卷帘、罗马帘、薄纱窗帘及遮光款式，免费上门量尺报价。',
    states: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
    verified: false,
    website: 'bettaview.com.au',
    phone: '1300 238 822',
    specialties: ['Roller Blinds', 'Roman Blinds', 'Sheer Curtains', 'Blockout Curtains', 'Motorised Blinds'],
    specialtiesZh: ['卷帘', '罗马帘', '薄纱窗帘', '遮光窗帘', '电动百叶'],
    featured: false,
    reliabilityScore: 84,
  },
  {
    id: 'acmeda-blinds',
    name: 'Acmeda',
    category: 'curtains-blinds',
    origin: 'local',
    description: 'Australian manufacturer of roller blind systems and components. Supplies to blind makers and installers nationwide. Known for motorisation systems compatible with smart home automation.',
    descriptionZh: '澳洲本土卷帘系统及配件制造商，全国供货给百叶安装商。以兼容智能家居自动化的电动系统著称。',
    states: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
    verified: false,
    website: 'acmeda.com',
    specialties: ['Roller Blind Systems', 'Motorised Blinds', 'Smart Home Integration', 'Outdoor Blinds', 'Zip Track Blinds'],
    specialtiesZh: ['卷帘系统', '电动百叶', '智能家居集成', '户外百叶', 'Zip Track遮阳帘'],
    featured: false,
    reliabilityScore: 80,
  },

  // ── CUSTOM WARDROBES ──
  {
    id: 'flexi-wardrobes',
    name: 'Flexi Wardrobes',
    category: 'custom-wardrobes',
    origin: 'local',
    description: 'Custom wardrobe and storage specialists with showrooms across Australia. Fully measured and installed. Popular for new builds — works directly with builders and homeowners.',
    descriptionZh: '澳洲全国连锁定制衣柜和储物专家，全国均有展示厅。提供全程量尺及安装服务，常与建筑商合作，适合新房项目。',
    states: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
    verified: false,
    website: 'flexi.com.au',
    specialties: ['Custom Built-ins', 'Walk-in Robes', 'Home Office', 'Entertainment Units', 'Laundry'],
    specialtiesZh: ['定制嵌入式衣柜', '步入式衣帽间', '家庭办公室', '影音墙', '洗衣房'],
    featured: false,
    reliabilityScore: 87,
  },
  {
    id: 'innerspace-wardrobes',
    name: 'InnerSpace Custom Wardrobes',
    category: 'custom-wardrobes',
    origin: 'local',
    description: 'Boutique wardrobe design and build studio in Perth. Walk-in robes, built-in wardrobes, and home office fitouts. Measured, manufactured, and installed by in-house team.',
    descriptionZh: '珀斯精品衣柜设计与制造工作室。步入式衣帽间、嵌入式衣柜和家庭办公室装修。由内部团队量尺、制造和安装。',
    states: ['WA'],
    verified: false,
    specialties: ['Walk-in Robes', 'Built-in Wardrobes', 'Home Office', 'Sliding Doors'],
    specialtiesZh: ['步入式衣帽间', '嵌入式衣柜', '家庭办公室', '滑门衣柜'],
    featured: false,
    reliabilityScore: 73,
  },

  // ── OUTDOOR & PAVING ──
  {
    id: 'eco-outdoor',
    name: 'Eco Outdoor',
    category: 'outdoor-paving',
    origin: 'multi',
    description: 'Premium outdoor stone, tile, and paving specialist supplying to high-end KDR and renovation projects. Natural stone (sandstone, granite, bluestone), porcelain outdoor tiles, and timber decking.',
    descriptionZh: '高端户外石材、瓷砖及铺装专家，专供高档推倒重建和翻新项目。提供天然石材（砂岩、花岗岩、蓝石）、户外瓷砖及木质甲板。',
    states: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
    verified: false,
    website: 'ecooutdoor.com.au',
    specialties: ['Natural Stone Pavers', 'Bluestone', 'Sandstone', 'Porcelain Outdoor', 'Timber Decking'],
    specialtiesZh: ['天然石材铺路', '蓝石', '砂岩', '户外瓷砖', '木质甲板'],
    featured: false,
    reliabilityScore: 89,
  },
  {
    id: 'allstone-paving',
    name: 'AllStone Paving & Masonry',
    category: 'outdoor-paving',
    origin: 'local',
    description: 'Concrete paver and retaining wall supplier in Melbourne\'s south-east. Budget to premium ranges for driveways, patios, and garden walls. Delivery across metro Melbourne.',
    descriptionZh: '墨尔本东南区混凝土铺路砖和挡土墙供应商。提供从经济型到高端的车道、露台和花园墙产品，覆盖墨尔本都市区配送。',
    states: ['VIC'],
    verified: false,
    specialties: ['Concrete Pavers', 'Retaining Walls', 'Driveway Pavers', 'Garden Walls', 'Permeable Paving'],
    specialtiesZh: ['混凝土铺路砖', '挡土墙', '车道铺路砖', '花园墙', '透水铺装'],
    featured: false,
    reliabilityScore: 66,
  },
]

// ── Ranking algorithm ──
// Verified first, then by reliabilityScore
export function rankSuppliers(suppliers: Supplier[]): Supplier[] {
  return [...suppliers].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1
    return b.reliabilityScore - a.reliabilityScore
  })
}
