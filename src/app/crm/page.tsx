'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cityProperties } from '@/data/cityProperties'
import dynamic from 'next/dynamic'

const AdminCalendar = dynamic(() => import('@/components/PublicCalendar'), { ssr: false })

export default function CRMPage() {
  const [rows, setRows] = useState<any[]>([])
  const [vips, setVips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ clientName: string; propertyId: string; checkIn: string; checkOut: string }>({ clientName: '', propertyId: '', checkIn: '', checkOut: '' })
  const [showCal, setShowCal] = useState(false)
  const [showAllVIPs, setShowAllVIPs] = useState(false)
  
  const formatShortDate = (iso: string) => {
    try {
      const [yStr,mStr,dStr] = String(iso).split('-')
      const y = Number(yStr), m = Number(mStr), d = Number(dStr)
      if (!y || !m || !d) return iso
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const j = d % 10, k = d % 100
      let suffix = 'th'
      if (k !== 11 && k !== 12 && k !== 13) {
        if (j === 1) suffix = 'st'
        else if (j === 2) suffix = 'nd'
        else if (j === 3) suffix = 'rd'
      }
      const yy = String(y).slice(2)
      return `${months[m-1]} ${d}${suffix}, ${yy}'`
    } catch { return iso }
  }
  
  const selectedMonthlyPrice = useMemo(()=>{
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any)=> x.id === form.propertyId)
      if (p) return Number(p.price) || 0
    }
    return 0
  }, [form.propertyId])
  
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/crm', { cache: 'no-store' })
        const data = await res.json()
        setRows(data.rows || [])
        setVips(data.vips || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="pt-28 pb-20">
        <div className="max-w-[1800px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-8">CRM Dashboard</h1>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/90 font-semibold text-lg">CRM Dashboard</div>
            </div>
            
            {/* CRM Tables Component Content */}
            <div className="space-y-8">
              {/* Quick Add Booking */}
              <div className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono uppercase tracking-wider text-sm text-amber-400">Add Booking</div>
                  {!adding ? (
                    <button className="bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold px-3 py-1.5 rounded" onClick={()=>setAdding(true)}>Add</button>
                  ) : (
                    <button className="text-white/70 text-sm" onClick={()=>setAdding(false)}>Cancel</button>
                  )}
                </div>
              </div>

              {/* VIP Row */}
              <div>
                <div className="text-white/80 font-semibold mb-3 flex items-center justify-between">
                  <span>VIP Customers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? (
                    Array.from({length:4}).map((_,i)=>(
                      <div key={i} className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-white/60">Loading…</div>
                    ))
                  ) : vips.slice(0,4).map((vip) => (
                    <div key={vip.clientName} className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-amber-400">{vip.clientName}</div>
                        <div className="text-xs text-emerald-400/80">Since {new Date(vip.dateJoined).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-white/80">Total Spend</div>
                      <div className="text-2xl font-bold text-emerald-400">€{Number(vip.total).toLocaleString('de-DE')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRM Table (desktop) */}
              <div className="hidden md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/60">
                      <th className="py-2 pr-4">Client</th>
                      <th className="py-2 pr-4">City</th>
                      <th className="py-2 pr-4">Property</th>
                      <th className="py-2 pr-4">Checkin/Checkout</th>
                      <th className="py-2 pr-4">Lease Agreement Total</th>
                      <th className="py-2 pr-4">Payment received</th>
                      <th className="py-2 pr-4">Deposit</th>
                      <th className="py-2 pr-4">Next due</th>
                      <th className="py-2 pr-4">Paid</th>
                      <th className="py-2 pr-4">Lease</th>
                      <th className="py-2 pr-4">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="py-6 text-white/40" colSpan={11}>Loading…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td className="py-6 text-white/60" colSpan={11}>No records yet.</td></tr>
                    ) : (
                      rows.map((r, idx) => (
                        <tr key={r.id} className="border-t border-white/10">
                          <td className="py-3 pr-4">{r.overdue ? (<span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">{r.clientName}</span>) : r.clientName}</td>
                          <td className="py-3 pr-4">{r.city}</td>
                          <td className="py-3 pr-4">{r.propertyTitle || r.propertyId}</td>
                          <td className="py-3 pr-4">
                            <div className="inline-flex flex-col gap-1 px-2.5 py-1.5 rounded border border-sky-400/30 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                              <span className="text-[11px] text-sky-300 whitespace-nowrap">Check-In: {formatShortDate(r.checkIn)}</span>
                              <span className="text-[11px] text-sky-200/80 whitespace-nowrap">Checkout: {formatShortDate(r.checkOut)}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {typeof r.leaseValue === 'number' ? (
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] whitespace-nowrap">
                                <span className="font-bold">€</span>
                                <span className="font-semibold">{Number(r.leaseValue||0).toLocaleString('de-DE')}</span>
                                <span className="uppercase tracking-wider text-[10px] text-amber-200">Lease Total</span>
                              </div>
                            ) : (
                              <span className="text-white/40">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {(() => {
                              const amt = Number(r.receivedAmount || 0)
                              if (!amt) return <span className="text-white/40">—</span>
                              return (
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] whitespace-nowrap">
                                  <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
                                  <span className="font-semibold">€{amt.toLocaleString('de-DE')}</span>
                                  <span className="uppercase tracking-wider text-[10px] text-emerald-200">Received</span>
                                </div>
                              )
                            })()}
                          </td>
                          <td className="py-3 pr-4">
                            {typeof r.depositAmount === 'number' ? (
                              (() => {
                                const isCompleted = r.paid !== false
                                const isRefunded = r.depositStatus === 'refunded'
                                const chipClass = isRefunded
                                  ? 'border-sky-400/30 bg-sky-500/10 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                                  : isCompleted
                                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                    : 'border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                const label = isRefunded ? 'Deposit Refunded' : (isCompleted ? 'Deposit Active' : 'No deposit')
                                return (
                                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border ${chipClass} whitespace-nowrap`}>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"/>
                                    </svg>
                                    <span className="font-semibold">€{Number(r.depositAmount||0).toLocaleString('de-DE')}</span>
                                    <span className="uppercase tracking-wider text-[10px] opacity-80">{label}</span>
                                  </div>
                                )
                              })()
                            ) : <span className="text-white/40">—</span>}
                          </td>
                          <td className="py-3 pr-4">
                            {r.nextDue ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-xs whitespace-nowrap bg-amber-500/20 text-amber-300">{r.nextDue}</span>
                                <span className="text-sm font-semibold text-white whitespace-nowrap">€{Number(r.nextDueAmount||0).toLocaleString('de-DE')}</span>
                              </div>
                            ) : <span className="text-white/40">—</span>}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 text-xs rounded border ${r.paid !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                              {r.paid !== false ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            {r.leasePdf ? (
                              <a className="text-amber-400 hover:text-amber-300" href={r.leasePdf} target="_blank">Open PDF</a>
                            ) : (
                              <button className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-2 py-1 rounded">
                                Generate PDF
                              </button>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {r.invoicePdf ? <a className="text-amber-400 hover:text-amber-300" href={r.invoicePdf} target="_blank">Open PDF</a> : <span className="text-white/40">—</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
