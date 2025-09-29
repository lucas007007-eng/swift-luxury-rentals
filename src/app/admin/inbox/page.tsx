'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Conversation = {
  id: string
  subject: string
  status: string
  lastMessageAt: string
  assigneeId?: string | null
}

type Message = {
  id: string
  direction: 'inbound'|'outbound'|'note'
  fromEmail: string
  fromName?: string
  text?: string
  html?: string
  createdAt: string
  status?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
}

export default function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState<'all'|'awaiting'>('all')
  const [agents, setAgents] = useState<{ id: string; email: string; name?: string }[]>([])
  const [bulk, setBulk] = useState<Record<string, boolean>>({})
  const [canned, setCanned] = useState<{ id?: string; title: string; body: string; variables?: string }[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    ;(async()=>{
      try { const res = await fetch('/api/admin/inbox/agents'); if(res.ok) setAgents(await res.json()) } catch {}
    })()
    ;(async()=>{
      try { const res = await fetch('/api/admin/inbox/canned'); if(res.ok) setCanned(await res.json()) } catch {}
    })()
    ;(async () => {
      const params = new URLSearchParams()
      params.set('list', '1')
      params.set('filter', filter)
      params.set('sort', 'newest')
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (assignee) params.set('assignee', assignee)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (tags) params.set('tags', tags)
      const res = await fetch(`/api/admin/inbox/messages?${params.toString()}`)
      if (res.ok) setConversations(await res.json())
    })()
  }, [filter, q, status, assignee, dateFrom, dateTo, tags])

  useEffect(() => {
    if (!selected) return
    ;(async () => {
      const res = await fetch(`/api/admin/inbox/messages?conversationId=${selected}`)
      if (res.ok) setMessages(await res.json())
    })()
  }, [selected])

  async function sendReply() {
    if (!selected || !reply.trim()) return
    const res = await fetch('/api/admin/inbox/reply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selected, text: reply })
    })
    if (res.ok) {
      setReply('')
      const updated = await fetch(`/api/admin/inbox/messages?conversationId=${selected}`)
      if (updated.ok) setMessages(await updated.json())
    }
  }

  async function markRead() {
    if (!selected) return
    await fetch('/api/admin/inbox/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selected }) })
  }

  async function toggleClosed(open: boolean) {
    if (!selected) return
    await fetch('/api/admin/inbox/close', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selected, open }) })
    // refresh list
    const res = await fetch('/api/admin/inbox/messages?list=1')
    if (res.ok) setConversations(await res.json())
  }

  async function suggestReply() {
    if (!selected) return
    const res = await fetch(`/api/admin/inbox/suggest?conversationId=${selected}`)
    const data = await res.json().catch(()=>null)
    if (res.ok && data?.suggestion) setReply(data.suggestion)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="relative overflow-hidden">
        {/* Luxury feature card header */}
        <div className="luxury-feature-card p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between">
            <button onClick={()=>router.push('/admin')} className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300">← Return</button>
            <div className="text-center">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Communications</div>
              <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Inbox Command</h1>
              <p className="text-zinc-300 text-sm md:text-base">Elite Customer Communications</p>
            </div>
            <div className="w-20 flex justify-end">
              <div className="text-2xl">🕵️</div>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto px-6 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation list */}
          <div className="lg:col-span-1 luxury-feature-card relative">
            <div className="p-4 border-b border-white/10 text-sm text-zinc-300">
              <div className="flex flex-wrap items-center gap-2">
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
                <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none">
                  <option value="">Status</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
                <select value={assignee} onChange={e=>setAssignee(e.target.value)} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none">
                  <option value="">Assignee</option>
                  {agents.map(a=> <option key={a.id} value={a.id}>{a.name||a.email}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none" />
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none" />
                <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags,comma,separated" className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none" />
                {/* Save / Apply Views */}
                <button onClick={async()=>{
                  const name = prompt('Save view as:')
                  if (!name) return
                  const filters = { q, status, assignee, from: dateFrom, to: dateTo, tags }
                  await fetch('/api/admin/inbox/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, filters }) })
                  alert('View saved')
                }} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300">Save View</button>
                <ApplyViews onApply={(f)=>{
                  setQ(f.q||''); setStatus(f.status||''); setAssignee(f.assignee||''); setDateFrom(f.from||''); setDateTo(f.to||''); setTags(f.tags||'')
                }} />
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={()=>setFilter('all')} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${filter==='all'?'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105':'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'}`}>All</button>
                  <button onClick={()=>setFilter('awaiting')} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${filter==='awaiting'?'border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105':'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'}`}>Awaiting</button>
                  <a href="/admin/inbox/canned" className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300">Manage Canned</a>
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between gap-2 border-b border-white/10">
              <div className="text-xs text-zinc-400">Bulk Actions:</div>
              <div className="flex items-center gap-2">
                <button onClick={async()=>{
                  const ids = Object.keys(bulk).filter(k=>bulk[k])
                  for (const id of ids) await fetch('/api/admin/inbox/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id})})
                  setBulk({})
                }} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300">Mark Read</button>
                <button onClick={async()=>{
                  const ids = Object.keys(bulk).filter(k=>bulk[k])
                  const reason = prompt('Close reason?') || ''
                  for (const id of ids) await fetch('/api/admin/inbox/close',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id,open:false,reason})})
                  setBulk({})
                  const res = await fetch('/api/admin/inbox/messages?list=1')
                  if(res.ok) setConversations(await res.json())
                }} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-red-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-red-400/50 transition-all duration-300">Close</button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {conversations
                .filter(c=>{
                  if (filter==='all') return true
                  // awaiting reply = last message inbound
                  return true
                })
                .map(c => (
                <div key={c.id} className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${selected===c.id?'bg-white/10 border-l-4 border-l-cyan-400':''} transition-all`}>
                  <div className="flex items-center justify-between">
                    <div onClick={() => setSelected(c.id)} className="cursor-pointer">
                      <div className="text-white font-semibold">{c.subject}</div>
                      <div className="text-xs text-zinc-400">{new Date(c.lastMessageAt).toLocaleString()} • {c.status}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={!!bulk[c.id]} onChange={(e)=>setBulk({...bulk,[c.id]:e.target.checked})} />
                      <select value={c.assigneeId||''} onChange={async(e)=>{
                        await fetch('/api/admin/inbox/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:c.id,assigneeId:e.target.value||null})})
                        const res = await fetch('/api/admin/inbox/messages?list=1')
                        if(res.ok) setConversations(await res.json())
                      }} className="bg-black/40 text-white text-xs border border-white/10 rounded px-2 py-1">
                        <option value="">Unassigned</option>
                        {agents.map(a=> <option key={a.id} value={a.id}>{a.name||a.email}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div className="lg:col-span-2 luxury-feature-card flex flex-col relative overflow-hidden">
            <div className="p-4 border-b border-white/10 text-sm text-zinc-300 flex items-center justify-between">
              <span>Thread</span>
              <div className="flex items-center gap-2">
                <button onClick={markRead} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300">Mark Read</button>
                <button onClick={()=>toggleClosed(false)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300">Open</button>
                <button onClick={()=>toggleClosed(true)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-red-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-red-400/50 transition-all duration-300">Close</button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {selected && <CustomerTimeline conversationId={selected} />}
              {messages.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border ${m.direction==='outbound'?'border-emerald-400/30 bg-emerald-500/10':'border-white/10 bg-white/5'} shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}>
                  <div className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                    <span>{m.fromName||m.fromEmail} • {new Date(m.createdAt).toLocaleString()}</span>
                    {m.status && (
                      <span className="px-2 py-1 rounded-lg text-[10px] border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                        {m.status}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-white text-sm">{m.text || ''}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 p-4 flex items-start gap-3">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <select onChange={(e)=>{
                    const id = e.target.value
                    const tpl = canned.find(c=>String(c.id||c.title)===id)
                    if (!tpl) return
                    let text = tpl.body
                    // lightweight variable hints
                    text = text.replace(/\{\{name\}\}/g,'Customer')
                    setReply(prev => (prev ? (prev + '\n\n' + text) : text))
                  }} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2">
                    <option value="">Insert canned…</option>
                    {canned.map(c=> <option key={String(c.id||c.title)} value={String(c.id||c.title)}>{c.title}</option>)}
                  </select>
                  <button onClick={suggestReply} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-amber-400/50 transition-all duration-300">AI Suggest</button>
                </div>
                {/* Quick tag editor */}
                <TagEditor conversationId={selected} />
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." className="flex-1 bg-black/40 text-white rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" rows={3} />
              </div>
              <button onClick={sendReply} className="inline-flex items-center px-6 py-3 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300">Send Reply</button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  )
}

function ApplyViews({ onApply }: { onApply: (filters: any) => void }) {
  const [views, setViews] = React.useState<any[]>([])
  React.useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/admin/inbox/views'); if(r.ok) setViews(await r.json()) }catch{} })() },[])
  return (
    <select onChange={(e)=>{
      const v = views.find(x=>x.id===e.target.value)
      if (v) onApply(v.filters || {})
    }} className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2">
      <option value="">Views</option>
      {views.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
    </select>
  )
}

function TagEditor({ conversationId }: { conversationId: string | null }) {
  const [tags, setTags] = React.useState<string>('')
  if (!conversationId) return null
  return (
    <div className="flex items-center gap-2">
      <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="add tags…" className="bg-black/40 text-white text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none" />
      <button onClick={async()=>{
        const arr = tags.split(',').map(s=>s.trim()).filter(Boolean)
        await fetch('/api/admin/inbox/tags', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ conversationId, tags: arr }) })
        setTags('')
      }} className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300">Add Tags</button>
    </div>
  )
}

function CustomerTimeline({ conversationId }: { conversationId: string }) {
  const [timeline, setTimeline] = React.useState<any>(null)
  const [email, setEmail] = React.useState<string>('')
  
  React.useEffect(() => {
    if (!conversationId) return
    ;(async () => {
      try {
        // Get customer email from conversation
        const convRes = await fetch(`/api/admin/inbox/messages?conversationId=${conversationId}`)
        if (!convRes.ok) return
        const msgs = await convRes.json()
        const customerMsg = msgs.find((m: any) => m.direction === 'inbound')
        if (!customerMsg) return
        
        const customerEmail = customerMsg.fromEmail
        setEmail(customerEmail)
        
        const timelineRes = await fetch(`/api/admin/customers/${encodeURIComponent(customerEmail)}/timeline`)
        if (timelineRes.ok) {
          const data = await timelineRes.json()
          setTimeline(data)
        }
      } catch {}
    })()
  }, [conversationId])
  
  if (!timeline) return null
  
  return (
    <div className="mb-4 p-4 rounded-xl border border-amber-400/30 bg-amber-500/10">
      <div className="text-sm font-semibold text-amber-300 mb-2">Customer Timeline - {email}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-zinc-400">Conversations</div>
          <div className="text-white font-semibold">{timeline.conversations?.length || 0}</div>
        </div>
        <div>
          <div className="text-zinc-400">Bookings</div>
          <div className="text-white font-semibold">{timeline.bookings?.length || 0}</div>
        </div>
        <div>
          <div className="text-zinc-400">Emails Sent</div>
          <div className="text-white font-semibold">{timeline.emails?.length || 0}</div>
        </div>
      </div>
      {timeline.bookings?.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="text-zinc-400">Latest Booking:</div>
          <div className="text-emerald-300">{timeline.bookings[0]?.property?.title} • {timeline.bookings[0]?.status} • €{Math.round((timeline.bookings[0]?.totalCents || 0) / 100)}</div>
        </div>
      )}
    </div>
  )
}


