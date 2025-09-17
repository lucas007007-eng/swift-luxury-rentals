'use client'

import React, { useMemo, useState } from 'react'

export type CalendarMap = Record<string, { priceNight?: number; available?: boolean }>

interface PublicCalendarProps {
  availability?: CalendarMap
  monthlyPrice?: number
  onChange?: (start: string | null, end: string | null) => void
}

function formatKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function PublicCalendar({ availability = {}, monthlyPrice, onChange }: PublicCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [range, setRange] = useState<{start: string | null, end: string | null}>({ start: null, end: null })
  const [lastKey, setLastKey] = useState<string | null>(null)

  const today = React.useMemo(() => new Date(), [])
  const currentMonth = React.useMemo(() => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1), [today, monthOffset])

  const days = useMemo(() => {
    const res: Date[] = []
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= end; d.setDate(d.getDate() + 1)) {
      // normalize to local midnight to avoid TZ drift
      res.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    }
    return res
  }, [currentMonth])

  const nightlyFallback = useMemo(() => {
    if (!monthlyPrice || monthlyPrice <= 0) return undefined
    return Math.round((monthlyPrice / 30) * 100) / 100
  }, [monthlyPrice])

  const isInRange = (key: string) => {
    if (!range.start || !range.end) return false
    return key >= range.start && key <= range.end
  }

  const handleClick = (key: string, avail: boolean) => {
    if (!avail) return
    if (!range.start || (range.start && range.end)) {
      const next = { start: key, end: null }
      setRange(next)
      onChange?.(next.start, next.end)
      setLastKey(key)
      return
    }
    // If checkout clicked is not strictly after check-in, ignore
    if (key <= range.start) {
      // Allow reassignment of check-in if the same earlier/same date is clicked twice
      if (lastKey === key) {
        const next = { start: key, end: null }
        setRange(next)
        onChange?.(next.start, next.end)
      }
      setLastKey(key)
      return
    }
    const next = { start: range.start, end: key }
    setRange(next)
    onChange?.(next.start, next.end)
    setLastKey(key)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="text-white/70 hover:text-white" onClick={()=>setMonthOffset(m=>m-1)}>← Prev</button>
        <div className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button className="text-white/70 hover:text-white" onClick={()=>setMonthOffset(m=>m+1)}>Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-white/60 text-xs">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=> <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({length: (new Date(currentMonth).getDay()+6)%7}).map((_,i)=>(<div key={i} />))}
        {days.map((d)=>{
          const key = formatKey(d)
          const av = availability[key]
          const available = av?.available !== false
          const price = av?.priceNight ?? nightlyFallback
          const selected = isInRange(key)
          const isStart = range.start === key
          const isEnd = !!range.end && range.end === key
          const priceDisplay = price !== undefined ? `€${Math.round(price).toLocaleString('de-DE')}` : null
          return (
            <button
              key={key}
              onClick={()=>handleClick(key, available)}
              className={`h-20 rounded-md border text-left p-2 transition-colors flex flex-col justify-between ${available ? 'bg-black/50 hover:border-amber-400/60' : 'bg-black/20 opacity-40'} ${selected ? 'border-amber-400 bg-amber-500/20' : 'border-white/10'} ${isStart ? 'bg-amber-500/50 border-amber-400 ring-2 ring-amber-400' : ''} ${isEnd ? 'bg-amber-500/50 border-amber-400 ring-2 ring-amber-400' : ''}`}
            >
              <div className="text-xs text-white/70">{d.getDate()}</div>
              {priceDisplay && (
                <div className={`self-end text-[11px] rounded px-1.5 py-0.5 border ${available ? 'text-amber-300 bg-black border-amber-400/30' : 'text-white/40 bg-black/60 border-white/20'}`}>
                  {priceDisplay}
                </div>
              )}
            </button>
          )
        })}
      </div>
      {range.start && (
        <div className="text-white/80 text-sm">Selected: {range.start}{range.end ? ` → ${range.end}` : ''}</div>
      )}
    </div>
  )
}


