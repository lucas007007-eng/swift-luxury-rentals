'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CompanyPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/crm2/companies/${params.id}`, { cache: 'no-store' })
        const j = await res.json()
        if (j.ok) setCompany(j.data); else setError(j.error||'not-found')
      } catch (e:any) { setError(e?.message||'load-failed') }
      finally { setLoading(false) }
    }
    load()
  }, [params.id])

  const save = async () => {
    try {
      const res = await fetch(`/api/crm2/companies/${params.id}`, { method:'PATCH', body: JSON.stringify(company) })
      const j = await res.json(); if (!j.ok) alert('Save failed')
    } catch { alert('Save failed') }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="max-w-[1600px] mx-auto px-6 py-10 pt-28">
        {loading ? (
          <div className="luxury-feature-card p-8">Loading…</div>
        ) : error ? (
          <div className="luxury-feature-card p-8 text-red-300">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="luxury-feature-card p-8">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">Company</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <input className="bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" value={company?.name||''} onChange={e=> setCompany((c:any)=> ({...c, name:e.target.value}))} />
                <input className="bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" placeholder="domain.com" value={company?.domain||''} onChange={e=> setCompany((c:any)=> ({...c, domain:e.target.value}))} />
              </div>
              <div className="mt-4 flex items-center justify-end">
                <button onClick={save} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all">Save</button>
              </div>
            </div>
            <div className="luxury-feature-card p-8">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">Negotiated Rates</div>
              <div className="text-zinc-400 text-sm mt-2">(Add fields here in next sprint)</div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}


