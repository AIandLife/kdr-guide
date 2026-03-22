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
  address?: string
  specialties: string[]
  specialtiesZh: string[]
  featured: boolean
  // For ranking algorithm: base score used alongside ratings
  reliabilityScore: number   // 0–100, internal curation score
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
  'landscaping':    { en: 'Landscaping',       zh: '景观',     icon: '🌿', color: 'green' },
}

export const SUPPLIERS: Supplier[] = [
  // ── WINDOWS & DOORS ──
  {
    id: 'stegbar',
    name: 'Stegbar Windows & Doors',
    category: 'windows-doors',
    origin: 'local',
    description: 'Australia\'s leading manufacturer of windows and doors for over 70 years. Custom aluminium, timber, and uPVC frames with full NCC compliance.',
    descriptionZh: '澳洲领先的门窗制造商，拥有超过 70 年历史。定制铝合金、木制和 uPVC 框架，完全符合 NCC 标准。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT'],
    verified: true,
    verifiedNote: 'Listed ASX company, WERS certified products',
    googleRating: 4.2,
    googleReviews: 1840,
    website: 'stegbar.com.au',
    phone: '1800 804 253',
    specialties: ['Double Glazing', 'Aluminium Frames', 'Bifold Doors', 'Sliding Doors', 'Energy Efficiency'],
    specialtiesZh: ['双层玻璃', '铝合金框架', '折叠门', '推拉门', '节能'],
    featured: true,
    reliabilityScore: 92,
  },
  {
    id: 'atf-windows',
    name: 'ATF Windows',
    category: 'windows-doors',
    origin: 'china',
    description: 'Specialist importer of high-performance aluminium double-glazed windows and doors. Chinese manufactured with full Australian compliance documentation.',
    descriptionZh: '专业进口高性能铝合金双层玻璃门窗。中国制造，拥有完整的澳洲合规文件。',
    states: ['NSW', 'VIC', 'QLD'],
    verified: true,
    verifiedNote: 'AGWA member, NCC energy compliance certificates available',
    googleRating: 4.5,
    googleReviews: 312,
    website: 'atfwindows.com.au',
    email: 'info@atfwindows.com.au',
    specialties: ['Double Glazing', 'Thermal Break', 'Cost-Effective', 'Custom Sizes'],
    specialtiesZh: ['双层玻璃', '断桥铝', '性价比高', '定制尺寸'],
    featured: false,
    reliabilityScore: 78,
  },
  {
    id: 'corinthian-doors',
    name: 'Corinthian Doors',
    category: 'windows-doors',
    origin: 'local',
    description: 'Australia\'s most popular door brand. Wide range of entry doors, internal doors, and cavity sliders. Available at leading hardware retailers.',
    descriptionZh: '澳洲最受欢迎的门品牌。提供多种入户门、内门和推拉门，可在主要建材零售商购买。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'WFPA member, BAL rated products available',
    googleRating: 4.1,
    googleReviews: 540,
    website: 'corinthian.com.au',
    specialties: ['Entry Doors', 'Cavity Sliders', 'BAL Rated', 'Fire Doors'],
    specialtiesZh: ['入户门', '嵌入式推拉门', 'BAL 防火等级', '防火门'],
    featured: false,
    reliabilityScore: 88,
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

  // ── FLOORING ──
  {
    id: 'quick-step',
    name: 'Quick-Step Flooring',
    category: 'flooring',
    origin: 'europe',
    description: 'Premium European engineered timber and laminate flooring. 25-year residential warranty. Distributed Australia-wide through authorised retailers.',
    descriptionZh: '欧洲优质工程木地板和强化地板。25 年住宅质保，通过全澳授权零售商销售。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'Unilin Group subsidiary, ISO certified',
    googleRating: 4.4,
    googleReviews: 2100,
    website: 'quick-step.com.au',
    specialties: ['Engineered Timber', 'Laminate', 'Waterproof', '25-Year Warranty'],
    specialtiesZh: ['工程木地板', '强化地板', '防水', '25 年质保'],
    featured: true,
    reliabilityScore: 90,
  },
  {
    id: 'hurford-timber',
    name: 'Hurford Hardwood',
    category: 'flooring',
    origin: 'local',
    description: 'Australian hardwood flooring specialists. Solid and engineered boards in species including Spotted Gum, Blackbutt, and Tasmanian Oak.',
    descriptionZh: '澳洲硬木地板专家。提供 Spotted Gum、Blackbutt 和塔斯马尼亚橡木等树种的实木和工程木地板。',
    states: ['NSW', 'VIC', 'QLD', 'SA'],
    verified: true,
    verifiedNote: 'Forest Stewardship Council certified',
    googleRating: 4.6,
    googleReviews: 185,
    website: 'hurfordhardwood.com.au',
    specialties: ['Australian Hardwood', 'Solid Timber', 'Spotted Gum', 'Blackbutt', 'FSC Certified'],
    specialtiesZh: ['澳洲硬木', '实木地板', 'Spotted Gum', 'Blackbutt', 'FSC 认证'],
    featured: false,
    reliabilityScore: 85,
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

  // ── TILES & STONE ──
  {
    id: 'beaumont-tiles',
    name: 'Beaumont Tiles',
    category: 'tiles',
    origin: 'multi',
    description: 'Australia\'s largest tile retailer with 125+ showrooms. Comprehensive range of floor tiles, wall tiles, and stone from global suppliers.',
    descriptionZh: '澳洲最大的瓷砖零售商，拥有 125 家以上展厅。来自全球供应商的地砖、墙砖和石材一应俱全。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'Listed company, 50+ year operating history',
    googleRating: 4.3,
    googleReviews: 8500,
    website: 'beaumont-tiles.com.au',
    phone: '1300 BEAUMONT',
    specialties: ['Floor Tiles', 'Wall Tiles', 'Stone', 'Porcelain', 'Mosaic'],
    specialtiesZh: ['地砖', '墙砖', '石材', '瓷砖', '马赛克'],
    featured: true,
    reliabilityScore: 91,
  },
  {
    id: 'tile-cloud',
    name: 'Tile Cloud',
    category: 'tiles',
    origin: 'multi',
    description: 'Online tile retailer with curated collections from Europe and Asia. Competitive pricing with sample ordering and delivery Australia-wide.',
    descriptionZh: '在线瓷砖零售商，精选欧洲和亚洲系列产品。价格具有竞争力，提供样品订购和全澳配送。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'Australian Business Reg verified, strong Google reviews',
    googleRating: 4.7,
    googleReviews: 2200,
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

  // ── PAINT ──
  {
    id: 'dulux',
    name: 'Dulux Australia',
    category: 'paint',
    origin: 'local',
    description: 'Australia\'s most trusted paint brand. Interior and exterior paints, primers, and coatings with industry-leading technical support and colour matching.',
    descriptionZh: '澳洲最受信赖的油漆品牌。室内外涂料、底漆，提供行业领先的技术支持和配色服务。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'Akzo Nobel subsidiary, GECA certified products available',
    googleRating: 4.4,
    googleReviews: 3200,
    website: 'dulux.com.au',
    phone: '13 25 25',
    specialties: ['Interior Paint', 'Exterior Paint', 'Roof Paint', 'Colour Matching', 'Low VOC'],
    specialtiesZh: ['室内涂料', '室外涂料', '屋顶漆', '配色', '低 VOC'],
    featured: true,
    reliabilityScore: 95,
  },
  {
    id: 'taubmans',
    name: 'Taubmans',
    category: 'paint',
    origin: 'local',
    description: 'Premium Australian paint brand known for durability and colour range. Popular with KDR builders for exterior weatherboard and render coatings.',
    descriptionZh: '澳洲优质油漆品牌，以耐久性和色彩范围著称，深受 KDR 建筑商喜爱，特别适用于外墙板和粉刷涂层。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'PPG Industries brand, Australian standards compliant',
    googleRating: 4.3,
    googleReviews: 1500,
    website: 'taubmans.com.au',
    specialties: ['Weatherboard Coating', 'Render Paint', 'Ceiling Paint', 'Colour Palette'],
    specialtiesZh: ['外墙板涂料', '粉刷涂料', '天花板漆', '色彩系列'],
    featured: false,
    reliabilityScore: 88,
  },

  // ── KITCHEN & JOINERY ──
  {
    id: 'ikea-kitchens',
    name: 'IKEA Kitchen Systems',
    category: 'kitchen',
    origin: 'multi',
    description: 'IKEA\'s SEKTION kitchen system is popular with KDR owner-builders for its modularity and value. Compatible with many third-party benchtop and door suppliers.',
    descriptionZh: 'IKEA 的 SEKTION 厨房系统因其模块化和性价比深受 KDR 自建业主欢迎，与许多第三方台面和橱柜门供应商兼容。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT'],
    verified: true,
    verifiedNote: 'Listed global company, established Australian stores',
    googleRating: 4.0,
    googleReviews: 14000,
    website: 'ikea.com/au',
    specialties: ['Modular Cabinets', 'Flat-Pack', 'Value-Priced', 'DIY Friendly'],
    specialtiesZh: ['模块化橱柜', '平板包装', '经济实惠', 'DIY 友好'],
    featured: false,
    reliabilityScore: 80,
  },
  {
    id: 'kinsman-kitchens',
    name: 'Kinsman Kitchens',
    category: 'kitchen',
    origin: 'local',
    description: 'Australian kitchen designer and manufacturer with nationwide showrooms. Custom and semi-custom kitchens with 10-year warranty.',
    descriptionZh: '澳洲厨房设计和制造商，拥有全国展厅。定制和半定制厨房，提供 10 年质保。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT'],
    verified: true,
    verifiedNote: 'HIA member, 10-year structural warranty',
    googleRating: 4.2,
    googleReviews: 920,
    website: 'kinsman.com.au',
    specialties: ['Custom Kitchen', 'Wardrobe', '10-Year Warranty', 'In-Home Design'],
    specialtiesZh: ['定制厨房', '衣柜', '10 年质保', '上门设计'],
    featured: true,
    reliabilityScore: 84,
  },

  // ── PLUMBING ──
  {
    id: 'caroma',
    name: 'Caroma',
    category: 'plumbing',
    origin: 'local',
    description: 'Australia\'s premier plumbing products manufacturer. Toilets, basins, tapware, and showers designed for Australian conditions with WELS rated products.',
    descriptionZh: '澳洲顶级卫浴产品制造商。马桶、面盆、水龙头和淋浴设备均针对澳洲条件设计，获 WELS 评级认证。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'WELS certified, WATERMARK licensed products',
    googleRating: 4.5,
    googleReviews: 2800,
    website: 'caroma.com.au',
    phone: '1300 227 662',
    specialties: ['Toilets', 'Basins', 'Tapware', 'Showers', 'WELS Rated', 'WaterMark'],
    specialtiesZh: ['马桶', '面盆', '水龙头', '淋浴', 'WELS 评级', 'WaterMark 认证'],
    featured: true,
    reliabilityScore: 93,
  },
  {
    id: 'reece-plumbing',
    name: 'Reece Plumbing',
    category: 'plumbing',
    origin: 'local',
    description: 'Australia\'s leading plumbing merchant with 600+ branches. One-stop shop for all KDR plumbing supplies including premium fixtures from leading brands.',
    descriptionZh: '澳洲领先的管道经销商，拥有 600 家以上分店。KDR 项目所有管道供应的一站式采购，包括知名品牌的优质配件。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'ASX listed (REH), 100+ year operating history',
    googleRating: 4.3,
    googleReviews: 5600,
    website: 'reece.com.au',
    phone: '1300 700 329',
    specialties: ['Full Range Supply', 'Trade Accounts', 'Premium Fixtures', 'Delivery'],
    specialtiesZh: ['全品类供货', '贸易账户', '优质配件', '配送服务'],
    featured: false,
    reliabilityScore: 91,
  },
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

  // ── ROOFING ──
  {
    id: 'colorbond',
    name: 'COLORBOND Steel Roofing',
    category: 'roofing',
    origin: 'local',
    description: 'BlueScope Steel\'s COLORBOND is the standard for Australian steel roofing. Available in 22 colours with Bush Fire Attack Level ratings and 30-year warranty.',
    descriptionZh: 'BlueScope Steel 的 COLORBOND 是澳洲钢制屋顶的行业标准。提供 22 种颜色，具有丛林火灾袭击等级评定和 30 年质保。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'BlueScope Steel subsidiary, BAL-FZ rated available',
    googleRating: 4.6,
    googleReviews: 1900,
    website: 'colorbond.com',
    specialties: ['Steel Roofing', '22 Colours', 'BAL Rated', '30-Year Warranty', 'Rainwater Compatible'],
    specialtiesZh: ['钢制屋顶', '22 种颜色', 'BAL 评级', '30 年质保', '雨水收集兼容'],
    featured: true,
    reliabilityScore: 96,
  },
  {
    id: 'monier-rooftiles',
    name: 'Monier Roof Tiles',
    category: 'roofing',
    origin: 'local',
    description: 'Australia\'s leading concrete and terracotta roof tile manufacturer. Wide range of styles, colours, and profiles for residential construction.',
    descriptionZh: '澳洲领先的混凝土和红陶屋顶瓦制造商。提供多种风格、颜色和型材，适用于住宅建筑。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'CSR subsidiary, Australian manufacturing',
    googleRating: 4.2,
    googleReviews: 430,
    website: 'monier.com.au',
    specialties: ['Concrete Tiles', 'Terracotta', 'Flat Profiles', 'Heritage Styles'],
    specialtiesZh: ['混凝土瓦', '红陶瓦', '平面型材', '遗产风格'],
    featured: false,
    reliabilityScore: 87,
  },

  // ── INSULATION ──
  {
    id: 'knauf-insulation',
    name: 'Knauf Insulation',
    category: 'insulation',
    origin: 'multi',
    description: 'Global insulation manufacturer with Australian operations. Glasswool and Earthwool products for wall, ceiling, and underfloor insulation.',
    descriptionZh: '全球隔热材料制造商，在澳洲设有工厂。提供玻璃棉和环保棉产品，适用于墙体、天花板和地板隔热。',
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'],
    verified: true,
    verifiedNote: 'CodeMark certified, Australian standards compliant',
    googleRating: 4.3,
    googleReviews: 680,
    website: 'knaufinsulation.com.au',
    specialties: ['Glasswool', 'Earthwool', 'Acoustic', 'Thermal', 'NCC Compliant'],
    specialtiesZh: ['玻璃棉', '环保棉', '隔音', '隔热', '符合 NCC'],
    featured: false,
    reliabilityScore: 86,
  },

  // ── LANDSCAPING ──
  {
    id: 'aus-native-landscapes',
    name: 'AusNative Landscaping',
    category: 'landscaping',
    origin: 'local',
    description: 'KDR-specialist landscaping company. Driveways, retaining walls, turf, irrigation, and native plantings for new residential builds.',
    descriptionZh: 'KDR 专业景观公司，提供车道、挡土墙、草坪、灌溉和本地植物种植服务，专注于新住宅建筑。',
    states: ['NSW', 'VIC'],
    verified: true,
    verifiedNote: 'AIILM member, landscape contractor licence',
    googleRating: 4.8,
    googleReviews: 210,
    website: 'ausnativelandscapes.com.au',
    email: 'info@ausnativelandscapes.com.au',
    specialties: ['Driveways', 'Retaining Walls', 'Turf', 'Native Plants', 'Irrigation'],
    specialtiesZh: ['车道', '挡土墙', '草坪', '本地植物', '灌溉系统'],
    featured: false,
    reliabilityScore: 83,
  },
]

// ── Ranking algorithm ──
// Verified first, then composite score of: Google rating (40%) + reliabilityScore (40%) + log(reviews) (20%)
export function rankSuppliers(suppliers: Supplier[]): Supplier[] {
  return [...suppliers].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1
    const scoreA = (a.googleRating ?? 3) * 40 + a.reliabilityScore * 0.4 + Math.log1p(a.googleReviews ?? 0) * 5
    const scoreB = (b.googleRating ?? 3) * 40 + b.reliabilityScore * 0.4 + Math.log1p(b.googleReviews ?? 0) * 5
    return scoreB - scoreA
  })
}
