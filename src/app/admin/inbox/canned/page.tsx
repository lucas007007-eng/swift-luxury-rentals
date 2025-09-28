'use client'

import React, { useEffect, useState } from 'react'

type Row = { id?: string; title: string; body: string; category?: string; variables?: string }

export default function CannedManager() {
  const [rows, setRows] = useState<Row[]>([])
  const [draft, setDraft] = useState<Row>({ title: '', body: '', category: '', variables: '' })

  useEffect(()=>{ (async()=>{ const r = await fetch('/api/admin/inbox/canned'); setRows(await r.json()) })() }, [])

  async function save() {
    if (!draft.title || !draft.body) return
    const res = await fetch('/api/admin/inbox/canned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    if (res.ok) { const row = await res.json(); setRows([row, ...rows]); setDraft({ title: '', body: '', category: '', variables: '' }) }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Canned Replies</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-700 rounded-xl p-4">
          <div className="text-sm text-gray-300 mb-2">Create New</div>
          <input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Title" className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-2 py-1 mb-2" />
          <input value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} placeholder="Category (optional)" className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-2 py-1 mb-2" />
          <input value={draft.variables} onChange={e=>setDraft({...draft,variables:e.target.value})} placeholder="Variables e.g. name,bookingId" className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-2 py-1 mb-2" />
          <textarea value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="Body" rows={8} className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-2 py-2 mb-2" />
          <button onClick={save} className="px-3 py-1.5 rounded bg-gray-200 text-black font-semibold">Save</button>
        </div>
        <div className="border border-gray-700 rounded-xl p-4">
          <div className="text-sm text-gray-300 mb-2">Existing</div>
          <div className="space-y-3">
            {rows.map(r => (
              <div key={String(r.id||r.title)} className="border border-gray-700 rounded p-3">
                <div className="font-semibold">{r.title} {r.category ? <span className="text-xs text-gray-400">({r.category})</span> : null}</div>
                {r.variables ? <div className="text-xs text-gray-400">vars: {r.variables}</div> : null}
                <pre className="whitespace-pre-wrap text-gray-200 text-sm mt-2">{r.body}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


