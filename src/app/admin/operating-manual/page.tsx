'use client'

import Link from 'next/link'

export default function OperatingManualPage() {
  const principles = [
    'Outcome-first: design to user behavior (not implementation).',
    'Short loops: ship → verify on real pages → iterate.',
    'Single source of truth: admin overrides reflect immediately in UI.',
    'Reversible moves: backup + tag before risky edits.',
    'Measure prod behavior: avoid cache surprises and hydration drift.'
  ]

  const definitionOfDone = [
    'Works on city and property pages with live data (overrides + base).',
    'No hydration/caching regressions (normal refresh shows changes).',
    'Mobile-friendly (buttons touch targets ≥ 44px, no clipped content).',
    'Accessible labels on controls; semantic buttons/links.',
    'Added to Accomplishments and a restore point is created.'
  ]

  const qaSmoke = [
    'City filter: select 1 amenity (e.g., Heating) → results > 0 & button count matches.',
    'Bedrooms/Bathrooms toggles reflect in results immediately.',
    'Admin amenity change on berlin-real-1 appears on property page and in filter.',
    'Normal refresh shows new code/content without Ctrl+F5.',
    'Open listing → gallery modal → arrow keys, close button work.'
  ]

  const releaseChecklist = [
    'Run backup-site.ps1 and tag commit.',
    'Verify /api/health and build succeeds.',
    'Quick E2E smoke: search → filter → listing → request.',
    'Update Accomplishments if new features shipped.',
    'Post short release notes.'
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Operating Manual (Short)</h1>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
        </div>

        <section className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Principles</h2>
          <ul className="space-y-2 text-white/80 list-disc pl-5">
            {principles.map((p)=> (<li key={p}>{p}</li>))}
          </ul>
        </section>

        <section className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Definition of Done</h2>
          <ul className="space-y-2 text-white/80 list-disc pl-5">
            {definitionOfDone.map((p)=> (<li key={p}>{p}</li>))}
          </ul>
        </section>

        <section className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">QA Smoke (5 checks)</h2>
          <ul className="space-y-2 text-white/80 list-decimal pl-5">
            {qaSmoke.map((p)=> (<li key={p}>{p}</li>))}
          </ul>
        </section>

        <section className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Release Checklist</h2>
          <ul className="space-y-2 text-white/80 list-disc pl-5">
            {releaseChecklist.map((p)=> (<li key={p}>{p}</li>))}
          </ul>
        </section>

        <p className="text-white/50 text-sm">Keep it short, verifiable, and reversible.</p>
      </div>
    </main>
  )
}





