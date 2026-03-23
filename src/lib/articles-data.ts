export type ArticleCategory =
  | 'planning'
  | 'finance'
  | 'construction'
  | 'zoning'
  | 'stories'
  | 'materials'

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
  planning: { en: 'Planning & Approvals', zh: '规划与审批', color: 'blue' },
  finance: { en: 'Finance', zh: '贷款与费用', color: 'green' },
  construction: { en: 'Construction', zh: '建筑施工', color: 'orange' },
  zoning: { en: 'Land & Zoning', zh: '土地与分区', color: 'purple' },
  stories: { en: 'Real Stories', zh: '真实案例', color: 'pink' },
  materials: { en: 'Materials & Products', zh: '建材与产品', color: 'cyan' },
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
]
