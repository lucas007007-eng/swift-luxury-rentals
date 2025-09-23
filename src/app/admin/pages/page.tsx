'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
      <Header forceBackground={true} />
      
      <div className="pt-28 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          
          {/* Ultra-Premium Header */}
          <div className="luxury-feature-card mb-8 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold heading-sora text-white mb-2">Page Content & SEO</h1>
                <p className="text-zinc-300 text-lg">Edit titles, descriptions, OG images, and page copy.</p>
              </div>
              <Link 
                href="/admin" 
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>

          {/* Ultra-Premium Pages Container */}
          <div className="luxury-feature-card p-6 relative">
            
            {/* Corner accent lights */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400/60 opacity-80" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400/60 opacity-80" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400/60 opacity-80" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400/60 opacity-80" />
            
            <div className="relative z-10">
              <div className="font-mono uppercase tracking-wider text-lg text-white mb-6 font-sora">Content Management System</div>
              {loading ? (
                <div className="text-zinc-400 text-center py-8">Loading pages...</div>
              ) : pages.length === 0 ? (
                <div className="text-zinc-400 text-center py-8">No pages found.</div>
              ) : (
                <div className="space-y-4">
                  {pages.map((p)=> (
                    <div key={p.slug} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-zinc-700/50 hover:border-zinc-600/60 hover:bg-black/30 transition-all duration-300">
                      <div>
                        <div className="text-white font-semibold font-sora">{p.displayName}</div>
                        <div className="text-zinc-400 text-sm">Edit meta description, meta titles and page descriptions and content</div>
                      </div>
                      <Link 
                        href={`/admin/pages/${encodeURIComponent(p.slug)}`} 
                        className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
                      >
                        Edit →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}


