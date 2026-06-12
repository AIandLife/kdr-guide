/**
 * Programmatic suburb guide page (SEO/AEO).
 * Fully static, read-only: rendered from the council dataset at build time.
 * No DB access, no /api/feasibility calls — see src/lib/area-pages.ts.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteNav } from '@/components/SiteNav'
import { AREAS, getArea, nearbyAreas } from '@/lib/area-pages'

export const dynamic = 'force-static'
export const revalidate = 86400

type Params = Promise<{ state: string; suburb: string }>

export function generateStaticParams() {
  return AREAS.map(a => ({ state: a.stateSlug, suburb: a.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state, suburb } = await params
  const area = getArea(state, suburb)
  if (!area) return {}
  const c = area.council
  const title = `Knockdown Rebuild, Granny Flats & Duplex in ${area.suburb} ${area.state} — Rules, Costs & Approvals | AusBuildCircle`
  const description = `Building in ${area.suburb} (${c.council}): minimum lot ${c.minLotSize}㎡ for KDR, max height ${c.maxHeight}m, DA approvals ${c.daTimelineWeeks[0]}–${c.daTimelineWeeks[1]} weeks, build cost $${c.avgBuildCostPerSqm[0]}–$${c.avgBuildCostPerSqm[1]}/㎡. Free AI feasibility report for your block.`
  const url = `https://ausbuildcircle.com/areas/${area.stateSlug}/${area.slug}`
  return {
    title,
    description,
    alternates: { canonical: `/areas/${area.stateSlug}/${area.slug}` },
    openGraph: { title, description, url, siteName: 'AusBuildCircle 澳洲建房圈', type: 'website' },
  }
}

function Risk({ label, level }: { label: string; level: 'Low' | 'Medium' | 'High' }) {
  const cls = level === 'Low' ? 'bg-green-100 text-green-700' : level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${cls}`}>
      {label}: {level}
    </span>
  )
}

export default async function AreaPage({ params }: { params: Params }) {
  const { state, suburb } = await params
  const area = getArea(state, suburb)
  if (!area) notFound()
  const c = area.council
  const nearby = nearbyAreas(area)
  const ctaHref = `/feasibility?suburb=${encodeURIComponent(area.suburb)}&state=${area.state}`

  const faqs = [
    {
      q: `Can I knock down and rebuild in ${area.suburb}?`,
      a: `Generally yes — ${c.council} requires a minimum lot of around ${c.minLotSize}㎡ for a standard knockdown rebuild, with a maximum building height of ${c.maxHeight}m. ${c.cdcEligible ? 'Fast-track CDC approval is available for fully compliant designs.' : 'Most projects need a full DA (development application).'}`,
    },
    {
      q: `How long does council approval take in ${area.suburb}?`,
      a: `A DA through ${c.council} typically takes ${c.daTimelineWeeks[0]}–${c.daTimelineWeeks[1]} weeks in practice.${c.cdcEligible ? ' A compliant CDC pathway is usually around 2–4 weeks instead.' : ''}`,
    },
    {
      q: `How much does it cost to build in ${area.suburb}?`,
      a: `Typical build costs around ${area.suburb} run $${c.avgBuildCostPerSqm[0].toLocaleString()}–$${c.avgBuildCostPerSqm[1].toLocaleString()} per square metre of floor area, plus demolition of roughly $${c.avgDemolitionCost[0].toLocaleString()}–$${c.avgDemolitionCost[1].toLocaleString()}. These are indicative ranges, not quotes.`,
    },
    {
      q: `Can I build a granny flat in ${area.suburb}?`,
      a: area.state === 'NSW'
        ? `In NSW, a secondary dwelling (granny flat) of up to 60㎡ can usually be approved via fast-track CDC on lots of 450㎡ or more, subject to overlays such as heritage, flood and bushfire.`
        : `Most ${area.state} councils allow secondary dwellings subject to lot size and overlay rules — check ${c.council}'s planning scheme or run a free feasibility report.`,
    },
    {
      q: `What are the main risks for building projects in ${area.suburb}?`,
      a: `For the ${c.council} area: heritage risk is ${c.heritageRisk.toLowerCase()}, flood risk is ${c.floodRisk.toLowerCase()}, bushfire risk is ${c.bushfireRisk.toLowerCase()}. ${c.notes}`,
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Areas', item: 'https://ausbuildcircle.com/areas' },
          { '@type': 'ListItem', position: 2, name: area.state, item: `https://ausbuildcircle.com/areas#${area.stateSlug}` },
          { '@type': 'ListItem', position: 3, name: area.suburb, item: `https://ausbuildcircle.com/areas/${area.stateSlug}/${area.slug}` },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav currentPath="/areas" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/areas" className="hover:text-gray-700">Areas</Link>
          <span className="mx-2">/</span>
          <span>{area.state}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{area.suburb}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Building in {area.suburb}: Knockdown Rebuild, Granny Flat & Duplex Guide
        </h1>
        <p className="text-gray-500 mt-3">
          {c.council} ({area.state}) · Indicative rules and costs for homeowners · 中文报告同样支持
        </p>

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
          {[
            ['Min lot (KDR)', `${c.minLotSize}㎡`],
            ['Max height', `${c.maxHeight}m`],
            ['Setbacks (front/side)', `${c.minSetbackFront}m / ${c.minSetbackSide}m`],
            ['DA timeline', `${c.daTimelineWeeks[0]}–${c.daTimelineWeeks[1]} wks`],
            ['Fast-track CDC', c.cdcEligible ? 'Often available' : 'Usually DA only'],
            ['Build cost', `$${c.avgBuildCostPerSqm[0]}–$${c.avgBuildCostPerSqm[1]}/㎡`],
          ].map(([k, v]) => (
            <div key={k} className="bg-orange-50/60 border border-orange-100 rounded-xl p-4">
              <p className="text-xs text-gray-500">{k}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{v}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          📊 Indicative ranges from council planning controls and recent market data — not quotes, and individual blocks vary.
        </p>

        {/* Risks */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Risk label="Heritage" level={c.heritageRisk} />
          <Risk label="Flood" level={c.floodRisk} />
          <Risk label="Bushfire" level={c.bushfireRisk} />
        </div>
        <p className="text-sm text-gray-600 mt-3 bg-gray-50 border border-gray-100 rounded-xl p-4">{c.notes}</p>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-xl sm:text-2xl font-bold">What can YOUR block in {area.suburb} fit?</h2>
          <p className="text-orange-50 mt-2 text-sm sm:text-base">
            Enter your street address and our AI checks the official cadastre (your measured lot size), zoning, heritage and flood overlays — then gives you costs, approval pathway and next steps. Free, 2 minutes, no signup. 支持中文。
          </p>
          <Link href={ctaHref} className="inline-block mt-4 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
            Get my free feasibility report →
          </Link>
        </div>

        {/* FAQs (rendered + JSON-LD above) */}
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently asked questions — {area.suburb}</h2>
        <div className="space-y-4">
          {faqs.map(f => (
            <details key={f.q} className="bg-white border border-gray-200 rounded-xl p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none">{f.q}</summary>
              <p className="text-gray-600 mt-3 leading-relaxed text-sm">{f.a}</p>
            </details>
          ))}
        </div>

        {/* Nearby */}
        {nearby.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mt-12 mb-3">Nearby areas under {c.council}</h2>
            <div className="flex flex-wrap gap-2">
              {nearby.map(n => (
                <Link key={n.slug} href={`/areas/${n.stateSlug}/${n.slug}`}
                  className="text-sm bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-700 px-3 py-1.5 rounded-full transition-colors">
                  {n.suburb}
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-12 leading-relaxed">
          This page provides general guidance for the {c.council} area and is not advice about any specific property.
          Planning controls change — always confirm with council or run a block-specific feasibility report.
          © {new Date().getFullYear()} AusBuildCircle 澳洲建房圈.
        </p>
      </main>
    </div>
  )
}
