'use client'

import React, { useMemo, useState } from 'react'
import PublicCalendar from '@/components/PublicCalendar'
import { cityProperties } from '@/data/cityProperties'

type Props = {}

export default function TestBookingBar(_: Props) {
  const cityNames = Object.keys(cityProperties)
  const [name, setName] = useState<string>('John Lenon')
  const [city, setCity] = useState<string>(cityNames[0] || 'Berlin')
  const properties = useMemo(() => (cityProperties as any)[city] || [], [city])
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '')
  const [checkIn, setCheckIn] = useState<string>('')
  const [checkOut, setCheckOut] = useState<string>('')
  const [showCal, setShowCal] = useState<boolean>(false)
  const [preview, setPreview] = useState<{ firstPeriod: number; firstNights: number; moveInFee: number; deposit: number; totalNow: number; schedule: Array<{ dueAt: Date; amount: number; coverage: string }> } | null>(null)
  const monthlyPrice = useMemo(() => {
    const p = properties.find((x: any) => x.id === propertyId)
    return Number(p?.price || 0)
  }, [properties, propertyId])

  const onCreate = async () => {
    try {
      if (!propertyId || !checkIn || !checkOut) { alert('Select property and dates'); return }
      const res = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, checkIn, checkOut, name, email: `${name.toLowerCase().replace(/\s+/g,'.')}@example.com` })
      })
      if (res.ok) { window.location.href = '/admin/bookings' }
      else { const t = await res.text(); alert('Failed to create test booking. ' + t) }
    } catch (e: any) {
      alert('Failed to create test booking')
    }
  }

  // helpers to mirror booking page calculations (monthly/30 baseline)
  const nightsBetween = (a: Date, b: Date) => Math.max(0, Math.round((b.getTime() - a.getTime())/86400000))
  const addMonthsKeepDay = (date: Date, add: number) => {
    const targetMonth = date.getMonth() + add
    const targetYear = date.getFullYear() + Math.floor(targetMonth / 12)
    const monthNormalized = ((targetMonth % 12) + 12) % 12
    const day = date.getDate()
    const lastDay = new Date(targetYear, monthNormalized + 1, 0).getDate()
    const useDay = Math.min(day, lastDay)
    return new Date(targetYear, monthNormalized, useDay)
  }
  const recomputePreview = () => {
    try {
      if (!propertyId || !checkIn || !checkOut) { setPreview(null); return }
      const monthly = monthlyPrice
      const nightly = monthly > 0 ? monthly / 30 : 0
      const s = new Date(checkIn)
      const e = new Date(checkOut)
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) { setPreview(null); return }
      // first period range
      const endOfCurrentMonth = new Date(s.getFullYear(), s.getMonth() + 1, 0)
      const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
      const endOfNextMonth = new Date(s.getFullYear(), s.getMonth() + 2, 0)
      const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
      const crossesMonthEnd = e > dayAfterEndOfCurrentMonth
      let firstPeriodEndExclusive = e
      if (s.getDate() >= 25) {
        firstPeriodEndExclusive = e < dayAfterEndOfNextMonth ? e : dayAfterEndOfNextMonth
      } else if (crossesMonthEnd) {
        firstPeriodEndExclusive = dayAfterEndOfCurrentMonth
      }
      const firstNights = nightsBetween(s, firstPeriodEndExclusive)
      const firstPeriod = Math.round(firstNights * nightly)
      const totalDays = nightsBetween(s, e)
      const moveInFee = totalDays < 30 ? 0 : 250
      // deposit rules
      const threeMonthsFromStart = addMonthsKeepDay(s, 3)
      const longerOrEqualThree = e > threeMonthsFromStart || e.getTime() === threeMonthsFromStart.getTime()
      const deposit = (totalDays < 15) ? 500 : (totalDays < 30) ? 750 : Math.round((monthly || 0) * (longerOrEqualThree ? 1 : 0.5))
      const totalNow = Math.round(firstPeriod + moveInFee + deposit)
      // schedule (monthly charges after first period)
      const schedule: Array<{ dueAt: Date; amount: number; coverage: string }> = []
      let monthCursor = new Date(firstPeriodEndExclusive.getFullYear(), firstPeriodEndExclusive.getMonth(), 1)
      if (monthCursor < firstPeriodEndExclusive) {
        monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
      }
      while (monthCursor < e) {
        const nextMonthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
        const end = e < nextMonthStart ? e : nextMonthStart
        if (monthCursor >= end) break
        const nights = nightsBetween(monthCursor, end)
        const amt = Math.round(nightly * nights)
        const dueAt = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
        const endLessOne = new Date(end.getTime() - 86400000)
        const coverage = `${monthCursor.toLocaleDateString('en-US', { month: 'short' })} 1 - ${monthCursor.toLocaleDateString('en-US', { month: 'short' })} ${String(endLessOne.getDate()).padStart(2,'0')}`
        schedule.push({ dueAt, amount: amt, coverage })
        monthCursor = nextMonthStart
      }
      setPreview({ firstPeriod, firstNights: firstNights, moveInFee, deposit, totalNow, schedule })
    } catch { setPreview(null) }
  }

  React.useEffect(() => { recomputePreview() }, [propertyId, checkIn, checkOut, monthlyPrice])

  return (
    <div className="relative mx-auto max-w-[720px] rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-[#07140F] to-[#0b1a12] shadow-[0_0_28px_rgba(16,185,129,0.28)] p-4 mb-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
      <div className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="inline-flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <div className="font-mono uppercase tracking-wider text-xs md:text-sm gold-metallic-text">Test booking</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 items-center relative z-10">
        <input className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs md:text-sm" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <select className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs md:text-sm" value={city} onChange={e=>{ setCity(e.target.value); const list=(cityProperties as any)[e.target.value]||[]; setPropertyId(list[0]?.id||'') }}>
          {cityNames.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs md:text-sm" value={propertyId} onChange={e=>setPropertyId(e.target.value)}>
          {properties.map((p:any)=> <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button type="button" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs md:text-sm text-left hover:border-emerald-400/40 transition-colors" onClick={()=>setShowCal(v=>!v)}>
          {checkIn && checkOut ? `${checkIn} → ${checkOut}` : 'Select dates'}
        </button>
        <button onClick={onCreate} className="px-3 py-1.5 rounded border border-emerald-400/40 bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))] text-emerald-300 hover:text-emerald-200 text-xs md:text-sm inline-flex items-center gap-2 shadow-[0_0_18px_rgba(16,185,129,0.25)]">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Create test booking
        </button>
      </div>
      {showCal && (
        <div className="mt-3 bg-black/30 border border-white/10 rounded p-3 relative z-10">
          <PublicCalendar
            availability={{}}
            monthlyPrice={monthlyPrice}
            onChange={(s: string|null, e: string|null)=>{ setCheckIn(s||''); setCheckOut(e||'') }}
          />
          {preview && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Pay now</div>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {preview.schedule.length > 0 ? '1st month rent' : 'Total rent'}
                    {preview.firstNights > 0 && <span className="text-emerald-200/80"> ({preview.firstNights} days)</span>}
                  </span>
                  <span>€{preview.firstPeriod.toLocaleString('de-DE')}</span>
                </div>
                {preview.moveInFee > 0 && <div className="flex items-center justify-between text-sm"><span>Move‑in fee</span><span>€{preview.moveInFee.toLocaleString('de-DE')}</span></div>}
                <div className="flex items-center justify-between text-sm"><span>Deposit</span><span>€{preview.deposit.toLocaleString('de-DE')}</span></div>
                <hr className="my-2 border-emerald-400/20" />
                <div className="flex items-center justify-between font-semibold"><span>Total now</span><span className="text-emerald-300">€{preview.totalNow.toLocaleString('de-DE')}</span></div>
              </div>
              <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 shadow-[0_0_12px_rgba(245,158,11,0.18)] md:col-span-2">
                <div className="text-xs text-amber-300 uppercase tracking-wider mb-1">Scheduled payments</div>
                {preview.schedule.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {preview.schedule.slice(0,6).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <div className="text-amber-200/90">{p.coverage}</div>
                          <div className="text-xs text-amber-300">Due {p.dueAt.toLocaleDateString()}</div>
                        </div>
                        <div className="font-semibold text-white">€{p.amount.toLocaleString('de-DE')}</div>
                      </div>
                    ))}
                    {preview.schedule.length > 6 && <div className="text-xs text-white/60">+ {preview.schedule.length - 6} more…</div>}
                  </div>
                ) : (
                  <div className="text-xs text-white/60">No scheduled payments</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


