'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Lead = {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  city?: string
  budgetCents?: number
  stage: string
  owner?: string
  nextActionAt?: string | null
  createdAt?: string
  updatedAt?: string
}

const STAGES = [
  'new',
  'qualified',
  'viewing',
  'application',
  'screening',
  'offer',
  'lease',
  'signed'
] as const

export default function CRM2Page() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Lead>>({ stage: 'new' })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/crm2/leads', { cache: 'no-store' })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || 'load-failed')
        setLeads(json.data || [])
        const a = await fetch('/api/crm2/activities', { cache: 'no-store' })
        const aj = await a.json()
        if (aj.ok) setActivities(aj.data || [])
      } catch (e: any) {
        setError(e?.message || 'load-failed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const map: Record<string, Lead[]> = {}
    STAGES.forEach(s => (map[s] = []))
    for (const l of leads) {
      (map[l.stage] ||= []).push(l)
    }
    return map
  }, [leads])

  const createLead = async () => {
    const payload: any = {
      name: (form.name || '').trim(),
      email: (form.email || '').trim(),
      phone: (form.phone || '').trim(),
      company: (form.company || '').trim(),
      city: (form.city || '').trim(),
      budgetCents: Number(form.budgetCents || 0),
      stage: form.stage || 'new',
      owner: (form.owner || '').trim()
    }
    if (!payload.name) return alert('Name is required')

    // optimistic
    const temp: Lead = { id: 'tmp_' + Date.now(), ...payload }
    setLeads(prev => [temp, ...prev])
    setNewLeadOpen(false)
    setForm({ stage: 'new' })
    try {
      const res = await fetch('/api/crm2/leads', { method: 'POST', body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.ok) {
        setLeads(prev => [json.data, ...prev.filter(x => x.id !== temp.id)])
      } else {
        setLeads(prev => prev.filter(x => x.id !== temp.id))
        alert('Failed to create lead')
      }
    } catch {
      setLeads(prev => prev.filter(x => x.id !== temp.id))
      alert('Failed to create lead')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="max-w-[2200px] mx-auto px-6 py-10 pt-28">
        {/* Header Row */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="luxury-feature-card p-8">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">CRM Prototype</div>
            <h1 className="text-4xl font-bold heading-sora text-white mb-2">Pipeline Overview</h1>
            <p className="text-zinc-300 text-lg">Leads by stage, drag ready (MVP)</p>
          </div>
          <div className="luxury-feature-card p-8 flex items-center justify-between">
            <div>
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">Actions</div>
              <div className="text-zinc-300">Create and track new leads</div>
            </div>
            <button onClick={()=>setNewLeadOpen(true)} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300">New Lead</button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="luxury-feature-card p-8">Loading…</div>
        ) : error ? (
          <div className="luxury-feature-card p-8 text-red-300">Failed to load: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAGES.map(stage => (
              <div
                key={stage}
                className="luxury-feature-card p-4"
                onDragOver={(e)=>{ e.preventDefault() }}
                onDrop={async (e)=>{
                  e.preventDefault()
                  const id = dragId
                  if (!id) return
                  setDragId(null)
                  // optimistic stage move
                  setLeads(prev=> prev.map(x=> x.id===id ? { ...x, stage } : x))
                  try { await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id, stage }) }) } catch {}
                }}
              >
                <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">{stage}</div>
                <div className="space-y-3">
                  {(grouped[stage] || []).map(l => (
                    <button
                      key={l.id}
                      onClick={()=>setDrawerLead(l)}
                      draggable
                      onDragStart={()=> setDragId(l.id)}
                      className="w-full text-left rounded-lg border border-zinc-600/40 bg-black/30 p-3 hover:border-zinc-400/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold font-sora truncate">{l.name}</div>
                        <div className="text-xs text-zinc-400 ml-2">{l.company || '—'}</div>
                      </div>
                      <div className="text-xs text-zinc-300 mt-1 truncate">{l.email || 'no-email'}{l.phone ? ` • ${l.phone}` : ''}</div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                        <span>{l.city || '—'}</span>
                        <span className="text-white">{(Number(l.budgetCents||0)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'})}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {newLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setNewLeadOpen(false)} />
          <div className="luxury-feature-card p-6 relative z-10 w-full max-w-lg">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">Create Lead</div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input placeholder="Name" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})} />
              <input placeholder="Email" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.email||''} onChange={e=>setForm({...form, email:e.target.value})} />
              <input placeholder="Phone" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.phone||''} onChange={e=>setForm({...form, phone:e.target.value})} />
              <input placeholder="Company" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.company||''} onChange={e=>setForm({...form, company:e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="City" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.city||''} onChange={e=>setForm({...form, city:e.target.value})} />
                <input placeholder="Budget (€)" type="number" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.budgetCents? String(Number(form.budgetCents)/100):''} onChange={e=>setForm({...form, budgetCents: Math.round(Number(e.target.value||0)*100)})} />
              </div>
              <select className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.stage||'new'} onChange={e=>setForm({...form, stage:e.target.value})}>
                {STAGES.map(s=> <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button onClick={()=>setNewLeadOpen(false)} className="px-3 py-2 text-sm rounded border border-zinc-400/30 text-white">Cancel</button>
                <button onClick={createLead} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerLead && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setDrawerLead(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl luxury-feature-card p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">Lead</div>
                <div className="text-2xl font-bold heading-sora text-white">{drawerLead.name}</div>
                <div className="text-zinc-300 text-sm">{drawerLead.company || '—'} • {drawerLead.city || '—'}</div>
              </div>
              <button onClick={()=>setDrawerLead(null)} className="px-3 py-2 rounded-lg border border-zinc-400/30 text-white">Close</button>
            </div>

            {/* Edit basics */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <select className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.stage} onChange={async e=>{
                const stage = e.target.value
                setDrawerLead(prev=> prev ? { ...prev, stage } : prev)
                setLeads(prev=> prev.map(x=> x.id===drawerLead.id ? { ...x, stage } : x))
                try { await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id: drawerLead.id, stage }) }) } catch {}
              }}>
                {STAGES.map(s=> <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.name||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, name: e.target.value } : prev)} placeholder="Name" />
              <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.email||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, email: e.target.value } : prev)} placeholder="Email" />
              <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.phone||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, phone: e.target.value } : prev)} placeholder="Phone" />
              <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.company||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, company: e.target.value } : prev)} placeholder="Company" />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.city||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, city: e.target.value } : prev)} placeholder="City" />
                <input className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.budgetCents? String(Number(drawerLead.budgetCents)/100):''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, budgetCents: Math.round(Number(e.target.value||0)*100) } : prev)} placeholder="Budget (€)" />
              </div>
              <div className="flex items-center justify-end">
                <button className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all" onClick={async ()=>{
                  try {
                    await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({
                      id: drawerLead.id,
                      name: drawerLead.name,
                      email: drawerLead.email,
                      phone: drawerLead.phone,
                      company: drawerLead.company,
                      city: drawerLead.city,
                      budgetCents: drawerLead.budgetCents
                    }) })
                  } catch {}
                }}>Save</button>
              </div>
            </div>

            {/* Matches */}
            <div className="luxury-feature-card p-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono uppercase tracking-wider text-sm text-white">Matches</div>
                <button className="px-3 py-1 text-xs rounded border border-zinc-400/30 text-white"
                        onClick={async ()=>{
                          try {
                            const url = `/api/crm2/match?city=${encodeURIComponent(drawerLead.city||'')}&budgetCents=${encodeURIComponent(String(drawerLead.budgetCents||0))}`
                            const res = await fetch(url)
                            const j = await res.json()
                            if (j.ok) setMatches(j.data || [])
                          } catch {}
                        }}>Find</button>
              </div>
              <div className="space-y-2">
                {matches.map((m:any)=> (
                  <a key={m.id} href={`/admin/property/${m.extId||''}`} className="block rounded border border-zinc-600/40 p-2 hover:border-zinc-400/60">
                    <div className="text-white text-sm font-semibold">{m.title}</div>
                    <div className="text-zinc-400 text-xs">{m.address || '—'}</div>
                    <div className="text-zinc-300 text-xs">€{Number(m.priceMonthly||0).toLocaleString('de-DE')}/mo</div>
                  </a>
                ))}
                {matches.length===0 && (<div className="text-zinc-400 text-sm">No matches yet</div>)}
              </div>
            </div>

            {/* Activities */}
            <div className="luxury-feature-card p-4">
              <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">Activities</div>
              <div className="space-y-2">
                {activities.filter(a=> a.leadId===drawerLead.id).map(a=> (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div className="text-zinc-300 truncate">{a.type}: {a.content}</div>
                    <div className="text-zinc-400 text-xs whitespace-nowrap">{a.dueAt ? new Date(a.dueAt).toLocaleDateString() : ''}</div>
                  </div>
                ))}
              </div>
              <AddActivity leadId={drawerLead.id} onAdd={(row)=> setActivities(prev=> [row, ...prev])} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

function AddActivity({ leadId, onAdd }: { leadId: string; onAdd: (row:any)=>void }) {
  const [content, setContent] = React.useState('')
  const [type, setType] = React.useState('note')
  const [dueAt, setDueAt] = React.useState('')
  const submit = async () => {
    if (!content.trim()) return
    try {
      const res = await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId, content, type, dueAt: dueAt || undefined }) })
      const json = await res.json()
      if (json.ok) {
        onAdd(json.data)
        setContent('')
        setDueAt('')
      }
    } catch {}
  }
  return (
    <div className="mt-3 grid grid-cols-1 gap-2">
      <div className="grid grid-cols-3 gap-2">
        <select className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-2 py-1 text-xs text-white" value={type} onChange={e=>setType(e.target.value)}>
          <option className="bg-black" value="note">note</option>
          <option className="bg-black" value="call">call</option>
          <option className="bg-black" value="task">task</option>
          <option className="bg-black" value="email">email</option>
        </select>
        <input className="bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white" placeholder="Due date (YYYY-MM-DD)" value={dueAt} onChange={e=>setDueAt(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input className="flex-1 bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-sm text-white" placeholder="Add note / task / call summary" value={content} onChange={e=>setContent(e.target.value)} />
        <button onClick={submit} className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white">Add</button>
      </div>
    </div>
  )
}


