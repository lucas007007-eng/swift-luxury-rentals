'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientDashboard() {
  const { data: session } = useSession()
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
  const [activeTab, setActiveTab] = React.useState<'bookings' | 'applications' | 'past'>('bookings')
  const [bookings, setBookings] = React.useState<any[] | null>(null)
  
  // Calculate counts based on booking data
  const [currentBookings, pastBookings, applications] = React.useMemo(() => {
    const list = bookings || []
    const curr = list.filter((b: any) => b?.status === 'confirmed')
    const past = list.filter((b: any) => b?.status === 'completed' || b?.status === 'cancelled')
    const apps = list.filter((b: any) => b?.status === 'hold')
    return [curr, past, apps]
  }, [bookings])
  
  const tabs = [
    { key: 'bookings', title: 'Bookings', desc: 'View your current and upcoming bookings', count: currentBookings.length },
    { key: 'applications', title: 'Lease Applications', desc: 'View ongoing applications', count: applications.length },
    { key: 'past', title: 'Past Bookings', desc: 'View properties you\'ve booked in the past', count: pastBookings.length },
  ]
  React.useEffect(() => {
    // After mount, read tab from URL to avoid SSR/CSR mismatch
    try {
      const url = new URL(window.location.href)
      const tab = url.searchParams.get('tab')
      if (tab === 'applications' || tab === 'bookings' || tab === 'past') {
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
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.title}
                <span className="ml-2 text-xs text-gray-500">{tab.count}</span>
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
        </div>
      </section>
      <Footer />
    </main>
  )
}


