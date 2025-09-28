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
    { key: '{{today}}', desc: 'Today’s date in locale format' },
    { key: '{{subject}}', desc: 'Conversation subject' },
  ]

  function copy(text: string) {
    try { navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <div className="relative min-h-screen bg-black text-white px-6 pt-14 pb-10">
      {/* Futuristic background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05),transparent_50%)]" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={()=>router.push('/admin/inbox')} className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">Return</button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-200 to-emerald-300">Canned Replies</h1>
          <p className="text-xs md:text-sm text-white/60">Design sleek, reusable responses with variables and categories</p>
        </div>
        <span />
      </div>
      {/* Hero card */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0a0f18] via-[#0a0a0a] to-[#0f1a14]">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative p-4 md:p-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-widest text-cyan-300/70 font-mono">Inbox • Toolkit</div>
            <div className="text-white/80 text-xs md:text-sm">Neon‑glass UI • Gradient borders • Copy‑ready variables</div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-white text-xs flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Create / edit */}
        <div className="xl:col-span-2 border border-white/10 rounded-2xl p-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="text-xs text-gray-300 mb-2">Create New</div>
          <input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Title" className="w-full bg-[#0b0b0b] text-gray-200 border border-white/10 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} placeholder="Category (optional)" className="w-full bg-[#0b0b0b] text-gray-200 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <input value={draft.variables} onChange={e=>setDraft({...draft,variables:e.target.value})} placeholder="Variables e.g. name,bookingId" className="w-full bg-[#0b0b0b] text-gray-200 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <textarea value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="Body" rows={6} className="w-full bg-[#0b0b0b] text-gray-200 border border-white/10 rounded-lg px-3 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
          <div className="flex items-center gap-2">
            <button onClick={save} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:from-cyan-300 hover:to-emerald-300 transition">Save Reply</button>
          </div>
        </div>
        {/* Variables cheat sheet */}
        <div className="border border-white/10 rounded-2xl p-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="text-xs text-gray-300 mb-2">Variables Cheat Sheet</div>
          <div className="space-y-1.5">
            {variables.map(v => (
              <div key={v.key} className="flex items-center justify-between gap-2 border border-white/10 rounded px-2 py-1 bg-white/5">
                <div>
                  <div className="font-mono text-cyan-300 text-xs">{v.key}</div>
                  <div className="text-[11px] text-gray-400">{v.desc}</div>
                </div>
                <button onClick={()=>copy(v.key)} className="text-[11px] px-2 py-0.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20">Copy</button>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">Tip: list vars used in the input above (comma‑separated) to help teammates discover them.</div>
        </div>
        {/* Existing list */}
        <div className="xl:col-span-3 border border-white/10 rounded-2xl p-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="text-xs text-gray-300 mb-2">Existing</div>
          <div className="space-y-2">
            {rows.map(r => (
              <div key={String(r.id||r.title)} className="border border-white/10 rounded p-2 bg-white/5 hover:bg-white/10 transition">
                <div className="font-semibold text-sm">{r.title} {r.category ? <span className="text-[11px] text-gray-400">({r.category})</span> : null}</div>
                {r.variables ? <div className="text-[11px] text-gray-400">vars: {r.variables}</div> : null}
                <pre className="whitespace-pre-wrap text-gray-200 text-xs mt-1.5">{r.body}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}


