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
          {/* Ultra-Premium Header Section */}
          <div className="luxury-feature-card mb-8 p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-amber-400 font-sora">Customer Relations</div>
                <h1 className="text-4xl font-bold heading-sora text-white mb-2 text-left">CRM Dashboard</h1>
                <p className="text-zinc-300 text-lg text-left">Elite Client Management</p>
              </div>
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
                aria-label="Back to Admin"
              >
                ← Back to Admin
              </a>
            </div>
          </div>
          
          <div className="luxury-feature-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/90 font-semibold text-lg">CRM Dashboard</div>
            </div>
            
            {/* CRM Tables Component Content */}
            <div className="space-y-8">

              {/* CRM Table (desktop) */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 9h6v6H9z"/></svg>
                  </div>
                  <div>
                    <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Client Records</div>
                    <div className="text-xl font-bold text-white heading-sora">Customer Database</div>
                  </div>
                </div>
                <table className="w-full divide-y divide-zinc-700/50 table-auto">
                  <thead className="bg-black/30 backdrop-blur-sm">
                    <tr>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Client</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">City</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Property</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Dates</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Lease Total</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Received</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Deposit</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Next Due</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Status</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700/30">
                    {loading ? (
                      <tr><td className="py-6 text-white/40" colSpan={10}>Loading…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td className="py-6 text-white/60" colSpan={10}>No records yet.</td></tr>
                    ) : (
                      rows.map((r, idx) => (
                        <tr key={r.id} className="border-t border-zinc-700/30 hover:bg-zinc-900/20 transition-colors">
                          <td className="px-3 py-4 text-sm text-white font-semibold font-sora">{r.overdue ? (<span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">{r.clientName}</span>) : r.clientName}</td>
                          <td className="px-3 py-4 text-sm text-zinc-300 font-sora">{r.city}</td>
                          <td className="px-3 py-4 text-sm text-white font-sora">{r.propertyTitle || r.propertyId}</td>
                          <td className="px-3 py-4 text-sm">
                            <div className="inline-flex flex-col gap-1 px-2.5 py-1.5 rounded border border-sky-400/30 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                              <span className="text-[11px] text-sky-300 whitespace-nowrap">Check-In: {formatShortDate(r.checkIn)}</span>
                              <span className="text-[11px] text-sky-200/80 whitespace-nowrap">Checkout: {formatShortDate(r.checkOut)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm">
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
                          <td className="px-3 py-4 text-sm">
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
                          <td className="px-3 py-4 text-sm">
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
                          <td className="px-3 py-4 text-sm">
                            {r.nextDue ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-xs whitespace-nowrap bg-amber-500/20 text-amber-300">{r.nextDue}</span>
                                <span className="text-sm font-semibold text-white whitespace-nowrap">€{Number(r.nextDueAmount||0).toLocaleString('de-DE')}</span>
                              </div>
                            ) : <span className="text-white/40">—</span>}
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded border ${r.paid !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                              {r.paid !== false ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <div className="flex gap-2">
                              {r.leasePdf ? (
                                <a className="text-amber-400 hover:text-amber-300 text-xs font-sora" href={r.leasePdf} target="_blank">Lease PDF</a>
                              ) : (
                                <button 
                                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-2 py-1 rounded font-sora"
                                  onClick={async()=>{
                                    try {
                                      const res = await fetch('/api/admin/lease', { 
                                        method: 'POST', 
                                        headers: { 'Content-Type': 'application/json' }, 
                                        body: JSON.stringify({ id: r.id }) 
                                      })
                                      const text = await res.text()
                                      let data: any = null
                                      try { data = JSON.parse(text) } catch {}
                                      if (res.ok && data?.url) {
                                        // Update the row with the PDF URL
                                        const updatedRows = rows.map(row => 
                                          row.id === r.id ? { ...row, leasePdf: data.url } : row
                                        )
                                        setRows(updatedRows)
                                      } else {
                                        const msg = typeof data === 'object' && data ? (data.message || '') : ''
                                        const err = typeof data === 'object' && data ? (data.error || '') : ''
                                        alert(`Failed to generate lease. ${msg} ${err}`.trim())
                                      }
                                    } catch (e: any) {
                                      alert('Failed to generate lease. Please try again.')
                                    }
                                  }}
                                >
                                  Generate
                                </button>
                              )}
                              {r.invoicePdf ? <a className="text-amber-400 hover:text-amber-300 text-xs font-sora" href={r.invoicePdf} target="_blank">Invoice</a> : <span className="text-white/40 text-xs">—</span>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* CRM Mobile Cards */}
              <div className="block md:hidden space-y-4 mb-8">
                {loading ? (
                  Array.from({length:3}).map((_,i)=>(
                    <div key={i} className="bg-gray-900/60 rounded-xl p-4 border border-gray-700 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded"></div>
                    </div>
                  ))
                ) : rows.length === 0 ? (
                  <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700 text-center">
                    <div className="text-white/60">No customer records yet.</div>
                  </div>
                ) : (
                  rows.map((r) => (
                    <div key={r.id} className="bg-gray-900/80 rounded-xl p-4 border border-gray-700">
                      {/* Customer Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{r.overdue ? (<span className="px-2 py-1 rounded bg-red-500/20 text-red-300">{r.clientName}</span>) : r.clientName}</h3>
                        <span className="text-gray-400 text-sm">{r.city}</span>
                      </div>
                      
                      {/* Property Info */}
                      <div className="mb-3">
                        <div className="text-white/80 text-sm font-medium">{r.propertyTitle || r.propertyId}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Check-in: {formatShortDate(r.checkIn)} → Checkout: {formatShortDate(r.checkOut)}
                        </div>
                      </div>
                      
                      {/* Financial Info */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
                          <div className="text-amber-400 text-xs uppercase tracking-wider mb-1">Lease Total</div>
                          <div className="text-white font-bold">€{Number(r.leaseValue||0).toLocaleString('de-DE')}</div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
                          <div className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Received</div>
                          <div className="text-white font-bold">€{Number(r.receivedAmount||0).toLocaleString('de-DE')}</div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-xs rounded border ${r.paid !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
                          {r.paid !== false ? 'Paid' : 'Unpaid'}
                        </span>
                        <div className="flex gap-2">
                          {r.leasePdf ? (
                            <a href={r.leasePdf} target="_blank" className="text-amber-400 text-xs hover:text-amber-300">View Lease</a>
                          ) : (
                            <span className="text-gray-500 text-xs">No Lease</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
