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
      const deal = deals.find(d => d.leadId === l.id)
      const monthlyValue = deal?.monthlyRateCents || l.budgetCents || 0
      const valueScore = Math.min(50, (monthlyValue / 100) / 50) // €50/month = 50 pts

      // Urgency from SLA breach
      const sla = STAGE_SLA_DAYS[l.stage] || 7
      const daysSinceUpdate = l.updatedAt ? Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / (24*60*60*1000)) : 0
      const urgencyScore = Math.min(50, Math.max(0, (daysSinceUpdate / sla) * 50))

      return Math.round(valueScore + urgencyScore)
    } catch { return 0 }
  }

  // Load data
  const loadData = async () => {
    try {
      const [leadsRes, activitiesRes, companiesRes, ownersRes, renewalsRes] = await Promise.all([
        fetch('/api/crm2/leads', { cache: 'no-store' }),
        fetch('/api/crm2/activities', { cache: 'no-store' }),
        fetch('/api/crm2/companies', { cache: 'no-store' }),
        fetch('/api/crm2/owners', { cache: 'no-store' }),
        fetch(`/api/crm2/renewals?days=${renewalDays}`, { cache: 'no-store' })
      ])
      
      const [leadsData, activitiesData, companiesData, ownersData, renewalsData] = await Promise.all([
        leadsRes.json(),
        activitiesRes.json(),
        companiesRes.json(),
        ownersRes.json(),
        renewalsRes.json()
      ])
      
      if (leadsData.ok) setLeads(leadsData.data || [])
      if (activitiesData.ok) setActivities(activitiesData.data || [])
      if (companiesData.ok) setCompanies(companiesData.data || [])
      if (ownersData.ok) setOwners(ownersData.data || [])
      if (renewalsData.ok) setRenewals(renewalsData.data || [])
      
      // Load deals for each lead
      const dealsRes = await fetch('/api/crm2/deals', { cache: 'no-store' })
      const dealsData = await dealsRes.json()
      if (dealsData.ok) setDeals(dealsData.data || [])
      
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [renewalDays])

  // Filter leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(l => {
      if (filterStage !== 'all' && l.stage !== filterStage) return false
      if (filterCity && l.city !== filterCity) return false
      if (filterOwner && l.owner !== filterOwner) return false
      if (filterText) {
        const text = filterText.toLowerCase()
        if (!l.name.toLowerCase().includes(text) && 
            !l.email?.toLowerCase().includes(text) && 
            !l.phone?.toLowerCase().includes(text) &&
            !l.company?.toLowerCase().includes(text)) return false
      }
      if (filterSLA !== 'all') {
        const sla = STAGE_SLA_DAYS[l.stage] || 7
        const daysSinceUpdate = l.updatedAt ? Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / (24*60*60*1000)) : 0
        if (filterSLA === 'breach' && daysSinceUpdate <= sla) return false
        if (filterSLA === 'due' && (daysSinceUpdate < sla - 1 || daysSinceUpdate > sla)) return false
      }
      if (myOnly && session?.user?.email && l.owner !== session.user.email) return false
      return true
    })
    
    // Sort by lead score (highest first)
    return filtered.sort((a, b) => getLeadScore(b) - getLeadScore(a))
  }, [leads, filterStage, filterCity, filterOwner, filterText, filterSLA, myOnly, session?.user?.email, deals])

  // Group leads by stage for board view
  const leadsByStage = useMemo(() => {
    const groups: Record<string, Lead[]> = {}
    STAGES.forEach(stage => { groups[stage] = [] })
    filteredLeads.forEach(lead => {
      if (groups[lead.stage]) groups[lead.stage].push(lead)
    })
    return groups
  }, [filteredLeads])

  const createLead = async () => {
    if (!form.name?.trim()) return
    try {
      const res = await fetch('/api/crm2/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, owner: session?.user?.email })
      })
      const data = await res.json()
      if (data.ok) {
        setLeads(prev => [data.data, ...prev])
        setForm({ stage: 'new' })
        setNewLeadOpen(false)
      } else {
        setError(data.error || 'Failed to create lead')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to create lead')
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const res = await fetch('/api/crm2/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      const data = await res.json()
      if (data.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
      } else {
        setError(data.error || 'Failed to update lead')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to update lead')
    }
  }

  const generateLeasesForSelected = async () => {
    const selectedLeadIds = Object.entries(leaseSelected).filter(([, v]) => v).map(([k]) => k)
    for (const leadId of selectedLeadIds) {
      const lead = leads.find(l => l.id === leadId)
      if (lead) { await generateLeaseForLead(lead) }
    }
  }

  const generateLeaseForLead = async (lead: Lead) => {
    // Implementation would go here - placeholder for now
    console.log('Generate lease for lead:', lead.name)
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
          <InAppBell activities={activities} onSnooze={async (id: string)=>{
            await fetch('/api/crm2/activities',{ method:'PATCH', body: JSON.stringify({ id, snoozeDays: 1 }) })
            setActivities(prev=> prev.map(x=> x.id===id ? { ...x, dueAt: new Date(Date.now()+24*60*60*1000).toISOString() } : x))
          }} onComplete={async (id: string)=>{
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
          {/* Quick Actions Card */}
          <div className="luxury-feature-card p-8">
            <div className="mb-4">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Quick Actions</div>
              <h2 className="text-2xl font-bold heading-sora text-white mb-2">Lead Management</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setNewLeadOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
              >
                + New Lead
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'board' ? 'renewals' : 'board')}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-amber-400/50 transition-all duration-300"
              >
                {activeTab === 'board' ? 'View Renewals' : 'View Board'}
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="luxury-feature-card p-8">
            <div className="mb-4">
              <div className="font-mono uppercase tracking-wider text-sm text-sky-400 font-sora">Pipeline Stats</div>
              <h2 className="text-2xl font-bold heading-sora text-white mb-2">Performance</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{filteredLeads.length}</div>
                <div className="text-sm text-zinc-400">Active Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{activities.filter(a => !a.completedAt).length}</div>
                <div className="text-sm text-zinc-400">Pending Tasks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 luxury-feature-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <option value="all" className="bg-black text-white">All Stages</option>
              {STAGES.map(stage => (
                <option key={stage} value={stage} className="bg-black text-white capitalize">{stage}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search leads..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            />
            
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <option value="" className="bg-black text-white">All Owners</option>
              {owners.map(owner => (
                <option key={owner} value={owner} className="bg-black text-white">{owner}</option>
              ))}
            </select>
            
            <select
              value={filterSLA}
              onChange={(e) => setFilterSLA(e.target.value as any)}
              className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-sm text-white shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <option value="all" className="bg-black text-white">All SLA</option>
              <option value="breach" className="bg-black text-white">SLA Breach</option>
              <option value="due" className="bg-black text-white">Due Soon</option>
            </select>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={myOnly}
                onChange={(e) => setMyOnly(e.target.checked)}
                className="rounded"
              />
              My Leads Only
            </label>
            
            <button
              onClick={() => {
                setFilterStage('all')
                setFilterCity('')
                setFilterText('')
                setFilterOwner('')
                setFilterSLA('all')
                setMyOnly(false)
              }}
              className="text-xs px-3 py-2 rounded border border-zinc-400/30 text-zinc-300 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAGES.map(stage => (
              <div key={stage} className="luxury-feature-card p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-white capitalize">{stage}</h3>
                  <div className="text-sm text-zinc-400">{leadsByStage[stage]?.length || 0} leads</div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leadsByStage[stage]?.map(lead => (
                    <div
                      key={lead.id}
                      className="p-3 rounded border border-zinc-600/30 bg-zinc-900/30 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => setDrawerLead(lead)}
                    >
                      <div className="font-semibold text-sm text-white">{lead.name}</div>
                      {lead.company && <div className="text-xs text-zinc-400">{lead.company}</div>}
                      {lead.city && <div className="text-xs text-emerald-400">{lead.city}</div>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-zinc-500">Score: {getLeadScore(lead)}</div>
                        {lead.owner && <div className="text-xs text-amber-400">{lead.owner.split('@')[0]}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="luxury-feature-card p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">Renewal Pipeline</h3>
              <div className="text-sm text-zinc-400">Upcoming lease renewals</div>
            </div>
            <div className="space-y-3">
              {renewals.map(renewal => (
                <div key={renewal.id} className="p-4 rounded border border-zinc-600/30 bg-zinc-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{renewal.clientName}</div>
                      <div className="text-sm text-zinc-400">{renewal.property}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-400">{renewal.daysUntilRenewal} days</div>
                      <div className="text-xs text-zinc-500">{renewal.checkoutDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Lead Modal */}
        {newLeadOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded-lg p-6 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
              <h3 className="text-lg font-bold text-white mb-4 font-sora">New Lead</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name *"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={form.city || ''}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-3 py-2 text-white placeholder-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createLead}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded font-sora shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                >
                  Create Lead
                </button>
                <button
                  onClick={() => setNewLeadOpen(false)}
                  className="flex-1 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 hover:border-zinc-300/40 text-white py-2 rounded font-sora shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Placeholder component - would need to implement the full InAppBell component
function InAppBell({ activities, onSnooze, onComplete }: any) {
  const pendingCount = activities.filter((a: any) => !a.completedAt).length
  
  return (
    <div className="relative">
      <button className="p-2 rounded-lg border border-zinc-400/30 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0l3-3m-3 3l-3-3" />
        </svg>
      </button>
      {pendingCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {pendingCount}
        </div>
      )}
    </div>
  )
}