import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PROFESSIONALS, CATEGORIES, STATE_INFO } from '@/lib/professionals-data'
import { StateProfessionalsClient } from './StateProfessionalsClient'

const VALID_STATES = ['nsw', 'vic', 'qld', 'wa', 'sa', 'act', 'tas', 'nt']

export function generateStaticParams() {
  return VALID_STATES.map(state => ({ state }))
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params
  const s = state.toUpperCase()
  const info = STATE_INFO[s]
  if (!info) return {}
  const count = PROFESSIONALS.filter(p => p.state === s || p.regions.includes('All Australia')).length
  return {
    title: `KDR Professionals in ${info.name} (${s}) — Builders, Designers & Planners | KDR Guide`,
    description: `Find verified knockdown rebuild specialists in ${info.name}. ${count}+ builders, building designers, town planners, finance brokers and engineers serving ${info.city} and surrounds.`,
    alternates: { canonical: `/professionals/${state}` },
    openGraph: {
      title: `KDR Professionals in ${info.name}`,
      description: info.blurb,
    },
  }
}

export default async function StateProfessionalsPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const s = state.toUpperCase()
  if (!VALID_STATES.includes(state.toLowerCase())) notFound()
  const info = STATE_INFO[s]
  if (!info) notFound()

  const pros = PROFESSIONALS.filter(p => p.state === s || p.regions.includes('All Australia'))
  const cats = CATEGORIES

  return <StateProfessionalsClient state={s} info={info} professionals={pros} categories={cats} />
}
