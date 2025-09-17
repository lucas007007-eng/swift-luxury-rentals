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
  const cards = [
    { key: 'bookings', title: 'Bookings', desc: 'Upcoming, past, and cancelled bookings', href: '#bookings', icon: '🧳' },
    { key: 'messages', title: 'Messages', desc: 'Conversations with hosts', href: '#messages', icon: '💬' },
    { key: 'saved', title: 'Saved', desc: 'Your saved listings and wishlists', href: '#saved', icon: '⭐' },
    { key: 'payments', title: 'Payments', desc: 'Cards, receipts, and refunds', href: '#payments', icon: '💶' },
    { key: 'profile', title: 'Profile', desc: 'Personal info and preferences', href: '#profile', icon: '🧑' },
    { key: 'security', title: 'Security', desc: 'Password and account security', href: '#security', icon: '🛡️' },
  ]
  const [bookings, setBookings] = React.useState<any[] | null>(null)
  React.useEffect(() => {
    ;(async()=>{
      try {
        const res = await fetch('/api/dashboard/bookings', { cache: 'no-store' })
        if (res.status === 401) { setBookings([]); return }
        const data = await res.json()
        setBookings(data.bookings || [])
      } catch { setBookings([]) }
    })()
  }, [session?.user?.email])
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header forceBackground={true} />
      <section className="flex-1 pt-36 md:pt-40 pb-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-3xl font-extrabold mb-1 text-center">Account</h1>
          <p className="text-white/60 mb-8 text-center">Welcome to your Swift Luxury dashboard</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {cards.map((c) => (
            <Link key={c.title} href={c.href} className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition shadow-[0_10px_30px_rgba(0,0,0,0.35)] p-6 block w-full">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="text-white/70 text-sm mt-1">{c.desc}</div>
            </Link>
          ))}
          </div>
          {/* Sections */}
          <div id="bookings" className="mt-12">
            <div className="text-xl font-bold mb-3">Bookings</div>
            {bookings === null ? (
              <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Loading…</div>
            ) : (bookings || []).length === 0 ? (
              <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">No trips yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((b:any)=> (
                  <div key={b.id} className="rounded-2xl overflow-hidden border border-amber-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08]">
                    {b.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.coverImage} alt="cover" className="w-full h-40 object-cover" />
                    ) : null}
                    <div className="p-4">
                      <div className="text-white/90 font-semibold mb-1">{b.propertyTitle || b.propertyId}</div>
                      <div className="text-white/60 text-xs mb-1">{b.location || '—'}</div>
                      <div className="text-white/60 text-sm">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</div>
                      {(() => {
                        const nights = Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000))
                        return (
                          <div className="mt-1 text-xs text-white/60">{nights} night{nights !== 1 ? 's' : ''}</div>
                        )
                      })()}
                      {(b.bedrooms || b.bathrooms) && (
                        <div className="mt-2 text-xs text-white/70">{b.bedrooms ? `${b.bedrooms} bd` : ''}{b.bedrooms && b.bathrooms ? ' • ' : ''}{b.bathrooms ? `${b.bathrooms} ba` : ''}</div>
                      )}
                      {b.description && (
                        <div className="mt-2 text-xs text-white/70 line-clamp-2">{b.description}</div>
                      )}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="px-2 py-0.5 rounded border border-amber-400/30 text-amber-300 bg-amber-500/10">{b.status}</span>
                        <span className="text-amber-300 font-semibold">€{Number((b.totalCents||0)/100).toLocaleString('de-DE')}</span>
                      </div>
                      {Array.isArray(b.images) && b.images.length > 1 && (
                        <div className="mt-3 grid grid-cols-4 gap-1">
                          {b.images.slice(1,5).map((src:string, idx:number)=> (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={idx} src={src} alt="thumb" className="h-14 w-full object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="messages" className="mt-12">
            <div className="text-xl font-bold mb-3">Messages</div>
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Coming soon.</div>
          </div>

          <div id="saved" className="mt-12">
            <div className="text-xl font-bold mb-3">Saved</div>
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Your saved listings will appear here.</div>
          </div>

          <div id="payments" className="mt-12">
            <div className="text-xl font-bold mb-3">Payments</div>
            {bookings === null ? (
              <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Loading…</div>
            ) : (bookings || []).length === 0 ? (
              <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">No payment items yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((b:any)=> {
                  const payments = Array.isArray(b.payments) ? b.payments : []
                  const depositPayments = payments.filter((p:any)=> p.purpose==='deposit')
                  let depositReceived = depositPayments.some((p:any)=> p.status === 'received')
                  const depositRefunded = depositPayments.some((p:any)=> p.status === 'refunded')
                  const depositAmountCents = depositPayments.reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                  const receivedList = payments.filter((p:any)=> p.status==='received' && p.purpose!=='deposit').sort((a:any,b:any)=> new Date(b.receivedAt||0).getTime() - new Date(a.receivedAt||0).getTime())
                  const receivedTotalCents = receivedList.reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                  const labelFor = (purpose:string) => purpose === 'first_period' ? '1st period' : purpose === 'monthly_rent' ? 'Monthly rent' : purpose === 'move_in_fee' ? 'Move‑in fee' : 'Payment'
                  const now = new Date()
                  const overdueList = payments.filter((p:any)=> p.purpose==='monthly_rent' && p.status==='scheduled' && p.dueAt && new Date(p.dueAt) < now)
                    .sort((a:any,b:any)=> new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime())
                  const overdueCents = overdueList.reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                  const futureList = payments.filter((p:any)=> p.purpose==='monthly_rent' && p.status==='scheduled' && p.dueAt && new Date(p.dueAt) >= now)
                    .sort((a:any,b:any)=> new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime())
                  return (
                    <div key={b.id} className="rounded-2xl p-4 border border-white/10 bg-white/5">
                      <div className="text-white/80 font-semibold mb-3">{b.propertyTitle || b.propertyId}</div>

                      {/* Deposit tile */}
                      {(() => { if (!depositRefunded && b.status === 'confirmed') depositReceived = true; return null })()}
                      <div className={`mb-3 rounded-lg p-3 border ${depositRefunded ? 'border-sky-400/30 bg-sky-500/10' : (depositReceived ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-amber-400/30 bg-amber-500/10')}`}>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wider ${depositRefunded ? 'text-sky-300' : (depositReceived ? 'text-emerald-300' : 'text-amber-300')}`}>{depositRefunded ? 'Deposit Refunded' : (depositReceived ? 'Deposit Received' : 'Deposit')}</span>
                          </div>
                          <div className={`${depositRefunded ? 'text-sky-300' : (depositReceived ? 'text-emerald-300' : 'text-amber-300')} font-semibold`}>
                            €{Math.round((depositAmountCents||0)/100).toLocaleString('de-DE')}
                          </div>
                        </div>
                      </div>

                      {/* Received breakdown */}
                      <div className="rounded-lg p-3 border border-emerald-400/20 bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-wider text-emerald-300">Payments Received</div>
                          <div className="text-emerald-300 font-semibold text-sm">€{Math.round((receivedTotalCents||0)/100).toLocaleString('de-DE')}</div>
                        </div>
                        {receivedList.length === 0 ? (
                          <div className="mt-2 text-xs text-white/60">—</div>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {receivedList.slice(0,4).map((p:any)=> (
                              <div key={p.id} className="flex items-center justify-between text-sm">
                                <div className="text-white/70">
                                  <span className="text-emerald-200/90 font-semibold mr-2">{labelFor(p.purpose)}</span>
                                  <span className="text-xs text-white/50">{new Date(p.receivedAt||p.dueAt||p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-white">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Future Payments */}
                      <div className="mt-3 rounded-lg p-3 border border-amber-400/30 bg-amber-500/10">
                        <div className="text-xs uppercase tracking-wider text-amber-300 mb-2">Future Payments</div>
                        {futureList.length === 0 ? (
                          <div className="text-xs text-white/60">—</div>
                        ) : (
                          <div className="space-y-2">
                            {futureList.map((p:any)=> (
                              <div key={p.id} className="flex items-center justify-between text-sm">
                                <div className="text-white/80">
                                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 mr-2">{formatShortDate(new Date(p.dueAt))}</span>
                                  {(() => {
                                    try {
                                      const list = payments.filter((x:any)=> x.purpose==='monthly_rent').sort((a:any,c:any)=> new Date(a.dueAt||0).getTime() - new Date(c.dueAt||0).getTime())
                                      const idx = list.findIndex((x:any)=> x.id === p.id)
                                      const n = (idx >= 0 ? idx + 2 : 2)
                                      const j = n % 10, k = n % 100
                                      const ord = (k === 11 || k === 12 || k === 13) ? `${n}th` : (j===1?`${n}st`:(j===2?`${n}nd`:(j===3?`${n}rd`:`${n}th`)))
                                      return <span className="text-xs text-amber-200/80">({ord} month rent)</span>
                                    } catch { return null }
                                  })()}
                                </div>
                                <div className="text-white">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Overdue Payments */}
                      <div className="mt-3 rounded-lg p-3 border border-red-400/40 bg-red-500/10 text-red-300">
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          <span className="uppercase tracking-wider">Overdue Payments</span>
                          <span className="ml-auto font-semibold text-white">€{Math.round((overdueCents||0)/100).toLocaleString('de-DE')}</span>
                        </div>
                        {overdueList.length === 0 ? (
                          <div className="text-xs text-red-200/80">—</div>
                        ) : (
                          <div className="space-y-2">
                            {overdueList.map((p:any)=> (
                              <div key={p.id} className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-200 border border-red-400/30 whitespace-nowrap">{formatShortDate(new Date(p.dueAt))}</span>
                                <span className="text-sm font-semibold text-white whitespace-nowrap">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div id="profile" className="mt-12">
            <div className="text-xl font-bold mb-3">Profile</div>
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Edit your personal info.</div>
          </div>

          <div id="security" className="mt-12">
            <div className="text-xl font-bold mb-3">Security</div>
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 text-white/70">Manage password and security.</div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}


