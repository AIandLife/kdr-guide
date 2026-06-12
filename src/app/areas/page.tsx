/** /areas index — static directory of all suburb guide pages (read-only). */
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { AREAS, STATES_IN_AREAS } from '@/lib/area-pages'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Building Rules & Costs by Suburb — Knockdown Rebuild, Granny Flats, Duplex | AusBuildCircle',
  description:
    'Suburb-by-suburb guides for Australian homeowners: council rules, minimum lot sizes, approval timelines and indicative build costs for knockdown rebuilds, granny flats and dual occupancy.',
  alternates: { canonical: '/areas' },
}

export default function AreasIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav currentPath="/areas" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Building guides by suburb</h1>
        <p className="text-gray-500 mt-3 max-w-2xl">
          Council rules, minimum lot sizes, approval timelines and indicative costs — suburb by suburb.
          For your exact block, run a <Link href="/feasibility" className="text-orange-600 font-medium hover:underline">free AI feasibility report</Link>.
        </p>

        {STATES_IN_AREAS.map(state => (
          <section key={state} id={state.toLowerCase()} className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{state}</h2>
            <div className="flex flex-wrap gap-2">
              {AREAS.filter(a => a.state === state).map(a => (
                <Link key={`${a.stateSlug}-${a.slug}`} href={`/areas/${a.stateSlug}/${a.slug}`}
                  className="text-sm bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-700 px-3 py-1.5 rounded-full transition-colors">
                  {a.suburb}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
