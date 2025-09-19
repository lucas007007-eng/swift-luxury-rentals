'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Load tickets from API
  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets?admin=true', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(loadTickets, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mock data fallback for demo
  const mockTickets: SupportTicket[] = [
      {
        id: 'ticket-001',
        userId: 'user-123',
        userName: 'John Lenon',
        userEmail: 'john.lenon@example.com',
        subject: 'Heating issue in apartment',
        description: 'The heating system in my apartment is not working properly. It\'s been cold for the past two days.',
        status: 'open',
        priority: 'high',
        category: 'maintenance',
        createdAt: '2025-09-18T10:30:00Z',
        updatedAt: '2025-09-18T10:30:00Z',
        messages: [
          {
            id: 'msg-001',
            from: 'tenant',
            message: 'The heating system in my apartment is not working properly. It\'s been cold for the past two days.',
            timestamp: '2025-09-18T10:30:00Z'
          }
        ]
      },
      {
        id: 'ticket-002',
        userId: 'user-456',
        userName: 'Lucas Veith',
        userEmail: 'lucasveith@protonmail.com',
        subject: 'Payment confirmation needed',
        description: 'I made a payment yesterday but haven\'t received confirmation. Can you please verify?',
        status: 'in_progress',
        priority: 'medium',
        category: 'payment',
        createdAt: '2025-09-17T14:20:00Z',
        updatedAt: '2025-09-18T09:15:00Z',
        messages: [
          {
            id: 'msg-002',
            from: 'tenant',
            message: 'I made a payment yesterday but haven\'t received confirmation. Can you please verify?',
            timestamp: '2025-09-17T14:20:00Z'
          },
          {
            id: 'msg-003',
            from: 'admin',
            message: 'Thank you for contacting us. I\'m checking your payment status now and will update you shortly.',
            timestamp: '2025-09-18T09:15:00Z'
          }
        ]
      }
    ]
    setTickets(mockTickets)
    setLoading(false)
  }, [])

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
      
      if (response.ok) {
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
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      
      <Header forceBackground={true} />
      <div className="pt-28 pb-20 relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-purple-400 font-mono tracking-wider">
                &gt;&gt; SUPPORT COMMAND CENTER &lt;&lt;
              </h1>
              <p className="text-white/70 mt-2">Manage tenant communications and support requests</p>
            </div>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 hover:border-red-400/60 rounded-xl text-red-400 hover:text-red-300 font-mono text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-red-400/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              EXIT SUPPORT
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    filterStatus === status
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                      : 'bg-black/40 text-white/60 border border-white/20 hover:bg-white/10'
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
              <div className="bg-black/60 border border-purple-400/30 rounded-xl p-4">
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
                          <span className={`px-2 py-1 rounded text-xs font-mono border ${getStatusColor(ticket.status)}`}>
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
                <div className="bg-black/60 border border-purple-400/30 rounded-xl p-6">
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
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Ticket Actions */}
                    <div className="flex gap-2">
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
                        className="bg-gray-800 border border-purple-400/30 rounded-lg px-3 py-2 text-white text-sm font-mono"
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
                        className="bg-gray-800 border border-purple-400/30 rounded-lg px-3 py-2 text-white text-sm font-mono"
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
                        className="flex-1 bg-gray-900 border border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`px-6 py-3 rounded-lg font-mono text-sm transition-all ${
                          newMessage.trim()
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/60 border border-purple-400/30 rounded-xl p-8 text-center">
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
      <Footer />
    </main>
  )
}
