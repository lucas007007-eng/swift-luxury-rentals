'use client'

import React from 'react'
import { getDefaultContent } from '@/lib/pagesStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const slug = params.slug
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<any>({ seoTitle: '', seoDescription: '', ogImage: '', content: '', contentOverrides: {} as Record<string,string> })
  const defaultsRef = React.useRef<Record<string,string>>({})

  React.useEffect(() => {
    ;(async()=>{
      try {
        const res = await fetch('/api/admin/pages', { cache: 'no-store' })
        const data = await res.json()
        const page = (data.pages || []).find((p: any) => p.slug === slug)
        if (page) setForm({ seoTitle: page.seoTitle || '', seoDescription: page.seoDescription || '', ogImage: page.ogImage || '', content: page.content || '', contentOverrides: page.contentOverrides || {} })
        defaultsRef.current = getDefaultContent(slug)
      } finally { setLoading(false) }
    })()
  }, [slug])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Page: {slug}</h1>
            <p className="text-white/70 text-sm">Update title, description, OG image and content.</p>
          </div>
          <Link href="/admin/pages" className="text-amber-300 hover:text-amber-200">← Back to Pages</Link>
        </div>

        <div className="rounded-2xl p-6 border border-amber-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_22px_rgba(245,158,11,0.22)]">
          {loading ? (
            <div className="text-white/60">Loading…</div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSaving(true)
                try {
                  const res = await fetch('/api/admin/pages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug, input: form })
                  })
                  if (res.ok) router.push('/admin/pages')
                } finally { setSaving(false) }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-amber-200 mb-1">SEO Title</label>
                <input
                  className="w-full bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-white"
                  value={form.seoTitle}
                  onChange={(e)=>setForm({ ...form, seoTitle: e.target.value })}
                  maxLength={70}
                />
                <div className="text-xs text-white/50 mt-1">Recommended ≤ 60–70 characters</div>
              </div>
              <div>
                <label className="block text-sm text-amber-200 mb-1">Meta Description</label>
                <textarea
                  className="w-full min-h-[90px] bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-white"
                  value={form.seoDescription}
                  onChange={(e)=>setForm({ ...form, seoDescription: e.target.value })}
                  maxLength={160}
                />
                <div className="text-xs text-white/50 mt-1">Recommended ≤ 150–160 characters</div>
              </div>
              <div>
                <label className="block text-sm text-amber-200 mb-1">OG Image URL</label>
                <input
                  className="w-full bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-white"
                  value={form.ogImage}
                  onChange={(e)=>setForm({ ...form, ogImage: e.target.value })}
                  placeholder="/images/og-default.jpg"
                />
                <div className="text-xs text-white/50 mt-1">1200×630 preferred</div>
              </div>
              <div>
                <label className="block text-sm text-amber-200 mb-1">Page Content (optional)</label>
                <textarea
                  className="w-full min-h-[160px] bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-white"
                  value={form.content}
                  onChange={(e)=>setForm({ ...form, content: e.target.value })}
                  placeholder="Optional: simple text/HTML for sections"
                />
              </div>
              <div>
                <div className="block text-sm text-amber-200 mb-1">Content Overrides (by section key)</div>
                <div className="rounded border border-amber-400/20 divide-y divide-amber-400/10">
                  {['hero.subtitle','mission.body','mission.body.2','values.intro','features.intro','cta.subtitle'].map((key)=> (
                    <div key={key} className="p-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-white/60">{key}</label>
                        <span className="text-[10px] text-white/40">Default:</span>
                      </div>
                      <div className="mt-1 text-xs text-white/50 bg-black/30 border border-white/10 rounded p-2">
                        {defaultsRef.current?.[key] || '—'}
                      </div>
                      <textarea
                        className="w-full mt-2 min-h-[80px] bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-white"
                        value={form.contentOverrides?.[key] || ''}
                        onChange={(e)=> setForm({ ...form, contentOverrides: { ...(form.contentOverrides||{}), [key]: e.target.value } })}
                        placeholder="Leave empty to use default content"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-white/50 mt-1">These keys map to sections on About and similar pages.</div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
                <Link href="/admin/pages" className="text-white/70 hover:text-white">Cancel</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}


