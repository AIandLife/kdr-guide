export type ArticleCategory =
  | 'planning'
  | 'finance'
  | 'construction'
  | 'zoning'
  | 'stories'
  | 'materials'
  | 'granny-flat'
  | 'renovation'

export interface Article {
  slug: string
  title: string
  titleZh: string
  excerpt: string
  excerptZh: string
  category: ArticleCategory
  author: string
  authorRole: string
  authorRoleZh: string
  date: string
  readMinutes: number
  content: string
  contentZh: string
  tags: string[]
  tagsZh: string[]
}

export const CATEGORY_LABELS: Record<ArticleCategory, { en: string; zh: string; color: string }> = {
  planning:    { en: 'Planning & Approvals', zh: '规划与审批',  color: 'blue'   },
  finance:     { en: 'Finance',              zh: '贷款与费用',  color: 'green'  },
  construction:{ en: 'Construction',         zh: '建筑施工',    color: 'orange' },
  zoning:      { en: 'Land & Zoning',        zh: '土地与分区',  color: 'purple' },
  stories:     { en: 'Real Stories',         zh: '真实案例',    color: 'pink'   },
  materials:   { en: 'Materials & Products', zh: '建材与产品',  color: 'cyan'   },
  'granny-flat':{ en: 'Granny Flat',         zh: 'Granny Flat', color: 'teal'   },
  renovation:  { en: 'Renovation',           zh: '翻新改造',    color: 'amber'  },
}

export const ARTICLES: Article[] = [
  {
    slug: 'da-vs-cdc-approval',
    title: 'DA vs CDC: Which Approval Path Is Right for Your KDR?',
    titleZh: 'DA 还是 CDC：哪种审批方式适合你的推倒重建？',
    excerpt: 'Development Applications and Complying Development Certificates both have a role in KDR projects — but they come with very different timelines, costs, and flexibility.',
    excerptZh: '开发申请（DA）和合规开发证书（CDC）都是推倒重建的常见审批路径，但时间、费用和灵活性差别很大。',
    category: 'planning',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-03-18',
    readMinutes: 8,
    tags: ['DA', 'CDC', 'Approval', 'Council', 'Planning'],
    tagsZh: ['DA申请', 'CDC', '审批', 'Council', '规划'],
    content: `
<p>When you're planning a knockdown rebuild, one of the first questions your town planner will ask is: "Are you going DA or CDC?" The answer will shape your entire project timeline, your design flexibility, and your budget. Here's what you need to know.</p>

<h2>What is a DA (Development Application)?</h2>
<p>A DA is a formal application to your local council requesting approval to carry out development. It involves a full assessment of your proposed design against the local planning instruments — the Local Environmental Plan (LEP) and Development Control Plan (DCP).</p>

<p><strong>Key characteristics of DA:</strong></p>
<ul>
  <li>Assessed by your local council</li>
  <li>Can accommodate design variations and requests for flexibility</li>
  <li>Public notification period required (usually 14–28 days)</li>
  <li>Typical timeline: <strong>3–12 months</strong> depending on council workload and complexity</li>
  <li>Suitable for heritage properties, flood-affected land, or non-standard designs</li>
</ul>

<h2>What is a CDC (Complying Development Certificate)?</h2>
<p>CDC is a streamlined approval pathway for developments that comply with a set of pre-determined standards. If your project meets all the rules, a private certifier can issue a CDC — no council involvement required.</p>

<p><strong>Key characteristics of CDC:</strong></p>
<ul>
  <li>Assessed by a private certifier (accredited)</li>
  <li>No public notification required</li>
  <li>Typical timeline: <strong>4–8 weeks</strong></li>
  <li>Faster, cheaper, and more predictable</li>
  <li>Design must strictly comply — no variations allowed</li>
</ul>

<h2>How to choose?</h2>
<p>CDC works well when your block is straightforward: no heritage, no flood zone, compliant setbacks, standard height and floor space ratio. DA is necessary when you want a design that pushes the boundaries, or when your property has overlays that exclude it from CDC.</p>

<p>Before committing to either path, have a <strong>pre-lodgement meeting</strong> with your council or a town planner. This 30-minute conversation can save you months of rework.</p>

<h2>Common Myths</h2>
<p><strong>Myth: CDC is always better.</strong> Not true. CDC can be more limiting if your design needs to flex, or if your block is oddly shaped.</p>
<p><strong>Myth: DA always takes years.</strong> Many councils now have fast-track pathways for straightforward residential DAs, with decisions in 8–12 weeks.</p>

<h2>Bottom Line</h2>
<p>Run a feasibility check on your suburb using our AI tool — it will tell you whether CDC is likely available for your block, and estimate DA timelines based on your council's current workload.</p>
    `,
    contentZh: `
<p>规划推倒重建时，你的 Town Planner 会问的第一个问题往往是："你打算走 DA 还是 CDC？" 这个选择将直接影响整个项目的时间线、设计灵活度和预算。以下是你需要了解的内容。</p>

<h2>什么是 DA（开发申请）？</h2>
<p>DA 是向当地 Council 提交的正式审批申请，要求对你的建筑方案进行全面评估，依据本地规划文件——地方环境规划（LEP）和开发控制规划（DCP）。</p>

<p><strong>DA 的主要特点：</strong></p>
<ul>
  <li>由当地 Council 审批</li>
  <li>可申请设计变更和豁免</li>
  <li>需要公示期（通常 14–28 天）</li>
  <li>典型时间线：<strong>3–12 个月</strong>（视 Council 工作量和复杂程度而定）</li>
  <li>适用于遗产保护地块、洪水区或非标准设计</li>
</ul>

<h2>什么是 CDC（合规开发证书）？</h2>
<p>CDC 是针对符合预定标准的开发项目的快速审批路径。如果你的方案满足所有规定，私人认证人员可直接签发 CDC，无需经过 Council。</p>

<p><strong>CDC 的主要特点：</strong></p>
<ul>
  <li>由私人认证人员（accredited certifier）审批</li>
  <li>无需公示</li>
  <li>典型时间线：<strong>4–8 周</strong></li>
  <li>更快、更便宜、更可预期</li>
  <li>设计必须严格合规，不允许任何变更</li>
</ul>

<h2>如何选择？</h2>
<p>CDC 适合地块条件简单的情况：无遗产保护、无洪水区、退界符合要求、层高和容积率均达标。如果你的设计需要突破规定，或地块有特殊条款将其排除在 CDC 之外，则需要走 DA。</p>

<p>在正式选择之前，建议先与 Council 或 Town Planner 进行一次<strong>预申请会议</strong>（Pre-lodgement meeting）。这 30 分钟的沟通可以帮你节省数月的返工时间。</p>

<h2>常见误解</h2>
<p><strong>误解：CDC 总是更好。</strong> 并非如此。如果你的设计需要灵活性，或地块形状不规则，CDC 可能更受限。</p>
<p><strong>误解：DA 一定要等好几年。</strong> 许多 Council 现在对简单住宅 DA 开通了快速审批通道，8–12 周就能出结果。</p>

<h2>结论</h2>
<p>使用我们的 AI 工具查询你的区域——它会告诉你 CDC 是否适用于你的地块，并根据你所在 Council 的当前工作量估算 DA 时间线。</p>
    `,
  },
  {
    slug: 'kdr-cost-guide-2026',
    title: 'How Much Does a Knockdown Rebuild Cost in Australia? (2026)',
    titleZh: '澳洲推倒重建到底要花多少钱？（2026 年完整指南）',
    excerpt: 'From demolition to handover, a realistic breakdown of KDR costs across Sydney, Melbourne, Brisbane, and Perth — plus the variables that move the number most.',
    excerptZh: '从拆除到交房，全面拆解悉尼、墨尔本、布里斯班和珀斯的推倒重建费用，以及最影响价格的关键因素。',
    category: 'finance',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-03-10',
    readMinutes: 10,
    tags: ['Cost', 'Budget', 'Demolition', 'Build Cost', 'Finance'],
    tagsZh: ['费用', '预算', '拆除', '建筑成本', '贷款'],
    content: `
<p>The most common question from homeowners considering a KDR is: "What will it actually cost?" The honest answer is: it depends. But here's a realistic breakdown to help you budget.</p>

<h2>The Major Cost Components</h2>

<h3>1. Demolition ($15,000–$35,000)</h3>
<p>Demolition costs vary by house size, materials (asbestos adds significant cost), and access. A standard 3-bedroom brick veneer house in Sydney typically costs $18,000–$25,000 to demolish including skip bins and site clean-up. Asbestos removal can add $8,000–$20,000 depending on extent.</p>

<h3>2. Construction ($250,000–$700,000+)</h3>
<p>The build cost is the largest variable. As a rough guide:</p>
<ul>
  <li><strong>Budget project home:</strong> $1,800–$2,200/m²</li>
  <li><strong>Mid-range custom home:</strong> $2,500–$3,500/m²</li>
  <li><strong>High-end custom:</strong> $4,000–$6,000+/m²</li>
</ul>
<p>A 250m² home at mid-range would cost $625,000–$875,000 to build.</p>

<h3>3. Professional Fees ($20,000–$60,000)</h3>
<p>These include architect or draftsperson ($8,000–$25,000), town planner ($5,000–$15,000), structural engineer ($3,000–$8,000), and private certifier ($3,000–$6,000).</p>

<h3>4. Council and Government Fees ($5,000–$20,000)</h3>
<p>DA lodgement fees vary by council and project value. Expect $3,000–$12,000. Contributions levies (Section 7.11 in NSW) can add significantly in growth corridors.</p>

<h3>5. Landscaping and External Works ($15,000–$50,000)</h3>
<p>Often underestimated. Driveway, fencing, lawn, garden, letterbox, clothesline — the list adds up quickly.</p>

<h2>State-by-State Build Cost Summary</h2>
<p>All figures are per m² of floor area and reflect 2026 market rates. Budget = project/volume builder; Mid-range = custom or semi-custom; Premium = architect-designed, high-specification finish.</p>
<table>
  <thead>
    <tr>
      <th>State</th>
      <th>Demolition</th>
      <th>Budget (per m²)</th>
      <th>Mid-range (per m²)</th>
      <th>Premium (per m²)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>NSW (Sydney)</td><td>$18,000–$30,000</td><td>$1,900–$2,400</td><td>$2,800–$3,800</td><td>$4,500–$7,000+</td></tr>
    <tr><td>VIC (Melbourne)</td><td>$15,000–$25,000</td><td>$1,800–$2,300</td><td>$2,600–$3,600</td><td>$4,200–$6,500+</td></tr>
    <tr><td>QLD (Brisbane)</td><td>$12,000–$22,000</td><td>$1,700–$2,200</td><td>$2,400–$3,200</td><td>$4,000–$6,000+</td></tr>
    <tr><td>WA (Perth)</td><td>$12,000–$20,000</td><td>$1,600–$2,100</td><td>$2,200–$3,000</td><td>$3,800–$5,500+</td></tr>
  </tbody>
</table>
<p><em>Note: These are indicative ranges only. Final costs depend on design complexity, site conditions, materials selected, and current builder availability. Always obtain 2–3 fixed-price tenders before committing.</em></p>

<h2>The Biggest Cost Variables</h2>
<p>Three things move the number most: <strong>size of the new home</strong>, <strong>level of finish</strong>, and <strong>site conditions</strong> (slope, soil type, services). Always get a soil test done early — reactive clay or rock can add $20,000–$50,000 to your slab cost.</p>

<h2>Getting an Accurate Quote</h2>
<p>The only way to get a firm number is to have your design completed, then get 2–3 fixed-price tenders from builders. Never commit to a builder based on a preliminary estimate alone.</p>
    `,
    contentZh: `
<p>考虑推倒重建的业主最常问的问题是："到底要花多少钱？"诚实的回答是：取决于很多因素。以下是一个实际的费用拆解，帮助你制定预算。</p>

<h2>主要费用构成</h2>

<h3>1. 拆除费用（$15,000–$35,000）</h3>
<p>拆除费用因房屋大小、建筑材料（含石棉会大幅增加费用）和出入条件而有所不同。悉尼一栋标准三卧室砖墙住宅的拆除费用（含垃圾桶和场地清理）通常为 $18,000–$25,000。石棉清除视范围可额外增加 $8,000–$20,000。</p>

<h3>2. 建筑费用（$250,000–$700,000+）</h3>
<p>建筑费用是最大的变量。粗略参考：</p>
<ul>
  <li><strong>经济型项目房：</strong>$1,800–$2,200/平方米</li>
  <li><strong>中档定制住宅：</strong>$2,500–$3,500/平方米</li>
  <li><strong>高端定制：</strong>$4,000–$6,000+/平方米</li>
</ul>
<p>一套 250 平方米的中档住宅建筑费用约为 $625,000–$875,000。</p>

<h3>3. 专业服务费（$20,000–$60,000）</h3>
<p>包括建筑师或绘图员（$8,000–$25,000）、Town Planner（$5,000–$15,000）、结构工程师（$3,000–$8,000）和私人认证人员（$3,000–$6,000）。</p>

<h3>4. Council 和政府费用（$5,000–$20,000）</h3>
<p>DA 申请费因 Council 和项目价值而异，通常为 $3,000–$12,000。在城市增长走廊地区，开发贡献金（NSW Section 7.11）可能额外增加相当大的金额。</p>

<h3>5. 景观和外部工程（$15,000–$50,000）</h3>
<p>这部分常被低估。车道、围栏、草坪、花园、信箱、晾衣架——加起来相当可观。</p>

<h2>各州建筑费用参考（2026）</h2>
<p>以下为每平方米建筑面积的参考价格。经济型 = 量产/项目建筑商；中档 = 定制或半定制；高端 = 建筑师设计、高规格装修。</p>
<table>
  <thead>
    <tr>
      <th>州</th>
      <th>拆除费用</th>
      <th>经济型（/㎡）</th>
      <th>中档（/㎡）</th>
      <th>高端（/㎡）</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>NSW（悉尼）</td><td>$18,000–$30,000</td><td>$1,900–$2,400</td><td>$2,800–$3,800</td><td>$4,500–$7,000+</td></tr>
    <tr><td>VIC（墨尔本）</td><td>$15,000–$25,000</td><td>$1,800–$2,300</td><td>$2,600–$3,600</td><td>$4,200–$6,500+</td></tr>
    <tr><td>QLD（布里斯班）</td><td>$12,000–$22,000</td><td>$1,700–$2,200</td><td>$2,400–$3,200</td><td>$4,000–$6,000+</td></tr>
    <tr><td>WA（珀斯）</td><td>$12,000–$20,000</td><td>$1,600–$2,100</td><td>$2,200–$3,000</td><td>$3,800–$5,500+</td></tr>
  </tbody>
</table>
<p><em>注意：以上为参考区间，最终费用取决于设计复杂度、场地条件、选材和当前建筑商档期。请务必在签约前获取 2–3 家固定价格报价。</em></p>

<h2>影响价格最大的因素</h2>
<p>影响总价最大的三个因素：<strong>新房面积</strong>、<strong>装修等级</strong>和<strong>场地条件</strong>（坡度、土壤类型、管道服务）。建议尽早进行土壤测试——活性黏土或岩石地基可能为你的地基额外增加 $20,000–$50,000。</p>

<h2>获取准确报价</h2>
<p>获得准确数字的唯一方法是完成设计方案，然后从 2–3 家建筑商处获取固定价格报价。切勿仅凭初步估价就与建筑商签约。</p>
    `,
  },
  {
    slug: 'heritage-overlays-kdr',
    title: 'Heritage Overlays & KDR: What You Need to Know',
    titleZh: '遗产保护条款与推倒重建：你必须了解的内容',
    excerpt: 'A heritage overlay doesn\'t necessarily mean you can\'t knock down and rebuild — but it does mean a more complex process. Here\'s what it affects and how to navigate it.',
    excerptZh: '有遗产保护条款并不一定意味着不能推倒重建——但流程会更复杂。本文解释它的影响以及应对方法。',
    category: 'planning',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-02-24',
    readMinutes: 7,
    tags: ['Heritage', 'Council', 'DA', 'Planning', 'Overlay'],
    tagsZh: ['遗产保护', 'Council', 'DA申请', '规划', '保护条款'],
    content: `
<p>Few words strike more dread into KDR homeowners than "heritage overlay." But the reality is more nuanced than a simple yes-or-no block on development.</p>

<h2>What is a Heritage Overlay?</h2>
<p>A heritage overlay is a planning instrument that identifies areas or properties of cultural, historical, architectural, or social significance. In Australia, heritage can be listed at local, state, or national levels — and each level has different implications for what you can and can't do.</p>

<h2>Types of Heritage Listing</h2>
<p><strong>Local Heritage Item:</strong> Your specific property is listed on the council's heritage register. This gives the most protection and requires a Heritage Impact Statement for any significant works.</p>
<p><strong>Conservation Area (Heritage Precinct):</strong> Your property is within a designated heritage precinct, but not necessarily listed individually. This is more flexible — it requires that new development is "sympathetic" to the streetscape character, not that you preserve everything.</p>
<p><strong>State Heritage Register:</strong> Reserved for the most significant places in Australia. Demolition is essentially impossible unless the property is severely compromised.</p>

<h2>Can You Still KDR on a Heritage Property?</h2>
<p>Often, yes — especially for Conservation Area properties. The key is that your new design needs to respect the streetscape, height, setbacks, and materials that define the area. A modern home can be built behind a restored or replica facade in some councils.</p>

<p>For individually listed heritage items, demolition is much harder. You'll typically need to demonstrate that the building is structurally unsound, poses a safety risk, or has been assessed as being of low heritage significance. A Heritage Impact Assessment from a qualified heritage consultant is essential.</p>

<h2>The Process</h2>
<ol>
  <li>Engage a heritage consultant to conduct a Heritage Impact Statement (HIS)</li>
  <li>Meet with council's heritage planner for a pre-lodgement discussion</li>
  <li>Work with your architect to design in a way that responds to heritage guidelines</li>
  <li>Lodge a DA — CDC is not available for heritage properties</li>
  <li>Allow for a longer assessment period (often 6–12 months)</li>
</ol>

<h2>Red Flags to Investigate</h2>
<p>Run an address check on your council's online mapping tool before purchasing any property. Look for: Heritage Conservation Area overlay, Individual Heritage Item listing, or any "pending" heritage nominations.</p>
    `,
    contentZh: `
<p>"遗产保护条款"这几个字常常让想推倒重建的业主望而却步。但现实情况比简单的"可以/不可以"更为复杂。</p>

<h2>什么是遗产保护条款？</h2>
<p>遗产保护条款是一种规划工具，用于识别具有文化、历史、建筑或社会意义的区域或房产。在澳洲，遗产可以在地方、州或国家层面登记——每个层级对你能做什么有不同的影响。</p>

<h2>遗产登记的类型</h2>
<p><strong>地方遗产项目：</strong>你的具体房产被列入 Council 的遗产名录。这提供了最强的保护，任何重大工程都需要提交遗产影响声明（Heritage Impact Statement）。</p>
<p><strong>保护区（遗产街区）：</strong>你的房产位于指定的遗产街区内，但不一定单独列名。这更为灵活——要求新建筑与街景风格"协调"，而非保留一切。</p>
<p><strong>州遗产名录：</strong>仅保留给澳洲最重要的地方。除非建筑严重受损，否则拆除基本不可能。</p>

<h2>有遗产条款还能推倒重建吗？</h2>
<p>通常可以——尤其是对于保护区内的房产。关键是新设计需要尊重当地的街景特色、高度、退界和建材。某些 Council 允许在修缮或复建的外立面后方建造现代住宅。</p>

<p>对于单独列名的遗产项目，拆除则难得多。通常需要证明建筑结构不安全、存在安全风险，或经评估遗产价值较低。聘请专业遗产顾问出具遗产影响评估（Heritage Impact Assessment）是必不可少的。</p>

<h2>流程</h2>
<ol>
  <li>聘请遗产顾问出具遗产影响声明（HIS）</li>
  <li>与 Council 的遗产规划师进行预申请讨论</li>
  <li>与建筑师合作，按照遗产指南设计</li>
  <li>提交 DA——遗产房产不适用 CDC</li>
  <li>预留更长的审批时间（通常 6–12 个月）</li>
</ol>

<h2>购房前必查</h2>
<p>在购买任何房产前，先在 Council 的在线地图工具上查询地址。注意以下标注：遗产保护区条款、单独遗产项目登记，或任何"待定"的遗产提名。</p>
    `,
  },
  {
    slug: 'construction-loans-kdr',
    title: 'Construction Loans for KDR: How They Work',
    titleZh: '推倒重建建筑贷款全解析',
    excerpt: 'A construction loan is fundamentally different from a normal home loan — and getting the structure wrong can cost you dearly. Here\'s exactly how they work for KDR.',
    excerptZh: '建筑贷款和普通房贷有本质区别——结构设置错误代价很大。本文详解推倒重建中建筑贷款的运作方式。',
    category: 'finance',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-02-12',
    readMinutes: 9,
    tags: ['Finance', 'Construction Loan', 'Mortgage', 'Lender', 'Interest'],
    tagsZh: ['贷款', '建筑贷款', '按揭', '银行', '利息'],
    content: `
<p>One of the most confusing aspects of a knockdown rebuild is financing it. Unlike buying an existing home where you borrow a lump sum, a construction loan is structured as a series of progress payments — and understanding this structure is essential to managing your cash flow.</p>

<h2>How a Construction Loan Works</h2>
<p>Instead of receiving the full loan amount upfront, your lender releases money in stages — called "drawdowns" — that correspond to construction milestones. The typical stages are:</p>
<ol>
  <li><strong>Deposit/Slab:</strong> 5–10% at contract signing and slab pour</li>
  <li><strong>Frame:</strong> After wall and roof frames are erected</li>
  <li><strong>Lock-up:</strong> When the building is weather-tight (windows, doors, roof)</li>
  <li><strong>Fit-out:</strong> After internal work (plasterboard, kitchen, bathrooms)</li>
  <li><strong>Completion:</strong> Final handover and all finishes complete</li>
</ol>
<p>During construction, you only pay interest on the funds drawn down — not the full loan amount. This significantly reduces your interest costs during the build period.</p>

<h2>The KDR Complication: You Still Own the Land</h2>
<p>Unlike buying a house-and-land package, in a KDR you already own the land (or are buying it separately). This means:</p>
<ul>
  <li>You may have an existing mortgage to manage during the build</li>
  <li>Your land value contributes to the LVR (loan-to-value ratio) calculation</li>
  <li>Lenders will need a valuation of the <em>end value</em> of the completed project</li>
</ul>

<h2>What Lenders Look At</h2>
<p>Lenders assess construction loans differently. Key factors:</p>
<ul>
  <li><strong>Fixed-price building contract:</strong> Most lenders require this. Progress payments are tied to contract milestones.</li>
  <li><strong>Licensed builder:</strong> The builder must be licensed and insured</li>
  <li><strong>End-value valuation:</strong> Lender will commission a "as if complete" valuation</li>
  <li><strong>Contingency buffer:</strong> Many lenders require or strongly recommend a 10–15% cost buffer in your budget</li>
</ul>

<h2>Bridging Finance</h2>
<p>If you're living in your home while planning the rebuild, you may need bridging finance to fund the demolition and early construction phase while you're renting elsewhere. This is expensive — typically 1–2% above standard rates — so minimise the bridge period where possible.</p>

<h2>Practical Tips</h2>
<ul>
  <li>Use a mortgage broker who specialises in construction lending — standard brokers often don't know the nuances</li>
  <li>Get your finance pre-approved before signing with a builder</li>
  <li>Factor in the "progress payment gap" — the time between when your builder invoices and when your lender pays them</li>
  <li>Keep a cash buffer of at least $30,000–$50,000 for variations and unexpected costs</li>
</ul>
    `,
    contentZh: `
<p>推倒重建最令人困惑的方面之一就是融资。与购买现房一次性借入一笔资金不同，建筑贷款是以一系列分阶段付款的方式运作的——了解这种结构对于管理现金流至关重要。</p>

<h2>建筑贷款的运作方式</h2>
<p>贷款方不会一次性放款，而是按照建设里程碑分阶段释放资金，称为"提款"。典型阶段如下：</p>
<ol>
  <li><strong>定金/地基：</strong>签合同和浇筑地基时，占总额 5–10%</li>
  <li><strong>框架：</strong>墙体和屋顶框架搭建完成后</li>
  <li><strong>封闭：</strong>建筑达到防水状态（窗户、门、屋顶完成）</li>
  <li><strong>内装：</strong>内部工程完成后（石膏板、厨房、浴室）</li>
  <li><strong>竣工：</strong>最终交房及所有装修完成</li>
</ol>
<p>建设期间，你只需为已提取的资金支付利息，而非全部贷款金额。这大大降低了建设期间的利息支出。</p>

<h2>推倒重建的特殊性：你已拥有土地</h2>
<p>与购买"土地+房屋套餐"不同，推倒重建时你已经拥有土地（或单独购买）。这意味着：</p>
<ul>
  <li>建设期间可能需要同时管理现有按揭</li>
  <li>土地价值将计入 LVR（贷款价值比）计算</li>
  <li>贷款方需要对<em>竣工后</em>的项目价值进行估值</li>
</ul>

<h2>贷款方的审核要点</h2>
<p>贷款方对建筑贷款有不同的评估标准。关键因素：</p>
<ul>
  <li><strong>固定价格建筑合同：</strong>大多数贷款方要求此类合同，分期付款与合同里程碑挂钩</li>
  <li><strong>持牌建筑商：</strong>建筑商必须持有执照并有保险</li>
  <li><strong>竣工后估值：</strong>贷款方将委托进行"假设完工"估值</li>
  <li><strong>应急储备金：</strong>许多贷款方要求或强烈建议预留 10–15% 的费用缓冲</li>
</ul>

<h2>过渡贷款</h2>
<p>如果你在规划重建期间仍住在自己的房子里，可能需要过渡融资（Bridging Finance）来支付拆除和早期建设阶段的费用，同时在外租房。这种贷款成本较高——通常比标准利率高 1–2%——因此尽量缩短过渡期。</p>

<h2>实用建议</h2>
<ul>
  <li>使用专注于建筑贷款的按揭经纪人——普通经纪人往往不了解其中的细节</li>
  <li>在与建筑商签约前先获得贷款预批</li>
  <li>考虑"分期付款差额"——从建筑商开具发票到贷款方付款之间的时间差</li>
  <li>至少保留 $30,000–$50,000 的现金缓冲，用于设计变更和意外费用</li>
</ul>
    `,
  },
  {
    slug: 'buying-kdr-block',
    title: '5 Things to Check Before Buying a Block for KDR',
    titleZh: '购买推倒重建地块前必须核查的 5 件事',
    excerpt: 'Not every property with a tired house is a good KDR candidate. Before you buy, here are five checks that can save you from a very expensive mistake.',
    excerptZh: '并非每块地都适合推倒重建。购房前，这五项检查可以帮你避免一个代价高昂的错误。',
    category: 'zoning',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-01-28',
    readMinutes: 6,
    tags: ['Buying', 'Due Diligence', 'Zoning', 'Planning', 'Investment'],
    tagsZh: ['购房', '尽职调查', '分区', '规划', '投资'],
    content: `
<p>Spotting a rundown house in a good suburb and thinking "KDR opportunity" is exciting — but before you sign a contract, here are five checks you should never skip.</p>

<h2>1. Minimum Lot Size</h2>
<p>Every council has a minimum lot size for a dwelling. If your block is too small, you may not be able to build. More importantly, check the <em>future subdivision potential</em> — if the block is large enough, you may be able to do a dual occupancy or Torrens title subdivision, which dramatically changes the economics.</p>
<p><strong>What to do:</strong> Look up the LEP zoning on the council's online mapping tool. The minimum lot size is specified in the LEP.</p>

<h2>2. Heritage and Conservation Area</h2>
<p>As covered in our heritage article, these overlays add complexity and cost. Always check the council's heritage map before buying. Some agents won't volunteer this information unless asked.</p>
<p><strong>What to do:</strong> Enter the address in the council's planning portal and look for any heritage flags. Also check for Aboriginal Cultural Heritage overlays in some states.</p>

<h2>3. Flood and Bushfire Overlays</h2>
<p>These affect what you can build, how high your floor must be, what building materials are required, and whether insurance is affordable after completion. Flood-affected properties often require the finished floor level to be 500mm above the 1-in-100-year flood level.</p>
<p><strong>What to do:</strong> Check council flood maps and the NSW Flood Check, VIC Land Vic, or equivalent state tools. For bushfire, check the Bushfire Attack Level (BAL) rating.</p>

<h2>4. Easements and Covenants</h2>
<p>Easements — for power lines, drainage, or sewer — run across many blocks. Building over an easement is generally prohibited without special permission. Similarly, restrictive covenants on the title can specify things like minimum house size, materials, or even that only a single-storey home can be built.</p>
<p><strong>What to do:</strong> Read the title documents carefully and have a property solicitor review them. This is non-negotiable.</p>

<h2>5. Contamination and Asbestos</h2>
<p>Older properties (pre-1987 in Australia) may contain asbestos in fibro sheeting, roofing, or floor tiles. Contaminated land — particularly near former industrial sites, petrol stations, or dry cleaners — adds significant remediation costs. Some sites may be uneconomic to develop without remediation running into hundreds of thousands of dollars.</p>
<p><strong>What to do:</strong> For older homes, budget for an asbestos assessment. For any property near former industrial use, request a Phase 1 Environmental Site Assessment before proceeding.</p>

<h2>The Bottom Line</h2>
<p>Run each of these checks before going unconditional on your contract. The cost of due diligence ($500–$2,000 across all checks) is trivial compared to the cost of discovering a problem post-settlement.</p>
    `,
    contentZh: `
<p>在好区看到一栋破旧的老房子，立刻想到"推倒重建机会"——这种兴奋是可以理解的。但在签合同之前，以下五项检查你绝对不能省略。</p>

<h2>1. 最小地块面积</h2>
<p>每个 Council 对住宅都有最小地块面积要求。如果你的地块太小，可能无法建造。更重要的是，要检查<em>未来分割潜力</em>——如果地块足够大，你可能可以进行双住宅开发或 Torrens 地权分割，这会大幅改变整个项目的经济效益。</p>
<p><strong>操作方法：</strong>在 Council 的在线地图工具中查询 LEP 分区，最小地块面积会在 LEP 中有明确规定。</p>

<h2>2. 遗产保护和保护区条款</h2>
<p>如我们遗产文章中所述，这些条款会增加复杂性和成本。购房前务必查看 Council 的遗产地图。部分中介不会主动告知这些信息，除非你主动询问。</p>
<p><strong>操作方法：</strong>在 Council 的规划门户中输入地址，查看是否有遗产标注。某些州还需检查原住民文化遗产条款。</p>

<h2>3. 洪水和丛林火灾条款</h2>
<p>这些条款会影响你能建什么、楼板高度要求、所需建材，以及竣工后保险是否负担得起。受洪水影响的房产通常要求完工楼板高度比百年一遇洪水位高 500 毫米。</p>
<p><strong>操作方法：</strong>查阅 Council 洪水图以及 NSW Flood Check、VIC Land Vic 或同等州级工具。对于丛林火灾，检查丛林火灾袭击等级（BAL）评级。</p>

<h2>4. 地役权和限制性契约</h2>
<p>地役权——用于电线、排水或下水道——存在于许多地块上。未经特别许可，通常不得在地役权上建造。同样，地契上的限制性契约可能规定最小房屋面积、建材要求，甚至只能建造单层住宅。</p>
<p><strong>操作方法：</strong>仔细阅读地契文件，并请房产律师进行审查。这一点不容忽视。</p>

<h2>5. 污染和石棉</h2>
<p>1987 年前在澳洲建造的老房子，其纤维板、屋顶或地砖中可能含有石棉。受污染的土地——特别是曾经的工业用地、加油站或干洗店附近——会增加大量修复费用。某些地块在修复费用高达数十万甚至数百万的情况下，开发可能完全不经济。</p>
<p><strong>操作方法：</strong>对于老旧房屋，预算石棉评估费用。对于任何前工业用地附近的房产，在继续推进前要求进行第一阶段环境场地评估。</p>

<h2>结论</h2>
<p>在合同无条件生效前完成以上每项检查。尽职调查的费用（所有检查合计 $500–$2,000）与在交割后发现问题的代价相比微乎其微。</p>
    `,
  },
  {
    slug: 'strathfield-kdr-story',
    title: 'Our Strathfield KDR: 18 Months, $1.4M, and Everything We Learned',
    titleZh: 'Strathfield 推倒重建亲历：18 个月、140 万、我们学到的一切',
    excerpt: 'A first-hand account of a KDR project in inner-west Sydney — from the first council inquiry to moving-in day. The good, the bad, and the expensive surprises.',
    excerptZh: '悉尼内西区亲历推倒重建——从第一次咨询 Council 到搬入新家。好的、坏的，以及那些昂贵的意外。',
    category: 'stories',
    author: 'Sarah & Tom Wu',
    authorRole: 'KDR Homeowners',
    authorRoleZh: '推倒重建业主',
    date: '2026-01-15',
    readMinutes: 12,
    tags: ['Real Story', 'Sydney', 'NSW', 'Strathfield', 'Case Study'],
    tagsZh: ['真实案例', '悉尼', 'NSW', 'Strathfield', '案例研究'],
    content: `
<p>When we bought our 1960s fibro house in Strathfield in 2022, we knew it was in bad shape. What we didn't know was how much we'd learn — the hard way — over the next 18 months.</p>

<h2>The Decision to KDR</h2>
<p>The house had been a rental for 20 years. The fibro walls tested positive for asbestos. The roof leaked. The wiring was original. We got renovation quotes that came in at $350,000–$400,000 — and we'd still have a 65-year-old bones and a compromised layout. A KDR started making sense.</p>

<h2>Month 1–3: Planning and Due Diligence</h2>
<p>We hired a town planner for a pre-DA feasibility. Key findings: our 600m² block was not heritage listed (though we were in a street of heritage homes — nerve-wracking), CDC was available due to compliant setbacks, and our R2 zoning allowed a single dwelling of up to 8.5m height.</p>
<p>We chose to go DA anyway because we wanted a second storey that pushed the height slightly. Cost of town planner: $12,000 for the whole engagement.</p>

<h2>Month 3–6: Design</h2>
<p>We used an architect instead of a volume builder's standard plan. It added cost ($28,000 in architectural fees) but gave us a design that maximised our north-facing backyard and created the indoor-outdoor flow we wanted.</p>
<p><strong>Lesson:</strong> Don't compromise on design. You live with it for 20+ years.</p>

<h2>Month 6: The Asbestos Surprise</h2>
<p>We'd budgeted $22,000 for demolition. The asbestos assessment came back with "Class A" contaminated materials throughout — not just the fibro but the floor tiles and roof sheeting too. Final demolition cost: $41,000. Surprise: $19,000. Have contingency.</p>

<h2>Month 7–12: DA Process</h2>
<p>Our DA took 11 months — longer than expected because one neighbouring property objected. The objection was about overlooking and privacy, which required design modifications to our upper floor windows. Lesson: neighbour relations matter. We wished we'd introduced ourselves and explained the project before lodgement.</p>

<h2>Month 12–18: Construction</h2>
<p>Build took 8 months. We had a fixed-price contract for $870,000. Final cost after variations: $930,000. Variations included: upgraded kitchen benchtops ($8,000), electrical upgrades we hadn't specified ($12,000), landscaping not in original scope ($25,000), and a structural issue with the slab due to unexpected underground stormwater pipes ($15,000).</p>

<h2>Final Numbers</h2>
<ul>
  <li>Demolition: $41,000</li>
  <li>Town planner + architect + certifier: $51,000</li>
  <li>DA fees and contributions: $22,000</li>
  <li>Construction: $930,000</li>
  <li>Landscaping and externals: $48,000</li>
  <li>Finance costs (bridging loan, 11 months): $68,000</li>
  <li>Temporary accommodation: $42,000</li>
  <li><strong>Total: approx. $1.4M (excluding land cost)</strong></li>
</ul>

<h2>Was It Worth It?</h2>
<p>Absolutely. We now have a 4-bedroom, 3-bathroom home with a stunning kitchen, north-facing entertaining area, and a value that reflects what we put into it. Current comparable sales in Strathfield suggest our home is worth $3.8M–$4.1M. We paid $2.1M for the land. All in, we're very happy with the outcome — even if the journey had its stressful moments.</p>

<p><strong>Our biggest advice:</strong> Build a contingency of 15–20% into your budget, start neighbour conversations early, and don't underestimate demolition costs if your home is pre-1990.</p>
    `,
    contentZh: `
<p>2022 年，我们在 Strathfield 买下一栋 1960 年代的纤维板老房子时，就知道它状况很差。但我们没有预料到，在接下来的 18 个月里，我们会用最艰难的方式学到这么多东西。</p>

<h2>决定推倒重建</h2>
<p>这栋房子出租了 20 年。纤维板墙壁检测出石棉阳性。屋顶漏水。电路是原装的。翻新报价在 $350,000–$400,000 之间——而且翻新后仍然是一栋有着 65 年历史的老骨架，格局也令人不满意。推倒重建开始显得有意义。</p>

<h2>第 1–3 个月：规划与尽职调查</h2>
<p>我们聘请了一位 Town Planner 进行 DA 前可行性评估。主要发现：我们 600 平方米的地块没有遗产保护（尽管我们所在的街道有遗产建筑——非常紧张）；由于退界符合要求，CDC 可用；R2 分区允许建造单户住宅，最高可达 8.5 米。</p>
<p>尽管如此，我们还是选择了走 DA，因为我们想要一个略微超过高度的二层结构。Town Planner 费用：整个项目 $12,000。</p>

<h2>第 3–6 个月：设计</h2>
<p>我们聘请了建筑师，而不是采用量产建筑商的标准方案。这增加了费用（建筑设计费 $28,000），但为我们提供了一个充分利用朝北后院、实现室内外流动空间的设计。</p>
<p><strong>经验：</strong>不要在设计上妥协，你要在里面住 20 年以上。</p>

<h2>第 6 个月：石棉的意外</h2>
<p>我们预算了 $22,000 用于拆除。石棉评估报告显示整栋房子都有"A 类"污染材料——不仅是纤维板，还有地砖和屋顶板。最终拆除费用：$41,000。意外超支：$19,000。务必留出应急储备金。</p>

<h2>第 7–12 个月：DA 流程</h2>
<p>我们的 DA 花了 11 个月——比预期更长，因为一个邻居提出了异议。异议是关于视线和隐私问题，需要修改二楼窗户的设计。经验：邻里关系很重要。我们希望在提交申请前就主动介绍自己并解释项目。</p>

<h2>第 12–18 个月：施工</h2>
<p>建造历时 8 个月。我们签订了 $870,000 的固定价格合同。含变更后最终费用：$930,000。变更包括：升级厨房台面（$8,000）、未在规格中明确的电气升级（$12,000）、原始方案范围外的景观（$25,000），以及因地下暗渠导致的地基结构问题（$15,000）。</p>

<h2>最终数字</h2>
<ul>
  <li>拆除：$41,000</li>
  <li>Town Planner + 建筑师 + 认证人员：$51,000</li>
  <li>DA 费用和开发贡献金：$22,000</li>
  <li>建筑施工：$930,000</li>
  <li>景观和外部工程：$48,000</li>
  <li>融资费用（过渡贷款，11 个月）：$68,000</li>
  <li>临时住所租金：$42,000</li>
  <li><strong>合计：约 $1.4M（不含土地成本）</strong></li>
</ul>

<h2>值得吗？</h2>
<p>绝对值得。我们现在拥有一栋四卧三卫的住宅，配备精美厨房、朝北娱乐区，价值与我们的投入相称。Strathfield 目前的同类成交价显示我们的房子价值在 $380 万到 $410 万之间。我们以 $210 万买地，加上所有费用，我们对结果非常满意——尽管过程中有过压力很大的时刻。</p>

<p><strong>我们最大的建议：</strong>在预算中留出 15–20% 的应急储备金，尽早与邻居沟通，如果房子是 1990 年前建造的，不要低估拆除费用。</p>
    `,
  },
  {
    slug: 'choosing-building-materials',
    title: 'Choosing Building Materials for Your KDR: Local vs Imported',
    titleZh: '推倒重建建材选择：本地还是进口？',
    excerpt: 'From windows to floor tiles, the materials you choose affect cost, quality, lead times, and warranty support. Here\'s a practical guide to making smart choices.',
    excerptZh: '从窗户到地砖，建材的选择会影响成本、质量、交货期和质保支持。以下是做出明智选择的实用指南。',
    category: 'materials',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2025-12-30',
    readMinutes: 7,
    tags: ['Materials', 'Windows', 'Tiles', 'Flooring', 'Import'],
    tagsZh: ['建材', '门窗', '瓷砖', '地板', '进口'],
    content: `
<p>Building materials account for 30–40% of your total construction cost. Making smart choices here can save tens of thousands without compromising quality — or cost you the same amount in problems if you get it wrong.</p>

<h2>The Local vs Imported Debate</h2>
<p>Australian-made materials carry a premium — typically 20–40% more than imported equivalents. But that premium buys you: easier warranty claims, familiar certifications (NCC compliance), no freight delays, and local trade familiarity. Imported materials (particularly from China, which dominates the market for tiles, stone, and fittings) can deliver excellent value when sourced from reputable suppliers.</p>

<h2>Windows and Doors</h2>
<p><strong>Australian brands:</strong> Stegbar, Corinthian, Capral — known quality, good warranty support, but premium pricing ($800–$1,500 per standard window).</p>
<p><strong>Imported options:</strong> Chinese-made aluminium double-glazed windows have improved dramatically. Well-specified imports can cost 30–40% less with comparable thermal performance. Key is ensuring they meet NCC energy efficiency requirements and have a local compliance certificate.</p>
<p><strong>Recommendation:</strong> For standard openings, reputable imported double-glazed windows are excellent value. For entry doors and feature windows, local quality tends to deliver better long-term satisfaction.</p>

<h2>Floor Tiles and Stone</h2>
<p>Australia imports the majority of its tiles. Spanish and Italian tiles have traditionally dominated the premium market, while Chinese tiles have captured the mid-range and now the lower-premium segment too. Quality from top Chinese tile manufacturers (Nabel, Eagle, Marco Polo) is genuinely competitive.</p>
<p><strong>Key consideration:</strong> Look for PEI wear rating (4+ for floors), slip rating (P4 or P5 for wet areas), and ensure the tile thickness and rectification suits your subfloor.</p>

<h2>Kitchen and Bathroom Fittings</h2>
<p>This is where imported products introduce the most risk. Cheap chrome tapware from unknown brands can fail within 2–3 years. Stick with Caroma, Methven, or Grohe for tapware — the local warranty and parts availability matter. For stone benchtops, engineered stone from Chinese manufacturers is excellent value for money when you choose established brands sold through Australian distributors.</p>

<h2>Flooring</h2>
<p>Timber flooring is a significant cost item. Australian hardwood flooring (spotted gum, blackbutt, brushbox) is beautiful and durable, but expensive ($150–$220/m² installed). Engineered timber from European and Chinese manufacturers offers a similar look at $80–$130/m² installed.</p>
<p>Luxury vinyl plank (LVP) has taken over the budget-to-mid segment and for good reason — waterproof, durable, and increasingly convincing in appearance at $45–$90/m² installed.</p>

<h2>Smart Material Strategy</h2>
<p>Spend on the things you touch daily — door handles, tapware, benchtops. Save on the things that are hidden or easily replaced — insulation, plasterboard, roof tiles, fascia. This is where good builders allocate budget wisely.</p>

<p>Visit our <a href="/suppliers">Suppliers Directory</a> to find verified local and imported material suppliers with KDR experience.</p>
    `,
    contentZh: `
<p>建材占总建设费用的 30–40%。在这方面做出明智选择可以节省数万元而不影响质量——但如果选择错误，同样可能损失这么多。</p>

<h2>本地 vs 进口之争</h2>
<p>澳洲本地生产的建材通常要贵 20–40%。但这个溢价带来的是：更便捷的质保服务、熟悉的认证标准（NCC 合规）、无货运延误，以及本地工人的熟悉度。进口建材（特别是主导瓷砖、石材和配件市场的中国产品）在选择信誉良好的供应商的前提下，可以提供出色的性价比。</p>

<h2>门窗</h2>
<p><strong>澳洲品牌：</strong>Stegbar、Corinthian、Capral——品质有保障，质保服务好，但价格较高（每扇标准窗户 $800–$1,500）。</p>
<p><strong>进口选择：</strong>中国制造的铝合金双层玻璃窗质量已大幅提升。规格合理的进口产品可以比同等热性能的本地产品便宜 30–40%。关键是确保符合 NCC 能效要求并拥有本地合规证书。</p>
<p><strong>建议：</strong>对于标准开口，来自信誉良好厂商的进口双层玻璃窗性价比极高。对于入户门和特色窗户，本地品质通常带来更好的长期满意度。</p>

<h2>地砖和石材</h2>
<p>澳洲进口了大部分瓷砖。西班牙和意大利瓷砖传统上占据高端市场，而中国瓷砖已占领中端市场，如今也进入了中高端领域。顶级中国瓷砖厂商（如金舵、鹰牌、马可波罗）的产品质量确实具备竞争力。</p>
<p><strong>关键指标：</strong>注意 PEI 耐磨等级（地面用 4+），防滑等级（湿区 P4 或 P5），并确保瓷砖厚度和校平度适合你的基底。</p>

<h2>厨房和浴室配件</h2>
<p>这是进口产品风险最大的地方。来自不知名品牌的廉价镀铬水龙头可能在 2–3 年内损坏。水龙头坚持选择 Caroma、Methven 或 Grohe——本地质保和配件供应很重要。对于石材台面，通过澳洲分销商购买的知名品牌中国工程石具有极高的性价比。</p>

<h2>地板</h2>
<p>木地板是一项重大费用。澳洲硬木地板（Spotted Gum、Blackbutt、Brushbox）美观耐用，但价格不菲（安装后 $150–$220/平方米）。来自欧洲和中国厂商的工程木地板提供类似外观，安装后 $80–$130/平方米。</p>
<p>豪华乙烯基地板（LVP）已经占领了经济型到中端市场，原因充分——防水、耐用，外观越来越逼真，安装后仅 $45–$90/平方米。</p>

<h2>明智的建材策略</h2>
<p>把钱花在每天触摸的地方——门把手、水龙头、台面。在隐蔽或易更换的地方节省——隔热材料、石膏板、屋顶瓦、檐板。这是优秀建筑商合理分配预算的方式。</p>

<p>访问我们的<a href="/suppliers">建材商目录</a>，寻找拥有 KDR 经验的经认证本地和进口建材供应商。</p>
    `,
  },

  // ── GRANNY FLAT & RENOVATION ARTICLES ─────────────────────────────────────

  {
    slug: 'kdr-vs-renovation-vs-granny-flat',
    title: 'KDR vs Renovation vs Extension vs Granny Flat: Which Is Right for You?',
    titleZh: '推倒重建 vs 翻新 vs 扩建 vs Granny Flat：哪种最适合你？',
    excerpt: 'Four paths, one old house. Before you decide anything, here\'s the honest financial and practical comparison that most guides don\'t give you.',
    excerptZh: '四条路，一栋旧房。在你做决定之前，这是大多数指南不会给你的真实财务和实用对比。',
    category: 'renovation',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-03-22',
    readMinutes: 9,
    tags: ['KDR', 'Renovation', 'Extension', 'Granny Flat', 'Decision Guide'],
    tagsZh: ['推倒重建', '翻新', '扩建', 'Granny Flat', '决策指南'],
    content: `
<p>You own an older home. Something needs to change. But which path makes the most sense — financially, practically, and for your life? Here's an honest comparison of all four options.</p>

<h2>A Quick Decision Map</h2>
<p>Before comparing costs, ask yourself these three questions:</p>
<ol>
<li><strong>Is the structure fundamentally sound?</strong> If the frame, foundations, and roof are solid, renovation is genuinely on the table. If not, you're looking at KDR.</li>
<li><strong>Do you need more space, or just better space?</strong> Extension adds area. Renovation improves what exists. KDR rebuilds everything. Granny flat adds a separate dwelling.</li>
<li><strong>Are you primarily solving a lifestyle problem or an investment problem?</strong> The answer changes the maths completely.</li>
</ol>

<h2>Option 1: Knockdown Rebuild (KDR)</h2>
<p><strong>Best for:</strong> Old homes with structural problems, asbestos, poor layout that renovation can't fix, or homeowners who want a fully custom new home without moving suburb.</p>
<p><strong>Cost range:</strong> $350,000–$700,000+ (build only, excluding land)</p>
<p><strong>Timeline:</strong> 18–30 months from planning to move-in</p>
<p><strong>Value created:</strong> Typically the highest uplift — new home adds 40–80% to land value in most suburbs</p>
<p><strong>Key risks:</strong> Longest disruption (you must vacate), requires DA or CDC, construction cost overruns</p>
<p><strong>Right move if:</strong> Your home is pre-1990s with structural issues, asbestos, or a layout no renovation can fix. Also right if you want to maximise the block's potential with a fully custom design.</p>

<h2>Option 2: Major Renovation</h2>
<p><strong>Best for:</strong> Homes with good bones that just need updating — kitchens, bathrooms, open-plan living, a second storey addition.</p>
<p><strong>Cost range:</strong> $80,000–$400,000 depending on scope</p>
<p><strong>Timeline:</strong> 6–18 months</p>
<p><strong>Value created:</strong> Moderate — a $200K renovation rarely adds $200K in value. Rule of thumb: expect 60–80 cents return per dollar spent on renovations.</p>
<p><strong>Key risks:</strong> Hidden costs (asbestos, old wiring, wet rot) discovered mid-project; budget blow-outs are extremely common</p>
<p><strong>Right move if:</strong> Your home has a layout you love, the structure is sound, and you're primarily improving liveability rather than maximising value. Or if you're on a tight timeline and can't wait for a full rebuild.</p>

<h2>Option 3: Extension / Addition</h2>
<p><strong>Best for:</strong> Homes that need more space — an extra bedroom, a larger living area, or a second storey.</p>
<p><strong>Cost range:</strong> $80,000–$250,000 for ground floor extension; $150,000–$400,000 for a second storey</p>
<p><strong>Timeline:</strong> 3–12 months (DA/CDC approval time varies)</p>
<p><strong>Value created:</strong> Good, especially second storey additions in land-constrained inner suburbs. A well-executed extension in Sydney or Melbourne can return $1.20–$1.50 for every dollar spent.</p>
<p><strong>Key risks:</strong> Matching new work to existing structure and finishes; council setback and height limits may restrict what's possible</p>
<p><strong>Right move if:</strong> You love your location and current home but genuinely need more space. Second storey additions in particular offer excellent ROI in established suburbs.</p>

<h2>Option 4: Granny Flat / Secondary Dwelling</h2>
<p><strong>Best for:</strong> Homeowners with a large enough block (typically 450m²+ in NSW) who want rental income, a space for family, or to add investment value.</p>
<p><strong>Cost range:</strong> $80,000–$200,000</p>
<p><strong>Timeline:</strong> 3–12 months (CDC pathway in NSW is as fast as 20 days)</p>
<p><strong>Value created:</strong> Properties with granny flats achieve ~27% higher rental yields. Rental income of $300–$600/week is realistic in most metro suburbs.</p>
<p><strong>Key risks:</strong> Cannot be sold separately; not available on all lot sizes; ongoing landlord responsibilities if renting</p>
<p><strong>Right move if:</strong> Your lot is large enough, you want income or family accommodation, and you don't need to touch the main house.</p>

<h2>The Honest Financial Summary</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>Option</th><th>Typical Cost</th><th>Timeline</th><th>Value Return</th><th>Disruption</th></tr></thead>
<tbody>
<tr><td>KDR</td><td>$350K–$700K+</td><td>18–30 months</td><td>Highest</td><td>Must vacate</td></tr>
<tr><td>Renovation</td><td>$80K–$400K</td><td>6–18 months</td><td>Moderate (60–80¢/$)</td><td>Can stay (sometimes)</td></tr>
<tr><td>Extension</td><td>$80K–$400K</td><td>3–12 months</td><td>Good ($1.20–$1.50/$)</td><td>Minimal</td></tr>
<tr><td>Granny Flat</td><td>$80K–$200K</td><td>3–12 months</td><td>Income-focused</td><td>Minimal</td></tr>
</tbody>
</table></div>

<p>The best choice depends entirely on your specific block, home condition, and goals. Run a free feasibility check on your block to get an AI assessment of which options are available to you.</p>
    `,
    contentZh: `
<p>你拥有一栋老房子，某些地方需要改变。但哪条路在财务和实际操作上最合理？以下是对所有四个选项的真实对比。</p>

<h2>快速决策地图</h2>
<p>在比较成本之前，先问自己这三个问题：</p>
<ol>
<li><strong>房屋结构是否根本健全？</strong>如果框架、地基和屋顶都是坚固的，翻新确实是一个选项。如果不是，你就需要考虑推倒重建了。</li>
<li><strong>你需要更多空间，还是更好的空间？</strong>扩建增加面积，翻新改善现有空间，推倒重建是全面重建，Granny Flat 增加独立住宅。</li>
<li><strong>你主要是在解决生活品质问题还是投资问题？</strong>答案会完全改变计算方式。</li>
</ol>

<h2>选项一：推倒重建（KDR）</h2>
<p><strong>最适合：</strong>有结构问题的旧房、含石棉的房子、翻新无法改善的糟糕布局，或者想要全定制新房而不换郊区的业主。</p>
<p><strong>费用范围：</strong>$35–70 万以上（仅建设费，不含地价）</p>
<p><strong>时间线：</strong>从规划到入住 18–30 个月</p>
<p><strong>创造价值：</strong>通常是最高的——新房在大多数郊区为地皮增加 40–80% 的价值</p>
<p><strong>主要风险：</strong>干扰时间最长（必须搬出），需要 DA 或 CDC，建设成本超支</p>
<p><strong>正确选择：</strong>如果你的房子是 1990 年前建造的，有结构问题、石棉或布局问题无法通过翻新解决。也适合想最大化地块潜力、做全定制设计的情况。</p>

<h2>选项二：大型翻新</h2>
<p><strong>最适合：</strong>结构良好只需更新的房屋——厨房、浴室、开放式生活区、二楼加建。</p>
<p><strong>费用范围：</strong>$8–40 万，视规模而定</p>
<p><strong>时间线：</strong>6–18 个月</p>
<p><strong>创造价值：</strong>适中——花 20 万翻新很少能增加 20 万的价值。经验法则：每花 1 元翻新，预期回报约 60–80 分。</p>
<p><strong>主要风险：</strong>施工中途发现的隐藏成本（石棉、旧电线、湿腐）；预算超支极为常见</p>
<p><strong>正确选择：</strong>如果你喜欢现有布局，结构良好，主要是改善生活质量而非最大化价值。或者时间紧迫，等不了完整重建。</p>

<h2>选项三：扩建</h2>
<p><strong>最适合：</strong>需要更多空间的房屋——额外卧室、更大的生活区或二楼。</p>
<p><strong>费用范围：</strong>地面扩建 $8–25 万；二楼加建 $15–40 万</p>
<p><strong>时间线：</strong>3–12 个月（DA/CDC 审批时间不等）</p>
<p><strong>创造价值：</strong>良好，特别是土地紧缺的内城郊区的二楼加建。悉尼或墨尔本精心施工的扩建每花 1 元可回报 $1.20–$1.50。</p>
<p><strong>主要风险：</strong>新旧工程的结构和装修匹配；Council 的退界和高度限制可能约束可能性</p>
<p><strong>正确选择：</strong>如果你热爱现有位置和房屋，但真的需要更多空间。二楼加建在成熟郊区尤其提供优秀的投资回报。</p>

<h2>选项四：Granny Flat / 辅助住宅</h2>
<p><strong>最适合：</strong>地块足够大（NSW 通常需要 450m²+）、想要租金收入、为家人提供空间或增加投资价值的业主。</p>
<p><strong>费用范围：</strong>$8–20 万</p>
<p><strong>时间线：</strong>3–12 个月（NSW 的 CDC 通道最快 20 天）</p>
<p><strong>创造价值：</strong>有 Granny Flat 的房产租金回报率高出约 27%。大多数都会区郊区每周租金 $300–$600 是现实的。</p>
<p><strong>主要风险：</strong>不能单独出售；不是所有地块都符合条件；如果出租需要承担房东责任</p>
<p><strong>正确选择：</strong>如果你的地块足够大，想要收入或家庭住所，且不需要改动主房屋。</p>

<h2>真实财务摘要</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>选项</th><th>典型费用</th><th>时间线</th><th>价值回报</th><th>干扰程度</th></tr></thead>
<tbody>
<tr><td>推倒重建</td><td>$35–70 万+</td><td>18–30 个月</td><td>最高</td><td>必须搬出</td></tr>
<tr><td>翻新</td><td>$8–40 万</td><td>6–18 个月</td><td>适中（每元 60–80 分）</td><td>有时可留住</td></tr>
<tr><td>扩建</td><td>$8–40 万</td><td>3–12 个月</td><td>良好（每元 $1.20–1.50）</td><td>最小</td></tr>
<tr><td>Granny Flat</td><td>$8–20 万</td><td>3–12 个月</td><td>以收益为主</td><td>最小</td></tr>
</tbody>
</table></div>

<p>最佳选择完全取决于你的具体地块、房屋状况和目标。对你的地块进行免费可行性查询，获取 AI 评估，了解哪些选项适合你。</p>
    `,
  },

  {
    slug: 'granny-flat-rules-by-state-2026',
    title: 'Australian Granny Flat Rules by State: The Complete 2026 Guide',
    titleZh: '全澳 Granny Flat 各州规定完整指南（2026）',
    excerpt: 'NSW, VIC, QLD, WA, SA, ACT — every state has different rules on size, lot size, approval type, and who can live there. Here\'s the definitive comparison.',
    excerptZh: 'NSW、VIC、QLD、WA、SA、ACT——每个州对面积、地块大小、审批方式和居住限制都有不同规定。这是权威对比。',
    category: 'granny-flat',
    author: 'Sarah Chen',
    authorRole: 'Registered Town Planner',
    authorRoleZh: '注册城市规划师',
    date: '2026-03-21',
    readMinutes: 10,
    tags: ['Granny Flat', 'Secondary Dwelling', 'State Regulations', 'NSW', 'VIC', 'QLD', 'WA'],
    tagsZh: ['Granny Flat', '辅助住宅', '州级规定', '新南威尔士', '维多利亚', '昆士兰', '西澳'],
    content: `
<p>Granny flat rules in Australia are primarily set at the state level — not by individual councils. Councils can add local restrictions on top, but the state sets the floor. Here's what you need to know in each state as of 2026.</p>

<h2>The Big Picture: 2024–2026 Reforms</h2>
<p>Every state has loosened its granny flat rules in the past two years. The trend is clear: governments are using secondary dwellings as a tool to address the housing shortage. Key changes include higher size limits (from 60m² to 70–90m²), removal of family-only rental restrictions, and in WA's case, the complete removal of minimum lot size requirements.</p>

<h2>New South Wales (NSW)</h2>
<p><strong>Maximum size:</strong> 70m² (increased from 60m² in 2024)</p>
<p><strong>Minimum lot size:</strong> 450m² — no exceptions for the complying development pathway</p>
<p><strong>Approval:</strong> Complying Development Certificate (CDC) if the block meets all requirements — assessed by a private certifier in about 20 days. Development Application (DA) for non-standard sites.</p>
<p><strong>Additional CDC requirements:</strong> 12m minimum street frontage, 3m rear setback, 0.9m side setbacks</p>
<p><strong>Can you rent to non-family?</strong> Yes — since 2020, NSW allows rental to anyone</p>
<p><strong>Separate sale?</strong> No — granny flats cannot be strata titled or sold separately from the main home</p>
<p><strong>Heritage/bushfire zones:</strong> In bushfire Attack Level (BAL) 40 or higher zones, the CDC pathway is unavailable — you must lodge a DA. Heritage conservation areas may require additional design controls.</p>
<p><strong>Key insight:</strong> NSW has the most structured approval system. If your block is 450m²+ with 12m frontage, the CDC pathway is fast and reliable. Smaller blocks must go through DA, which is discretionary.</p>

<h2>Victoria</h2>
<p><strong>Maximum size:</strong> 60m²</p>
<p><strong>Minimum lot size:</strong> No fixed state minimum — varies by council zone</p>
<p><strong>Approval:</strong> In most residential zones, <strong>no planning permit is required</strong>. A building permit is always required. This makes VIC the most permissive state for granny flats.</p>
<p><strong>Exceptions requiring a planning permit:</strong> Heritage Overlay, Bushfire Management Overlay, Floodway Overlay, Neighbourhood Residential Zone (NRZ) in some councils</p>
<p><strong>Can you rent to non-family?</strong> Yes</p>
<p><strong>Separate sale?</strong> No</p>
<p><strong>Key insight:</strong> Victoria removed the planning permit requirement for small second homes in late 2023. If you're in a standard residential zone, you only need a building permit — typically 4–8 weeks. This is the fastest path in Australia for most homeowners.</p>

<h2>Queensland</h2>
<p><strong>Maximum size:</strong> 80m² in Brisbane; varies by council (Ipswich 50m², Gold Coast 60m²)</p>
<p><strong>Minimum lot size:</strong> Flexible — in Brisbane, 400m²+ lots can generally support a secondary dwelling</p>
<p><strong>Approval:</strong> Varies significantly by council. Brisbane City Council has a defined pathway; regional councils vary widely.</p>
<p><strong>Can you rent to non-family?</strong> Yes — rules updated 2022–2024</p>
<p><strong>Separate sale?</strong> No</p>
<p><strong>Key insight:</strong> QLD is the most variable state. Always check your specific council's planning scheme — the rules in Logan, Gold Coast, Sunshine Coast, and Brisbane are all different. A town planner familiar with your council is essential.</p>

<h2>Western Australia (WA)</h2>
<p><strong>Maximum size:</strong> 70m²</p>
<p><strong>Minimum lot size:</strong> <strong>None</strong> — WA removed the 350m² minimum in April 2024</p>
<p><strong>Approval:</strong> No development approval needed if the design complies with the Residential Design Codes (R-Codes). A building permit is still required.</p>
<p><strong>Can you rent to non-family?</strong> Yes</p>
<p><strong>Separate sale?</strong> No</p>
<p><strong>Key insight:</strong> WA's April 2024 reform was the most significant granny flat deregulation in Australia. Removing the lot size minimum means virtually any suburban block can now accommodate an ancillary dwelling. If you're in Perth, the path is now straightforward: design to R-Code compliance, get a building permit, build.</p>

<h2>South Australia (SA)</h2>
<p><strong>Maximum size:</strong> 70m² (increased from 60m²)</p>
<p><strong>Minimum lot size:</strong> 450m² in most cases</p>
<p><strong>Approval:</strong> Development approval is always required — there's no exempt or complying pathway</p>
<p><strong>Can you rent to non-family?</strong> Yes — family-only restriction recently removed</p>
<p><strong>Separate sale?</strong> No</p>
<p><strong>Key insight:</strong> SA requires a DA for every granny flat — no fast-track complying pathway. Budget 8–16 weeks for approval. On the positive side, the family-only rental restriction was removed, making granny flats a genuine investment tool in SA.</p>

<h2>Australian Capital Territory (ACT)</h2>
<p><strong>Maximum size:</strong> Up to 90m² (most generous limit in Australia)</p>
<p><strong>Minimum lot size:</strong> 500m²</p>
<p><strong>Approval:</strong> Development approval required</p>
<p><strong>Can you rent to non-family?</strong> Yes</p>
<p><strong>Separate sale?</strong> No</p>
<p><strong>Key insight:</strong> ACT allows the largest secondary dwellings (90m²) but requires water-sensitive design — a rainwater tank is mandatory. The planning process is managed by the ACT Planning Authority.</p>

<h2>Quick Comparison Table</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>State</th><th>Max Size</th><th>Min Lot</th><th>Fast-Track?</th><th>Rent Anyone?</th></tr></thead>
<tbody>
<tr><td><strong>NSW</strong></td><td>70m²</td><td>450m²</td><td>Yes (CDC ~20 days)</td><td>Yes</td></tr>
<tr><td><strong>VIC</strong></td><td>60m²</td><td>None (varies)</td><td>Yes (no planning permit)</td><td>Yes</td></tr>
<tr><td><strong>QLD</strong></td><td>50–80m²</td><td>~400m²</td><td>Varies by council</td><td>Yes</td></tr>
<tr><td><strong>WA</strong></td><td>70m²</td><td><strong>None</strong></td><td>Yes (R-Code compliant)</td><td>Yes</td></tr>
<tr><td><strong>SA</strong></td><td>70m²</td><td>450m²</td><td>No (DA always required)</td><td>Yes</td></tr>
<tr><td><strong>ACT</strong></td><td>90m²</td><td>500m²</td><td>No (DA required)</td><td>Yes</td></tr>
</tbody>
</table></div>

<p>Not sure if your block qualifies? Run a free feasibility check — our AI tool can assess your suburb's zoning and flag any overlay issues that would affect your granny flat approval path.</p>
    `,
    contentZh: `
<p>澳洲的 Granny Flat 规定主要由州级制定——而非由各个 Council 决定。Council 可以在此基础上增加本地限制，但州级设定基准。以下是截至 2026 年各州的规定。</p>

<h2>整体趋势：2024–2026 年改革</h2>
<p>每个州在过去两年都放宽了 Granny Flat 规定。趋势很明确：政府正在把辅助住宅作为解决住房短缺的工具。主要变化包括：面积上限提高（从 60m² 到 70–90m²）、取消仅限家人出租的限制，以及西澳完全取消最小地块要求。</p>

<h2>新南威尔士州（NSW）</h2>
<p><strong>最大面积：</strong>70m²（2024 年从 60m² 提升）</p>
<p><strong>最小地块：</strong>450m²——合规开发通道无例外</p>
<p><strong>审批：</strong>如果地块满足所有要求，可使用合规开发证书（CDC）——由私人认证人员评估，约 20 天。非标准地块需申请 DA。</p>
<p><strong>CDC 额外要求：</strong>最少 12m 临街面，3m 后退，0.9m 侧退</p>
<p><strong>能否出租给非家人？</strong>可以——自 2020 年起，NSW 允许向任何人出租</p>
<p><strong>能否单独出售？</strong>不能——Granny Flat 不能单独进行产权分割或与主房分开出售</p>
<p><strong>遗产/丛林火灾区：</strong>在丛林火灾袭击等级（BAL）40 或以上的区域，不能使用 CDC 通道——必须提交 DA。遗产保护区可能需要额外的设计控制。</p>
<p><strong>关键提示：</strong>NSW 拥有最结构化的审批体系。如果你的地块是 450m²+ 且临街面 12m，CDC 通道快速可靠。较小地块必须通过 DA，具有酌情处理性质。</p>

<h2>维多利亚州（VIC）</h2>
<p><strong>最大面积：</strong>60m²</p>
<p><strong>最小地块：</strong>无固定州级最低要求——因 Council 分区而异</p>
<p><strong>审批：</strong>在大多数住宅区，<strong>无需规划许可</strong>。建筑许可始终需要。这使 VIC 成为澳洲对 Granny Flat 最宽松的州。</p>
<p><strong>需要规划许可的例外情况：</strong>遗产叠加、丛林火灾管理叠加、洪泛区叠加、部分 Council 的邻里住宅区（NRZ）</p>
<p><strong>能否出租给非家人？</strong>可以</p>
<p><strong>关键提示：</strong>维多利亚于 2023 年底取消了小型第二住宅的规划许可要求。如果你在标准住宅区，只需要建筑许可——通常 4–8 周。这是澳洲大多数业主最快的申请路径。</p>

<h2>昆士兰州（QLD）</h2>
<p><strong>最大面积：</strong>Brisbane 为 80m²；各 Council 不同（Ipswich 50m²，Gold Coast 60m²）</p>
<p><strong>最小地块：</strong>弹性——Brisbane 400m²+ 的地块通常可以支持辅助住宅</p>
<p><strong>审批：</strong>各 Council 差异显著。Brisbane City Council 有明确通道；地区 Council 差异很大。</p>
<p><strong>关键提示：</strong>QLD 是差异最大的州。务必查看你所在 Council 的规划方案——Logan、Gold Coast、Sunshine Coast 和 Brisbane 的规定都不同。需要熟悉你所在 Council 的城市规划师。</p>

<h2>西澳大利亚州（WA）</h2>
<p><strong>最大面积：</strong>70m²</p>
<p><strong>最小地块：</strong><strong>无要求</strong>——WA 于 2024 年 4 月取消了 350m² 的最低要求</p>
<p><strong>审批：</strong>如果设计符合住宅设计规范（R-Codes），无需开发审批。仍需建筑许可。</p>
<p><strong>关键提示：</strong>WA 2024 年 4 月的改革是澳洲 Granny Flat 最重大的去监管化举措。取消地块面积最低要求意味着几乎任何郊区地块现在都可以建造附属住宅。如果你在珀斯，路径现在很直接：按 R-Code 合规设计，获取建筑许可，开始建设。</p>

<h2>南澳大利亚州（SA）</h2>
<p><strong>最大面积：</strong>70m²（从 60m² 提高）</p>
<p><strong>最小地块：</strong>大多数情况下 450m²</p>
<p><strong>审批：</strong>始终需要开发审批——没有豁免或合规开发通道</p>
<p><strong>关键提示：</strong>SA 每个 Granny Flat 都需要 DA——没有快速合规通道。预计审批需要 8–16 周。好消息是，仅限家人出租的限制已被取消，使 Granny Flat 成为 SA 真正的投资工具。</p>

<h2>澳大利亚首都领地（ACT）</h2>
<p><strong>最大面积：</strong>最高 90m²（澳洲最宽松的限制）</p>
<p><strong>最小地块：</strong>500m²</p>
<p><strong>审批：</strong>需要开发审批</p>
<p><strong>关键提示：</strong>ACT 允许最大的辅助住宅（90m²），但需要水敏感设计——雨水箱是强制要求的。规划过程由 ACT 规划局管理。</p>

<h2>快速对比表</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>州</th><th>最大面积</th><th>最小地块</th><th>快速通道？</th><th>可租任何人？</th></tr></thead>
<tbody>
<tr><td><strong>NSW</strong></td><td>70m²</td><td>450m²</td><td>是（CDC 约 20 天）</td><td>是</td></tr>
<tr><td><strong>VIC</strong></td><td>60m²</td><td>无（因地区而异）</td><td>是（无需规划许可）</td><td>是</td></tr>
<tr><td><strong>QLD</strong></td><td>50–80m²</td><td>约 400m²</td><td>因 Council 而异</td><td>是</td></tr>
<tr><td><strong>WA</strong></td><td>70m²</td><td><strong>无</strong></td><td>是（R-Code 合规即可）</td><td>是</td></tr>
<tr><td><strong>SA</strong></td><td>70m²</td><td>450m²</td><td>否（始终需要 DA）</td><td>是</td></tr>
<tr><td><strong>ACT</strong></td><td>90m²</td><td>500m²</td><td>否（需要 DA）</td><td>是</td></tr>
</tbody>
</table></div>

<p>不确定你的地块是否符合条件？进行免费可行性查询——我们的 AI 工具可以评估你郊区的分区，并标记可能影响你 Granny Flat 审批路径的任何叠加区。</p>
    `,
  },

  {
    slug: 'granny-flat-cost-guide-2026',
    title: 'How Much Does a Granny Flat Cost in Australia? (2026 Real Numbers)',
    titleZh: '澳洲建一个 Granny Flat 要多少钱？（2026 年真实数字）',
    excerpt: 'From a basic studio to a fully self-contained 2-bedroom dwelling — here are the real build costs, hidden extras, and how to get the best value for your budget.',
    excerptZh: '从基础单间到全配套 2 卧室住宅——这是真实的建设成本、隐藏额外费用，以及如何在预算内获得最佳价值。',
    category: 'granny-flat',
    author: 'Tom Richards',
    authorRole: 'Project Manager, 12 years KDR',
    authorRoleZh: '项目经理，12 年 KDR 经验',
    date: '2026-03-18',
    readMinutes: 7,
    tags: ['Granny Flat', 'Cost', 'Budget', 'Secondary Dwelling', '2026'],
    tagsZh: ['Granny Flat', '费用', '预算', '辅助住宅', '2026'],
    content: `
<p>The honest answer is: a granny flat in Australia costs between $80,000 and $200,000+. That's a wide range, and it exists for good reason. Here's how to understand where your project will sit and what drives the price.</p>

<h2>Cost by Build Type</h2>

<div class="overflow-x-auto"><table>
<thead><tr><th>Build Type</th><th>Size</th><th>Cost Range</th><th>Timeline</th></tr></thead>
<tbody>
<tr><td>Prefabricated / modular</td><td>30–50m²</td><td>$80,000–$130,000</td><td>6–12 weeks on-site</td></tr>
<tr><td>Kit home (owner-assembled)</td><td>40–60m²</td><td>$90,000–$140,000</td><td>3–6 months</td></tr>
<tr><td>Volume builder (standard range)</td><td>50–70m²</td><td>$120,000–$160,000</td><td>4–6 months</td></tr>
<tr><td>Custom builder (architect-designed)</td><td>50–70m²</td><td>$160,000–$220,000+</td><td>6–10 months</td></tr>
</tbody>
</table></div>

<h2>What's Included in the Build Price — and What Isn't</h2>
<p>Builder quotes typically include the structure, fit-out, kitchen, bathroom, and standard inclusions. They usually <strong>do not include</strong>:</p>
<ul>
<li>Site preparation and demolition of existing structures ($5,000–$20,000)</li>
<li>Connections to water, sewer, and electricity ($8,000–$25,000 depending on distance from mains)</li>
<li>Council/certifier fees and application costs ($3,000–$8,000)</li>
<li>Landscaping and driveway works ($5,000–$15,000)</li>
<li>Architect or draftsperson fees if not included ($3,000–$12,000)</li>
</ul>
<p><strong>Realistic all-in budget:</strong> Add 20–30% to the builder's base quote to estimate your true project cost.</p>

<h2>Cost by State</h2>
<p>Labour and materials costs vary significantly across Australia:</p>
<div class="overflow-x-auto"><table>
<thead><tr><th>State</th><th>Typical cost per m² (standard)</th><th>60m² all-in estimate</th></tr></thead>
<tbody>
<tr><td>NSW (Sydney metro)</td><td>$2,500–$3,500/m²</td><td>$150,000–$210,000</td></tr>
<tr><td>VIC (Melbourne metro)</td><td>$2,200–$3,000/m²</td><td>$130,000–$180,000</td></tr>
<tr><td>QLD (Brisbane / SEQ)</td><td>$2,000–$2,800/m²</td><td>$120,000–$170,000</td></tr>
<tr><td>WA (Perth metro)</td><td>$1,900–$2,600/m²</td><td>$115,000–$160,000</td></tr>
<tr><td>SA (Adelaide)</td><td>$1,800–$2,500/m²</td><td>$110,000–$150,000</td></tr>
</tbody>
</table></div>

<h2>Prefab vs Stick-Built: Which Is Better Value?</h2>
<p>Prefabricated granny flats have improved significantly in quality and are often 15–25% cheaper than site-built equivalents. The main trade-offs:</p>
<ul>
<li><strong>Prefab pros:</strong> Faster (weeks not months on your block), factory quality control, less weather disruption</li>
<li><strong>Prefab cons:</strong> Limited customisation, crane delivery adds cost for tight access blocks, some lenders value them lower</li>
<li><strong>Stick-built pros:</strong> Full customisation, matches main house style better, standard bank valuation</li>
<li><strong>Stick-built cons:</strong> Longer build time, more weather-dependent, more coordination required</li>
</ul>
<p>For most suburban blocks with good access, prefab is excellent value — especially for a straightforward studio or 1-bedroom unit aimed at rental income.</p>

<h2>The Rental Income Calculation</h2>
<p>Before committing to a budget, run the numbers on your expected return:</p>
<ul>
<li>Studio/1-bed in Sydney suburbs: $350–$500/week = $18,200–$26,000/year</li>
<li>2-bed in Melbourne suburbs: $350–$500/week = $18,200–$26,000/year</li>
<li>2-bed in Brisbane: $300–$450/week = $15,600–$23,400/year</li>
</ul>
<p>At $150,000 total project cost with $22,000 annual rent, that's a 14.7% gross yield — significantly better than most investment properties. Factor in maintenance, vacancy, and tax before getting too excited, but the fundamentals are strong.</p>

<h2>Five Ways to Control Costs</h2>
<ol>
<li><strong>Use a granny flat specialist</strong> — not a general builder. Specialists have streamlined the process and buy materials in volume.</li>
<li><strong>Choose a standard design</strong> — custom designs add $15,000–$30,000 in architect/draftsperson fees and often don't add proportionate value.</li>
<li><strong>Check services connection early</strong> — the biggest surprise cost is discovering the sewer line is 30 metres away. Get a services diagram before quoting.</li>
<li><strong>Avoid relocating the kitchen or bathroom</strong> — wet areas are expensive. A design that clusters plumbing reduces cost significantly.</li>
<li><strong>Get three builder quotes</strong> — granny flat pricing varies 20–30% between builders for identical specifications.</li>
</ol>
    `,
    contentZh: `
<p>诚实的回答是：澳洲 Granny Flat 的费用在 $8 万到 $20 万以上之间。这个范围很宽，原因充分。以下是如何理解你的项目会在哪里，以及什么驱动了价格。</p>

<h2>按建造类型的费用</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>建造类型</th><th>面积</th><th>费用范围</th><th>时间线</th></tr></thead>
<tbody>
<tr><td>预制 / 模块化</td><td>30–50m²</td><td>$8–13 万</td><td>6–12 周现场工作</td></tr>
<tr><td>套件房屋（业主自组装）</td><td>40–60m²</td><td>$9–14 万</td><td>3–6 个月</td></tr>
<tr><td>量产建筑商（标准范围）</td><td>50–70m²</td><td>$12–16 万</td><td>4–6 个月</td></tr>
<tr><td>定制建筑商（建筑师设计）</td><td>50–70m²</td><td>$16–22 万以上</td><td>6–10 个月</td></tr>
</tbody>
</table></div>

<h2>建设价格包含什么——以及不包含什么</h2>
<p>建筑商报价通常包括结构、装修、厨房、浴室和标准配置。通常<strong>不包含</strong>：</p>
<ul>
<li>场地准备和拆除现有结构（$5,000–$20,000）</li>
<li>水、排污和电力连接（$8,000–$25,000，取决于距主管线的距离）</li>
<li>Council/认证人员费用和申请成本（$3,000–$8,000）</li>
<li>园林和车道工程（$5,000–$15,000）</li>
<li>建筑师或绘图员费用（如未包含）（$3,000–$12,000）</li>
</ul>
<p><strong>实际全包预算：</strong>在建筑商基础报价上加 20–30% 来估算你的真实项目成本。</p>

<h2>各州费用</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>州</th><th>典型费用/m²（标准）</th><th>60m² 全包估算</th></tr></thead>
<tbody>
<tr><td>NSW（悉尼都会区）</td><td>$2,500–$3,500/m²</td><td>$15–21 万</td></tr>
<tr><td>VIC（墨尔本都会区）</td><td>$2,200–$3,000/m²</td><td>$13–18 万</td></tr>
<tr><td>QLD（Brisbane / SEQ）</td><td>$2,000–$2,800/m²</td><td>$12–17 万</td></tr>
<tr><td>WA（珀斯都会区）</td><td>$1,900–$2,600/m²</td><td>$11.5–16 万</td></tr>
<tr><td>SA（阿德莱德）</td><td>$1,800–$2,500/m²</td><td>$11–15 万</td></tr>
</tbody>
</table></div>

<h2>预制 vs 现场建造：哪个更有价值？</h2>
<p>预制 Granny Flat 在质量上已显著改善，通常比现场建造便宜 15–25%。主要权衡：</p>
<ul>
<li><strong>预制优点：</strong>更快（在你的地块上只需几周而非几个月），工厂质量控制，减少天气干扰</li>
<li><strong>预制缺点：</strong>定制空间有限，狭窄通道的地块需要额外起重机费用，一些贷款机构对其估值较低</li>
<li><strong>现场建造优点：</strong>完全定制，与主房风格更协调，标准银行估值</li>
<li><strong>现场建造缺点：</strong>建设时间更长，更受天气影响，需要更多协调</li>
</ul>
<p>对于大多数通道条件良好的郊区地块，预制是极好的性价比——特别是针对租金收入的直接单间或一居室。</p>

<h2>租金收入计算</h2>
<p>在确定预算之前，计算你的预期回报：</p>
<ul>
<li>悉尼郊区单间/一居室：$350–$500/周 = 每年 $18,200–$26,000</li>
<li>墨尔本郊区 2 居室：$350–$500/周 = 每年 $18,200–$26,000</li>
<li>Brisbane 2 居室：$300–$450/周 = 每年 $15,600–$23,400</li>
</ul>
<p>以 15 万总项目成本和 2.2 万年租金计算，毛收益率为 14.7%——远高于大多数投资房产。在太过兴奋之前，请考虑维护、空置和税务因素，但基本面是强劲的。</p>

<h2>控制成本的五种方法</h2>
<ol>
<li><strong>使用 Granny Flat 专业建筑商</strong>——而不是普通建筑商。专业建筑商已优化了流程并批量采购材料。</li>
<li><strong>选择标准设计</strong>——定制设计会额外增加 $15,000–$30,000 的建筑师/绘图员费用，通常不会带来相应的价值提升。</li>
<li><strong>尽早检查管线连接</strong>——最大的意外成本是发现排污管线在 30 米以外。在报价前获取管线图。</li>
<li><strong>避免移动厨房或浴室</strong>——湿区费用昂贵。将管道集中的设计可以显著降低成本。</li>
<li><strong>获取三个建筑商报价</strong>——相同规格的 Granny Flat，不同建筑商的报价差异可达 20–30%。</li>
</ol>
    `,
  },

  {
    slug: 'renting-out-granny-flat-australia',
    title: 'Renting Out Your Granny Flat: Income, Tax, and Everything You Need to Know',
    titleZh: '出租你的 Granny Flat：收入、税务及你需要知道的一切',
    excerpt: 'All states now allow you to rent your granny flat to anyone. Here\'s the honest guide to rental income, landlord responsibilities, tax implications, and the family arrangement rules.',
    excerptZh: '所有州现在都允许你将 Granny Flat 出租给任何人。这是关于租金收入、房东责任、税务影响和家庭安排规则的真实指南。',
    category: 'granny-flat',
    author: 'James Hartley',
    authorRole: 'Construction Finance Specialist',
    authorRoleZh: '建筑贷款专家',
    date: '2026-03-14',
    readMinutes: 8,
    tags: ['Granny Flat', 'Rental Income', 'Tax', 'Investment', 'Landlord'],
    tagsZh: ['Granny Flat', '租金收入', '税务', '投资', '房东'],
    content: `
<p>The family-only rental restriction is gone in every major state. Your granny flat can now be rented to anyone — students, couples, professionals, or strangers. That changes the investment equation significantly. Here's everything you need to know before you sign a lease.</p>

<h2>Rental Income Potential by State (2026)</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>City / State</th><th>Studio/1-bed (weekly)</th><th>2-bed (weekly)</th><th>Annual (2-bed)</th></tr></thead>
<tbody>
<tr><td>Sydney (NSW)</td><td>$380–$520</td><td>$450–$650</td><td>$23,400–$33,800</td></tr>
<tr><td>Melbourne (VIC)</td><td>$320–$460</td><td>$400–$580</td><td>$20,800–$30,160</td></tr>
<tr><td>Brisbane (QLD)</td><td>$300–$420</td><td>$370–$520</td><td>$19,240–$27,040</td></tr>
<tr><td>Perth (WA)</td><td>$320–$450</td><td>$400–$560</td><td>$20,800–$29,120</td></tr>
<tr><td>Adelaide (SA)</td><td>$260–$380</td><td>$320–$460</td><td>$16,640–$23,920</td></tr>
</tbody>
</table></div>

<h2>Tax: What You Must Declare</h2>
<p>Rental income from a granny flat is assessable income — you must declare it on your tax return at your marginal rate. There is no exemption simply because it's on your own property.</p>
<p><strong>What you can deduct against rental income:</strong></p>
<ul>
<li>Interest on the portion of your home loan used to fund the granny flat</li>
<li>Depreciation on the building (2.5% per year) and fixtures</li>
<li>Maintenance and repairs (not improvements)</li>
<li>Property management fees if using an agent</li>
<li>Council rates (apportioned to the granny flat area)</li>
<li>Insurance (granny flat proportion)</li>
</ul>
<p><strong>Important — CGT implication:</strong> Renting your granny flat to a third party means that portion of your property is no longer fully covered by the main residence CGT exemption. When you sell, you may owe capital gains tax on the granny flat portion. Talk to a tax accountant before renting.</p>

<h2>Family Arrangements vs Commercial Rental</h2>
<p>There are two fundamentally different scenarios, and the tax treatment differs:</p>
<p><strong>Commercial rental</strong> (to unrelated tenants at market rent): Rental income is assessable, deductions apply, potential CGT exposure on sale.</p>
<p><strong>Granny flat arrangement</strong> (formal agreement with a family member): The ATO recognises "granny flat arrangements" as a distinct category. If you enter a formal granny flat arrangement (a written agreement where a family member lives there in exchange for a lump sum payment or care), the CGT implications are different — the main residence exemption may still apply. The ATO has a specific ruling on this (TR 2022/1). Get tax advice before structuring a family arrangement.</p>

<h2>Landlord Responsibilities</h2>
<p>Renting your granny flat makes you a landlord under state tenancy legislation — the same rules that apply to investment properties apply here:</p>
<ul>
<li>Provide a written lease (standard residential tenancy agreement)</li>
<li>Lodge a rental bond with the relevant state authority (RTA in QLD, NSW Fair Trading, Consumer Affairs VIC, etc.)</li>
<li>Maintain the property in a habitable condition</li>
<li>Conduct a condition report at start and end of tenancy</li>
<li>Give proper notice before entering the property</li>
<li>Follow state-specific rules on rent increases and lease termination</li>
</ul>
<p>The fact that the tenant lives on the same block as you doesn't create any special exemption — all standard tenancy rights and obligations apply.</p>

<h2>Practical Considerations: Sharing a Block</h2>
<p>Before signing a lease with a third-party tenant, think carefully about:</p>
<ul>
<li><strong>Shared services:</strong> Who pays for water? If on one meter, how do you apportion costs?</li>
<li><strong>Parking:</strong> Is there space for both the main home and granny flat occupants?</li>
<li><strong>Privacy:</strong> Can the tenant access their unit without walking through your garden?</li>
<li><strong>Noise and amenity:</strong> How close is the granny flat entry to your main bedroom windows?</li>
</ul>
<p>These aren't deal-breakers, but they're worth designing for before you build — changing access paths and utility metering after construction is expensive.</p>

<h2>Insurance</h2>
<p>Your standard home insurance may not cover a rented secondary dwelling. Tell your insurer before renting — you may need landlord insurance for the granny flat portion, which covers malicious damage by tenants, loss of rent, and tenant liability. Landlord insurance for a granny flat typically costs $800–$1,500/year.</p>
    `,
    contentZh: `
<p>所有主要州的仅限家人出租限制已经消除。你的 Granny Flat 现在可以出租给任何人——学生、情侣、专业人士或陌生人。这显著改变了投资方程。在签署租约之前，以下是你需要了解的一切。</p>

<h2>2026 年各州租金收入潜力</h2>
<div class="overflow-x-auto"><table>
<thead><tr><th>城市/州</th><th>单间/一居室（周租）</th><th>2 居室（周租）</th><th>年收入（2 居室）</th></tr></thead>
<tbody>
<tr><td>悉尼（NSW）</td><td>$380–$520</td><td>$450–$650</td><td>$23,400–$33,800</td></tr>
<tr><td>墨尔本（VIC）</td><td>$320–$460</td><td>$400–$580</td><td>$20,800–$30,160</td></tr>
<tr><td>布里斯班（QLD）</td><td>$300–$420</td><td>$370–$520</td><td>$19,240–$27,040</td></tr>
<tr><td>珀斯（WA）</td><td>$320–$450</td><td>$400–$560</td><td>$20,800–$29,120</td></tr>
<tr><td>阿德莱德（SA）</td><td>$260–$380</td><td>$320–$460</td><td>$16,640–$23,920</td></tr>
</tbody>
</table></div>

<h2>税务：你必须申报什么</h2>
<p>Granny Flat 的租金收入属于应税收入——你必须按边际税率在税务申报中申报。仅仅因为它在你自己的房产上，并没有豁免。</p>
<p><strong>可以从租金收入中扣除的项目：</strong></p>
<ul>
<li>用于资助 Granny Flat 的房屋贷款部分的利息</li>
<li>建筑（每年 2.5%）和设备折旧</li>
<li>维修和保养（非改善）</li>
<li>如果使用代理人的房产管理费</li>
<li>Council 费率（按 Granny Flat 面积比例分摊）</li>
<li>保险（Granny Flat 比例）</li>
</ul>
<p><strong>重要——资本利得税影响：</strong>将你的 Granny Flat 出租给第三方意味着你的房产该部分不再完全受主要住所 CGT 豁免保护。出售时，你可能需要为 Granny Flat 部分缴纳资本利得税。在出租之前咨询税务会计师。</p>

<h2>家庭安排 vs 商业出租</h2>
<p>有两种根本不同的情况，税务处理也不同：</p>
<p><strong>商业出租</strong>（以市场租金出租给无关联租客）：租金收入应税，可申请扣除，出售时可能有 CGT 风险。</p>
<p><strong>Granny Flat 安排</strong>（与家庭成员的正式协议）：ATO 将"Granny Flat 安排"认定为独立类别。如果你签订正式的 Granny Flat 安排（家庭成员住在那里，以换取一次性付款或照顾），CGT 影响不同——主要住所豁免可能仍然适用。ATO 对此有专门裁定（TR 2022/1）。在构建家庭安排之前获取税务建议。</p>

<h2>房东责任</h2>
<p>出租你的 Granny Flat 使你成为州租赁法下的房东——适用于投资房产的相同规则也适用于此：</p>
<ul>
<li>提供书面租约（标准住宅租赁协议）</li>
<li>向相关州机构缴纳押金（昆士兰 RTA、NSW Fair Trading、VIC 消费事务局等）</li>
<li>保持房产处于适合居住的状态</li>
<li>在租赁开始和结束时进行状况报告</li>
<li>在进入房产前给予适当通知</li>
<li>遵守各州关于租金上涨和终止租约的具体规定</li>
</ul>
<p>租客居住在与你相同的地块上并不会创造任何特殊豁免——所有标准租赁权利和义务均适用。</p>

<h2>实际考量：共用一块地</h2>
<p>在与第三方租客签署租约之前，请仔细考虑：</p>
<ul>
<li><strong>共用设施：</strong>谁支付水费？如果共用一个水表，如何分摊费用？</li>
<li><strong>停车位：</strong>主房和 Granny Flat 住户是否都有停车空间？</li>
<li><strong>隐私：</strong>租客能否在不穿越你的花园的情况下进入他们的单元？</li>
<li><strong>噪音和环境：</strong>Granny Flat 入口距你的主卧窗户有多近？</li>
</ul>
<p>这些不是问题所在，但值得在建造前进行设计——施工后更改通道路径和公用事业计量方式是昂贵的。</p>

<h2>保险</h2>
<p>你的标准房屋保险可能不覆盖出租的辅助住宅。在出租之前告知保险公司——你可能需要为 Granny Flat 部分购买房东保险，涵盖租客造成的恶意损坏、租金损失和租客责任。Granny Flat 的房东保险通常每年 $800–$1,500。</p>
    `,
  },

  // ── NEW 2026 ARTICLES ──────────────────────────────────────────────────────

  {
    slug: 'rba-rates-construction-loans-2026',
    title: 'RBA Rate Cuts & Construction Loans: What KDR Borrowers Need to Know in 2026',
    titleZh: 'RBA 降息 & 建筑贷款：2026 年推倒重建借款人必知',
    excerpt: 'After a sustained rate cycle, the RBA has moved. Here\'s what that means for your construction loan repayments, draw schedules, and how to lock in the best deal now.',
    excerptZh: '经历了持续的利率周期后，RBA 开始行动。这对你的建筑贷款还款、分批支付计划意味着什么，以及如何现在锁定最佳利率。',
    category: 'finance',
    author: 'James Hartley',
    authorRole: 'Construction Finance Specialist',
    authorRoleZh: '建筑贷款专家',
    date: '2026-03-20',
    readMinutes: 8,
    tags: ['Finance', 'RBA', 'Interest Rates', 'Construction Loans', '2026'],
    tagsZh: ['贷款', 'RBA', '利率', '建筑贷款', '2026'],
    content: `
<p>The RBA's rate decisions in late 2024 and into 2025 set the tone for borrowing conditions in 2026. For anyone planning a knockdown rebuild, understanding how construction loans work in the current environment — and how rates affect your actual repayments — can save you significant money.</p>

<h2>How Construction Loans Are Different</h2>
<p>Unlike a standard home loan where you draw the full amount on day one, a construction loan releases funds in <strong>progress draws</strong> — typically 5–6 stages tied to build milestones: slab, frame, lock-up, fixing, and completion.</p>
<p>This matters for your repayments: you only pay interest on the amount drawn to date. If your build costs $800,000 and you've drawn $200,000 at frame stage, you're only paying interest on $200,000 — not the full amount. This is called the <strong>interest-only period</strong> and typically runs until completion.</p>

<h2>What the Rate Environment Means for You</h2>
<p>With the cash rate lower than its 2023–24 peak, construction loan variable rates from major lenders are broadly sitting in the <strong>6.0–7.5% range</strong> depending on LVR and lender. The key metric for KDR borrowers is the all-in cost over the build period — typically 12–18 months of interest-only payments followed by principal-and-interest repayments once you move in.</p>
<p><strong>Example:</strong> $1M construction loan, 6.5% interest rate, 14-month build averaging 60% drawn: interest cost over the build ≈ $45,500. Worth factoring into your total project budget.</p>

<h2>Fixed vs Variable for Construction Loans</h2>
<p>Most lenders don't offer fixed rates during the construction (interest-only) phase. The draw-down nature makes it difficult to fix — you're not sure exactly when each draw happens. Once construction is complete and you convert to a standard home loan, you can then choose to fix.</p>
<p>Given current rate conditions, many borrowers are choosing to stay variable for now and reassess at completion. Get advice from a broker before deciding.</p>

<h2>The Valuation Challenge</h2>
<p>Banks lend against the <strong>on-completion value</strong> of the property, not the build cost. If your block is worth $700K and the completed home is valued at $1.4M, the bank will lend based on that $1.4M figure (typically up to 80% LVR = $1.12M). But if the valuer comes in lower than expected, you may need more equity — a common source of surprise for KDR borrowers.</p>
<p><strong>Tip:</strong> Get a pre-build valuation estimate from an independent valuer before committing to your builder contract. Some brokers include this as part of their service.</p>

<h2>Top Tips for KDR Borrowers in 2026</h2>
<ul>
<li>Use a broker who specialises in construction lending — not every broker understands progress draws and bank requirements for KDR</li>
<li>Get pre-approval before signing with a builder — some builders require proof of finance before locking in a slot</li>
<li>Factor 3–4% cost contingency into your loan amount — price variations during builds are common</li>
<li>Ask your broker about bridging finance options if you're staying in the existing home during demolition planning</li>
</ul>
    `,
    contentZh: `
<p>RBA 在 2024 年底至 2025 年的利率决定奠定了 2026 年借贷环境的基调。对于任何计划推倒重建的人来说，了解建筑贷款在当前环境下的运作方式——以及利率如何影响你的实际还款——可以为你节省大量资金。</p>

<h2>建筑贷款与普通贷款的区别</h2>
<p>与普通房屋贷款在第一天就全额提款不同，建筑贷款按<strong>分批提款</strong>方式释放资金——通常分为 5–6 个阶段，与建设里程碑挂钩：地基、框架、锁闭、装修和竣工。</p>
<p>这对你的还款很重要：你只需支付迄今提取金额的利息。如果你的建设费用为 80 万，框架阶段已提取 20 万，你只需支付 20 万的利息——而不是全部金额。这称为<strong>只付利息期</strong>，通常持续到竣工。</p>

<h2>利率环境对你意味着什么</h2>
<p>随着现金利率低于 2023–24 年的峰值，主要贷款机构的建筑贷款浮动利率大致在 <strong>6.0–7.5%</strong>，具体取决于贷款价值比和贷款机构。KDR 借款人的关键指标是建设期间的综合成本——通常是 12–18 个月的只付利息还款，之后在入住后转为本息还款。</p>
<p><strong>示例：</strong>100 万建筑贷款，6.5% 利率，14 个月建设期平均提取 60%：建设期间利息成本约 4.55 万。值得纳入你的项目总预算。</p>

<h2>建筑贷款固定利率 vs 浮动利率</h2>
<p>大多数贷款机构在建设（只付利息）阶段不提供固定利率。分批提款的性质使得固定利率难以实现——你无法确定每次提款的确切时间。建设完成并转换为标准房屋贷款后，你可以选择固定利率。</p>
<p>考虑到当前利率状况，许多借款人选择暂时保持浮动利率，并在竣工时重新评估。在做决定之前请向经纪人咨询。</p>

<h2>估值挑战</h2>
<p>银行根据房产的<strong>竣工价值</strong>而非建设成本放贷。如果你的地块价值 70 万，竣工后房屋估值 140 万，银行将基于 140 万的数字放贷（通常最高 80% 贷款价值比 = 112 万）。但如果估价师给出的估值低于预期，你可能需要更多自有资金——这是 KDR 借款人常见的惊喜。</p>
<p><strong>建议：</strong>在与建筑商签约之前，从独立估价师处获取建前估值。一些经纪人将此作为服务的一部分。</p>

<h2>2026 年 KDR 借款人建议</h2>
<ul>
<li>使用专注于建筑贷款的经纪人——并非每个经纪人都了解分批提款和银行对 KDR 的要求</li>
<li>在与建筑商签约前获得预批准——一些建筑商需要资金证明才能锁定档期</li>
<li>在贷款金额中计入 3–4% 的成本应急储备——建设期间的价格变动很常见</li>
<li>如果在拆除规划期间仍居住在现有住宅中，询问经纪人关于过桥贷款的选择</li>
</ul>
    `,
  },

  {
    slug: 'neighbour-objections-da-what-happens',
    title: 'When Your Neighbour Objects to Your DA: What Actually Happens',
    titleZh: '邻居反对你的 DA 申请会怎样？真实情况解析',
    excerpt: 'Fear of neighbour objections stops many homeowners from pursuing legitimate developments. Here\'s the reality of what happens, what rights neighbours actually have, and how councils decide.',
    excerptZh: '对邻居反对的恐惧让许多业主放弃了合法的开发申请。这里是真实情况——邻居实际上有哪些权利，以及 Council 如何做出决定。',
    category: 'planning',
    author: 'Sarah Chen',
    authorRole: 'Registered Town Planner',
    authorRoleZh: '注册城市规划师',
    date: '2026-03-15',
    readMinutes: 7,
    tags: ['DA', 'Neighbours', 'Objections', 'Council', 'Planning'],
    tagsZh: ['DA', '邻居', '反对', 'Council', '规划'],
    content: `
<p>One of the most common fears among people planning a knockdown rebuild or major development is: "What if my neighbour objects?" The reality is more nuanced — and often more manageable — than people expect.</p>

<h2>The Notification Process</h2>
<p>When you lodge a DA, council will notify adjoining and nearby neighbours — typically within 20–50 metres depending on the council and development type. Neighbours get 14–28 days to submit written submissions. This is standard and expected; receiving an objection doesn't mean your DA will be refused.</p>

<h2>What Grounds for Objection Are Valid?</h2>
<p>This is the key point most people don't know: neighbours can only object on <strong>planning-relevant grounds</strong>. Valid grounds include:</p>
<ul>
<li>Privacy impacts (overlooking of outdoor living areas or windows)</li>
<li>Overshadowing (loss of solar access to living areas or solar panels)</li>
<li>Visual bulk and scale (the building feels out of character)</li>
<li>Traffic and parking impacts</li>
<li>Heritage impacts (in heritage conservation areas)</li>
</ul>
<p><strong>Not valid grounds:</strong> "I just don't want them to build," personal disputes, concerns about construction noise during the build, or general preference for the neighbourhood to stay the same.</p>

<h2>How Council Weighs Objections</h2>
<p>Council planners are required to assess your DA against the relevant planning controls — not against the volume of objections. Receiving 50 objection letters doesn't automatically mean refusal; receiving one detailed, well-founded objection can carry more weight. Councils look at:</p>
<ul>
<li>Whether the objection raises legitimate planning concerns</li>
<li>Whether those concerns can be addressed through conditions</li>
<li>Whether the development complies with the relevant controls despite the concerns</li>
</ul>

<h2>What Happens If Your DA Goes to a Panel?</h2>
<p>If your DA is complex or contentious, it may be referred to a Local Planning Panel (LPP) instead of being determined by council staff. This happens more often for larger developments, heritage matters, or when councillors have a conflict of interest. The LPP is an independent body and often more consistent in its decision-making than council.</p>

<h2>Practical Steps to Manage Neighbour Relations</h2>
<ol>
<li><strong>Talk to neighbours early</strong> — before lodging. Show them the plans. Many objections come from surprise, not genuine opposition.</li>
<li><strong>Address privacy proactively</strong> — screen planting, high sill windows on shared boundaries, and privacy louvres cost very little but eliminate the most common objection ground.</li>
<li><strong>Shadow diagrams matter</strong> — if your build is two-storey, get proper shadow diagrams prepared. If you can show minimal impact on neighbouring solar access, you pre-empt the objection.</li>
<li><strong>Engage a planner</strong> — a town planner can review your plans before lodgement and identify objection risks so you can address them in the design.</li>
</ol>

<p>The bottom line: a well-designed, compliant KDR development will usually be approved even with objections, especially if your town planner has anticipated and addressed likely concerns in the Statement of Environmental Effects.</p>
    `,
    contentZh: `
<p>计划推倒重建或重大开发的人中，最常见的担忧之一是："如果我的邻居反对怎么办？"现实情况比人们预期的更为微妙——也更容易处理。</p>

<h2>通知流程</h2>
<p>当你提交 DA 时，Council 会通知相邻和附近的邻居——根据 Council 和开发类型，通常在 20–50 米范围内。邻居有 14–28 天时间提交书面意见。这是标准且预期的；收到反对意见并不意味着你的 DA 会被拒绝。</p>

<h2>哪些反对理由是有效的？</h2>
<p>这是大多数人不知道的关键点：邻居只能基于<strong>规划相关理由</strong>提出反对。有效理由包括：</p>
<ul>
<li>隐私影响（俯瞰邻居的室外生活区域或窗户）</li>
<li>遮挡阳光（减少邻居生活区域或太阳能板的日照）</li>
<li>视觉体量和规模（建筑感觉与周边不协调）</li>
<li>交通和停车影响</li>
<li>遗产影响（在遗产保护区内）</li>
</ul>
<p><strong>无效理由：</strong>"我就是不想让他们建"、个人纠纷、对建设期间噪音的担忧，或对邻居保持不变的一般偏好。</p>

<h2>Council 如何权衡反对意见</h2>
<p>Council 规划师需要根据相关规划控制来评估你的 DA——而非根据反对意见的数量。收到 50 封反对信并不自动意味着被拒绝；一封详细、有根据的反对意见可能更有分量。Council 会考虑：</p>
<ul>
<li>反对意见是否提出了合法的规划关切</li>
<li>这些关切是否可以通过附加条件解决</li>
<li>尽管有这些关切，开发项目是否仍符合相关控制要求</li>
</ul>

<h2>如果你的 DA 被提交给审议团怎么办？</h2>
<p>如果你的 DA 复杂或有争议，可能会被转至地方规划审议团（LPP）而非由 Council 工作人员决定。这在较大开发、遗产事务或议员存在利益冲突时更常见。LPP 是一个独立机构，决策通常比 Council 更为一致。</p>

<h2>管理邻居关系的实用步骤</h2>
<ol>
<li><strong>提前与邻居沟通</strong>——在提交之前。给他们看设计图。许多反对来自惊讶，而非真正的反对。</li>
<li><strong>主动解决隐私问题</strong>——在共用边界种植屏障植物、设置高窗台窗户和隐私百叶窗，成本很低，但能消除最常见的反对理由。</li>
<li><strong>阴影图很重要</strong>——如果你的建筑是两层，要准备适当的阴影图。如果你能证明对邻居日照影响最小，就能预先消除反对意见。</li>
<li><strong>聘请规划师</strong>——城市规划师可以在提交前审查你的设计并识别反对风险，这样你就可以在设计中解决这些问题。</li>
</ol>

<p>结论：一个设计良好、符合规定的 KDR 开发通常会获得批准，即使有反对意见，特别是如果你的城市规划师已经在环境影响说明中预见并解决了可能的关切。</p>
    `,
  },

  {
    slug: 'dual-occupancy-vs-kdr-numbers',
    title: 'Dual Occupancy vs Single KDR: Running the Numbers in 2026',
    titleZh: '双住宅开发 vs 单栋推倒重建：2026 年数字对比',
    excerpt: 'If your block is large enough, you may have a choice: build one quality home, or two smaller ones. The financial difference can be substantial — but so are the risks.',
    excerptZh: '如果你的地块足够大，你可能面临选择：建一栋高质量住宅，还是两栋较小的？财务差异可能相当可观——但风险也同样如此。',
    category: 'zoning',
    author: 'Michael Wong',
    authorRole: 'Property Development Advisor',
    authorRoleZh: '房产开发顾问',
    date: '2026-03-10',
    readMinutes: 9,
    tags: ['Dual Occupancy', 'Investment', 'Zoning', 'Development', 'ROI'],
    tagsZh: ['双住宅', '投资', '分区', '开发', '回报率'],
    content: `
<p>One question we hear constantly from homeowners with larger blocks: "Should I just do a dual occupancy instead?" The answer depends on your council's zoning, your lot size, your financial position, and what you're actually trying to achieve.</p>

<h2>What Is Dual Occupancy?</h2>
<p>Dual occupancy means two dwellings on a single lot — either attached (side-by-side) or detached (one behind the other). The key distinction from a granny flat: both dwellings can typically be strata-titled and sold separately, making dual occ a genuine investment strategy.</p>

<h2>When Is Dual Occ Allowed?</h2>
<p>This varies dramatically by state and council:</p>
<ul>
<li><strong>NSW:</strong> Most R2 Low Density Residential zones allow dual occupancy as either complying development (if the block is large enough) or via DA. Minimum lot sizes typically range from 400–600m². Check your council's LEP.</li>
<li><strong>VIC:</strong> ResCode controls dual occupancy. Most residential zones allow two dwellings on lots above 500m². The Neighbourhood Residential Zone (NRZ) is the most restrictive.</li>
<li><strong>QLD:</strong> Dual occupancy (duplex) is generally permitted in Low-Medium Density zones. The 400m² minimum is common but varies.</li>
<li><strong>WA:</strong> The R-Codes allow dual occ from R20 and above, which covers most suburban areas.</li>
</ul>

<h2>The Numbers: Single KDR vs Dual Occ</h2>
<p>Let's use a real example: 700m² block in Western Sydney, current value $900K.</p>

<div class="overflow-x-auto"><table>
<thead><tr><th>Item</th><th>Single KDR (4-bed)</th><th>Dual Occ (2×3-bed)</th></tr></thead>
<tbody>
<tr><td>Build cost</td><td>$550,000</td><td>$780,000</td></tr>
<tr><td>Demo + site</td><td>$40,000</td><td>$40,000</td></tr>
<tr><td>Planning + DA</td><td>$15,000</td><td>$25,000</td></tr>
<tr><td>Total project cost</td><td>$1,505,000</td><td>$1,745,000</td></tr>
<tr><td>Completed value</td><td>$1,700,000</td><td>$2,100,000 (2×$1.05M)</td></tr>
<tr><td>Equity created</td><td>$195,000</td><td>$355,000</td></tr>
<tr><td>Rental yield (if keeping)</td><td>~$2,800/wk (whole home)</td><td>~$1,450/wk × 2 = $2,900/wk</td></tr>
</tbody>
</table></div>

<p>On paper, dual occ creates more equity and similar rental yield. But the risks are higher: more complex build, longer DA, more things that can go wrong.</p>

<h2>Hidden Costs of Dual Occ</h2>
<ul>
<li><strong>Strata costs:</strong> Strata titling each dwelling costs $15,000–$25,000</li>
<li><strong>Longer DA:</strong> Dual occ DAs typically take 3–6 months longer than a standard KDR DA</li>
<li><strong>Higher build complexity:</strong> Party walls, shared drainage, sound separation — all add cost and coordination</li>
<li><strong>Finance complications:</strong> Banks may be more cautious with dual occ construction loans</li>
<li><strong>CGT if selling:</strong> If this isn't your primary residence, CGT applies to the profit on sale</li>
</ul>

<h2>Who Should Consider Dual Occ?</h2>
<p>Dual occ makes sense if: your lot is genuinely large enough (700m²+ in most states), you're comfortable with a more complex project and longer timeline, you want to retain one dwelling and sell the other to offset costs, or you're an investor seeking higher returns and can handle the holding costs during the 24–30 month project.</p>

<p>If you primarily want a great family home with minimal stress, a single KDR on a well-designed brief will almost always deliver a better outcome. Talk to both a town planner and a finance broker before deciding — the regulatory and financial picture varies significantly by suburb.</p>
    `,
    contentZh: `
<p>我们经常听到拥有较大地块的业主提问："我是不是应该做双住宅开发？"答案取决于你的 Council 分区、地块大小、财务状况，以及你真正想要实现什么。</p>

<h2>什么是双住宅开发？</h2>
<p>双住宅开发是指在一块地上建造两套住宅——可以是相连的（并排）或独立的（一前一后）。与 Granny Flat 的主要区别在于：两套住宅通常可以分开进行产权分割（Strata）并单独出售，使双住宅成为真正的投资策略。</p>

<h2>双住宅何时被允许？</h2>
<p>这因州和 Council 而差异很大：</p>
<ul>
<li><strong>新南威尔士州：</strong>大多数 R2 低密度住宅区允许双住宅开发，可以是合规开发（如果地块足够大）或通过 DA 申请。最小地块通常为 400–600 平方米。查看你的 Council LEP。</li>
<li><strong>维多利亚州：</strong>ResCode 控制双住宅。大多数住宅区允许在 500 平方米以上的地块上建造两套住宅。邻里住宅区（NRZ）限制最严格。</li>
<li><strong>昆士兰州：</strong>双住宅（Duplex）通常在中低密度区允许。400 平方米最小值很常见，但因地而异。</li>
<li><strong>西澳大利亚州：</strong>R 代码允许 R20 及以上的双住宅，覆盖了大多数郊区。</li>
</ul>

<h2>数字对比：单栋 KDR vs 双住宅</h2>
<p>让我们用一个真实例子：悉尼西部一块 700 平方米的地，当前价值 90 万。</p>

<div class="overflow-x-auto"><table>
<thead><tr><th>项目</th><th>单栋 KDR（4 卧）</th><th>双住宅（2×3 卧）</th></tr></thead>
<tbody>
<tr><td>建设成本</td><td>$55 万</td><td>$78 万</td></tr>
<tr><td>拆除 + 场地</td><td>$4 万</td><td>$4 万</td></tr>
<tr><td>规划 + DA</td><td>$1.5 万</td><td>$2.5 万</td></tr>
<tr><td>项目总成本</td><td>$150.5 万</td><td>$174.5 万</td></tr>
<tr><td>竣工价值</td><td>$170 万</td><td>$210 万（2×$105 万）</td></tr>
<tr><td>创造的权益</td><td>$19.5 万</td><td>$35.5 万</td></tr>
<tr><td>租金回报（如持有）</td><td>~$2,800/周</td><td>~$1,450/周×2=$2,900/周</td></tr>
</tbody>
</table></div>

<p>从表面看，双住宅创造更多权益，租金回报相近。但风险更高：建设更复杂，DA 更长，出问题的可能性更多。</p>

<h2>双住宅的隐藏成本</h2>
<ul>
<li><strong>产权分割成本：</strong>每套住宅的产权分割费用 $1.5–2.5 万</li>
<li><strong>更长的 DA：</strong>双住宅 DA 通常比标准 KDR DA 多需要 3–6 个月</li>
<li><strong>更高的建设复杂性：</strong>共用墙、共用排水、隔音——都增加成本和协调难度</li>
<li><strong>融资复杂性：</strong>银行对双住宅建筑贷款可能更为谨慎</li>
<li><strong>出售时的资本利得税：</strong>如果这不是你的主要住所，出售利润需缴纳 CGT</li>
</ul>

<h2>谁应该考虑双住宅？</h2>
<p>双住宅在以下情况下有意义：地块确实足够大（大多数州 700 平方米以上），你能接受更复杂的项目和更长的时间线，你想保留一套住宅同时出售另一套以抵消成本，或者你是寻求更高回报的投资者，能够承担 24–30 个月项目期间的持有成本。</p>

<p>如果你主要想要一个压力最小的优质家庭住宅，一个设计良好的单栋 KDR 几乎总会带来更好的结果。在做决定之前，同时咨询城市规划师和贷款经纪人——各郊区的监管和财务状况差异很大。</p>
    `,
  },

  {
    slug: '7-star-energy-ncc-2022-kdr',
    title: '7-Star Energy Rating: What Every KDR Builder Must Do in 2026',
    titleZh: '7 星能效评级：2026 年每位 KDR 建筑商必须做到的',
    excerpt: 'NCC 2022 introduced mandatory 7-star NatHERS energy ratings for new homes. Here\'s exactly what that means for your build cost, design, and material choices.',
    excerptZh: 'NCC 2022 引入了新住宅强制性 7 星 NatHERS 能效评级。这对你的建设成本、设计和建材选择意味着什么。',
    category: 'construction',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-03-05',
    readMinutes: 6,
    tags: ['Energy Rating', 'NCC 2022', '7-Star', 'Sustainability', 'Building Code'],
    tagsZh: ['能效评级', 'NCC 2022', '7 星', '可持续', '建筑规范'],
    content: `
<p>If you're doing a knockdown rebuild in 2026, your new home must meet 7-star NatHERS (Nationwide House Energy Rating Scheme) requirements under NCC 2022. This isn't optional — it's a mandatory building code requirement enforced by your private certifier or council.</p>

<h2>What Changed with NCC 2022</h2>
<p>Before May 2023, the minimum standard was 6 stars. NCC 2022 raised this to 7 stars for the thermal envelope (heating and cooling energy) and introduced an additional requirement for an overall home energy budget (which includes hot water, lighting, and pool/spa equipment where applicable).</p>
<p>The practical effect: your builder and energy assessor need to work together from the design stage — retrofitting compliance late in the design process is expensive and disruptive.</p>

<h2>What Gets You to 7 Stars?</h2>
<p>A NatHERS energy assessor runs software simulations of your design. The rating depends on a combination of factors:</p>
<ul>
<li><strong>Insulation:</strong> Ceiling, wall, and underfloor insulation values (R-values)</li>
<li><strong>Glazing:</strong> Window-to-floor-area ratio, glass type (double-glazed vs single), and orientation</li>
<li><strong>Shading:</strong> Eaves, external blinds, and overhangs</li>
<li><strong>Air sealing:</strong> Reducing draughts reduces heating/cooling load</li>
<li><strong>Orientation:</strong> North-facing living areas and minimising east/west glass</li>
</ul>

<h2>Cost Impact on Your KDR</h2>
<p>Meeting 7-star adds approximately <strong>$8,000–$20,000</strong> to a typical build, depending on the design. The biggest cost drivers are:</p>
<ul>
<li>Double glazing throughout (adds ~$8,000–$15,000 vs single-glazed)</li>
<li>Additional ceiling insulation (usually R6.0+ in most climate zones)</li>
<li>Sealing and draught-proofing during construction</li>
</ul>
<p>However, the long-term energy savings are real. A well-rated home can reduce heating and cooling costs by 30–50% compared to a 5-star home. Over 10 years, that's often $15,000–$30,000 in savings.</p>

<h2>Common Pitfalls</h2>
<p><strong>Late assessment:</strong> Some builders get the energy assessment done after finalising plans, then discover compliance requires expensive changes. Get assessment done at concept stage.</p>
<p><strong>Window placement:</strong> Large west-facing windows are a common 7-star killer in warmer climates. Your architect or draftsperson should understand passive solar design principles.</p>
<p><strong>Ceiling fans and natural ventilation:</strong> These are underrated compliance helpers. A design with good cross-ventilation and ceiling fans in bedrooms can achieve 7 stars without expensive mechanical systems.</p>

<h2>Ask Your Builder These Questions</h2>
<ol>
<li>Do you work with an energy assessor from the design stage, or only at documentation?</li>
<li>What insulation spec do you use as your standard, and how does it compare to NCC minimum?</li>
<li>What glazing do you recommend for our climate zone, and what are the alternatives?</li>
<li>Can you show me energy assessments from similar recent builds?</li>
</ol>
    `,
    contentZh: `
<p>如果你在 2026 年进行推倒重建，你的新家必须符合 NCC 2022 规定的 7 星 NatHERS（全国住宅能效评级方案）要求。这不是可选的——这是由你的私人认证人员或 Council 强制执行的建筑规范要求。</p>

<h2>NCC 2022 改变了什么</h2>
<p>在 2023 年 5 月之前，最低标准是 6 星。NCC 2022 将热包络（供暖和制冷能耗）提高到 7 星，并引入了额外的总体家庭能耗预算要求（包括热水、照明，以及适用情况下的泳池/水疗设备）。</p>
<p>实际影响：你的建筑商和能效评估师需要从设计阶段开始合作——在设计过程后期才进行合规改造既昂贵又费事。</p>

<h2>如何达到 7 星？</h2>
<p>NatHERS 能效评估师运行软件模拟你的设计。评级取决于以下因素的组合：</p>
<ul>
<li><strong>隔热：</strong>天花板、墙壁和地板下的隔热值（R 值）</li>
<li><strong>玻璃：</strong>窗墙比、玻璃类型（双层 vs 单层）和朝向</li>
<li><strong>遮阳：</strong>屋檐、外部百叶和悬挑</li>
<li><strong>气密性：</strong>减少穿堂风可降低供暖/制冷负荷</li>
<li><strong>朝向：</strong>北向生活区和最小化东西向玻璃</li>
</ul>

<h2>对你的 KDR 建设成本的影响</h2>
<p>达到 7 星标准约为典型建设增加 <strong>$8,000–$20,000</strong>，具体取决于设计。最大的成本驱动因素是：</p>
<ul>
<li>全屋双层玻璃（与单层玻璃相比增加约 $8,000–$15,000）</li>
<li>额外天花板隔热（大多数气候区通常需要 R6.0 以上）</li>
<li>施工期间的密封和防穿堂风</li>
</ul>
<p>然而，长期的能源节省是真实的。与 5 星住宅相比，评级良好的住宅可以将供暖和制冷费用降低 30–50%。10 年内，通常可节省 $15,000–$30,000。</p>

<h2>常见误区</h2>
<p><strong>晚期评估：</strong>一些建筑商在完成设计后才进行能效评估，然后发现合规需要进行昂贵的修改。应在概念设计阶段就进行评估。</p>
<p><strong>窗户位置：</strong>大面积西向窗户是温暖气候中达到 7 星的常见障碍。你的建筑师或绘图员应该了解被动式太阳能设计原则。</p>
<p><strong>吊扇和自然通风：</strong>这些是被低估的合规助手。一个具有良好穿越通风和卧室吊扇的设计可以在没有昂贵机械系统的情况下达到 7 星。</p>

<h2>问你的建筑商这些问题</h2>
<ol>
<li>你是从设计阶段还是只在文件准备阶段与能效评估师合作？</li>
<li>你标准使用什么隔热规格，与 NCC 最低要求相比如何？</li>
<li>你为我们的气候区推荐什么玻璃，有哪些替代方案？</li>
<li>你能展示来自类似近期建设的能效评估报告吗？</li>
</ol>
    `,
  },

  {
    slug: 'what-delays-your-build',
    title: '7 Things That Will Delay Your KDR Build (And How to Avoid Them)',
    titleZh: '7 件会拖延你推倒重建的事（以及如何避免）',
    excerpt: 'Most KDR builds run over schedule. These are the seven most common causes of delay — and the steps you can take before you even sign a building contract to protect your timeline.',
    excerptZh: '大多数推倒重建项目都会超期。这是七个最常见的延误原因——以及在你签订建筑合同之前可以采取的保护时间线的步骤。',
    category: 'construction',
    author: 'Tom Richards',
    authorRole: 'Project Manager, 12 years KDR',
    authorRoleZh: '项目经理，12 年 KDR 经验',
    date: '2026-02-22',
    readMinutes: 7,
    tags: ['Timeline', 'Build Delays', 'Project Management', 'Builder', 'Construction'],
    tagsZh: ['时间线', '工期延误', '项目管理', '建筑商', '施工'],
    content: `
<p>A 14-month build that takes 22 months. That's not unusual — it's actually fairly common. And the consequences are real: rent costs, living disruption, holding costs on your loan. Here are the seven most common causes of KDR delay, and what you can do about each.</p>

<h2>1. DA Approval Longer Than Expected</h2>
<p>Councils routinely take longer than their published timeframes. Sydney metropolitan councils average 70–100+ days for DA determination, despite a 40-day statutory target. Heritage and complex sites can take 6–12 months.</p>
<p><strong>Fix:</strong> Start the DA process as early as possible. Consider a complying development certificate (CDC) where the project qualifies — CDCs are assessed by private certifiers and typically take 10–20 days. Engage a town planner who knows your council's requirements to avoid requests for additional information (RAIs) that pause the clock.</p>

<h2>2. Engineering and Soil Issues</h2>
<p>Reactive clay soil, underground water, old drainage infrastructure, or unexpected rock — these are discovered after demolition and can add $20,000–$80,000 in costs and 4–8 weeks of delay.</p>
<p><strong>Fix:</strong> Commission a geotechnical report before finalising your design and builder contract. It costs $1,500–$3,000 and can save multiples of that in surprises.</p>

<h2>3. Builder Capacity Problems</h2>
<p>The builder wins your job, then assigns an inexperienced site supervisor. Or they take on too many projects. Result: slow responses, long gaps between trades, poor coordination.</p>
<p><strong>Fix:</strong> Ask specifically who will be your site supervisor and how many active sites they're managing. Ask to speak to two or three recent clients before signing. Check that the builder's contract has a liquidated damages clause for delays.</p>

<h2>4. Variations and Scope Creep</h2>
<p>Changing your mind mid-build is the single biggest controllable cause of delay. A variation for a bathroom relocation can set back the frame by three weeks — each trade needs to be rescheduled.</p>
<p><strong>Fix:</strong> Make all decisions before signing the contract. Walk through a display home, review every fixture and fitting selection. Changes after contract signing cost double what they would have cost in the design phase.</p>

<h2>5. Trade Availability</h2>
<p>In 2026, experienced concreters, electricians, and tilers are still in high demand. A builder who doesn't have strong trade relationships may find themselves waiting weeks for key trades.</p>
<p><strong>Fix:</strong> Ask your builder about their trade relationships during the tender process. Builders with high-volume programs tend to have more reliable trade access. Look for builders who employ some trades directly (like their own concreters) rather than relying entirely on subcontractors.</p>

<h2>6. Neighbour and Authority Disputes</h2>
<p>Disputes about property boundaries, boundary fencing, tree removal, or dust and noise complaints can result in stop-work orders or significant neighbour negotiation delays.</p>
<p><strong>Fix:</strong> Commission a surveyor to identify boundary pegs before demolition. Communicate proactively with neighbours about the build timeline. Ensure your builder has a clear dust and waste management plan.</p>

<h2>7. Defects and Rework</h2>
<p>Nothing delays a build like having to redo work. Frame shrinkage, waterproofing failure, and tiling on uneven surfaces are common rework triggers.</p>
<p><strong>Fix:</strong> Appoint an independent building inspector at key stages (frame, pre-plaster, practical completion). It costs $600–$1,200 per inspection but catches problems when they're still cheap to fix.</p>
    `,
    contentZh: `
<p>一个计划 14 个月的建设项目实际花了 22 个月。这并不罕见——实际上相当普遍。后果是真实的：租金成本、生活干扰、贷款持有成本。以下是 KDR 延误的七个最常见原因，以及每个原因的应对方法。</p>

<h2>1. DA 审批时间比预期长</h2>
<p>Council 通常比其公布的时间框架花费更长时间。尽管法定目标是 40 天，悉尼都会区 Council 平均需要 70–100 天以上来确定 DA。遗产地点和复杂地点可能需要 6–12 个月。</p>
<p><strong>解决方案：</strong>尽早开始 DA 流程。在项目符合条件的情况下，考虑合规开发证书（CDC）——CDC 由私人认证人员评估，通常需要 10–20 天。聘请熟悉你所在 Council 要求的城市规划师，避免因额外信息请求（RAI）暂停计时。</p>

<h2>2. 工程和土壤问题</h2>
<p>膨胀黏土、地下水、旧排水设施或意外岩石——这些在拆除后才被发现，可能增加 $2–8 万的费用和 4–8 周的延误。</p>
<p><strong>解决方案：</strong>在完成设计和与建筑商签约之前委托岩土工程报告。费用 $1,500–$3,000，可以节省数倍的意外支出。</p>

<h2>3. 建筑商产能问题</h2>
<p>建筑商赢得你的项目，然后指派一名缺乏经验的工地监督员。或者他们承接了太多项目。结果：响应慢、工种之间长时间间隔、协调不良。</p>
<p><strong>解决方案：</strong>具体询问谁将是你的工地监督员，以及他们管理多少个活跃工地。在签约前要求与两三个近期客户交谈。确认建筑商合同中有关于延误的违约金条款。</p>

<h2>4. 变更和范围蔓延</h2>
<p>在施工过程中改变想法是最大的可控延误原因。浴室重新定位的一个变更可能使框架推迟三周——每个工种都需要重新安排。</p>
<p><strong>解决方案：</strong>在签约前做好所有决定。参观展示房，审查每一个固定装置和配件选择。签约后的变更成本是设计阶段的两倍。</p>

<h2>5. 工种可用性</h2>
<p>到 2026 年，经验丰富的混凝土工、电工和贴砖工仍然需求旺盛。没有强大工种关系的建筑商可能发现自己在等待关键工种数周。</p>
<p><strong>解决方案：</strong>在招标过程中询问建筑商关于其工种关系。高产量项目的建筑商往往有更可靠的工种获取渠道。寻找直接雇用部分工种（如自己的混凝土工）的建筑商，而非完全依赖分包商。</p>

<h2>6. 邻居和机构纠纷</h2>
<p>关于产权边界、边界围栏、树木移除或尘土噪音投诉的纠纷可能导致停工令或重大邻居协商延误。</p>
<p><strong>解决方案：</strong>在拆除前委托测量师确认边界桩。主动与邻居沟通建设时间线。确保你的建筑商有明确的尘土和废物管理计划。</p>

<h2>7. 缺陷和返工</h2>
<p>没有什么比返工更能拖延建设。框架收缩、防水失败和不平整表面的贴砖是常见的返工触发因素。</p>
<p><strong>解决方案：</strong>在关键阶段（框架、预石膏板、实际完工）委任独立建筑检查员。每次检查费用 $600–$1,200，但能在问题便宜修复时及时发现。</p>
    `,
  },

  {
    slug: 'box-hill-townhouse-development',
    title: 'Box Hill Townhouse: How One Family Turned a Single Block Into Four Homes',
    titleZh: 'Box Hill 联排别墅：一家人如何把一块地变成四套住宅',
    excerpt: 'The Chen family\'s journey from a single-storey fibro home on a 900m² Box Hill block to four modern townhouses — the numbers, the challenges, and what they\'d do differently.',
    excerptZh: '陈家从 Box Hill 一块 900 平方米地上的单层旧屋，到四套现代联排别墅的历程——数字、挑战，以及他们如果重来会怎么做。',
    category: 'stories',
    author: 'KDR Guide Editorial',
    authorRole: 'Editorial Team',
    authorRoleZh: '编辑团队',
    date: '2026-02-15',
    readMinutes: 10,
    tags: ['Success Story', 'Townhouses', 'Box Hill', 'Development', 'Investment'],
    tagsZh: ['成功案例', '联排别墅', 'Box Hill', '开发', '投资'],
    content: `
<p>In 2023, the Chen family owned a 1960s fibro home on a 900m² block in Box Hill — one of Melbourne's most sought-after growth corridors. Their parents had bought the block in 1989 for $85,000. By the time they started planning, the land alone was worth $1.4 million.</p>

<h2>The Initial Question</h2>
<p>James Chen, the eldest son, posed the question that started everything: "We could renovate, we could sell, or we could build. But what if we built four townhouses?" It took a year of planning to find out whether that was even possible.</p>

<h2>The Zoning Check</h2>
<p>Box Hill falls within the City of Whitehorse. A town planner confirmed the block was zoned General Residential Zone Schedule 1 (GRZ1), which allows medium-density development with council permission. The 900m² size — well above Whitehorse's 250m² minimum per dwelling for townhouses — made four dwellings viable in principle.</p>
<p>However, the block had a significant challenge: a 3-metre easement along the rear boundary and a protected native tree near the centre, which an arborist assessed as having a 6-metre Tree Protection Zone.</p>

<h2>The Design Process</h2>
<p>Working with a local architect experienced in Whitehorse, the Chens spent five months developing plans that worked around the tree and easement. The final design: four 3-bedroom, 2.5-bathroom townhouses arranged in a U-shape, with shared visitor parking at the front.</p>
<p>Total gross floor area per townhouse: 180m². Each with a private courtyard, single garage, and storage.</p>

<h2>The Numbers</h2>
<table>
<thead><tr><th>Item</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Town planner & architect</td><td>$65,000</td></tr>
<tr><td>Planning permit (DA)</td><td>$8,200</td></tr>
<tr><td>Demolition</td><td>$48,000</td></tr>
<tr><td>Construction (4 townhouses)</td><td>$1,940,000</td></tr>
<tr><td>Landscaping & fencing</td><td>$62,000</td></tr>
<tr><td>Strata titling (4 lots)</td><td>$42,000</td></tr>
<tr><td>Finance costs (construction loan)</td><td>$89,000</td></tr>
<tr><td>Contingency used</td><td>$67,000</td></tr>
<tr><td><strong>Total project cost</strong></td><td><strong>$2,321,200</strong></td></tr>
</tbody>
</table>
<p>Add land value ($1.4M) and total cost is $3.72M. Final valuations on completion (mid-2025): each townhouse valued at $1.05M = <strong>$4.2M total</strong>. Equity created: approximately $480,000.</p>

<h2>What Took Longest</h2>
<p>The planning permit took 11 months — significantly longer than the 60-day expectation. An objection from a neighbour about overlooking triggered a revised design and an additional two months of council review. The tree protection zone also required an arborist report at multiple stages.</p>
<p>"We thought 6 months, it took 11. That was the biggest surprise," James said. "But once we got the permit, the build itself went relatively smoothly."</p>

<h2>What They'd Do Differently</h2>
<ul>
<li><strong>Commission the geotechnical report earlier.</strong> They discovered reactive clay soil during excavation, requiring a more expensive raft slab. Cost: additional $34,000.</li>
<li><strong>Communicate with the neighbours before lodging.</strong> The objection from next door was a surprise and could likely have been avoided with early conversation and design adjustments.</li>
<li><strong>Lock in the builder earlier.</strong> Their preferred builder was fully booked; they waited 6 months for a slot to open up. That was 6 months of holding costs on the loan.</li>
</ul>

<h2>The Outcome</h2>
<p>The family retained two townhouses (one for James, one for his parents) and sold two. The sale of those two units — at $1.05M each — effectively paid for the entire project, leaving the family with two debt-free properties valued at $2.1M combined.</p>
<p>"We started with one old house worth $1.4M including land. We ended up with two new townhouses worth $2.1M, debt-free. That's what good planning can do." — James Chen</p>
    `,
    contentZh: `
<p>2023 年，陈家在 Box Hill 拥有一栋 900 平方米地块上的 1960 年代石棉瓦旧房——这里是墨尔本最受追捧的增长走廊之一。他们的父母在 1989 年以 8.5 万买下这块地。到他们开始规划时，仅地皮就价值 140 万。</p>

<h2>最初的问题</h2>
<p>大儿子陈炜提出了引发一切的问题："我们可以翻新、可以出售，或者我们可以建房。但如果我们建四套联排别墅呢？"花了一年时间规划，才弄清楚这是否可行。</p>

<h2>分区核查</h2>
<p>Box Hill 属于 Whitehorse 市政区。一位城市规划师确认该地块被划为通用住宅区 GRZ1，允许经 Council 批准的中密度开发。900 平方米的面积——远超 Whitehorse 对联排别墅每套 250 平方米的最低要求——原则上使四套住宅成为可行方案。</p>
<p>然而，地块有一个重大挑战：后边界有一条 3 米宽的地役权，中间附近有一棵受保护的当地树木，树艺师评估其树木保护区为 6 米。</p>

<h2>设计过程</h2>
<p>与一位熟悉 Whitehorse 的本地建筑师合作，陈家花了五个月时间开发绕过树木和地役权的设计方案。最终设计：四套 3 卧室 2.5 浴室联排别墅，排列成 U 形，前面设有共用访客停车位。</p>
<p>每套联排别墅总建筑面积：180 平方米。每套都有私人庭院、单车库和储藏室。</p>

<h2>数字详情</h2>
<table>
<thead><tr><th>项目</th><th>费用</th></tr></thead>
<tbody>
<tr><td>城市规划师和建筑师</td><td>$6.5 万</td></tr>
<tr><td>规划许可（DA）</td><td>$8,200</td></tr>
<tr><td>拆除</td><td>$4.8 万</td></tr>
<tr><td>施工（4 套联排）</td><td>$194 万</td></tr>
<tr><td>园林和围栏</td><td>$6.2 万</td></tr>
<tr><td>产权分割（4 个地块）</td><td>$4.2 万</td></tr>
<tr><td>融资成本（建筑贷款）</td><td>$8.9 万</td></tr>
<tr><td>使用的应急储备</td><td>$6.7 万</td></tr>
<tr><td><strong>项目总成本</strong></td><td><strong>$232.12 万</strong></td></tr>
</tbody>
</table>
<p>加上地皮价值（140 万），总成本 372 万。竣工时（2025 年中）最终估值：每套联排估值 105 万 = <strong>总计 420 万</strong>。创造的权益：约 48 万。</p>

<h2>耗时最长的事</h2>
<p>规划许可花了 11 个月——远超预期的 60 天。一位邻居关于俯瞰问题的反对意见触发了设计修改，以及额外两个月的 Council 审查。树木保护区还需要在多个阶段提交树艺师报告。</p>
<p>"我们以为 6 个月，结果花了 11 个月。这是最大的意外，"陈炜说。"但一旦获得许可，建设本身就相对顺利了。"</p>

<h2>如果重来他们会怎么做</h2>
<ul>
<li><strong>更早委托岩土工程报告。</strong>他们在挖掘过程中发现了膨胀黏土，需要更昂贵的筏形基础。额外费用：$3.4 万。</li>
<li><strong>在提交申请前与邻居沟通。</strong>隔壁邻居的反对是个意外，通过早期沟通和设计调整可能可以避免。</li>
<li><strong>更早锁定建筑商。</strong>他们首选的建筑商档期全满；他们等了 6 个月才有档期。那是 6 个月的贷款持有成本。</li>
</ul>

<h2>最终结果</h2>
<p>家人保留了两套联排（一套给陈炜，一套给父母），出售了两套。出售这两套——每套 105 万——实际上支付了整个项目的费用，让家人拥有两套合计估值 210 万的无债务房产。</p>
<p>"我们从一栋含地皮价值 140 万的旧房开始。最终得到两套价值 210 万、无债务的新联排别墅。这就是良好规划的力量。" —— 陈炜</p>
    `,
  },
]
