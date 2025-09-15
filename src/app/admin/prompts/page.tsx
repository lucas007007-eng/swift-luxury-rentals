'use client'

import Link from 'next/link'

const prompts = [
  'Make the smallest possible edit to achieve X; show only changed lines.',
  'Plan-first: list files to touch, risks, and a 3-step path. Then wait.',
  'Before coding, write 5 tests that would fail now and pass after.',
  'Refactor without behavior change; preserve existing API surface.',
  'Find all call sites of X; categorize by risk and propose safe sequence.',
  'Explain the data flow from request to DB for endpoint Y.',
]

export default function SavedPromptsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved Prompts</h1>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
        </div>

        <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
          <ul className="space-y-3">
            {prompts.map((p) => (
              <li key={p} className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-4 flex items-start justify-between gap-4">
                <span className="text-white/90">{p}</span>
                <button
                  className="shrink-0 text-xs px-2 py-1 rounded border border-emerald-400/30 text-emerald-300 hover:text-emerald-200"
                  onClick={() => {
                    try { navigator.clipboard.writeText(p) } catch {}
                  }}
                >Copy</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}


