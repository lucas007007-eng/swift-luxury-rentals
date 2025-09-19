'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false)
  const formatShortDate = (d: Date) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const dd = d.getDate()
    const j = dd % 10, k = dd % 100
    let suffix = 'th'
    if (k !== 11 && k !== 12 && k !== 13) {
      if (j === 1) suffix = 'st'
      else if (j === 2) suffix = 'nd'
      else if (j === 3) suffix = 'rd'
    }
    const yy = String(d.getFullYear()).slice(2)
    return `${months[d.getMonth()]} ${dd}${suffix}, ${yy}'`
  }
  const [activeTab, setActiveTab] = React.useState<'bookings' | 'applications' | 'support' | 'past'>('bookings')
  const [bookings, setBookings] = React.useState<any[] | null>(null)
  const [supportTickets, setSupportTickets] = React.useState<any[]>([])
  const [expandedTicket, setExpandedTicket] = React.useState<any | null>(null)
  const [showTicketModal, setShowTicketModal] = React.useState(false)
  const [ticketSubmissionStage, setTicketSubmissionStage] = React.useState<'idle' | 'processing' | 'confirmed'>('idle')
  const [ticketForm, setTicketForm] = React.useState({
    category: 'maintenance',
    priority: 'medium',
    subject: '',
    description: ''
  })

  type TicketReplyBoxProps = { onSend: (msg: string) => void | Promise<void> }
  const TicketReplyBox: React.FC<TicketReplyBoxProps> = ({ onSend }) => {
    const [value, setValue] = React.useState('')
    const [sending, setSending] = React.useState(false)
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
        <div className="flex gap-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your message to support..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none resize-none"
            rows={3}
          />
          <button
            onClick={async () => {
              if (!value.trim() || sending) return
              setSending(true)
              await onSend(value)
              setValue('')
              setSending(false)
            }}
            disabled={!value.trim() || sending}
            className={`px-5 py-3 rounded-lg font-mono text-sm transition-all ${
              value.trim() && !sending ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    )
  }

  const mapTicketsFromApi = (apiTickets: any[]) => {
    return (apiTickets || []).map((t: any) => ({
      id: String(t.id),
      userId: String(t.userId ?? t.user?.id ?? ''),
      subject: String(t.subject ?? ''),
      description: String(t.description ?? ''),
      status: String(t.status ?? 'open'),
      priority: String(t.priority ?? 'medium'),
      category: String(t.category ?? 'general'),
      createdAt: String(t.createdAt ?? new Date().toISOString()),
      updatedAt: String(t.updatedAt ?? new Date().toISOString()),
      user: t.user ? { id: t.user.id, name: t.user.name, email: t.user.email } : undefined,
      messages: (t.messages || []).map((m: any) => ({
        id: String(m.id),
        fromType: String(m.fromType ?? 'tenant'),
        message: String(m.message ?? ''),
        createdAt: String(m.createdAt ?? new Date().toISOString()),
      })),
    }))
  }

  const loadSupportTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setSupportTickets(mapTicketsFromApi(data.tickets))
      }
    } catch (error) {
      console.error('Failed to load support tickets:', error)
    }
  }
  
  // Calculate counts based on booking data
  const [currentBookings, pastBookings, applications] = React.useMemo(() => {
    const list = bookings || []
    const curr = list.filter((b: any) => b?.status === 'confirmed')
    const past = list.filter((b: any) => b?.status === 'completed' || b?.status === 'cancelled')
    const apps = list.filter((b: any) => b?.status === 'hold')
    return [curr, past, apps]
  }, [bookings])
  
  const supportUnreadCount = React.useMemo(() => {
    return (supportTickets || []).filter((t: any) => {
      const msgs = Array.isArray(t.messages) ? t.messages : []
      if (msgs.length === 0) return false
      const last = msgs[msgs.length - 1]
      return last && last.fromType === 'admin'
    }).length
  }, [supportTickets])

  const tabs = [
    { key: 'bookings', title: 'Bookings', desc: 'View your current and upcoming bookings', count: currentBookings.length },
    { key: 'applications', title: 'Lease Applications', desc: 'View ongoing applications', count: applications.length },
    { key: 'support', title: 'Support', desc: 'Submit and track support tickets', count: supportUnreadCount > 0 ? supportUnreadCount : supportTickets.length },
    { key: 'past', title: 'Past Bookings', desc: 'View properties you\'ve booked in the past', count: pastBookings.length },
  ]
  React.useEffect(() => {
    // After mount, read tab from URL to avoid SSR/CSR mismatch
    try {
      const url = new URL(window.location.href)
      const tab = url.searchParams.get('tab')
      if (tab === 'applications' || tab === 'bookings' || tab === 'support' || tab === 'past') {
        setActiveTab(tab)
      }
    } catch {}

    ;(async()=>{
      // Local dev fallback: merge server bookings with localStorage applications
      let localApps: any[] = []
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('test_applications_v1')
          localApps = raw ? JSON.parse(raw) : []
          // Normalize shape to match server mapping
          localApps = (Array.isArray(localApps) ? localApps : []).map((b: any) => ({
            id: b.id || `local-${Date.now()}`,
            propertyTitle: b.propertyTitle || b.propertyId,
            propertyId: b.propertyId,
            propertyExtId: b.propertyExtId || b.propertyId,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            status: b.status || 'hold',
            totalCents: b.totalCents || 0,
            payments: b.payments || [],
            receivedCents: b.receivedCents || 0,
            location: b.location || '—',
            bedrooms: b.bedrooms || null,
            bathrooms: b.bathrooms || null,
            coverImage: b.coverImage || null,
            images: b.images || [],
            description: b.description || null,
          }))
          // Filter out local entries that match a recently deleted id list
          try {
            const delRaw = localStorage.getItem('deleted_booking_ids_v1')
            const deletedIds: string[] = delRaw ? JSON.parse(delRaw) : []
            if (Array.isArray(deletedIds) && deletedIds.length > 0) {
              localApps = localApps.filter((x:any)=> !deletedIds.includes(x.id))
            }
          } catch {}
        }
       } catch {}

       // Load support tickets
       loadSupportTickets()

       try {
         const res = await fetch('/api/dashboard/bookings', { cache: 'no-store' })
        if (res.status === 401) { setBookings(localApps); return }
        const data = await res.json()
        const server = (data.bookings || [])
        if (Array.isArray(server) && server.length > 0) {
          // Prefer server truth; clear dev-local cache to avoid duplicates
          try { localStorage.removeItem('test_applications_v1') } catch {}
          setBookings(server)
        } else {
          setBookings(localApps)
        }
      } catch { setBookings(localApps) }
    })()
  }, [session?.user?.email])
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header forceBackground={true} />
      <section className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {session?.user?.name || 'Lucas Veith'}</h1>
          </div>
          
          {/* Tab Navigation - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 mb-8 border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
                  activeTab === tab.key
                    ? 'border-white text-white bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <span className="text-center">{tab.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tab.key==='support' && supportUnreadCount>0 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'bookings' && (
              <div>
                {bookings === null ? (
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="text-gray-400">Loading your bookings...</div>
                  </div>
                ) : currentBookings.length === 0 ? (
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">$</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Property Bookings...</h3>
                    <p className="text-gray-400 mb-6">Explore a curated selection of properties tailored to your needs. Whether it's a weekend getaway, a month-long transition, or a long-term home, find your perfect rental with just a click.</p>
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
                      View Properties →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentBookings.map((b:any)=> (
                      <div key={b.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <div className="flex gap-4 items-start">
                          <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            {b.coverImage ? (
                              <img 
                                src={b.coverImage} 
                                alt="Property" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${b.coverImage ? 'hidden' : ''}`}>
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="hover:text-amber-400 transition-colors cursor-pointer">
                                  <h3 className="text-white font-semibold text-lg">{b.propertyTitle || b.propertyId}</h3>
                                </Link>
                                <div className="space-y-3 mt-3">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-gray-300 text-base font-medium">{b.location || '—'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                    </svg>
                                    <div className="text-gray-300 text-base font-medium">
                                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                                      <span className="ml-3 bg-gray-700 px-3 py-1 rounded-md text-sm text-white font-medium">
                                        {Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000))} nights
                                      </span>
                                    </div>
                                  </div>
                                  {(b.bedrooms || b.bathrooms) && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                      </svg>
                                      <div className="text-gray-300 text-base font-medium">
                                        {b.bedrooms ? `${b.bedrooms} bedrooms` : ''}{b.bedrooms && b.bathrooms ? ' • ' : ''}{b.bathrooms ? `${b.bathrooms} bathrooms` : ''}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {(() => {
                                  if (b.status === 'confirmed') {
                                    // Calculate total lease contract value
                                    const allPayments = (b.payments || []).filter((p: any) => p.purpose !== 'deposit')
                                    const receivedCents = allPayments.filter((p: any) => p.status === 'received').reduce((s: number, p: any) => s + (Number(p.amountCents) || 0), 0)
                                    const scheduledCents = allPayments.filter((p: any) => p.status === 'scheduled').reduce((s: number, p: any) => s + (Number(p.amountCents) || 0), 0)
                                    const totalLeaseContractCents = receivedCents + scheduledCents
                                    
                                    if (scheduledCents === 0 && receivedCents > 0) {
                                      // Paid in full
                                      return (
                                        <>
                                          <div className="text-white font-semibold">€{Math.round(totalLeaseContractCents/100).toLocaleString('de-DE')}</div>
                                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                            Paid in Full
                                          </div>
                                        </>
                                      )
                                    } else {
                                      // Monthly payments
                                      return (
                                        <>
                                          <div className="text-white font-semibold">€{Math.round(totalLeaseContractCents/100).toLocaleString('de-DE')}</div>
                                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                            Lease Contract Total
                                          </div>
                                        </>
                                      )
                                    }
                                  } else {
                                    // Other statuses (hold, etc.)
                                    return (
                                      <>
                                        <div className="text-white font-semibold">€{Number((b.totalCents||0)/100).toLocaleString('de-DE')}</div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                          b.status === 'hold' ? 'bg-amber-500/20 text-amber-400' :
                                          'bg-gray-500/20 text-gray-400'
                                        }`}>
                                          {b.status}
                                        </div>
                                      </>
                                    )
                                  }
                                })()}
                              </div>
                            </div>
                            
                            {/* Payment Management Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Payments Received */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-emerald-400">Payments Received</h4>
                                  <div className="text-emerald-400 font-semibold">€{Math.round((b.receivedCents||0)/100).toLocaleString('de-DE')}</div>
                                </div>
                                {(() => {
                                  const receivedPayments = (b.payments || []).filter((p: any) => p.status === 'received' && p.purpose !== 'deposit')
                                  const labelFor = (purpose: string) => purpose === 'first_period' ? '1st month rent' : purpose === 'monthly_rent' ? 'Monthly rent' : purpose === 'move_in_fee' ? 'Move-in fee' : 'Payment'
                                  
                                  if (receivedPayments.length === 0) {
                                    return <div className="text-xs text-gray-500">No payments received yet</div>
                                  }
                                  
                                  return (
                                    <div className="space-y-3">
                                      {receivedPayments.slice(0, 3).map((p: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center">
                                          <span className="text-gray-300 text-sm font-medium">{labelFor(p.purpose)}</span>
                                          <span className="text-emerald-300 text-sm font-semibold">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                                        </div>
                                      ))}
                                      {receivedPayments.length > 3 && (
                                        <div className="text-xs text-gray-500">+{receivedPayments.length - 3} more</div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                              
                              {/* Scheduled Payments */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-amber-400">Scheduled Payments</h4>
                                </div>
                                {(() => {
                                  const scheduledPayments = (b.payments || []).filter((p: any) => p.status === 'scheduled' && p.purpose === 'monthly_rent' && p.dueAt && new Date(p.dueAt) >= new Date())
                                    .sort((a: any, b: any) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                                  
                                  if (scheduledPayments.length === 0) {
                                    return <div className="text-xs text-gray-500">No upcoming payments</div>
                                  }
                                  
                                  return (
                                    <div className="space-y-3">
                                      {scheduledPayments.slice(0, 3).map((p: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center">
                                          <span className="text-gray-300 text-sm font-medium">{new Date(p.dueAt).toLocaleDateString()}</span>
                                          <span className="text-amber-300 text-sm font-semibold">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                                        </div>
                                      ))}
                                      {scheduledPayments.length > 3 && (
                                        <div className="text-xs text-gray-500">+{scheduledPayments.length - 3} more</div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                              
                              {/* Overdue Payments */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-red-400">Overdue Payments</h4>
                                </div>
                                {(() => {
                                  const overduePayments = (b.payments || []).filter((p: any) => p.status === 'scheduled' && p.purpose === 'monthly_rent' && p.dueAt && new Date(p.dueAt) < new Date())
                                    .sort((a: any, b: any) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                                  const overdueCents = overduePayments.reduce((s: number, p: any) => s + (Number(p.amountCents) || 0), 0)
                                  
                                  if (overduePayments.length === 0) {
                                    return <div className="text-xs text-gray-500">No overdue payments</div>
                                  }
                                  
                                  return (
                                    <div>
                                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-red-400 text-sm font-medium">Total Overdue</span>
                                          <span className="text-red-400 font-bold">€{Math.round(overdueCents/100).toLocaleString('de-DE')}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        {overduePayments.slice(0, 2).map((p: any, idx: number) => (
                                          <div key={idx} className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm font-medium">{new Date(p.dueAt).toLocaleDateString()}</span>
                                            <span className="text-red-300 text-sm font-semibold">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-xs font-medium transition-colors">
                                        Pay Overdue
                                      </button>
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                {applications.length === 0 ? (
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Ongoing Applications...</h3>
                    <p className="text-gray-400 mb-6">Your lease applications will appear here when you apply for properties.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((b:any)=> (
                      <div key={b.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <div className="flex gap-4 items-start">
                          <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            {b.coverImage ? (
                              <img 
                                src={b.coverImage} 
                                alt="Property" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${b.coverImage ? 'hidden' : ''}`}>
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="hover:text-amber-400 transition-colors cursor-pointer">
                                  <h3 className="text-white font-semibold text-lg">{b.propertyTitle || b.propertyId}</h3>
                                </Link>
                                <div className="space-y-3 mt-3">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-gray-300 text-base font-medium">{b.location || '—'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                    </svg>
                                    <div className="text-gray-300 text-base font-medium">
                                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                                      <span className="ml-3 bg-gray-700 px-3 py-1 rounded-md text-sm text-white font-medium">
                                        {Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000))} nights
                                      </span>
                                    </div>
                                  </div>
                                  {(b.bedrooms || b.bathrooms) && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                      </svg>
                                      <div className="text-gray-300 text-base font-medium">
                                        {b.bedrooms ? `${b.bedrooms} bedrooms` : ''}{b.bedrooms && b.bathrooms ? ' • ' : ''}{b.bathrooms ? `${b.bathrooms} bathrooms` : ''}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {(() => {
                                  // Calculate total stay price (includes all payments including deposit)
                                  const allPayments = (b.payments || [])
                                  const totalStayPriceCents = allPayments.reduce((sum: number, p: any) => sum + (Number(p.amountCents) || 0), 0)
                                  const totalStayPrice = Math.round(totalStayPriceCents / 100)
                                  
                                  return (
                                    <>
                                      <div className="text-white font-semibold">€{totalStayPrice.toLocaleString('de-DE')}</div>
                                      <div className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                                        Total Stay Price
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                            
                            {/* Enhanced Application Management Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Application Details */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-amber-400">Application Status</h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm font-medium">Status</span>
                                    <span className="text-amber-300 text-sm font-semibold">Awaiting landlord approval</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm font-medium">Submitted</span>
                                    <span className="text-gray-300 text-sm">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm font-medium">Response time</span>
                                    <span className="text-gray-300 text-sm">2-3 business days</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Required Payments Upon Approval */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-blue-400">Required Upon Approval</h4>
                                </div>
                                <div className="space-y-3">
                                  {(() => {
                                    // Get exact payment amounts from booking payments (matches request page pricing breakdown)
                                    const payments = b.payments || []
                                    const firstPeriodPayment = payments.find((p: any) => p.purpose === 'first_period')
                                    const moveInFeePayment = payments.find((p: any) => p.purpose === 'move_in_fee')
                                    const depositPayment = payments.find((p: any) => p.purpose === 'deposit')
                                    
                                    // Use exact amounts from stored payments (these match request page pricing breakdown)
                                    const firstMonthAmount = firstPeriodPayment ? Math.round((Number(firstPeriodPayment.amountCents) || 0) / 100) : 0
                                    const moveInAmount = moveInFeePayment ? Math.round((Number(moveInFeePayment.amountCents) || 0) / 100) : 0
                                    const depositAmount = depositPayment ? Math.round((Number(depositPayment.amountCents) || 0) / 100) : 0
                                    
                                    return (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-300 text-sm font-medium">1st month rent</span>
                                          <span className="text-blue-300 text-sm font-semibold">€{firstMonthAmount.toLocaleString('de-DE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-300 text-sm font-medium">Move-in fee</span>
                                          <span className="text-blue-300 text-sm font-semibold">€{moveInAmount.toLocaleString('de-DE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-300 text-sm font-medium">Damage deposit</span>
                                          <span className="text-blue-300 text-sm font-semibold">€{depositAmount.toLocaleString('de-DE')}</span>
                                        </div>
                                        <hr className="border-gray-600 my-3" />
                                        <div className="flex justify-between items-center">
                                          <span className="text-white font-semibold">Total Due Upon Approval</span>
                                          <span className="text-blue-300 font-bold text-lg">€{(firstMonthAmount + moveInAmount + depositAmount).toLocaleString('de-DE')}</span>
                                        </div>
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                              
                              {/* Next Steps */}
                              <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-purple-400">Next Steps</h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="text-xs text-gray-400 mb-2">Once approved, you'll receive:</div>
                                  <div className="space-y-2">
                                    <div className="text-gray-300 text-sm">• Lease agreement to sign</div>
                                    <div className="text-gray-300 text-sm">• Payment instructions</div>
                                    <div className="text-gray-300 text-sm">• Move-in coordination</div>
                                  </div>
                                  <button className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-xs font-medium transition-colors">
                                    Contact Landlord
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <div>
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Support Center</h2>
                    <div className="text-purple-400 font-mono text-sm">TENANT SUPPORT</div>
                  </div>
                  
                  {/* Create New Ticket */}
                  <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-purple-400/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Submit New Support Request</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Category</label>
                        <select 
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="maintenance">🔧 Maintenance</option>
                          <option value="payment">💳 Payment Issue</option>
                          <option value="booking">📅 Booking Question</option>
                          <option value="general">💬 General Inquiry</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Priority</label>
                        <select 
                          value={ticketForm.priority}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🟠 High</option>
                          <option value="urgent">🔴 Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-300 mb-2">Subject</label>
                      <input 
                        type="text" 
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-300 mb-2">Description</label>
                      <textarea 
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please provide detailed information about your request..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                        rows={4}
                      />
                    </div>
                     <button 
                        onClick={async () => {
                         if (!session?.user?.email) { setShowLoginPrompt(true); return }
                         if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return
                         
                         setShowTicketModal(true)
                         setTicketSubmissionStage('processing')
                         
                         try {
                           const response = await fetch('/api/support/tickets', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify(ticketForm)
                           })
                           
                           if (response.ok) {
                             const { ticket } = await response.json()
                             // Immediately reflect new ticket in UI and expand
                             const mapped = {
                               id: String(ticket.id),
                               userId: String(ticket.userId ?? ticket.user?.id ?? ''),
                               subject: String(ticket.subject ?? ''),
                               description: String(ticket.description ?? ''),
                               status: String(ticket.status ?? 'open'),
                               priority: String(ticket.priority ?? 'medium'),
                               category: String(ticket.category ?? 'general'),
                               createdAt: String(ticket.createdAt ?? new Date().toISOString()),
                               updatedAt: String(ticket.updatedAt ?? new Date().toISOString()),
                               user: ticket.user ? { id: ticket.user.id, name: ticket.user.name, email: ticket.user.email } : undefined,
                               messages: (ticket.messages || []).map((m: any) => ({
                                 id: String(m.id),
                                 fromType: String(m.fromType ?? 'tenant'),
                                 message: String(m.message ?? ''),
                                 createdAt: String(m.createdAt ?? new Date().toISOString()),
                               })),
                             }
                             setSupportTickets(prev => [mapped, ...prev])
                             setExpandedTicket(mapped)
                             // Show confirmed state after 1 second
                             setTimeout(() => {
                               setTicketSubmissionStage('confirmed')
                               
                               // Close modal and refresh after confirmation
                               setTimeout(() => {
                                 setShowTicketModal(false)
                                 setTicketSubmissionStage('idle')
                                 setTicketForm({ category: 'maintenance', priority: 'medium', subject: '', description: '' })
                                 
                                 // Reload support tickets to show new ticket
                                 loadSupportTickets()
                               }, 1500)
                             }, 1000)
                           }
                         } catch (error) {
                           console.error('Failed to create ticket:', error)
                           setShowTicketModal(false)
                           setTicketSubmissionStage('idle')
                         }
                       }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Submit Support Request
                    </button>
                  </div>

                  {/* My Tickets */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">My Support Tickets</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Ticket list */}
                      <div className="lg:col-span-1">
                        <div className="space-y-3 max-h-[480px] overflow-y-auto">
                          {supportTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <div className="text-xl mb-2">📋</div>
                              <div>No support tickets yet</div>
                            </div>
                          ) : (
                            supportTickets.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => setExpandedTicket(t)}
                                className={`bg-gray-800/80 border rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700/80 ${
                                  expandedTicket?.id === t.id ? 'border-purple-400/60 bg-purple-500/20' : 'border-gray-600 hover:border-gray-500'
                                }`}
                              >
                              <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold text-sm truncate">{t.subject}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-gray-400 text-xs">{t.category}</span>
                                      {(() => {
                                        const msgs = Array.isArray(t.messages) ? t.messages : []
                                        const last = msgs.length > 0 ? msgs[msgs.length - 1] : null
                                        const hasAnyAdmin = msgs.some((m:any) => m.fromType === 'admin')
                                        if (last && last.fromType === 'admin') {
                                          return (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-purple-500/20 text-purple-300 border-purple-400/30">NEW REPLY</span>
                                          )
                                        }
                                        if (hasAnyAdmin) {
                                          return (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-gray-700 text-gray-200 border-gray-600">Replied</span>
                                          )
                                        }
                                        return null
                                      })()}
                                    </div>
                                  </div>
                                  <div className="px-2 py-1 rounded text-xs font-mono border bg-gray-700 text-gray-200">
                                    {String(t.priority).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`px-2.5 py-1.5 rounded-md text-xs font-mono border ${
                                    String(t.status) === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-400/30' : 'bg-gray-700 text-gray-200 border-gray-600'
                                  }`}>
                                    {String(t.status).replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(t.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Chat area */}
                      <div className="lg:col-span-2">
                          {expandedTicket ? (
                          <div className="bg-gray-800/60 border border-purple-400/40 rounded-xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <div className="mb-4">
                              <h4 className="text-white font-semibold text-lg">{expandedTicket.subject}</h4>
                              <p className="text-gray-400 text-sm">{expandedTicket.description}</p>
                            </div>
                            <div className="space-y-4 max-h-[360px] overflow-y-auto mb-4">
                              {expandedTicket.messages.map((m: any) => (
                                <div key={m.id} className={`p-3 rounded-lg border ${m.fromType === 'tenant' ? 'bg-cyan-500/10 border-cyan-400/30 ml-0 mr-8' : 'bg-purple-500/10 border-purple-400/30 ml-8 mr-0'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`font-mono text-xs uppercase tracking-wider ${m.fromType === 'tenant' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                      {m.fromType === 'tenant' ? 'YOU' : 'ADMIN'}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="text-white text-sm leading-relaxed">{m.message}</div>
                                </div>
                              ))}
                            </div>
                            <TicketReplyBox
                              onSend={async (msg) => {
                                if (!msg.trim()) return
                                const optimistic = { id: `tmp-${Date.now()}`, fromType: 'tenant', message: msg.trim(), createdAt: new Date().toISOString() }
                                setSupportTickets((prev: any[]) => prev.map((t: any) => t.id === expandedTicket.id ? { ...t, messages: [...t.messages, optimistic], updatedAt: new Date().toISOString() } : t))
                                setExpandedTicket((prev: any) => prev ? { ...prev, messages: [...prev.messages, optimistic], updatedAt: new Date().toISOString() } : prev)
                                try {
                                  const resp = await fetch('/api/support/messages', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ticketId: expandedTicket.id, message: msg.trim(), fromType: 'tenant' })
                                  })
                                  if (!resp.ok) {
                                    // rollback optimistic on failure
                                    setSupportTickets((prev: any[]) => prev.map((t: any) => t.id === expandedTicket.id ? { ...t, messages: t.messages.filter((m:any)=> m.id !== optimistic.id) } : t))
                                    setExpandedTicket((prev: any) => prev ? { ...prev, messages: prev.messages.filter((m:any)=> m.id !== optimistic.id) } : prev)
                                  } else {
                                    // refresh from server
                                    loadSupportTickets()
                                  }
                                } catch (e) {
                                  setSupportTickets((prev: any[]) => prev.map((t: any) => t.id === expandedTicket.id ? { ...t, messages: t.messages.filter((m:any)=> m.id !== optimistic.id) } : t))
                                  setExpandedTicket((prev: any) => prev ? { ...prev, messages: prev.messages.filter((m:any)=> m.id !== optimistic.id) } : prev)
                                }
                              }}
                            />
                          </div>
                          ) : (
                          <div className="bg-black/40 border border-gray-700 rounded-xl p-8 text-center">
                            <div className="text-2xl mb-2">💬</div>
                            <div className="text-gray-400">Select a ticket to view and reply</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'past' && (
              <div>
                {pastBookings.length === 0 ? (
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Past Bookings...</h3>
                    <p className="text-gray-400 mb-6">Properties you've previously booked will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastBookings.map((b:any)=> (
                      <div key={b.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <div className="flex gap-4 items-start">
                          <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            {b.coverImage ? (
                              <img 
                                src={b.coverImage} 
                                alt="Property" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${b.coverImage ? 'hidden' : ''}`}>
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/property/${b.propertyExtId || b.propertyId}`} className="hover:text-amber-400 transition-colors cursor-pointer">
                                  <h3 className="text-white font-semibold text-lg">{b.propertyTitle || b.propertyId}</h3>
                                </Link>
                                <p className="text-gray-400 text-sm">{b.location || '—'}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">€{Number((b.totalCents||0)/100).toLocaleString('de-DE')}</div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  b.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                                  b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {b.status}
                                </div>
                              </div>
                            </div>
                            <div className="text-gray-400 text-sm mb-3">
                              {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                              <span className="ml-2">
                                {Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000))} nights
                              </span>
                            </div>
                            {(b.bedrooms || b.bathrooms) && (
                              <div className="text-gray-400 text-sm">
                                {b.bedrooms ? `${b.bedrooms} bedrooms` : ''}{b.bedrooms && b.bathrooms ? ' • ' : ''}{b.bathrooms ? `${b.bathrooms} bathrooms` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Support Ticket Submission Modal */}
          {showTicketModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-gray-900 border border-purple-400/30 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                {ticketSubmissionStage === 'processing' ? (
                  <>
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Processing Request</h3>
                    <p className="text-gray-400">Submitting your support ticket...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ticket Confirmed</h3>
                    <p className="text-gray-400">Your support request has been submitted successfully!</p>
                    <div className="text-purple-400 font-mono text-sm mt-2">SUPPORT TICKET SENT!</div>
                    <button
                      onClick={() => { setShowTicketModal(false); setTicketSubmissionStage('idle') }}
                      className="mt-4 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Sign in to continue</h3>
                <p className="text-gray-400 mb-4">Have an account? Sign in to auto-fill your details and track your booking.</p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/login?callbackUrl=${encodeURIComponent('/dashboard?tab=support')}`} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white">Login</Link>
                  <Link href={`/register?callbackUrl=${encodeURIComponent('/dashboard?tab=support')}`} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700">Register</Link>
                </div>
                <button onClick={()=>setShowLoginPrompt(false)} className="mt-4 text-gray-400 hover:text-gray-200">Close</button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}


