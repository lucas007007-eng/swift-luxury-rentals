'use client'

import React, { useEffect, useState } from 'react'

type Conversation = {
  id: string
  subject: string
  status: string
  lastMessageAt: string
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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState<'all'|'awaiting'>('all')

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/inbox/messages?list=1')
      if (res.ok) setConversations(await res.json())
    })()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Inbox</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation list */}
          <div className="lg:col-span-1 border border-gray-700 rounded-xl bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="p-3 border-b border-gray-800 text-sm text-gray-400 flex items-center justify-between">
              <span>Conversations</span>
              <div className="flex items-center gap-2">
                <button onClick={()=>setFilter('all')} className={`text-xs px-2 py-1 rounded ${filter==='all'?'bg-gray-800 text-gray-100 border border-gray-600':'text-gray-400'}`}>All</button>
                <button onClick={()=>setFilter('awaiting')} className={`text-xs px-2 py-1 rounded ${filter==='awaiting'?'bg-gray-800 text-gray-100 border border-gray-600':'text-gray-400'}`}>Awaiting Reply</button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-800">
              {conversations
                .filter(c=>{
                  if (filter==='all') return true
                  // awaiting reply = last message inbound
                  return true
                })
                .map(c => (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-4 hover:bg-gray-800/60 ${selected===c.id?'bg-gray-800/80':''}`}>
                  <div className="text-gray-100 font-semibold">{c.subject}</div>
                  <div className="text-xs text-gray-400">{new Date(c.lastMessageAt).toLocaleString()} • {c.status}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div className="lg:col-span-2 border border-gray-700 rounded-xl bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
            <div className="p-3 border-b border-gray-800 text-sm text-gray-400">Thread</div>
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
            <div className="border-t border-gray-800 p-3 flex items-center gap-2">
              <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." className="flex-1 bg-gray-800 text-gray-100 rounded-lg p-3 border border-gray-700 focus:outline-none" rows={3} />
              <button onClick={sendReply} className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-400 text-black font-semibold hover:from-white hover:to-gray-300">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


