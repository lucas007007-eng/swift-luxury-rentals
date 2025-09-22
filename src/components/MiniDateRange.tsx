'use client'

import React, { useMemo, useState } from 'react'

type Props = {
  startDate?: string
  endDate?: string
  minDate?: Date
  onApply: (startISO: string, endISO: string) => void
  onClose: () => void
  onPreview?: (startISO: string | null, endISO: string | null) => void
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime()
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function MiniDateRange({ startDate, endDate, minDate, onApply, onClose, onPreview }: Props) {
  const today = useMemo(() => new Date(), [])
  const min = minDate || new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const initialMonth = startOfMonth(startDate ? new Date(startDate) : today)
  const [viewMonth, setViewMonth] = useState<Date>(initialMonth)
  const [localStart, setLocalStart] = useState<Date | null>(startDate ? new Date(startDate) : null)
  const [localEnd, setLocalEnd] = useState<Date | null>(endDate ? new Date(endDate) : null)

  const months = [viewMonth, addMonths(viewMonth, 1)]

  const buildMonth = (month: Date) => {
    const first = startOfMonth(month)
    const firstWeekday = first.getDay()
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
    // Pad trailing blanks to complete the grid
    const remainder = cells.length % 7
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) cells.push(null)
    }
    const rows: (Date | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }

  const inRange = (d: Date) => {
    if (!localStart || !localEnd) return false
    const t = d.getTime()
    return t >= localStart.getTime() && t <= localEnd.getTime()
  }

  const onDayClick = (d: Date) => {
    if (d.getTime() < min.getTime()) return
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(d)
      setLocalEnd(null)
      onPreview?.(toISODate(d), null)
      return
    }
    if (isBefore(d, localStart)) {
      setLocalStart(d)
      setLocalEnd(null)
      onPreview?.(toISODate(d), null)
    } else {
      setLocalEnd(d)
      onPreview?.(toISODate(localStart), toISODate(d))
    }
  }

  const canApply = Boolean(localStart && localEnd)

  const minMonthStart = startOfMonth(min)
  const canGoPrev = viewMonth.getTime() > minMonthStart.getTime()

  return (
    <div className="rounded-2xl shadow-2xl border p-5 sm:p-7 w-full sm:w-[820px] bg-zinc-950 border-zinc-800">
      <div className="relative mb-2 sm:mb-4">
        <button
          aria-label="Previous months"
          onClick={() => canGoPrev && setViewMonth(addMonths(viewMonth, -1))}
          disabled={!canGoPrev}
          className={`absolute left-0 top-1 w-9 h-9 rounded-full shadow flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400 ${canGoPrev ? 'bg-white text-black hover:shadow-lg' : 'bg-white/70 text-black/50 cursor-not-allowed'}`}
        >
          ‹
        </button>
        <div className="text-center font-bold text-white tracking-tight">
          {viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })} – {addMonths(viewMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          aria-label="Next months"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="absolute right-0 top-1 w-9 h-9 rounded-full bg-white text-black shadow hover:shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          ›
        </button>
        <button onClick={onClose} className="hidden sm:block absolute right-12 top-2 text-sm text-zinc-400 hover:text-zinc-200">Close</button>
      </div>
      <div className="mt-2 sm:hidden flex justify-end pr-2">
        <button onClick={onClose} className="text-sm text-zinc-400 hover:text-zinc-200">Close</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {months.map((m) => (
          <div key={m.toISOString()}>
            <div className="text-center font-extrabold text-white mb-2 tracking-tight">{m.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] sm:text-xs font-semibold text-zinc-500 mb-1">
              {weekDays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {buildMonth(m).flat().map((d, idx) => {
                if (!d) return <div key={idx} className="h-10" />
                const disabled = d.getTime() < min.getTime()
                const selectedStart = localStart && isSameDay(d, localStart)
                const selectedEnd = localEnd && isSameDay(d, localEnd)
                const between = inRange(d)
                const innerBetween = between && !(selectedStart || selectedEnd)
                return (
                  <button
                    key={idx}
                    onClick={() => onDayClick(d)}
                    disabled={disabled}
                    className={
                      `relative h-10 sm:h-12 md:h-14 rounded-md text-sm sm:text-base font-semibold transition-colors ` +
                      (disabled ? 'text-zinc-600/50 cursor-not-allowed ' : 'text-zinc-100 hover:bg-zinc-800 ') +
                      (innerBetween ? 'bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-[rgba(192,192,192,0.35)] shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] ' : '') +
                      (selectedStart || selectedEnd ? 'bg-[linear-gradient(145deg,#b8b8b8_0%,#868686_50%,#565656_100%)] font-extrabold border border-zinc-500 ring-2 ring-zinc-300 shadow-[0_8px_18px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.35)] ' : '')
                    }
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => { setLocalStart(null); setLocalEnd(null); onPreview?.(null, null) }} className="text-sm text-zinc-400 hover:text-zinc-200">Clear</button>
        <button
          disabled={!canApply}
          onClick={() => {
            if (localStart && localEnd) {
              onApply(toISODate(localStart), toISODate(localEnd))
            }
          }}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ` + (canApply
            ? 'text-white bg-[linear-gradient(145deg,#0f0f10_0%,#1a1b1f_50%,#0b0b0c_100%)] border border-[rgba(220,220,220,0.6)] ring-1 ring-white/30 shadow-[0_10px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.35),0_0_0_2px_rgba(192,192,192,0.35)] hover:brightness-110 hover:ring-white/50 hover:shadow-[0_14px_28px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.45)]'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700')}
        >
          Apply
        </button>
      </div>
    </div>
  )
}


