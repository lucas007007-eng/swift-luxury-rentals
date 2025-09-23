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
  const [form, setForm] = useState<Partial<Lead>>({ stage: 'new' })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/crm2/leads', { cache: 'no-store' })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || 'load-failed')
        setLeads(json.data || [])
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
              <div key={stage} className="luxury-feature-card p-4">
                <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">{stage}</div>
                <div className="space-y-3">
                  {(grouped[stage] || []).map(l => (
                    <div key={l.id} className="rounded-lg border border-zinc-600/40 bg-black/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold font-sora truncate">{l.name}</div>
                        <div className="text-xs text-zinc-400 ml-2">{l.company || '—'}</div>
                      </div>
                      <div className="text-xs text-zinc-300 mt-1 truncate">{l.email || 'no-email'}{l.phone ? ` • ${l.phone}` : ''}</div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                        <span>{l.city || '—'}</span>
                        <span className="text-white">{(Number(l.budgetCents||0)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'})}</span>
                      </div>
                    </div>
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

      <Footer />
    </main>
  )
}


