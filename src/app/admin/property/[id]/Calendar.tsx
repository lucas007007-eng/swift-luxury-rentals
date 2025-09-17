'use client'

import React, { useEffect, useMemo, useState } from 'react'

interface CalendarProps {
  value?: Record<string, { priceNight?: number; priceMonth?: number; available?: boolean }>
  onChange?: (value: Record<string, { priceNight?: number; priceMonth?: number; available?: boolean }>) => void
}

export default function CalendarEditor({ value = {}, onChange }: CalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [priceNight, setPriceNight] = useState<number | ''>('')
  const [priceMonth, setPriceMonth] = useState<number | ''>('')
  const [available, setAvailable] = useState(true)

  const now = React.useMemo(() => new Date(), [])
  const currentMonth = React.useMemo(() => new Date(now.getFullYear(), now.getMonth() + monthOffset, 1), [now, monthOffset])

  const days = useMemo(() => {
    const res: Date[] = []
    const start = new Date(currentMonth)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      res.push(new Date(d))
    }
    return res
  }, [currentMonth])

  const applyToDate = (d: Date) => {
    const key = d.toISOString().slice(0,10)
    // If a nightly value is being applied, force the date to be available and prefer nightly override
    const makeAvailable = typeof priceNight === 'number' && !!priceNight
    const next = { ...value, [key]: { priceNight: priceNight || undefined, priceMonth: priceMonth || undefined, available: makeAvailable ? true : available } }
    onChange?.(next)
  }

  // When a monthly amount is entered, automatically apply its per-night equivalent
  // (monthly divided by number of days in the displayed month) to every day in that month.
  useEffect(() => {
    if (typeof priceMonth !== 'number' || !priceMonth || !onChange) return
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const nightlyFromMonthly = Math.round(priceMonth / daysInMonth)
    const next: Record<string, { priceNight?: number; priceMonth?: number; available?: boolean }> = { ...value }
    for (const d of days) {
      const key = d.toISOString().slice(0,10)
      const prev = next[key] || {}
      next[key] = { ...prev, priceNight: nightlyFromMonthly }
    }
    onChange(next)
  }, [priceMonth, currentMonth, onChange, value, days])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="text-white/70 hover:text-white" onClick={()=>setMonthOffset(m=>m-1)}>← Prev</button>
        <div className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button className="text-white/70 hover:text-white" onClick={()=>setMonthOffset(m=>m+1)}>Next →</button>
      </div>

      <div className="flex items-center gap-3">
        <div>
          <label className="block text-xs text-white/70 mb-1">Nightly (€)</label>
          <input type="number" value={priceNight} onChange={e=>setPriceNight(Number(e.target.value)||'')} className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white w-28" />
        </div>
        <div>
          <label className="block text-xs text-white/70 mb-1">Monthly (€)</label>
          <input type="number" value={priceMonth} onChange={e=>setPriceMonth(Number(e.target.value)||'')} className="bg-black/60 border border-white/20 rounded px-2 py-1 text-white w-28" />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/80 mt-5"><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} /> Available</label>
        <div className="text-xs text-white/50">Click a date to apply values</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(<div key={d} className="text-center text-white/50 text-xs">{d}</div>))}
        {Array.from({length: (days[0].getDay()+6)%7}).map((_,i)=>(<div key={i} />))}
        {days.map((d)=>{
          const key = d.toISOString().slice(0,10)
          const v = value[key]
          return (
            <button key={key} onClick={()=>applyToDate(d)} className={`h-20 rounded-md border text-left p-2 hover:border-amber-400/60 ${v?.available===false?'opacity-40':''} border-white/10 bg-black/50`}>
              <div className="text-xs text-white/60">{d.getDate()}</div>
              {v?.priceNight != null && v?.priceNight !== undefined ? (
                <div className="text-[10px] text-amber-300">€{v.priceNight}/night</div>
              ) : (
                v?.priceMonth != null && <div className="text-[10px] text-green-300">€{v.priceMonth}/mo</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


