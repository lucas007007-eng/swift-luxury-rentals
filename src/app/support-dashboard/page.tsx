'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSession } from 'next-auth/react'

interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'maintenance' | 'payment' | 'booking' | 'general'
  createdAt: string
  updatedAt: string
  messages: {
    id: string
    from: 'tenant' | 'admin'
    message: string
    timestamp: string
  }[]
}

export default function SupportDashboard() {
  const router = useRouter()
  const { status } = useSession()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Map API ticket shape to UI shape
  function mapTicketsFromApi(apiTickets: any[]): SupportTicket[] {
    return (apiTickets || []).map((t: any) => ({
      id: String(t.id),
      userId: String(t.userId ?? t.user?.id ?? ''),
      userName: String(t.user?.name ?? 'Tenant'),
      userEmail: String(t.user?.email ?? ''),
      subject: String(t.subject ?? ''),
      description: String(t.description ?? ''),
      status: (t.status ?? 'open') as any,
      priority: (t.priority ?? 'medium') as any,
      category: (t.category ?? 'general') as any,
      createdAt: String(t.createdAt ?? new Date().toISOString()),
      updatedAt: String(t.updatedAt ?? new Date().toISOString()),
      messages: (t.messages || []).map((m: any) => ({
        id: String(m.id),
        from: (m.fromType === 'admin' ? 'admin' : 'tenant') as 'tenant' | 'admin',
        message: String(m.message ?? ''),
        timestamp: String(m.createdAt ?? new Date().toISOString()),
      })),
    }))
  }

  // Load tickets from API
  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets?admin=true', { cache: 'no-store' })
      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent('/support-dashboard')}`)
        return
      }
      if (response.ok) {
        const data = await response.json()
        setTickets(mapTicketsFromApi(data.tickets))
      } else {
        setTickets([])
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('admin_auth=true')
    if (hasAdminCookie) {
      loadTickets()
      return
    }
    if (status === 'authenticated') {
      loadTickets()
    } else if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/support-dashboard')}`)
    }
  }, [status])

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('admin_auth=true')
    if (!hasAdminCookie && status !== 'authenticated') return
    const interval = setInterval(loadTickets, 30000)
    return () => clearInterval(interval)
  }, [status])

  // Remove mock fallback in production to avoid confusion

  const filteredTickets = tickets.filter(ticket => 
    filterStatus === 'all' || ticket.status === filterStatus
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-400/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-cyan-400 bg-cyan-500/20 border-cyan-400/30'
      case 'in_progress': return 'text-amber-400 bg-amber-500/20 border-amber-400/30'
      case 'resolved': return 'text-emerald-400 bg-emerald-500/20 border-emerald-400/30'
      case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return
    
    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: newMessage.trim(),
          fromType: 'admin'
        })
      })
      
      if (response.status === 401) {
        const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('admin_auth=true')
        if (!hasAdminCookie) {
          router.push(`/login?callbackUrl=${encodeURIComponent('/support-dashboard')}`)
          return
        }
      }
      if (response.ok) {
        // Optimistically append to UI
        const optimistic = {
          id: `optimistic-${Date.now()}`,
          from: 'admin' as const,
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
        }
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, messages: [...t.messages, optimistic], updatedAt: new Date().toISOString() } : t))
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, optimistic], updatedAt: new Date().toISOString() } : null)
        // Reload tickets to get fresh data
        loadTickets()
        setNewMessage('')
        
        // Trigger cache invalidation for tenant dashboard
        try {
          await fetch('/api/cache/invalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'support_message', ticketId: selectedTicket.id })
          })
        } catch (e) {
          console.log('Cache invalidation failed:', e)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/admin" 
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
          >
            ← Return
          </Link>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Support</div>
            <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Support Command</h1>
            <p className="text-zinc-300 text-sm md:text-base">Elite Tenant Communications</p>
          </div>
          <div className="w-20 flex justify-end">
            <div className="text-2xl">🎧</div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 pb-10">

          {/* Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border transition-all duration-300 ${
                    filterStatus === status
                      ? 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105'
                      : 'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-purple-400 font-mono text-sm">
              {filteredTickets.length} TICKETS FOUND
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="luxury-feature-card p-6">
                <h3 className="text-purple-400 font-mono text-sm uppercase tracking-wider mb-4">ACTIVE TICKETS</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    Array.from({length: 3}).map((_, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded"></div>
                      </div>
                    ))
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <div className="text-2xl mb-2">📋</div>
                      <div>No tickets found</div>
                    </div>
                  ) : (
                    filteredTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`bg-gray-800/80 border rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700/80 ${
                          selectedTicket?.id === ticket.id 
                            ? 'border-purple-400/60 bg-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">{ticket.subject}</h4>
                            <p className="text-gray-400 text-xs">{ticket.userName}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-mono border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1.5 rounded-md text-xs font-mono border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="luxury-feature-card p-6">
                  {/* Ticket Header */}
                  <div className="mb-6 pb-4 border-b border-purple-400/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-purple-400 font-mono">FROM: {selectedTicket.userName}</span>
                          <span className="text-gray-400">{selectedTicket.userEmail}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority.toUpperCase()}
                        </span>
                        <span className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Ticket Actions */}
                    <div className="flex gap-3">
                      <select 
                        value={selectedTicket.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as any
                          try {
                            const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            })
                            if (response.ok) {
                              // Reload tickets to get fresh data
                              loadTickets()
                              // Update selected ticket
                              setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
                            }
                          } catch (error) {
                            console.error('Failed to update ticket status:', error)
                          }
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm"
                      >
                        <option value="open">OPEN</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="resolved">RESOLVED</option>
                        <option value="closed">CLOSED</option>
                      </select>
                      <select 
                        value={selectedTicket.priority}
                        onChange={(e) => {
                          const newPriority = e.target.value as any
                          setTickets(prev => prev.map(t => 
                            t.id === selectedTicket.id ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } : t
                          ))
                          setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null)
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm"
                      >
                        <option value="low">LOW</option>
                        <option value="medium">MEDIUM</option>
                        <option value="high">HIGH</option>
                        <option value="urgent">URGENT</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="mb-6">
                    <h3 className="text-purple-400 font-mono text-sm uppercase tracking-wider mb-4">COMMUNICATION LOG</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {selectedTicket.messages.map(msg => (
                        <div key={msg.id} className={`p-4 rounded-lg border ${
                          msg.from === 'tenant' 
                            ? 'bg-cyan-500/10 border-cyan-400/30 ml-0 mr-8' 
                            : 'bg-purple-500/10 border-purple-400/30 ml-8 mr-0'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-mono text-xs uppercase tracking-wider ${
                              msg.from === 'tenant' ? 'text-cyan-400' : 'text-purple-400'
                            }`}>
                              {msg.from === 'tenant' ? 'TENANT' : 'ADMIN'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white text-sm leading-relaxed">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Box */}
                  <div className="bg-gray-800/50 border border-purple-400/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-mono text-xs uppercase tracking-wider mb-3">ADMIN RESPONSE</h4>
                    <div className="flex gap-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response to the tenant..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`inline-flex items-center px-6 py-3 rounded-lg font-extrabold transition-all duration-300 ${
                          newMessage.trim()
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        SEND REPLY
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="luxury-feature-card p-8 text-center">
                  <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Support Ticket</h3>
                  <p className="text-gray-400">Choose a ticket from the list to view details and respond to tenant inquiries.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
