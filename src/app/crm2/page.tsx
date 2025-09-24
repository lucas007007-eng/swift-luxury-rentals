'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [deals, setDeals] = useState<any[]>([])
  const [bookingPreview, setBookingPreview] = useState<{ id: string; payments?: any[] } | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Lead>>({ stage: 'new' })
  // Quote builder state (drawer)
  const [quoteCity, setQuoteCity] = useState<string>('')
  const [quoteCities, setQuoteCities] = useState<string[]>([])
  const [quoteProperty, setQuoteProperty] = useState<string>('')
  const [quotePropertyOptions, setQuotePropertyOptions] = useState<{ extId: string; title: string }[]>([])
  const [quoteStart, setQuoteStart] = useState<string>('') // yyyy-mm-dd
  const [calOpen, setCalOpen] = useState<boolean>(false)
  const [calCursor, setCalCursor] = useState<Date>(new Date()) // month cursor
  const calBtnRef = React.useRef<HTMLButtonElement | null>(null)
  const [calPos, setCalPos] = useState<{ left: number; top: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) }, [])
  const [companies, setCompanies] = useState<any[]>([])
  const [newCompany, setNewCompany] = useState<{ name: string; domain?: string }>({ name: '' })
  const [filterStage, setFilterStage] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('')
  const [filterText, setFilterText] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'board'|'renewals'>('board')
  const [renewalDays, setRenewalDays] = useState<number>(45)
  const [renewals, setRenewals] = useState<any[]>([])
  const bcRef = React.useRef<any>(null)

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
        const c = await fetch('/api/crm2/companies', { cache: 'no-store' })
        const cj = await c.json()
        if (cj.ok) setCompanies(cj.data || [])
        const d = await fetch('/api/crm2/deals', { cache: 'no-store' })
        const dj = await d.json()
        if (dj.ok) setDeals(dj.data || [])
      } catch (e: any) {
        setError(e?.message || 'load-failed')
      } finally {
        setLoading(false)
      }
    }
    load()
    // Live updates via SSE
    const es = new EventSource('/api/crm2/events')
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'lead.updated' || msg.type === 'lead.created') {
          const l = msg.data
          setLeads(prev => {
            const idx = prev.findIndex(x => x.id === l.id)
            if (idx >= 0) {
              const copy = prev.slice(); copy[idx] = { ...prev[idx], ...l }; return copy
            }
            return [l, ...prev]
          })
        }
      } catch {}
    }
    es.onerror = () => { /* let browser auto-reconnect */ }
    // Local BroadcastChannel for instant cross-tab updates
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      // @ts-ignore
      bcRef.current = new window.BroadcastChannel('crm2')
      bcRef.current.onmessage = (ev: any) => {
        const msg = ev.data
        if (!msg) return
        if (msg.type === 'lead.updated' || msg.type === 'lead.created') {
          const l = msg.data
          setLeads(prev => {
            const idx = prev.findIndex(x => x.id === l.id)
            if (idx >= 0) { const copy = prev.slice(); copy[idx] = { ...prev[idx], ...l }; return copy }
            return [l, ...prev]
          })
        }
      }
    }
    return () => { try { es.close() } catch {}; try { bcRef.current?.close?.() } catch {} }
  }, [])

  // Handle saved view filters via URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URL(window.location.href).searchParams
    const view = sp.get('view')
    if (view === 'offers') setFilterStage('offer')
    if (view === 'signed') setFilterStage('signed')
    if (view === 'new7') {
      setFilterStage('all')
      // constrain to new 7d by setting text filter to a token unlikely to exclude results; we'll filter post-group below
      // (for MVP keep it simple; could implement true date filter in a future step)
    }
    if (view === 'renewals45') {
      setFilterStage('signed')
    }
  }, [])

  const filteredLeads = useMemo(() => {
    return leads.filter(l =>
      (filterStage === 'all' || l.stage === filterStage) &&
      (!filterCity || (l.city || '').toLowerCase().includes(filterCity.toLowerCase())) &&
      (!filterText || [l.name, l.email, l.phone, l.company, l.city].some(v => (v||'').toLowerCase().includes(filterText.toLowerCase())))
    )
  }, [leads, filterStage, filterCity, filterText])

  const grouped = useMemo(() => {
    const map: Record<string, Lead[]> = {}
    STAGES.forEach(s => (map[s] = []))
    for (const l of filteredLeads) {
      (map[l.stage] ||= []).push(l)
    }
    return map
  }, [filteredLeads])

  const kpis = useMemo(() => {
    const total = leads.length
    const offers = leads.filter(l => l.stage === 'offer').length
    const signed = leads.filter(l => l.stage === 'signed').length
    const weekAgo = Date.now() - 7*24*60*60*1000
    const newWeek = leads.filter(l => {
      const ts = l.createdAt ? new Date(l.createdAt).getTime() : 0
      return ts >= weekAgo
    }).length
    return { total, offers, signed, newWeek }
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
    setFilterStage('all')
    setForm({ stage: 'new' })
    try {
      const res = await fetch('/api/crm2/leads', { method: 'POST', body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.ok) {
        setLeads(prev => [json.data, ...prev.filter(x => x.id !== temp.id)])
        try { bcRef.current?.postMessage({ type:'lead.created', data: json.data }) } catch {}
      } else {
        setLeads(prev => prev.filter(x => x.id !== temp.id))
        alert('Failed to create lead')
      }
    } catch {
      setLeads(prev => prev.filter(x => x.id !== temp.id))
      alert('Failed to create lead')
    }
  }

  // Load cities and default property options when drawer opens or lead changes
  useEffect(() => {
    const load = async () => {
      if (!drawerLead) return
      setQuoteCity(drawerLead.city || '')
      setQuoteStart('')
      try {
        const rc = await fetch('/api/crm2/options/cities', { cache: 'no-store' })
        const cj = await rc.json()
        if (cj.ok) setQuoteCities((cj.data || []).map((c: any) => c.name))
      } catch {}
      const city = drawerLead.city || ''
      if (city) {
        try {
          const rp = await fetch(`/api/crm2/options/properties?city=${encodeURIComponent(city)}`, { cache: 'no-store' })
          const pj = await rp.json()
          if (pj.ok) setQuotePropertyOptions((pj.data || []).map((p: any) => ({ extId: p.extId || p.id, title: p.title })))
        } catch {}
      } else {
        setQuotePropertyOptions([])
      }
      setQuoteProperty('')
    }
    load()
  }, [drawerLead])

  // Load renewals when tab open or window changes
  useEffect(() => {
    const run = async () => {
      if (activeTab !== 'renewals') return
      try {
        const r = await fetch(`/api/crm2/renewals?days=${renewalDays}`, { cache: 'no-store' })
        const j = await r.json()
        if (j.ok) setRenewals(j.data || [])
      } catch {}
    }
    run()
  }, [activeTab, renewalDays])

  async function createRenewalReminder(row: any) {
    try {
      // Try to find an existing lead by email
      const email = (row.userEmail || '').toLowerCase()
      let lead = leads.find(l => (l.email || '').toLowerCase() === email)
      if (!lead) {
        const res = await fetch('/api/crm2/leads', { method: 'POST', body: JSON.stringify({
          name: row.userName || 'Client',
          email: row.userEmail || '',
          city: row.city || '',
          stage: 'qualified'
        }) })
        const j = await res.json(); if (j.ok) { lead = j.data; setLeads(prev=> [j.data, ...prev]) }
      }
      if (!lead) return alert('Could not create/find lead')
      // Reminder 14 days before checkout (or tomorrow if already past)
      const checkoutTs = row.checkout ? new Date(row.checkout).getTime() : Date.now()
      const dueTs = Math.max(Date.now() + 24*60*60*1000, checkoutTs - 14*24*60*60*1000)
      const res2 = await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({
        leadId: lead.id,
        type: 'renewal',
        content: `Renewal follow-up for ${row.propertyTitle || 'property'}`,
        dueAt: new Date(dueTs).toISOString()
      }) })
      const j2 = await res2.json(); if (j2.ok) setActivities(prev=> [j2.data, ...prev])
      alert('Reminder created')
    } catch { alert('Failed to create reminder') }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="max-w-[2200px] mx-auto px-6 py-10 pt-28">
        {/* In-app notifications bell */}
        <div className="mb-3 flex items-center justify-end">
          <InAppBell activities={activities} onSnooze={async (id)=>{
            await fetch('/api/crm2/activities',{ method:'PATCH', body: JSON.stringify({ id, snoozeDays: 1 }) })
            setActivities(prev=> prev.map(x=> x.id===id ? { ...x, dueAt: new Date(Date.now()+24*60*60*1000).toISOString() } : x))
          }} onComplete={async (id)=>{
            await fetch('/api/crm2/activities',{ method:'PATCH', body: JSON.stringify({ id, complete: true }) })
            setActivities(prev=> prev.map(x=> x.id===id ? { ...x, completedAt: new Date().toISOString() } : x))
          }} />
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 text-red-300 px-4 py-3 flex items-center justify-between">
            <div className="text-sm">{error}</div>
            <button onClick={()=>setError(null)} className="text-xs px-2 py-1 rounded border border-red-400/40">Dismiss</button>
          </div>
        )}
        {/* Header Row */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="luxury-feature-card p-8">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400">CRM Prototype</div>
            <h1 className="text-4xl font-bold heading-sora text-white mb-2">Pipeline Overview</h1>
            <p className="text-zinc-300 text-lg">Leads by stage with filters and KPIs</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="luxury-feature-card p-3 text-center">
                <div className="text-xs text-zinc-300">Total Leads</div>
                <div className="text-2xl font-bold text-white">{kpis.total.toLocaleString('de-DE')}</div>
              </div>
              <div className="luxury-feature-card p-3 text-center">
                <div className="text-xs text-zinc-300">New (7d)</div>
                <div className="text-2xl font-bold text-white">{kpis.newWeek}</div>
              </div>
              <div className="luxury-feature-card p-3 text-center">
                <div className="text-xs text-zinc-300">Offers Out</div>
                <div className="text-2xl font-bold text-white">{kpis.offers}</div>
              </div>
              <div className="luxury-feature-card p-3 text-center">
                <div className="text-xs text-zinc-300">Signed</div>
                <div className="text-2xl font-bold text-white">{kpis.signed}</div>
              </div>
            </div>
          </div>
          <div className="luxury-feature-card p-8">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 mb-3">Filters & Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded-lg px-3 py-2 text-sm text-white font-sora">
                <option className="bg-black" value="all">All Stages</option>
                {STAGES.map(s=> <option className="bg-black" key={s} value={s}>{s}</option>)}
              </select>
              <input value={filterCity} onChange={e=>setFilterCity(e.target.value)} placeholder="City" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" />
              <input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder="Search name/email/company" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora md:col-span-2" />
            </div>
            <div className="mt-4 flex items-center justify-end">
              <button onClick={()=>setNewLeadOpen(true)} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all">New Lead</button>
              <div className="ml-3 flex items-center gap-2">
                <a href="/crm2?view=offers" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Offers Out</a>
                <a href="/crm2?view=signed" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Signed</a>
                <a href="/crm2?view=new7" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">New 7d</a>
                <a href="/crm2?view=renewals45" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Renewals 45d</a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-3">
          <button onClick={()=> setActiveTab('board')} className={`px-3 py-2 text-sm rounded-lg border ${activeTab==='board' ? 'border-zinc-400/40 bg-zinc-800/40 text-white' : 'border-zinc-600/40 text-zinc-300 hover:border-zinc-500/50'}`}>Board</button>
          <button onClick={()=> setActiveTab('renewals')} className={`px-3 py-2 text-sm rounded-lg border ${activeTab==='renewals' ? 'border-zinc-400/40 bg-zinc-800/40 text-white' : 'border-zinc-600/40 text-zinc-300 hover:border-zinc-500/50'}`}>Renewals</button>
          {activeTab==='renewals' && (
            <div className="ml-auto flex items-center gap-2">
              {[30,45,60].map(d=> (
                <button key={d} onClick={()=> setRenewalDays(d)} className={`px-2 py-1 text-xs rounded border ${renewalDays===d ? 'border-zinc-300/60 text-white' : 'border-zinc-600/40 text-zinc-300 hover:border-zinc-500/50'}`}>{d}d</button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="luxury-feature-card p-8">Loading…</div>
        ) : error ? (
          <div className="luxury-feature-card p-8 text-red-300">Failed to load: {error}</div>
        ) : activeTab==='board' ? (
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
                  try { bcRef.current?.postMessage({ type:'lead.updated', data: { id, stage } }) } catch {}
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
        ) : (
          <div className="luxury-feature-card p-4">
            <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">Renewals in next {renewalDays} days</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-300">
                    <th className="px-2 py-2">Checkout</th>
                    <th className="px-2 py-2">Client</th>
                    <th className="px-2 py-2">Property</th>
                    <th className="px-2 py-2">City</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.map((r:any)=> (
                    <tr key={r.id} className="border-t border-zinc-700/40">
                      <td className="px-2 py-2 text-zinc-200">{r.checkout ? new Date(r.checkout).toLocaleDateString() : ''}</td>
                      <td className="px-2 py-2 text-zinc-300">{r.userName || r.userEmail || '—'}</td>
                      <td className="px-2 py-2 text-zinc-300">{r.propertyTitle || '—'}</td>
                      <td className="px-2 py-2 text-zinc-300">{r.city || '—'}</td>
                      <td className="px-2 py-2 text-right">
                        <button className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white" onClick={()=> createRenewalReminder(r)}>Create Reminder</button>
                      </td>
                    </tr>
                  ))}
                  {renewals.length===0 && (
                    <tr><td colSpan={5} className="px-2 py-6 text-center text-zinc-400">No renewals found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Company" className="col-span-2 w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={form.company||''} onChange={e=>setForm({...form, company:e.target.value})} list="crm2-company-datalist" />
                <button type="button" onClick={async ()=>{
                  if (!newCompany.name.trim()) return
                  const res = await fetch('/api/crm2/companies', { method:'POST', body: JSON.stringify(newCompany) })
                  const j = await res.json(); if (j.ok) setCompanies(prev=> [j.data, ...prev]); setNewCompany({ name: '' })
                }} className="px-3 py-2 rounded-lg border border-zinc-400/30 text-white">Add Co</button>
              </div>
              <datalist id="crm2-company-datalist">
                {companies.map(c=> <option key={c.id} value={c.name} />)}
              </datalist>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="New company name" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={newCompany.name} onChange={e=>setNewCompany({ ...newCompany, name: e.target.value })} />
                <input placeholder="domain.com (opt)" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={newCompany.domain||''} onChange={e=>setNewCompany({ ...newCompany, domain: e.target.value })} />
              </div>
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
          <div className="absolute right-0 top-0 h-full w-full max-w-xl luxury-feature-card p-6 overflow-y-auto pb-24">
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
                try { bcRef.current?.postMessage({ type:'lead.updated', data: { id: drawerLead.id, stage } }) } catch {}
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
                {activities.filter(a=> a.leadId===drawerLead.id).map(a=> {
                  const due = a.dueAt ? new Date(a.dueAt).getTime() : null
                  const today = new Date(); today.setHours(0,0,0,0)
                  const isOverdue = !!due && due < today.getTime() && !a.completedAt
                  const isToday = !!due && due >= today.getTime() && due < today.getTime()+24*60*60*1000 && !a.completedAt
                  return (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div className="text-zinc-300 truncate">
                        {a.type}: {a.content}
                        {isToday && <span className="ml-2 px-2 py-0.5 text-[10px] rounded border border-amber-400/40 text-amber-300">Due Today</span>}
                        {isOverdue && <span className="ml-2 px-2 py-0.5 text-[10px] rounded border border-red-400/40 text-red-300">Overdue</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-zinc-400 text-xs whitespace-nowrap">{a.dueAt ? new Date(a.dueAt).toLocaleDateString() : ''}</div>
                        {!a.completedAt && (
                          <>
                            <button className="px-2 py-1 text-[10px] rounded border border-zinc-400/30 text-white" onClick={async()=>{ await fetch('/api/crm2/activities',{ method:'PATCH', body: JSON.stringify({ id: a.id, snoozeDays: 1 }) }); setActivities(prev=> prev.map(x=> x.id===a.id ? { ...x, dueAt: new Date(Date.now()+24*60*60*1000).toISOString() } : x)) }}>Snooze 1d</button>
                            <button className="px-2 py-1 text-[10px] rounded border border-emerald-400/30 text-white" onClick={async()=>{ await fetch('/api/crm2/activities',{ method:'PATCH', body: JSON.stringify({ id: a.id, complete: true }) }); setActivities(prev=> prev.map(x=> x.id===a.id ? { ...x, completedAt: new Date().toISOString() } : x)) }}>Complete</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <AddActivity leadId={drawerLead.id} onAdd={(row)=> setActivities(prev=> [row, ...prev])} />
            </div>

            {/* Quote Builder */}
            <div className="luxury-feature-card p-4 mt-6">
              <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">Create Quote</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  aria-label="Cities"
                  value={quoteCity}
                  onChange={async (e)=>{
                    const val = e.target.value
                    setQuoteCity(val)
                    setQuoteProperty('')
                    setQuotePropertyOptions([])
                    try { const rp = await fetch(`/api/crm2/options/properties?city=${encodeURIComponent(val)}`, { cache: 'no-store' }); const pj = await rp.json(); if (pj.ok) setQuotePropertyOptions((pj.data||[]).map((p:any)=>({ extId: p.extId||p.id, title: p.title }))) } catch {}
                  }}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Cities</option>
                  {quoteCities.map(c=> (<option key={c} value={c} className="bg-black">{c}</option>))}
                </select>
                <select
                  aria-label="Property"
                  value={quoteProperty}
                  onChange={(e)=> setQuoteProperty(e.target.value)}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Select property</option>
                  {quotePropertyOptions.map(p=> (<option key={p.extId} value={p.extId} className="bg-black">{p.title} ({p.extId})</option>))}
                </select>
                <div className="relative">
                  <button
                    type="button"
                    ref={calBtnRef}
                    onClick={()=> {
                      const next = !calOpen
                      setCalOpen(next)
                      if (next && calBtnRef.current) {
                        const r = calBtnRef.current.getBoundingClientRect()
                        setCalPos({ left: r.left, top: r.bottom + 8 })
                      }
                    }}
                    className="w-full text-left bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white hover:border-zinc-400/60"
                  >
                    {quoteStart ? new Date(quoteStart).toLocaleDateString('en-GB') : 'Check in'}
                  </button>
                  {calOpen && calPos && mounted && createPortal((
                    <>
                      <div className="fixed inset-0 z-[999]" onClick={()=> setCalOpen(false)} />
                      <div className="fixed z-[1000] w-64 rounded-xl border border-zinc-600/40 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] p-3" style={{ left: calPos.left, top: calPos.top }}>
                      <div className="flex items-center justify-between mb-2">
                        <button className="px-2 py-1 text-xs rounded border border-zinc-500/40 text-white" onClick={()=> setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth()-1, 1))}>{'<'}</button>
                        <div className="text-white text-sm font-semibold">{calCursor.toLocaleString('en-US',{ month:'long', year:'numeric'})}</div>
                        <button className="px-2 py-1 text-xs rounded border border-zinc-500/40 text-white" onClick={()=> setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth()+1, 1))}>{'>'}</button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-xs text-zinc-300">
                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=> (<div key={d} className="text-center opacity-70">{d}</div>))}
                        {(() => {
                          const start = new Date(calCursor.getFullYear(), calCursor.getMonth(), 1)
                          const end = new Date(calCursor.getFullYear(), calCursor.getMonth()+1, 0)
                          const pad = (start.getDay()+6)%7 // Monday as first
                          const cells: any[] = []
                          for (let i=0;i<pad;i++) cells.push(<div key={'p'+i} className="h-8" />)
                          for (let d=1; d<=end.getDate(); d++) {
                            const iso = new Date(calCursor.getFullYear(), calCursor.getMonth(), d).toISOString().slice(0,10)
                            const selected = quoteStart===iso
                            cells.push(
                              <button
                                key={d}
                                onClick={()=> { setQuoteStart(iso); setCalOpen(false) }}
                                className={`h-8 rounded flex items-center justify-center border ${selected ? 'border-zinc-300/60 bg-white/10 text-white' : 'border-zinc-600/30 hover:border-zinc-400/50 text-zinc-200'}`}
                              >{d}</button>
                            )
                          }
                          return cells
                        })()}
                      </div>
                      </div>
                    </>), document.body)}
                </div>
                <input id="qb_term" type="number" placeholder="Term (months)" className="w-full bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" />
                <input id="qb_rate" type="number" placeholder="Monthly rate (€)" className="w-full bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" />
                <input id="qb_deposit" type="number" placeholder="Deposit (€)" className="w-full bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" />
                <input id="qb_movein" type="number" placeholder="Move-in fee (€)" className="w-full bg-black/40 border border-zinc-600/50 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex items-center justify-end mt-3">
                <button
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all"
                  onClick={async ()=>{
                    const propertyExtId = (quoteProperty || '').trim()
                    const city = (quoteCity || '').trim()
                    const termMonths = Number((document.getElementById('qb_term') as HTMLInputElement)?.value || 0)
                    const monthlyRateCents = Math.round(Number((document.getElementById('qb_rate') as HTMLInputElement)?.value || 0)*100)
                    const depositCents = Math.round(Number((document.getElementById('qb_deposit') as HTMLInputElement)?.value || 0)*100)
                    const moveInFeeCents = Math.round(Number((document.getElementById('qb_movein') as HTMLInputElement)?.value || 0)*100)
                    if (!propertyExtId || monthlyRateCents<=0) return alert('Property and monthly rate required')
                    try {
                      const res = await fetch('/api/crm2/deals', { method:'POST', body: JSON.stringify({
                        leadId: drawerLead.id, propertyExtId, city, termMonths, monthlyRateCents, depositCents, moveInFeeCents, startDate: quoteStart || undefined
                      }) })
                      const j = await res.json()
                      if (j.ok) {
                        // Mark stage as offer
                        setDrawerLead(prev=> prev ? { ...prev, stage: 'offer' } : prev)
                        setLeads(prev=> prev.map(x=> x.id===drawerLead.id ? { ...x, stage: 'offer' } : x))
                        await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id: drawerLead.id, stage: 'offer' }) })
                        // Activity
                        await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId: drawerLead.id, type:'note', content:`Sent quote for ${city||'—'} • €${(monthlyRateCents/100).toLocaleString('de-DE')}/mo` }) })
                        alert('Quote created')
                      } else {
                        alert('Failed to create quote')
                      }
                    } catch {
                      alert('Failed to create quote')
                    }
                  }}
                >Send Quote</button>
              </div>
            </div>

            {/* Latest Quote */}
            <div className="luxury-feature-card p-4 mt-6 mb-6">
              <div className="font-mono uppercase tracking-wider text-sm text-white mb-3">Latest Quote</div>
              {(() => {
                const list = deals.filter(d=> d.leadId === drawerLead.id)
                  .sort((a,b)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())
                const q = list[0]
                if (!q) return <div className="text-zinc-400 text-sm">No quotes yet</div>
                const rate = (Number(q.monthlyRateCents||0)/100).toLocaleString('de-DE')
                const dep = (Number(q.depositCents||0)/100).toLocaleString('de-DE')
                const mv = (Number(q.moveInFeeCents||0)/100).toLocaleString('de-DE')
                return (
                  <div className="space-y-2">
                    <div className="text-white text-sm font-semibold">{q.city || '—'} • {q.termMonths||1} mo • €{rate}/mo</div>
                    <div className="text-zinc-300 text-sm">Deposit €{dep} • Move-in €{mv} • Property {q.propertyExtId}</div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-xs rounded border border-zinc-400/30 text-white"
                        onClick={()=>{
                          const text = `Quote for ${drawerLead.name}: ${q.city||'—'} • ${q.termMonths||1} months • €${rate}/mo\nDeposit €${dep} • Move-in €${mv} • Property ${q.propertyExtId}`
                          navigator.clipboard?.writeText(text)
                        }}>Copy Summary</button>
                      <button
                        className="px-3 py-1 text-xs rounded border border-zinc-400/30 text-white"
                        onClick={async ()=>{
                          const term = prompt('Update term (months):', String(q.termMonths||1))
                          if (!term) return
                          const newTerm = Math.max(1, Number(term))
                          const rateIn = prompt('Update monthly rate (€):', String(Number(q.monthlyRateCents||0)/100))
                          if (!rateIn) return
                          const newRateCents = Math.round(Number(rateIn)*100)
                          try {
                            const res = await fetch(`/api/crm2/deals/${q.id}`, { method:'PATCH', body: JSON.stringify({ termMonths: newTerm, monthlyRateCents: newRateCents }) })
                            const j = await res.json(); if (j.ok) {
                              setDeals(prev=> prev.map(d=> d.id===q.id ? { ...d, termMonths:newTerm, monthlyRateCents:newRateCents } : d))
                              await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId: drawerLead.id, type:'note', content:`Updated quote to ${newTerm} mo • €${(newRateCents/100).toLocaleString('de-DE')}/mo` }) })
                              alert('Quote updated')
                            } else alert('Failed to update quote')
                          } catch { alert('Failed to update quote') }
                        }}
                      >Edit Quote</button>
                      <a
                        className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white"
                        href={`mailto:${(drawerLead.email||'').trim()}?subject=${encodeURIComponent('Quote from Swift Luxury')}&body=${encodeURIComponent(`Hello ${drawerLead.name},%0D%0A%0D%0AHere is your quote:%0D%0A• City: ${q.city||'—'}%0D%0A• Term: ${q.termMonths||1} months%0D%0A• Monthly: €${rate}%0D%0A• Deposit: €${dep}%0D%0A• Move-in: €${mv}%0D%0A• Property: ${q.propertyExtId}%0D%0A%0D%0ABest regards,%0D%0ASwift Luxury`)}`}
                        target="_blank" rel="noopener noreferrer">Email Quote</a>
                      <button
                        className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white"
                        onClick={async ()=>{
                          setDrawerLead(prev=> prev ? { ...prev, stage: 'signed' } : prev)
                          setLeads(prev=> prev.map(x=> x.id===drawerLead.id ? { ...x, stage: 'signed' } : x))
                          try {
                            await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id: drawerLead.id, stage: 'signed' }) })
                            await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId: drawerLead.id, type:'note', content:`Client accepted quote • property ${q.propertyExtId}` }) })
                          } catch {}
                        }}>Mark Signed</button>
                      <button
                        className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white"
                        onClick={async ()=>{
                          try {
                            const startVal = (document.getElementById('qb_start') as HTMLInputElement)?.value
                            const startISO = startVal ? new Date(startVal).toISOString() : new Date().toISOString()
                            const res = await fetch('/api/crm2/create-booking', { method:'POST', body: JSON.stringify({
                              propertyExtId: q.propertyExtId,
                              email: drawerLead.email,
                              name: drawerLead.name,
                              termMonths: q.termMonths,
                              monthlyRateCents: q.monthlyRateCents,
                              depositCents: q.depositCents,
                              moveInFeeCents: q.moveInFeeCents,
                              startDate: startISO
                            }) })
                            const j = await res.json()
                            if (j.ok) {
                              await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId: drawerLead.id, type:'note', content:`Created booking from quote • property ${q.propertyExtId}` }) })
                              const count = j.data.payments?.length||0
                              const url = j.data.adminUrl || '/admin/bookings'
                              setBookingPreview({ id: j.data.id, payments: j.data.payments || [] })
                              if (confirm(`Booking created with ${count} scheduled payments. Open bookings now?`)) {
                                window.open(url, '_blank')
                              }
                            } else { setError(j.error || 'Failed to create booking'); alert('Failed to create booking') }
                          } catch (e:any) { setError(e?.message || 'Failed to create booking'); alert('Failed to create booking') }
                        }}>Create Booking</button>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Scheduled Payments Preview (after booking creation) */}
            {bookingPreview && (
              <div className="luxury-feature-card p-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono uppercase tracking-wider text-sm text-white">Scheduled Payments</div>
                  <div className="text-zinc-300 text-xs">Booking {bookingPreview.id.slice(0,8)}</div>
                </div>
                <div className="space-y-2">
                  {(bookingPreview.payments || []).map((p:any)=> (
                    <div key={p.id || `${p.purpose}-${p.dueAt}`} className="flex items-center justify-between rounded border border-zinc-600/40 bg-black/30 px-3 py-2">
                      <div className="text-sm text-zinc-300 capitalize">{String(p.purpose).replace('_',' ')}</div>
                      <div className="text-xs text-zinc-400">{p.dueAt ? new Date(p.dueAt).toLocaleDateString() : ''}</div>
                      <div className="text-sm text-white">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</div>
                    </div>
                  ))}
                  {(bookingPreview.payments || []).length === 0 && (
                    <div className="text-zinc-400 text-sm">No payments created</div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white"
                    onClick={async ()=>{
                      try {
                        const res = await fetch('/api/admin/lease', { method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bookingPreview.id }) })
                        const j = await res.json()
                        if (res.ok && j?.url) {
                          await fetch('/api/crm2/activities', { method:'POST', body: JSON.stringify({ leadId: drawerLead!.id, type:'note', content:`Lease PDF generated for booking ${bookingPreview.id}` }) })
                          window.open(j.url, '_blank')
                        } else {
                          setError(j?.message || 'Failed to generate lease')
                          alert('Failed to generate lease')
                        }
                      } catch (e:any) { setError(e?.message || 'lease-failed'); alert('Failed to generate lease') }
                    }}
                  >Generate Lease PDF</button>
                </div>
              </div>
            )}

            {/* Renewals Pipeline */}
            <div className="luxury-feature-card p-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono uppercase tracking-wider text-sm text-white">Renewals</div>
                <div className="flex items-center gap-2">
                  {[30,45,60].map(d=> (
                    <button key={d} className="px-3 py-1 text-xs rounded border border-zinc-400/30 text-white" onClick={async()=>{
                      try { const r=await fetch(`/api/crm2/renewals?days=${d}`); const j=await r.json(); if(j.ok){
                        if (j.data && j.data.length) alert(`${j.data.length} bookings ending in ${d}d`); else alert(`No renewals in ${d}d window`)
                      } } catch {}
                    }}>{d}d</button>
                  ))}
                </div>
              </div>
              <button className="px-3 py-2 text-xs rounded border border-emerald-400/30 text-white" onClick={async()=>{
                // quick create reminder activity for current lead
                try { const due = new Date(Date.now()+45*24*60*60*1000).toISOString(); const r = await fetch('/api/crm2/activities',{ method:'POST', body: JSON.stringify({ leadId: drawerLead.id, type:'renewal', content:'Follow up renewal', dueAt: due }) }); const j=await r.json(); if(j.ok) setActivities(prev=> [j.data, ...prev]) } catch {}
              }}>Create 45d Reminder</button>
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

function InAppBell({ activities, onSnooze, onComplete }: { activities:any[]; onSnooze:(id:string)=>void; onComplete:(id:string)=>void }) {
  const [open, setOpen] = React.useState(false)
  const due = React.useMemo(()=>{
    const today = new Date(); today.setHours(0,0,0,0)
    return activities.filter(a=> !a.completedAt && a.dueAt && new Date(a.dueAt).getTime() < today.getTime()+24*60*60*1000)
  }, [activities])
  const count = due.length
  return (
    <div className="relative">
      <button onClick={()=> setOpen(v=> !v)} className="relative px-3 py-2 rounded-lg border border-zinc-400/30 text-white">
        🔔
        {count>0 && <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-600/40 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] p-3 z-50">
          <div className="font-mono uppercase tracking-wider text-xs text-white mb-2">Due Today / Overdue</div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {due.map(a=> (
              <div key={a.id} className="flex items-center justify-between text-xs border border-zinc-700/40 rounded p-2">
                <div className="text-zinc-300 truncate mr-2">{a.type}: {a.content}</div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-0.5 rounded border border-zinc-400/30 text-white" onClick={()=> onSnooze(a.id)}>Snooze</button>
                  <button className="px-2 py-0.5 rounded border border-emerald-400/30 text-white" onClick={()=> onComplete(a.id)}>Done</button>
                </div>
              </div>
            ))}
            {count===0 && <div className="text-zinc-400 text-xs">All clear</div>}
          </div>
        </div>
      )}
    </div>
  )
}


