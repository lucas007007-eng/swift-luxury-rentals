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

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 w-full sm:w-[680px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => setViewMonth(addMonths(viewMonth, -1))} className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center">‹</button>
          <div className="font-semibold text-gray-900">{viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })} – {addMonths(viewMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
          <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center">›</button>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">Close</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {months.map((m) => (
          <div key={m.toISOString()}>
            <div className="text-center font-semibold text-gray-900 mb-2">{m.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
              {weekDays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {buildMonth(m).flat().map((d, idx) => {
                if (!d) return <div key={idx} className="h-10" />
                const disabled = d.getTime() < min.getTime()
                const selectedStart = localStart && isSameDay(d, localStart)
                const selectedEnd = localEnd && isSameDay(d, localEnd)
                const between = inRange(d)
                return (
                  <button
                    key={idx}
                    onClick={() => onDayClick(d)}
                    disabled={disabled}
                    className={
                      `relative h-10 rounded-md text-sm ` +
                      (disabled ? 'text-gray-300 cursor-not-allowed ' : 'text-gray-900 hover:bg-gray-100 ') +
                      (between ? 'bg-amber-100 ' : '') +
                      (selectedStart || selectedEnd ? 'bg-amber-400 text-black font-semibold ' : '')
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
        <button onClick={() => { setLocalStart(null); setLocalEnd(null); onPreview?.(null, null) }} className="text-sm text-gray-600 hover:text-gray-900">Clear</button>
        <button
          disabled={!canApply}
          onClick={() => {
            if (localStart && localEnd) {
              onApply(toISODate(localStart), toISODate(localEnd))
            }
          }}
          className={`px-5 py-2 rounded-xl text-sm font-semibold ` + (canApply ? 'bg-amber-500 text-black hover:bg-amber-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed')}
        >
          Apply
        </button>
      </div>
    </div>
  )
}


