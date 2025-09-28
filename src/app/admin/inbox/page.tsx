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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={()=>router.push('/admin')} className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800">Return</button>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Inbox</h1>
          <span />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation list */}
          <div className="lg:col-span-1 border border-gray-700 rounded-xl bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="p-3 border-b border-gray-800 text-sm text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1" />
                <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1">
                  <option value="">Status</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
                <select value={assignee} onChange={e=>setAssignee(e.target.value)} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1">
                  <option value="">Assignee</option>
                  {agents.map(a=> <option key={a.id} value={a.id}>{a.name||a.email}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1" />
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1" />
                <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags,comma,separated" className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1" />
                {/* Save / Apply Views */}
                <button onClick={async()=>{
                  const name = prompt('Save view as:')
                  if (!name) return
                  const filters = { q, status, assignee, from: dateFrom, to: dateTo, tags }
                  await fetch('/api/admin/inbox/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, filters }) })
                  alert('View saved')
                }} className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-800">Save View</button>
                <ApplyViews onApply={(f)=>{
                  setQ(f.q||''); setStatus(f.status||''); setAssignee(f.assignee||''); setDateFrom(f.from||''); setDateTo(f.to||''); setTags(f.tags||'')
                }} />
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={()=>setFilter('all')} className={`text-xs px-2 py-1 rounded ${filter==='all'?'bg-gray-800 text-gray-100 border border-gray-600':'text-gray-400'}`}>All</button>
                  <button onClick={()=>setFilter('awaiting')} className={`text-xs px-2 py-1 rounded ${filter==='awaiting'?'bg-gray-800 text-gray-100 border border-gray-600':'text-gray-400'}`}>Awaiting</button>
                  <a href="/admin/inbox/canned" className="text-xs px-2 py-1 rounded border border-cyan-600 text-cyan-300 hover:bg-cyan-900/20">Manage Canned</a>
                </div>
              </div>
            </div>
            <div className="p-2 flex items-center justify-between gap-2 border-b border-gray-800">
              <div className="text-xs text-gray-400">Bulk:</div>
              <div className="flex items-center gap-2">
                <button onClick={async()=>{
                  const ids = Object.keys(bulk).filter(k=>bulk[k])
                  for (const id of ids) await fetch('/api/admin/inbox/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id})})
                  setBulk({})
                }} className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-800">Mark Read</button>
                <button onClick={async()=>{
                  const ids = Object.keys(bulk).filter(k=>bulk[k])
                  const reason = prompt('Close reason?') || ''
                  for (const id of ids) await fetch('/api/admin/inbox/close',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id,open:false,reason})})
                  setBulk({})
                  const res = await fetch('/api/admin/inbox/messages?list=1')
                  if(res.ok) setConversations(await res.json())
                }} className="text-xs px-2 py-1 rounded border border-red-600 text-red-300 hover:bg-red-900/20">Close</button>
              </div>
            </div>
            <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-800">
              {conversations
                .filter(c=>{
                  if (filter==='all') return true
                  // awaiting reply = last message inbound
                  return true
                })
                .map(c => (
                <div key={c.id} className={`w-full text-left p-3 hover:bg-gray-800/60 ${selected===c.id?'bg-gray-800/80':''}`}>
                  <div className="flex items-center justify-between">
                    <div onClick={() => setSelected(c.id)} className="cursor-pointer">
                      <div className="text-gray-100 font-semibold">{c.subject}</div>
                      <div className="text-xs text-gray-400">{new Date(c.lastMessageAt).toLocaleString()} • {c.status}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={!!bulk[c.id]} onChange={(e)=>setBulk({...bulk,[c.id]:e.target.checked})} />
                      <select value={c.assigneeId||''} onChange={async(e)=>{
                        await fetch('/api/admin/inbox/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:c.id,assigneeId:e.target.value||null})})
                        const res = await fetch('/api/admin/inbox/messages?list=1')
                        if(res.ok) setConversations(await res.json())
                      }} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-1 py-0.5">
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
          <div className="lg:col-span-2 border border-gray-700 rounded-xl bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
            <div className="p-3 border-b border-gray-800 text-sm text-gray-400 flex items-center justify-between">
              <span>Thread</span>
              <div className="flex items-center gap-2">
                <button onClick={markRead} className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-800">Mark Read</button>
                <button onClick={()=>toggleClosed(false)} className="text-xs px-2 py-1 rounded border border-emerald-600 text-emerald-300 hover:bg-emerald-900/20">Open</button>
                <button onClick={()=>toggleClosed(true)} className="text-xs px-2 py-1 rounded border border-red-600 text-red-300 hover:bg-red-900/20">Close</button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map(m => (
                <div key={m.id} className={`p-3 rounded-lg border ${m.direction==='outbound'?'border-green-700 bg-green-900/10':'border-gray-700 bg-gray-900/40'}`}>
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                    <span>{m.fromName||m.fromEmail} • {new Date(m.createdAt).toLocaleString()}</span>
                    {m.status && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] border border-gray-600 text-gray-300">
                        {m.status}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-100 text-sm">{m.text || ''}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 p-3 flex items-start gap-2">
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
                  }} className="bg-gray-800 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1">
                    <option value="">Insert canned…</option>
                    {canned.map(c=> <option key={String(c.id||c.title)} value={String(c.id||c.title)}>{c.title}</option>)}
                  </select>
                </div>
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." className="flex-1 bg-gray-800 text-gray-100 rounded-lg p-3 border border-gray-700 focus:outline-none" rows={3} />
              </div>
              <button onClick={sendReply} className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-400 text-black font-semibold hover:from-white hover:to-gray-300">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplyViews({ onApply }: { onApply: (filters: any) => void }) {
  const [views, setViews] = React.useState<any[]>([])
  React.useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/admin/inbox/views'); if(r.ok) setViews(await r.json()) }catch{} })() },[])
  return (
    <select onChange={(e)=>{
      const v = views.find(x=>x.id===e.target.value)
      if (v) onApply(v.filters || {})
    }} className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded px-2 py-1">
      <option value="">Views</option>
      {views.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
    </select>
  )
}


