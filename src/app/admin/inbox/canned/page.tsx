'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Row = { id?: string; title: string; body: string; category?: string; variables?: string }

export default function CannedManager() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [draft, setDraft] = useState<Row>({ title: '', body: '', category: '', variables: '' })

  useEffect(()=>{ (async()=>{ const r = await fetch('/api/admin/inbox/canned'); setRows(await r.json()) })() }, [])

  async function save() {
    if (!draft.title || !draft.body) return
    const res = await fetch('/api/admin/inbox/canned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    if (res.ok) { const row = await res.json(); setRows([row, ...rows]); setDraft({ title: '', body: '', category: '', variables: '' }) }
  }

  const variables: { key: string; desc: string }[] = [
    { key: '{{name}}', desc: 'Customer name if known' },
    { key: '{{email}}', desc: 'Customer email address' },
    { key: '{{bookingId}}', desc: 'Booking ID (if referenced in thread)' },
    { key: '{{property}}', desc: 'Property title/name' },
    { key: '{{city}}', desc: 'City of the property/booking' },
    { key: '{{checkIn}}', desc: 'Check‑in date (YYYY‑MM‑DD)' },
    { key: '{{checkOut}}', desc: 'Check‑out date (YYYY‑MM‑DD)' },
    { key: '{{total}}', desc: 'Total amount (formatted)' },
    { key: '{{supportEmail}}', desc: 'Support address (support@phantomproperties.co)' },
    { key: '{{company}}', desc: 'Company name (Phantom Properties)' },
    { key: '{{today}}', desc: 'Today date in locale format' },
    { key: '{{subject}}', desc: 'Conversation subject' },
  ]

  function copy(text: string) {
    try { navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="relative overflow-hidden">
        {/* Luxury feature card header */}
        <div className="luxury-feature-card p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between">
            <button onClick={()=>router.push('/admin/inbox')} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300">← Return</button>
            <div className="text-center">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Communications</div>
              <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Canned Replies</h1>
              <p className="text-zinc-300 text-sm md:text-base">Elite Email Templates & Variables</p>
            </div>
            <div className="w-20 flex justify-end">
              <div className="text-2xl">📝</div>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto px-6 pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Create / edit */}
            <div className="xl:col-span-2 luxury-feature-card p-6">
              <div className="text-sm font-mono uppercase tracking-wider text-emerald-400 mb-4">Create New Template</div>
              <input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Title" className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} placeholder="Category (optional)" className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                <input value={draft.variables} onChange={e=>setDraft({...draft,variables:e.target.value})} placeholder="Variables e.g. name,bookingId" className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <textarea value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="Body" rows={8} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
              <div className="flex items-center gap-2">
                <button onClick={save} className="inline-flex items-center px-6 py-3 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300">Save Reply</button>
              </div>
            </div>
            {/* Variables cheat sheet */}
            <div className="luxury-feature-card p-6">
              <div className="text-sm font-mono uppercase tracking-wider text-cyan-400 mb-4">Variables Cheat Sheet</div>
              <div className="space-y-1.5">
                {variables.map(v => (
                  <div key={v.key} className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 transition-all">
                    <div>
                      <div className="font-mono text-cyan-300 text-sm">{v.key}</div>
                      <div className="text-xs text-zinc-400">{v.desc}</div>
                    </div>
                    <button onClick={()=>copy(v.key)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300">Copy</button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-zinc-400 mt-4 p-3 rounded-lg border border-white/10 bg-white/5">💡 Tip: list vars used in the input above (comma‑separated) to help teammates discover them.</div>
            </div>
            {/* Existing list */}
            <div className="xl:col-span-3 luxury-feature-card p-6">
              <div className="text-sm font-mono uppercase tracking-wider text-amber-400 mb-4">Existing Templates</div>
              <div className="space-y-2">
                {rows.map(r => (
                  <div key={String(r.id||r.title)} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    <div className="font-semibold text-white">{r.title} {r.category ? <span className="text-xs text-zinc-400 ml-2 px-2 py-1 rounded-lg border border-white/10 bg-white/10">({r.category})</span> : null}</div>
                    {r.variables ? <div className="text-xs text-cyan-300 mt-1">vars: {r.variables}</div> : null}
                    <pre className="whitespace-pre-wrap text-zinc-200 text-sm mt-3 p-3 rounded-lg bg-black/20 border border-white/5">{r.body}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}