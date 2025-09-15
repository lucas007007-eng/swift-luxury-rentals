'use client'

import Link from 'next/link'

const days: { title: string; bullets: string[] }[] = [
  { title: 'Day 1 — Environment mastery', bullets: [
    'Customize keybindings; map AI edit/compose/search to single keys.',
    'Create a one‑pager repo map and quick commands.',
    'Set up Saved Prompts for repeatable refactors and reviews.',
  ]},
  { title: 'Day 2 — Surgical editing speed', bullets: [
    'Drill multi‑cursor, structural selections, regex replace.',
    'Practice minimal diffs with AI edit‑in‑place.',
    'Build 5 personal code‑mod prompts.',
  ]},
  { title: 'Day 3 — Codebase navigation and context', bullets: [
    'Perfect semantic search queries; narrow by directory.',
    'Create context checklists: feature build, bugfix, large refactor.',
    'Write repo FAQ: auth, data models, error handling.',
  ]},
  { title: 'Day 4 — AI‑assisted testing', bullets: [
    'Standardize test scaffolds; prioritize edge cases.',
    'Generate tests with AI; harden fixtures and assertions.',
    'Run in watch; keep green during refactors.',
  ]},
  { title: 'Day 5 — Refactor discipline', bullets: [
    'Run two medium refactors end‑to‑end with plan → tests → docs.',
    'One concern per edit; revert fast; PRs < 300 lines.',
    'Capture a reusable refactor checklist for PRs.',
  ]},
  { title: 'Day 6 — Performance and reliability', bullets: [
    'Add lightweight tracing/logging helpers.',
    'Benchmark micro‑optimizations before accepting.',
    'Codify a rollback plan; script quick restores.',
  ]},
  { title: 'Day 7 — Capstone speedrun', bullets: [
    'Ship one meaningful feature in a single sitting.',
    'Record timings; tighten prompts and shortcuts.',
    'Write a short postmortem; save best prompts.',
  ]},
]

export default function WeekPlanPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">7‑Day Cursor Mastery Plan</h1>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {days.map((d) => (
            <section key={d.title} className="rounded-2xl p-6 border border-white/10 bg-white/5">
              <h2 className="text-lg font-semibold mb-3">{d.title}</h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80">
                {d.bullets.map((b) => (<li key={b}>{b}</li>))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}


