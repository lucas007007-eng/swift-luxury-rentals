'use client'

import Link from 'next/link'

export default function EngineeringPlaybooksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Engineering Playbooks</h1>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Plan‑first (Smallest Possible Edit)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-white/80">
              <li>Define the acceptance check and rollback plan.</li>
              <li>List exact files to touch; limit scope to 1 concern.</li>
              <li>Search narrowly; open only related files.</li>
              <li>Ask AI for a minimal edit; keep diffs small.</li>
              <li>Run fast feedback (typecheck/tests/lint), then commit.</li>
            </ol>
          </section>

          <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Refactor Discipline</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>No behavior changes; keep API stable.</li>
              <li>One concern per edit; PRs under 300 changed lines.</li>
              <li>Introduce tests before reshaping code.</li>
              <li>Prefer extraction over in‑place rewrites.</li>
              <li>Revert quickly if green fails for &gt; 5 minutes.</li>
            </ul>
          </section>

          <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Testing Workflow</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>Table‑driven unit tests for core logic.</li>
              <li>Edge cases first: empties, nulls, extremes, ordering.</li>
              <li>Golden fixtures for APIs; update via script.</li>
              <li>Watch mode always on during refactors.</li>
            </ul>
          </section>

          <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Rollback & Safety</h2>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>Create a restore point before risky edits.</li>
              <li>Feature flags for runtime toggles.</li>
              <li>Always log new error paths with clear context.</li>
              <li>Document the rollback command in the PR.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}


