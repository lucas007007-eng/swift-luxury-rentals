'use client'

import React from 'react'
import Link from 'next/link'

export default function AdminPagesList() {
  const [pages, setPages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async()=>{
      try {
        const res = await fetch('/api/admin/pages', { cache: 'no-store' })
        const data = await res.json()
        setPages(data.pages || [])
      } finally { setLoading(false) }
    })()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Page Content & SEO</h1>
            <p className="text-white/70 text-sm">Edit titles, descriptions, OG images, and page copy.</p>
          </div>
          <Link href="/admin" className="text-amber-300 hover:text-amber-200">← Back to Admin</Link>
        </div>

        <div className="rounded-2xl p-6 border border-amber-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_22px_rgba(245,158,11,0.22)]">
          <div className="font-mono uppercase tracking-wider text-sm gold-metallic-text mb-4">Pages</div>
          {loading ? (
            <div className="text-white/60">Loading…</div>
          ) : pages.length === 0 ? (
            <div className="text-white/70">No pages found.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {pages.map((p)=> (
                <div key={p.slug} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-white/90 font-semibold">{p.displayName}</div>
                    <div className="text-white/50 text-sm">Route: {p.route} • Slug: {p.slug}</div>
                  </div>
                  <Link href={`/admin/pages/${encodeURIComponent(p.slug)}`} className="inline-flex items-center px-3 py-1.5 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400">Edit →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


