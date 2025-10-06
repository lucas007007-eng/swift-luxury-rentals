'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { createPortal } from 'react-dom'

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

const STAGE_SLA_DAYS: Record<string, number> = {
  new: 2,
  qualified: 5,
  viewing: 7,
  application: 3,
  screening: 3,
  offer: 5,
  lease: 3,
  signed: 0,
}

const TEAM_OWNERS = [
  'ops@swiftluxury.local',
  'agent1@swiftluxury.local',
  'agent2@swiftluxury.local'
]

export default function AdminCRMPage() {
  const { data: session } = useSession()
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
  const [filterOwner, setFilterOwner] = useState<string>('')
  const [filterSLA, setFilterSLA] = useState<'all'|'breach'|'due'>('all')
  const [activeTab, setActiveTab] = useState<'board'|'renewals'>('board')
  const [renewalDays, setRenewalDays] = useState<number>(45)
  const [renewals, setRenewals] = useState<any[]>([])
  const [renewalSearch, setRenewalSearch] = useState('')
  const [renewalSort, setRenewalSort] = useState<'checkout'|'client'|'city'|'days'>('checkout')
  const [owners, setOwners] = useState<string[]>([])
  const [myOnly, setMyOnly] = useState(false)
  const [leaseSelected, setLeaseSelected] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  // Derived selections
  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)

  // Simple lead score (0-100): combines value and urgency
  const getLeadScore = (l: any): number => {
    try {
      // Monetary value from latest deal or budget
      const dl = (deals || [])
        .filter((d: any) => d.leadId === l.id)
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0]
      const dealValueCents = dl ? Number(dl.monthlyRateCents || 0) * Math.max(1, Number(dl.termMonths || 1)) : 0
      const budgetCents = Number(l.budgetCents || 0)
      const valueCents = Math.max(dealValueCents, budgetCents)
      // Normalize value to 0..60 (e.g., €0..€50k scaled)
      const valueScore = Math.max(0, Math.min(60, Math.round((valueCents / 100) / 50000 * 60)))
      // Urgency from SLA consumption -> 0..40
      const slaDays = STAGE_SLA_DAYS[l.stage] ?? 0
      let urgencyScore = 0
      if (slaDays > 0) {
        const lastStageTs = (l as any).stageHistory?.[0]?.changedAt
          ? new Date((l as any).stageHistory[0].changedAt).getTime()
          : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
        if (lastStageTs) {
          const ageMs = Date.now() - lastStageTs
          const slaMs = slaDays * 24 * 60 * 60 * 1000
          const pct = Math.max(0, Math.min(150, Math.round((ageMs / slaMs) * 100)))
          // Map 0..100% -> 0..30, 100..150% -> 30..40
          urgencyScore = pct <= 100 ? Math.round(pct * 0.3) : 30 + Math.round((pct - 100) * 0.2)
          urgencyScore = Math.max(0, Math.min(40, urgencyScore))
        }
      }
      return Math.max(0, Math.min(100, valueScore + urgencyScore))
    } catch {
    return 0
    }
  }
  const jumpToBreaches = () => {
    setFilterSLA('breach')
    setTimeout(() => {
      const breach = leads.find((l:any) => {
        const slaDays = STAGE_SLA_DAYS[l.stage] ?? 0
        if (!slaDays) return false
        const lastStageTs = l.stageHistory?.[0]?.changedAt ? new Date(l.stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
        if (!lastStageTs) return false
        return (Date.now() - lastStageTs) > slaDays*24*60*60*1000
      })
      if (breach) {
        const el = document.getElementById(`lead-${breach.id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('highlight-flash')
          setTimeout(() => el.classList.remove('highlight-flash'), 2000)
        }
      }
    }, 120)
  }
  const jumpToDue = () => {
    setFilterSLA('due')
    setTimeout(() => {
      const dueLead = leads.find((l:any) => {
        const slaDays = STAGE_SLA_DAYS[l.stage] ?? 0
        if (!slaDays) return false
        const lastStageTs = l.stageHistory?.[0]?.changedAt ? new Date(l.stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
        if (!lastStageTs) return false
        const ageMs = Date.now() - lastStageTs
        const slaMs = slaDays*24*60*60*1000
        return ageMs > (slaMs - 24*60*60*1000) && ageMs <= slaMs
      })
      if (dueLead) {
        const el = document.getElementById(`lead-${dueLead.id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('highlight-flash')
          setTimeout(() => el.classList.remove('highlight-flash'), 2000)
        }
      }
    }, 120)
  }
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
    // Load owners list
    fetch('/api/crm2/owners').then(r=> r.json()).then(j=> { if (j.ok) setOwners((j.data||[]).map((o:any)=> o.email)) }).catch(()=>{})
    const accept = sp.get('accept')
    if (accept==='ok') {
      alert('Quote accepted. Lead advanced to Signed.')
    }
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
    // Parse direct filters from URL (?owner=&city=&stage=&sla=&my=1)
    const qOwner = sp.get('owner') || ''
    const qCity = sp.get('city') || ''
    const qStage = sp.get('stage') || ''
    const qSla = sp.get('sla') || ''
    const qMy = sp.get('my') || ''
    if (qOwner) setFilterOwner(qOwner)
    if (qCity) setFilterCity(qCity)
    if (qStage) setFilterStage(qStage)
    if (qSla === 'breach' || qSla === 'due') setFilterSLA(qSla as any)
    if (qMy === '1') setMyOnly(true)
  }, [])

  // Keep URL in sync with current filters
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const set = (k: string, v: string) => { if (v) url.searchParams.set(k, v); else url.searchParams.delete(k) }
    set('owner', filterOwner || '')
    set('city', filterCity || '')
    set('stage', filterStage !== 'all' ? filterStage : '')
    set('sla', filterSLA !== 'all' ? filterSLA : '')
    if (myOnly) url.searchParams.set('my', '1'); else url.searchParams.delete('my')
    window.history.replaceState(null, '', url.toString())
  }, [filterOwner, filterCity, filterStage, filterSLA, myOnly])

  const filteredLeads = useMemo(() => {
    const isBreachOrDue = (l: any) => {
      const slaDays = STAGE_SLA_DAYS[l.stage] ?? 0
      if (!slaDays) return { breach:false, due:false }
      const lastStageTs = l.stageHistory?.[0]?.changedAt ? new Date(l.stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
      if (!lastStageTs) return { breach:false, due:false }
      const ageMs = Date.now() - lastStageTs
      const slaMs = slaDays*24*60*60*1000
      return { breach: ageMs > slaMs, due: ageMs > slaMs - 24*60*60*1000 && ageMs <= slaMs }
    }
    const myEmail = (session?.user?.email || '').toLowerCase()
    return leads.filter(l =>
      (filterStage === 'all' || l.stage === filterStage) &&
      (!filterCity || (l.city || '').toLowerCase().includes(filterCity.toLowerCase())) &&
      (!filterOwner || (l.owner || '').toLowerCase().includes(filterOwner.toLowerCase())) &&
      (!filterText || [l.name, l.email, l.phone, l.company, l.city, l.owner].some(v => (v||'').toLowerCase().includes(filterText.toLowerCase()))) &&
      (!myOnly || ((l.owner || '').toLowerCase() === myEmail)) &&
      ((() => { const s = isBreachOrDue(l); if (filterSLA==='breach') return s.breach; if (filterSLA==='due') return s.due; return true })())
    )
  }, [leads, filterStage, filterCity, filterOwner, filterText, filterSLA, myOnly, session?.user?.email])

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
    // SLA breaches and due soon (within next 24h)
    let breaches = 0
    let dueSoon = 0
    for (const l of leads) {
      const slaDays = STAGE_SLA_DAYS[l.stage] ?? 0
      if (!slaDays) continue
      const lastStageTs = (l as any).stageHistory?.[0]?.changedAt ? new Date((l as any).stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
      if (!lastStageTs) continue
      const ageMs = Date.now() - lastStageTs
      const slaMs = slaDays*24*60*60*1000
      if (ageMs > slaMs) breaches++
      else if (ageMs > slaMs - 24*60*60*1000) dueSoon++
    }
    return { total, offers, signed, newWeek, breaches, dueSoon }
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
      const j2 = await res2.json(); if (j2.ok) {
        setActivities(prev=> [j2.data, ...prev])
        // mark row as reminded to show visual feedback
        setRenewals(prev=> prev.map((r:any)=> r.id===row.id ? { ...r, __reminded: true } : r))
      }
    } catch { alert('Failed to create reminder') }
  }

  // Generate Lease PDF for a lead in 'lease' stage (creates booking if needed)
  const generateLeaseForLead = async (lead: Lead) => {
    try {
      const latest = deals
        .filter((d:any)=> d.leadId === lead.id)
        .sort((a:any,b:any)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())[0]
      if (!latest) { alert('No quote found for this lead'); return }
      const startISO = new Date().toISOString()
      const res = await fetch('/api/crm2/create-booking', { method:'POST', body: JSON.stringify({
        propertyExtId: latest.propertyExtId,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        termMonths: latest.termMonths,
        monthlyRateCents: latest.monthlyRateCents,
        depositCents: latest.depositCents,
        moveInFeeCents: latest.moveInFeeCents,
        startDate: startISO
      }) })
      const j = await res.json(); if (!j.ok) { alert('Failed to create booking'); return }
      const bookingId = j.data?.id
      const lease = await fetch('/api/admin/lease', { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: bookingId }) })
      const lj = await lease.json();
      if (lease.ok && (lj?.dataUrl || lj?.url)) {
        if (lj.dataUrl) {
          // Create a Blob and open a blob URL to avoid data: navigation issues in some in-app browsers
          try {
            const byteString = atob(lj.dataUrl.split(',')[1] || '')
            const len = byteString.length
            const bytes = new Uint8Array(len)
            for (let i=0;i<len;i++) bytes[i] = byteString.charCodeAt(i)
            const blob = new Blob([bytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(()=> URL.revokeObjectURL(url), 10000)
          } catch {
            window.open(lj.dataUrl, '_blank')
          }
        } else if (lj.url) {
          window.open(lj.url, '_blank')
        }
      } else {
        alert('Failed to generate lease PDF')
      }
    } catch { alert('Lease generation failed') }
  }

  const generateLeasesForSelected = async () => {
    const ids = Object.entries(leaseSelected).filter(([,v])=> v).map(([k])=> k)
    if (!ids.length) { alert('Select lease leads first'); return }
    for (const id of ids) {
      const lead = leads.find(l=> l.id===id)
      if (lead) { await generateLeaseForLead(lead) }
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[2200px] mx-auto px-6 py-10">
        {/* Admin Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Customer Relations</div>
            <h1 className="text-4xl font-bold heading-sora text-white mb-2">CRM Dashboard</h1>
            <p className="text-zinc-300 text-lg">Elite Client Management System</p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
            aria-label="Back to Admin"
          >
            ← Back to Admin
          </a>
        </div>
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
              <div className="luxury-feature-card p-3 text-center md:col-span-2">
                <div className="text-xs text-zinc-300">SLA Breaches</div>
                <div className="text-2xl font-bold text-white">{kpis.breaches}</div>
              </div>
              <div className="luxury-feature-card p-3 text-center md:col-span-2">
                <div className="text-xs text-zinc-300">SLA Due (24h)</div>
                <div className="text-2xl font-bold text-white">{kpis.dueSoon}</div>
              </div>
            </div>
            {/* SLA Legend */}
            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-300">
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-400/70"></span><span>On pace (&lt; 80%)</span></div>
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-400/70"></span><span>Due (80–100%)</span></div>
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500/70"></span><span>Breached (&gt; 100%)</span></div>
            </div>
          </div>
          <div className="luxury-feature-card p-8">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 mb-3">Filters & Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded-lg px-3 py-2 text-sm text-white font-sora">
                <option className="bg-black" value="all">All Stages</option>
                {STAGES.map(s=> <option className="bg-black" key={s} value={s}>{s}</option>)}
              </select>
              <input value={filterCity} onChange={e=>setFilterCity(e.target.value)} placeholder="City" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" />
              <select value={filterOwner} onChange={e=>setFilterOwner(e.target.value)} className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora">
                <option className="bg-black" value="">All Owners</option>
                <option className="bg-black" value="unassigned">Unassigned</option>
                {(owners.length? owners: TEAM_OWNERS).map(o=> <option className="bg-black" key={o} value={o}>{o}</option>)}
              </select>
              <input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder="Search name/email/company" className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora md:col-span-2" />
              <select value={filterSLA} onChange={e=> setFilterSLA(e.target.value as any)} className="w-full bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora">
                <option className="bg-black" value="all">All SLA</option>
                <option className="bg-black" value="breach">Breaches</option>
                <option className="bg-black" value="due">Due (24h)</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={myOnly} onChange={(e)=> setMyOnly(e.target.checked)} /> My leads</label>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={()=>setNewLeadOpen(true)} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:scale-105 transition-all">New Lead</button>
              {selectedIds.length>0 && (
                <>
                <button
                    className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white"
                    onClick={async ()=>{
                      const newOwner = prompt('Assign owner (email) to selected:') || ''
                      if (!newOwner) return
                      for (const id of selectedIds) {
                        try { await fetch('/api/crm2/leads', { method: 'PATCH', body: JSON.stringify({ id, owner: newOwner }) }) } catch {}
                      }
                      setLeads(prev => prev.map(l => selected[l.id] ? { ...l, owner: newOwner } : l))
                      setSelected({})
                    }}
                  >Assign Owner</button>
                  <button
                    className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white"
                    onClick={async ()=>{
                      const newStage = prompt('Change stage to (new,qualified,viewing,application,screening,offer,lease,signed):') || ''
                      if (!newStage) return
                      for (const id of selectedIds) {
                        try { await fetch('/api/crm2/leads', { method: 'PATCH', body: JSON.stringify({ id, stage: newStage }) }) } catch {}
                      }
                      setLeads(prev => prev.map(l => selected[l.id] ? { ...l, stage: newStage } : l))
                      setSelected({})
                    }}
                  >Change Stage</button>
                </>
              )}
              <div className="ml-3 flex items-center gap-2">
                <a href="/crm2?view=offers" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Offers Out</a>
                <a href="/crm2?view=signed" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Signed</a>
                <a href="/crm2?view=new7" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">New 7d</a>
                <a href="/crm2?view=renewals45" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Renewals 45d</a>
                <a href="/api/crm2/export?type=leads" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Export Leads</a>
                <a href="/api/crm2/export?type=activities" className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white">Export Activities</a>
                <button onClick={jumpToBreaches} className="px-3 py-2 text-xs rounded border border-red-400/40 text-red-300 hover:border-red-300/60">Jump to Breaches</button>
                <button onClick={jumpToDue} className="px-3 py-2 text-xs rounded border border-amber-400/40 text-amber-300 hover:border-amber-300/60">Jump to Due (24h)</button>
                <button onClick={generateLeasesForSelected} className="px-3 py-2 text-xs rounded border border-emerald-400/40 text-white hover:border-emerald-300/60">Generate Lease PDFs</button>
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
              <input value={renewalSearch} onChange={e=> setRenewalSearch(e.target.value)} placeholder="Search client/city" className="ml-2 bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white" />
              <select value={renewalSort} onChange={e=> setRenewalSort(e.target.value as any)} className="bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white">
                <option className="bg-black" value="checkout">Checkout</option>
                <option className="bg-black" value="client">Client</option>
                <option className="bg-black" value="city">City</option>
                <option className="bg-black" value="days">Days to checkout</option>
              </select>
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
                      className={`w-full text-left rounded-lg border ${selected[l.id] ? 'border-zinc-300/70' : 'border-zinc-600/40'} bg-black/30 p-3 hover:border-zinc-400/60 transition-colors`}
                      id={`lead-${l.id}`}
                      title={`Stage changed ${((l as any).stageHistory?.[0]?.changedAt ? new Date((l as any).stageHistory[0].changedAt) : (l.updatedAt ? new Date(l.updatedAt) : null))?.toLocaleString() || ''}`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-300">
                        <input type="checkbox" checked={!!selected[l.id]} onChange={(e)=> setSelected(prev=> ({ ...prev, [l.id]: e.target.checked }))} onClick={(e)=> e.stopPropagation()} />
                        <span>Select</span>
                  </div>
                      {stage==='lease' && (
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-[11px] text-zinc-300">
                            <input type="checkbox" checked={!!leaseSelected[l.id]} onChange={(e)=> setLeaseSelected(prev=> ({ ...prev, [l.id]: e.target.checked }))} />
                            Select for lease PDF
                          </label>
                          <button
                            className="px-2 py-1 text-[11px] rounded border border-emerald-400/30 text-white hover:border-emerald-300/60"
                            onClick={(e)=> { e.stopPropagation(); generateLeaseForLead(l) }}
                            title="Generate lease PDF now"
                          >Generate Lease</button>
                  </div>
                      )}
                      {stage==='offer' && (
                        <div className="mb-1 flex items-center justify-end gap-2">
                          <button
                            className="px-2 py-1 text-[11px] rounded border border-zinc-400/30 text-white hover:border-zinc-300/60"
                            onClick={async (e)=>{
                              e.stopPropagation()
                              try {
                                const dl = (deals || []).filter((d:any)=> d.leadId === l.id).sort((a:any,b:any)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())[0]
                                if (!dl) { alert('No quote found for this lead'); return }
                                const r = await fetch('/api/crm2/quotes/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dealId: dl.id }) })
                                const j = await r.json()
                                if (j.ok && (j.dataUrl || j.url)) {
                                  if (j.dataUrl) {
                                    try {
                                      const b64 = j.dataUrl.split(',')[1] || ''
                                      const bin = atob(b64)
                                      const len = bin.length
                                      const bytes = new Uint8Array(len)
                                      for (let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i)
                                      const blob = new Blob([bytes], { type: 'application/pdf' })
                                      const url = URL.createObjectURL(blob)
                                      window.open(url, '_blank')
                                      setTimeout(()=> URL.revokeObjectURL(url), 10000)
                                    } catch { window.open(j.dataUrl, '_blank') }
                                  } else {
                                    window.open(j.url, '_blank')
                                  }
                                } else alert('Failed to generate quote PDF')
                              } catch { alert('Failed to generate quote PDF') }
                            }}
                            title="Generate quote PDF"
                          >Quote PDF</button>
                    </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold font-sora truncate">{l.name}</div>
                        <div className="text-xs text-zinc-400 ml-2 flex items-center gap-2">
                          <span>{l.company || '—'}</span>
                          <span className="px-1.5 py-0.5 rounded border border-zinc-500/40 text-[10px] text-zinc-300" title="Lead Score">
                            {getLeadScore(l)}
                          </span>
                    </div>
                  </div>
                      <div className="text-xs text-zinc-300 mt-1 truncate">{l.email || 'no-email'}{l.phone ? ` • ${l.phone}` : ''}</div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                        <span>{l.city || '—'}</span>
                        <span className="text-white">{(() => {
                          let cents = Number((l as any).budgetCents || 0)
                          if (!cents || cents <= 0) {
                            const dl = (deals || []).filter((d:any)=> d.leadId === l.id).sort((a:any,b:any)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())[0]
                            if (dl) cents = Number(dl.monthlyRateCents||0) * Number(dl.termMonths||0) + Number(dl.moveInFeeCents||0)
                          }
                          return (cents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'})
                        })()}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-400">Owner: {l.owner || 'Unassigned'}</span>
                        {l.stage==='offer' && (()=>{
                          // Show expiry countdown if we have a recent deal
                          const dl = (deals || []).filter((d:any)=> d.leadId === l.id).sort((a:any,b:any)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())[0]
                          if (!dl || !dl.createdAt) return null
                          const created = new Date(dl.createdAt).getTime()
                          const expires = created + 7*24*60*60*1000
                          const msLeft = expires - Date.now()
                          const daysLeft = Math.max(0, Math.ceil(msLeft/(24*60*60*1000)))
                          const label = daysLeft>0 ? `${daysLeft}d left` : 'Expired'
                          const cls = daysLeft>2 ? 'border-emerald-400/40 text-emerald-300' : daysLeft>0 ? 'border-amber-400/40 text-amber-300' : 'border-red-400/40 text-red-300'
                          return <span className={`px-2 py-0.5 text-[10px] rounded border ${cls}`}>{label}</span>
                        })()}
                        <button
                          className="px-2 py-0.5 text-[11px] rounded border border-zinc-400/40 text-white hover:border-zinc-300/60"
                          onClick={async (e)=>{
                            e.stopPropagation()
                            try {
                              const r = await fetch(`/api/crm2/bookings?email=${encodeURIComponent((l.email||'').toLowerCase())}`)
                              const j = await r.json()
                              if (j.ok && j.data?.adminUrl) { window.open(j.data.adminUrl, '_blank') }
                              else { alert('No booking found for this lead') }
                            } catch { alert('Lookup failed') }
                          }}
                          title="Open in Admin Bookings"
                        >Open booking</button>
                        {(() => {
                          const sla = STAGE_SLA_DAYS[l.stage] ?? 0
                          const lastStageTs = (l as any).stageHistory?.[0]?.changedAt ? new Date((l as any).stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
                          const ageHours = lastStageTs ? Math.floor((Date.now() - lastStageTs)/(60*60*1000)) : 0
                          const slaHours = sla*24
                          if (sla>0 && ageHours>slaHours) return <span title={`Changed ${Math.floor(ageHours)}h ago`} className="px-2 py-0.5 text-[10px] rounded border border-red-400/40 text-red-300">SLA {ageHours - slaHours}h overdue</span>
                          if (sla>0 && ageHours>=slaHours-1 && ageHours<slaHours) return <span title={`Changed ${Math.floor(ageHours)}h ago`} className="px-2 py-0.5 text-[10px] rounded border border-amber-400/40 text-amber-300">SLA due</span>
                          return null
                        })()}
                      </div>
                      {(() => {
                        const sla = STAGE_SLA_DAYS[l.stage] ?? 0
                        if (!sla) return null
                        const lastStageTs = (l as any).stageHistory?.[0]?.changedAt ? new Date((l as any).stageHistory[0].changedAt).getTime() : (l.updatedAt ? new Date(l.updatedAt).getTime() : 0)
                        if (!lastStageTs) return null
                        const ageMs = Date.now() - lastStageTs
                        const slaMs = sla*24*60*60*1000
                        const pct = Math.max(0, Math.min(100, Math.round((ageMs / slaMs) * 100)))
                        const color = ageMs > slaMs ? 'bg-red-500/70' : (pct > 80 ? 'bg-amber-400/70' : 'bg-emerald-400/70')
                          return (
                          <div className="mt-1 h-1.5 bg-zinc-700/40 rounded" title={`SLA ${pct}% used`}>
                            <div className={`h-full rounded ${color}`} style={{ width: `${pct}%` }} />
                            </div>
                          )
                      })()}
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
                    <th className="px-2 py-2"><input type="checkbox" onChange={(e)=>{
                      const checked = e.target.checked
                      setRenewals(prev=> prev.map((r:any)=> ({ ...r, __sel: checked })))
                    }} /></th>
                    <th className="px-2 py-2">Checkout</th>
                    <th className="px-2 py-2">Client</th>
                    <th className="px-2 py-2">Property</th>
                    <th className="px-2 py-2">City</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals
                    .filter((r:any)=> {
                      const q = renewalSearch.toLowerCase()
                      if (!q) return true
                      return (r.userName||'').toLowerCase().includes(q) || (r.userEmail||'').toLowerCase().includes(q) || (r.city||'').toLowerCase().includes(q)
                    })
                    .sort((a:any,b:any)=> {
                      if (renewalSort==='checkout') return new Date(a.checkout||0).getTime() - new Date(b.checkout||0).getTime()
                      if (renewalSort==='client') return String(a.userName||a.userEmail||'').localeCompare(String(b.userName||b.userEmail||''))
                      if (renewalSort==='city') return String(a.city||'').localeCompare(String(b.city||''))
                      // days
                      const today = new Date(); today.setHours(0,0,0,0)
                      const da = Math.ceil((new Date(a.checkout||today).getTime() - today.getTime())/(24*60*60*1000))
                      const db = Math.ceil((new Date(b.checkout||today).getTime() - today.getTime())/(24*60*60*1000))
                      return da - db
                    })
                    .map((r:any)=> (
                    <tr key={r.id} className={`border-t border-zinc-700/40 ${r.__reminded ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-2 py-2"><input type="checkbox" checked={!!r.__sel} onChange={(e)=> setRenewals(prev=> prev.map((x:any)=> x.id===r.id ? { ...x, __sel: e.target.checked } : x))} /></td>
                      <td className="px-2 py-2 text-zinc-200">{r.checkout ? `${new Date(r.checkout).toLocaleDateString()} (${(()=>{ const t=new Date(); t.setHours(0,0,0,0); return Math.ceil((new Date(r.checkout).getTime()-t.getTime())/(24*60*60*1000))})()}d)` : ''}</td>
                      <td className="px-2 py-2 text-zinc-300 flex items-center gap-2">
                        <span>{r.userName || r.userEmail || '—'}</span>
                        {r.__reminded && <span className="text-emerald-300 text-[11px]">Reminder created</span>}
                        {!r.userEmail && <button className="px-2 py-0.5 text-[10px] rounded border border-emerald-400/30 text-white" onClick={async()=>{
                          const email = prompt('Email for new lead:') || ''
                          const owner = prompt('Assign owner (optional, email):') || ''
                          if (!email) return
                          try {
                            const res = await fetch('/api/crm2/leads', { method:'POST', body: JSON.stringify({ name: r.userName||'Client', email, city: r.city||'', stage:'qualified', owner }) })
                            const j = await res.json(); if (j.ok) { setLeads(prev=> [j.data, ...prev]); alert('Lead created and assigned') }
                          } catch { alert('Failed to create lead') }
                        }}>Create + Assign</button>}
                      </td>
                      <td className="px-2 py-2 text-zinc-300">{r.propertyTitle || '—'}</td>
                      <td className="px-2 py-2 text-zinc-300">{r.city || '—'}</td>
                      <td className="px-2 py-2 text-right">
                        {/* Inline Assign Lead (if lead exists by email) */}
                        {(() => {
                          const email = (r.userEmail||'').toLowerCase()
                          const lead = leads.find(l => (l.email||'').toLowerCase()===email)
                          if (!lead) return null
                          return (
                            <span className="inline-flex items-center gap-1 mr-2">
                              <select className="bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white" defaultValue={lead.owner||''} id={`assign-${r.id}`}>
                                <option className="bg-black" value="">Unassigned</option>
                                {(owners.length? owners: TEAM_OWNERS).map(o=> <option key={o} className="bg-black" value={o}>{o}</option>)}
                              </select>
                              <button className="px-2 py-1 text-[10px] rounded border border-zinc-400/30 text-white" onClick={async()=>{ const sel=(document.getElementById(`assign-${r.id}`) as HTMLSelectElement)?.value||''; try{ await fetch('/api/crm2/leads',{ method:'PATCH', body: JSON.stringify({ id: lead.id, owner: sel }) }); setLeads(prev=> prev.map(x=> x.id===lead.id ? { ...x, owner: sel } : x)); alert('Owner assigned'); }catch{ alert('Failed to assign') } }}>Assign</button>
                    </span>
                          )
                        })()}
                        <button className="px-3 py-1 text-xs rounded border border-emerald-400/30 text-white" onClick={()=> createRenewalReminder(r)}>Create Reminder</button>
                      </td>
                    </tr>
                  ))}
                  {renewals.length===0 && (
                    <tr><td colSpan={5} className="px-2 py-6 text-center text-zinc-400">No renewals found</td></tr>
                  )}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-end gap-2">
                <div className="text-xs text-emerald-300" id="renewal-toast" style={{display:'none'}}>Reminders created</div>
                <button className="px-3 py-2 text-xs rounded border border-emerald-400/30 text-white" onClick={async()=>{
                  const selected = renewals.filter((r:any)=> r.__sel)
                  if (!selected.length) { alert('Select rows first'); return }
                  for (const r of selected) { await createRenewalReminder(r) }
                  try { const el=document.getElementById('renewal-toast'); if (el) { el.textContent = `Created ${selected.length} reminder${selected.length>1?'s':''}`; el.style.display='inline'; setTimeout(()=>{ if (el) el.style.display='none' }, 2000) } } catch {}
                }}>Create Reminders for Selected</button>
                    </div>
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
                <div className="grid grid-cols-3 gap-2">
                  <select className="col-span-2 bg-black/40 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-white font-sora" value={drawerLead.owner||''} onChange={e=> setDrawerLead(prev=> prev ? { ...prev, owner: e.target.value } : prev)}>
                    <option className="bg-black" value="">Unassigned</option>
                    {(owners.length? owners: TEAM_OWNERS).map(o=> <option className="bg-black" key={o} value={o}>{o}</option>)}
                  </select>
                  <button className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white" onClick={async()=>{ const v = drawerLead.owner||''; setLeads(prev=> prev.map(x=> x.id===drawerLead.id ? { ...x, owner: v } : x)); try{ await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id: drawerLead.id, owner: v }) }) } catch{} }}>Save Owner</button>
                </div>
                <div className="flex items-center justify-end">
                  <button className="px-3 py-2 text-xs rounded border border-zinc-400/30 text-white mr-2" onClick={async()=>{ const v = prompt('Assign owner (email):', drawerLead.owner||''); if (v!==null){ setDrawerLead(prev=> prev ? { ...prev, owner: v } : prev); setLeads(prev=> prev.map(x=> x.id===drawerLead.id ? { ...x, owner: v } : x)); try{ await fetch('/api/crm2/leads', { method:'PATCH', body: JSON.stringify({ id: drawerLead.id, owner: v }) }) } catch{} }} }>Assign</button>
                </div>
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
                            <button className="px-2 py-1 text-[10px] rounded border border-zinc-400/30 text-white" onClick={async()=>{ await fetch('/api/crm2/activities',{ method:'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id: a.id, snoozeDays: 1 }) }); const newDue = new Date(Date.now()+24*60*60*1000).toISOString(); setActivities(prev=> prev.map(x=> x.id===a.id ? { ...x, dueAt: newDue } : x)); alert(`Snoozed to ${new Date(newDue).toLocaleDateString()}`) }}>Snooze 1d</button>
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
                        href="#"
                        onClick={async (e)=>{ e.preventDefault(); try {
                          await fetch('/api/crm2/quotes/send', { method:'POST', body: JSON.stringify({
                            to: (drawerLead.email||'').trim(),
                            leadId: drawerLead.id,
                            dealId: q.id,
                            city: q.city,
                            termMonths: q.termMonths,
                            monthlyRateCents: q.monthlyRateCents,
                            depositCents: q.depositCents,
                            moveInFeeCents: q.moveInFeeCents
                          }) })
                          alert('Quote email sent (or logged in dry-run)')
                        } catch { alert('Failed to send email') } }}
                      >Email Quote</a>
                      <button
                        className="px-3 py-1 text-xs rounded border border-zinc-400/30 text-white"
                        onClick={async ()=>{
                          try {
                            const r = await fetch('/api/crm2/quotes/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dealId: q.id }) })
                            const j = await r.json()
                            if (j.ok && (j.dataUrl || j.url)) {
                              if (j.dataUrl) {
                                try {
                                  const b64 = j.dataUrl.split(',')[1] || ''
                                  const bin = atob(b64)
                                  const len = bin.length
                                  const bytes = new Uint8Array(len)
                                  for (let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i)
                                  const blob = new Blob([bytes], { type: 'application/pdf' })
                                  const url = URL.createObjectURL(blob)
                                  window.open(url, '_blank')
                                  setTimeout(()=> URL.revokeObjectURL(url), 10000)
                                } catch { window.open(j.dataUrl, '_blank') }
                              } else {
                                window.open(j.url, '_blank')
                              }
                            } else alert('Failed to generate quote PDF')
                          } catch { alert('Failed to generate quote PDF') }
                        }}
                      >Generate PDF</button>
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

    </main>
  )
}

function AddActivity({ leadId, onAdd }: { leadId: string; onAdd: (row:any)=>void }) {
  const [content, setContent] = React.useState('')
  const [type, setType] = React.useState('note')
  const [dueAt, setDueAt] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState<Date>(new Date())
  const [pos, setPos] = React.useState<{ left:number; top:number } | null>(null)
  const btnRef = React.useRef<HTMLButtonElement|null>(null)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(()=>{ setMounted(true) }, [])
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
        <div className="col-span-2 relative">
          <button
            type="button"
            ref={btnRef}
            onClick={()=> {
              const next = !open; setOpen(next);
              if (next && btnRef.current) {
                const r = btnRef.current.getBoundingClientRect();
                setPos({ left: r.left, top: r.bottom + 8 })
              }
            }}
            className="w-full text-left bg-black/40 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white hover:border-zinc-400/60"
          >
            {dueAt ? new Date(dueAt).toLocaleDateString('en-GB') : 'Due date'}
                          </button>
          {open && pos && mounted && createPortal((
            <>
              <div className="fixed inset-0 z-[999]" onClick={()=> setOpen(false)} />
              <div className="fixed z-[1000] w-60 rounded-xl border border-zinc-600/40 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] p-2" style={{ left: pos.left, top: pos.top }}>
                <div className="flex items-center justify-between mb-1">
                  <button className="px-2 py-0.5 text-[10px] rounded border border-zinc-500/40 text-white" onClick={()=> setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}>{'<'}</button>
                  <div className="text-white text-xs font-semibold">{cursor.toLocaleString('en-US',{ month:'long', year:'numeric'})}</div>
                  <button className="px-2 py-0.5 text-[10px] rounded border border-zinc-500/40 text-white" onClick={()=> setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}>{'>'}</button>
          </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] text-zinc-300">
                  {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=> (<div key={d} className="text-center opacity-70">{d}</div>))}
                  {(() => {
                    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
                    const end = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0)
                    const pad = (start.getDay()+6)%7
                    const cells: any[] = []
                    for (let i=0;i<pad;i++) cells.push(<div key={'p'+i} className="h-7" />)
                    for (let d=1; d<=end.getDate(); d++) {
                      const iso = new Date(cursor.getFullYear(), cursor.getMonth(), d).toISOString().slice(0,10)
                      const selected = dueAt===iso
                      cells.push(
                        <button key={d} onClick={()=> { setDueAt(iso); setOpen(false) }} className={`h-7 rounded flex items-center justify-center border ${selected ? 'border-zinc-300/60 bg-white/10 text-white' : 'border-zinc-600/30 hover:border-zinc-400/50 text-zinc-200'}`}>{d}</button>
                      )
                    }
                    return cells
                  })()}
        </div>
      </div>
            </>
          ), document.body)}
        </div>
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
      <button onClick={()=> setOpen(v=> !v)} className="relative px-3 py-2 rounded-lg border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] text-white hover:border-zinc-300/40 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0l3-3m-3 3l-3-3" />
        </svg>
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
                  <button className="px-2 py-0.5 rounded border border-zinc-400/30 text-white" onClick={async()=>{ await onSnooze(a.id); alert('Snoozed 1 day') }}>Snooze</button>
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


