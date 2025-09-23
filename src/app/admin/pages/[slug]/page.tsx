'use client'

import React from 'react'
import { getDefaultContent } from '@/lib/pagesStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
        // Load default content first
        const defaults = getDefaultContent(slug)
        defaultsRef.current = defaults
        
        // Then load saved overrides
        const res = await fetch('/api/admin/pages', { cache: 'no-store' })
        const data = await res.json()
        const page = (data.pages || []).find((p: any) => p.slug === slug)
        
        // Initialize form with saved overrides or defaults
        const contentOverrides: Record<string, string> = {}
        const savedOverrides = page?.contentOverrides || {}
        
        // For each key, use saved override if exists, otherwise use default
        Object.keys(defaults).forEach(key => {
          contentOverrides[key] = savedOverrides[key] || defaults[key] || ''
        })
        
        setForm({ 
          seoTitle: page?.seoTitle || '', 
          seoDescription: page?.seoDescription || '', 
          ogImage: page?.ogImage || '', 
          content: page?.content || '', 
          contentOverrides 
        })
      } finally { setLoading(false) }
    })()
  }, [slug])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="max-w-[1200px] mx-auto px-6 py-10 pt-28">
        {/* Ultra-Premium Header Section */}
        <div className="luxury-feature-card mb-8 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono uppercase tracking-wider text-sm text-amber-400 font-sora">Content Management</div>
              <h1 className="text-4xl font-bold heading-sora text-white mb-2 text-left">Edit Page: {slug}</h1>
              <p className="text-zinc-300 text-lg text-left">Update SEO, metadata, and page content</p>
            </div>
            <Link 
              href="/admin/pages" 
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
            >
              ← Back to Pages
            </Link>
          </div>
        </div>

        <div className="luxury-feature-card p-8">
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
                <label className="block text-sm text-amber-300 mb-2 font-sora font-semibold">SEO Title</label>
                <input
                  className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-4 py-3 text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-amber-400/50 focus:outline-none transition-all"
                  value={form.seoTitle}
                  onChange={(e)=>setForm({ ...form, seoTitle: e.target.value })}
                  maxLength={70}
                />
                <div className="text-xs text-zinc-400 mt-2 font-sora">Recommended ≤ 60–70 characters</div>
              </div>
              <div>
                <label className="block text-sm text-amber-300 mb-2 font-sora font-semibold">Meta Description</label>
                <textarea
                  className="w-full min-h-[100px] bg-black/40 border border-zinc-600/50 rounded-lg px-4 py-3 text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-amber-400/50 focus:outline-none transition-all resize-none"
                  value={form.seoDescription}
                  onChange={(e)=>setForm({ ...form, seoDescription: e.target.value })}
                  maxLength={160}
                />
                <div className="text-xs text-zinc-400 mt-2 font-sora">Recommended ≤ 150–160 characters</div>
              </div>
              <div>
                <label className="block text-sm text-amber-300 mb-2 font-sora font-semibold">OG Image URL</label>
                <input
                  className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-4 py-3 text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-amber-400/50 focus:outline-none transition-all"
                  value={form.ogImage}
                  onChange={(e)=>setForm({ ...form, ogImage: e.target.value })}
                  placeholder="/images/og-default.jpg"
                />
                <div className="text-xs text-zinc-400 mt-2 font-sora">1200×630 preferred</div>
              </div>
              <div>
                <label className="block text-sm text-amber-300 mb-2 font-sora font-semibold">Page Content (optional)</label>
                <textarea
                  className="w-full min-h-[160px] bg-black/40 border border-zinc-600/50 rounded-lg px-4 py-3 text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-amber-400/50 focus:outline-none transition-all resize-none"
                  value={form.content}
                  onChange={(e)=>setForm({ ...form, content: e.target.value })}
                  placeholder="Optional: simple text/HTML for sections"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-400/40 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
                  </div>
                  <div>
                    <div className="font-mono uppercase tracking-wider text-sm text-blue-400 font-sora">Dynamic Content</div>
                    <div className="text-lg font-bold text-white heading-sora">Content Overrides</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {['hero.subtitle','mission.body','mission.body.2','values.intro','features.intro','cta.subtitle'].map((key)=> (
                    <div key={key} className="p-4 rounded-lg border border-zinc-600/30 bg-black/20">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-white font-semibold font-sora">{key}</label>
                        <span className="text-xs text-zinc-400 font-sora">Edit Content</span>
                      </div>
                      <textarea
                        className="w-full min-h-[100px] bg-black/40 border border-zinc-600/50 rounded-lg px-4 py-3 text-white font-sora shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-blue-400/50 focus:outline-none transition-all resize-none"
                        value={form.contentOverrides?.[key] || ''}
                        onChange={(e)=> setForm({ ...form, contentOverrides: { ...(form.contentOverrides||{}), [key]: e.target.value } })}
                        placeholder={`Edit live website content for ${key}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-zinc-400 mt-3 font-sora">These keys map to sections on About and similar pages.</div>
              </div>
              <div className="pt-6 flex items-center gap-4">
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-amber-400/50 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100">
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
                      Save Changes
                    </>
                  )}
                </button>
                <Link href="/admin/pages" className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300">Cancel</Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}


