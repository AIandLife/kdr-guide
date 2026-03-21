'use client'

import { useState } from 'react'
import {
  Building2, ArrowLeft, CheckCircle, ChevronDown, ChevronRight,
  ClipboardList, Ruler, FileText, Hammer, Zap, Home, DollarSign
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/language-context'
import { translations } from '@/lib/i18n'
import { LangToggle } from '@/components/LangToggle'

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
      { title: 'Calculate total project cost', detail: 'Include: Demolition ($15k-40k), new build ($1,800-$5,000/sqm depending on state), council fees, DA/CDC costs, consultant fees, landscaping, connections, contingency (10-15%).' },
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
      { title: 'CDC (Complying Development Certificate) — Faster path', detail: 'If your build meets all the rules as of right, a CDC can be approved by a private certifier in as little as 10 business days. No council involvement. Cost: ~$3,000-8,000. Available in NSW and some VIC zones.' },
      { title: 'DA (Development Application) — Full council review', detail: 'Required if CDC isn\'t available or your design doesn\'t comply. Council has 40-60 business days to decide (NSW). Heritage items, non-standard designs, or neighbour objections can extend this significantly.' },
      { title: 'Pre-DA meeting', detail: 'Highly recommended for complex sites. Most councils offer a pre-lodgement meeting where planners tell you the issues before formal submission. Saves time and money.' },
      { title: 'Neighbour notifications', detail: 'DAs are publicly notified. Neighbours can object. Heritage and dual occupancy proposals attract the most objections. Build good relationships with neighbours early.' },
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
      { title: 'Demolition permit', detail: 'Separate demolition permit required from council in most states. Submit before DA approval to save time. Include an asbestos survey for pre-1990 homes.' },
      { title: 'Asbestos testing and removal', detail: 'Pre-1987 homes often contain asbestos in fibro sheeting, floor tiles, and roof sheeting. Licensed asbestos removalist required. Cost: $3,000-$20,000+ depending on extent.' },
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
      { title: 'Statutory warranty period', detail: 'In NSW: 6 years for major defects, 2 years for other defects. Builder must fix warranty issues within these periods. Document everything in writing.' },
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

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',   badge: 'bg-blue-500/20 text-blue-400' },
  green:   { bg: 'bg-green-500/10',   text: 'text-green-400',   border: 'border-green-500/20',  badge: 'bg-green-500/20 text-green-400' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20', badge: 'bg-purple-500/20 text-purple-400' },
  yellow:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  border: 'border-yellow-500/20', badge: 'bg-yellow-500/20 text-yellow-400' },
  red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',    badge: 'bg-red-500/20 text-red-400' },
  orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20', badge: 'bg-orange-500/20 text-orange-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20',badge: 'bg-emerald-500/20 text-emerald-400' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',   badge: 'bg-cyan-500/20 text-cyan-400' },
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

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">{t.nav.brand}</span>
          </a>
          <div className="flex items-center gap-3">
            <LangToggle />
            <a href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.nav.home}
            </a>
            <a href="/feasibility" className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">{t.guide.h1}</h1>
          <p className="text-gray-400 text-lg">{t.guide.subtitle}</p>
        </div>

        {/* Overview timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 overflow-x-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.guide.overviewLabel}</h2>
          <div className="flex items-center gap-2 min-w-max">
            {STAGES.map((stage, i) => {
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
                  {i < STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-gray-700 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stages accordion */}
        <div className="space-y-4">
          {STAGES.map(stage => {
            const c = COLOR_MAP[stage.color]
            const isOpen = openStages.includes(stage.id)
            return (
              <div key={stage.id} className={cn('bg-gray-900 border rounded-2xl overflow-hidden transition-all', isOpen ? c.border : 'border-gray-800')}>
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
                      <span className="text-xs text-gray-600">{stage.duration}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white">{stage.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{stage.summary}</p>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-gray-500 shrink-0 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="h-px bg-gray-800 mb-4" />
                    {stage.steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', c.bg)}>
                          <CheckCircle className={cn('w-4 h-4', c.text)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-br from-orange-900/30 to-gray-900 border border-orange-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{t.guide.ctaTitle}</h2>
          <p className="text-gray-400 mb-6">{t.guide.ctaSubtitle}</p>
          <a href="/feasibility" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            {t.guide.ctaBtn}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
