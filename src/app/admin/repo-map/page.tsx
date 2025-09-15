'use client'

import Link from 'next/link'

export default function RepoMapPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Repository Map</h1>
          <Link href="/admin" className="text-amber-400 hover:text-amber-300">← Back to Admin</Link>
        </div>

        <section className="rounded-2xl p-6 border border-white/10 bg-white/5 mb-6">
          <h2 className="text-lg font-semibold mb-2">High Level</h2>
          <ul className="list-disc pl-5 space-y-1 text-white/80">
            <li><code>src/app</code>: Next.js App Router pages and APIs</li>
            <li><code>src/components</code>: Reusable UI (Header, Hero, Maps, Admin widgets)</li>
            <li><code>src/data</code>: Property and city data</li>
            <li><code>prisma</code>: Schema, migrations, seed</li>
            <li><code>public</code>: Static assets, service worker</li>
          </ul>
        </section>

        <section className="rounded-2xl p-6 border border-white/10 bg-white/5 mb-6">
          <h2 className="text-lg font-semibold mb-2">Key Commands</h2>
          <div className="space-y-2 text-white/80">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="font-mono text-sm">Start (Desktop)</div>
              <div className="text-xs opacity-80">start-server-desktop.bat → port 3002</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="font-mono text-sm">Start (Fallback)</div>
              <div className="text-xs opacity-80">npm run dev -- --port 3002</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-6 border border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold mb-2">Admin Surfaces</h2>
          <ul className="list-disc pl-5 space-y-1 text-white/80">
            <li><code>/admin</code>: Dashboard (CRM, metrics, radar map)</li>
            <li><code>/admin/bookings</code>: Booking operations</li>
            <li><code>/admin/city/[city]</code>: City management (listings)</li>
            <li><code>/admin/operating-manual</code>: Operating principles</li>
            <li><code>/admin/playbooks</code>, <code>/admin/prompts</code>, <code>/admin/week-plan</code>: Productivity toolkit</li>
          </ul>
        </section>
      </div>
    </main>
  )
}


