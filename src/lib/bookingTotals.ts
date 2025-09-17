import { promises as fs } from 'fs'
import path from 'path'
import { cityProperties } from '@/data/cityProperties'
import prisma from '@/lib/prisma'

type Totals = {
  subtotal: number
  firstPeriod: number
  deposit: number
  moveInFee: number
  totalNow: number
}

async function readOverrides(): Promise<Record<string, any>> {
  try {
    const p = path.join(process.cwd(), 'src', 'data', 'admin-overrides.json')
    const raw = await fs.readFile(p, 'utf8').catch(() => '')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function addMonthsKeepDay(date: Date, add: number): Date {
  const targetMonth = date.getMonth() + add
  const targetYear = date.getFullYear() + Math.floor(targetMonth / 12)
  const monthNormalized = ((targetMonth % 12) + 12) % 12
  const day = date.getDate()
  const lastDay = new Date(targetYear, monthNormalized + 1, 0).getDate()
  const useDay = Math.min(day, lastDay)
  return new Date(targetYear, monthNormalized, useDay)
}

function eachDate(start: Date, endExclusive: Date): Date[] {
  const dates: Date[] = []
  const startTs = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const endTs = Date.UTC(endExclusive.getUTCFullYear(), endExclusive.getUTCMonth(), endExclusive.getUTCDate())
  for (let ts = startTs; ts < endTs; ts += 86400000) {
    dates.push(new Date(ts))
  }
  return dates
}

export async function computeBookingTotals(params: { propertyExtId?: string; checkIn: string | Date; checkOut: string | Date }): Promise<Totals> {
  const s = new Date(params.checkIn)
  const e = new Date(params.checkOut)
  const totalDays = Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000))
  const overrides = await readOverrides()

  // Find property by external id in cityProperties to get monthly price and default nightly
  const extId = params.propertyExtId
  let found: any = null
  if (extId) {
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any) => x.id === extId)
      if (p) { found = p; break }
    }
  }
  let monthly = Number(found?.price || 0)
  // Fallback: if not found in catalog, try Prisma property by extId or id
  if ((!monthly || monthly <= 0) && extId) {
    try {
      const p = await prisma.property.findFirst({ where: { OR: [ { extId }, { id: extId } ] }, select: { priceMonthly: true } })
      if (p && typeof p.priceMonthly === 'number') monthly = Number(p.priceMonthly || 0)
    } catch {}
  }
  const nightlyDefault = monthly > 0 ? monthly / 30 : 0

  // calendar overrides per property id
  const calendar: Record<string, any> = (extId && overrides?.[extId]?.calendar) ? (overrides?.[extId]?.calendar) : {}

  const sumRange = (start: Date, endExclusive: Date) => {
    let acc = 0
    let hadDays = false
    for (const d of eachDate(start, endExclusive)) {
      hadDays = true
      const k = d.toISOString().slice(0, 10)
      const day = (calendar as any)[k]
      const available = day?.available !== false
      if (!available) {
        // Skip blocked days but still count others; do not force whole range to zero
        continue
      }
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      const baseMonthly = (day?.priceMonth ?? monthly)
      const fallback = nightlyDefault
      const nightlyRaw = day?.priceNight ?? (baseMonthly > 0 ? baseMonthly / daysInMonth : fallback)
      const nightly = Math.ceil(Number(nightlyRaw || 0))
      acc += nightly
    }
    // Fallback: if no nights priced due to missing data, approximate by monthly/30 per night
    if (hadDays && acc === 0 && (monthly || nightlyDefault)) {
      const nights = Math.max(0, Math.round((endExclusive.getTime() - start.getTime()) / 86400000))
      const nightly = monthly > 0 ? (monthly / 30) : nightlyDefault
      acc = nights * nightly
    }
    return Math.round(acc * 100) / 100
  }

  // Subtotal = entire stay nights
  const subtotal = sumRange(s, e)

  // First period segmentation similar to request page
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
  } else {
    firstPeriodEndExclusive = e
  }
  const firstPeriod = sumRange(s, firstPeriodEndExclusive)

  // Move-in fee: waived for stays under 30 days
  const moveInFee = totalDays < 30 ? 0 : 250

  // Deposit rules
  const threeMonthsFromStart = addMonthsKeepDay(s, 3)
  const longerOrEqualThree = e > threeMonthsFromStart || e.getTime() === threeMonthsFromStart.getTime()
  const deposit = (totalDays < 15)
    ? 500
    : (totalDays < 30)
      ? 750
      : Math.round((monthly || 0) * (longerOrEqualThree ? 1 : 0.5))

  const totalNow = Math.round((firstPeriod + moveInFee + deposit))
  return { subtotal, firstPeriod, deposit, moveInFee, totalNow }
}

export type ScheduledItem = {
  purpose: 'monthly_rent'
  dueAt: Date
  amount: number
  coverage: string
}

// Build a monthly schedule for remaining periods after the first period used in Pay Now.
// dueAt is set to the 1st of each covered month.
export async function computeMonthlySchedule(params: { propertyExtId?: string; checkIn: string | Date; checkOut: string | Date }): Promise<ScheduledItem[]> {
  const s = new Date(params.checkIn)
  const e = new Date(params.checkOut)
  const overrides = await readOverrides()

  const extId = params.propertyExtId
  let found: any = null
  if (extId) {
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any) => x.id === extId)
      if (p) { found = p; break }
    }
  }
  let monthly = Number(found?.price || 0)
  // Fallback: if not found in catalog, try Prisma property by extId or id
  if ((!monthly || monthly <= 0) && extId) {
    try {
      const p = await prisma.property.findFirst({ where: { OR: [ { extId }, { id: extId } ] }, select: { priceMonthly: true } })
      if (p && typeof p.priceMonthly === 'number') monthly = Number(p.priceMonthly || 0)
    } catch {}
  }
  const nightlyDefault = monthly > 0 ? monthly / 30 : 0
  const calendar: Record<string, any> = (extId && overrides?.[extId]?.calendar) ? (overrides?.[extId]?.calendar) : {}

  const sumRange = (start: Date, endExclusive: Date) => {
    let acc = 0
    let hadDays = false
    for (const d of eachDate(start, endExclusive)) {
      hadDays = true
      const k = d.toISOString().slice(0, 10)
      const day = (calendar as any)[k]
      const available = day?.available !== false
      if (!available) {
        continue
      }
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      const baseMonthly = (day?.priceMonth ?? monthly)
      const fallback = nightlyDefault
      const nightlyRaw = day?.priceNight ?? (baseMonthly > 0 ? baseMonthly / daysInMonth : fallback)
      const nightly = Math.ceil(Number(nightlyRaw || 0))
      acc += nightly
    }
    if (hadDays && acc === 0 && (monthly || nightlyDefault)) {
      const nights = Math.max(0, Math.round((endExclusive.getTime() - start.getTime()) / 86400000))
      const nightly = monthly > 0 ? (monthly / 30) : nightlyDefault
      acc = nights * nightly
    }
    return Math.round(acc * 100) / 100
  }

  // Determine first period end as in computeBookingTotals
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

  const items: ScheduledItem[] = []
  // Start next period from the 1st following firstPeriodEndExclusive
  let monthCursor = new Date(firstPeriodEndExclusive.getFullYear(), firstPeriodEndExclusive.getMonth(), 1)
  if (monthCursor < firstPeriodEndExclusive) {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
  }
  while (monthCursor < e) {
    const nextMonthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
    const end = e < nextMonthStart ? e : nextMonthStart
    if (monthCursor >= end) break
    // Nights in this month segment
    const nights = Math.max(0, Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(monthCursor.getFullYear(), monthCursor.getMonth(), monthCursor.getDate())) / 86400000))
    const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate()
    const baseMonthly = monthly > 0 ? monthly : (nightlyDefault * 30)
    const isFullMonth = monthCursor.getDate() === 1 && end.getTime() === nextMonthStart.getTime()
    const amt = isFullMonth
      ? Math.round(baseMonthly)
      : (nights * Math.ceil((baseMonthly > 0 ? baseMonthly / daysInMonth : nightlyDefault) || 0))
    const dueAt = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const endLessOne = new Date(end.getTime() - 86400000)
    const coverage = `${monthCursor.toLocaleDateString('en-US', { month: 'short' })} 1 - ${monthCursor.toLocaleDateString('en-US', { month: 'short' })} ${String(endLessOne.getDate()).padStart(2,'0')}`
    items.push({ purpose: 'monthly_rent', dueAt, amount: Math.round(amt * 100) / 100, coverage })
    monthCursor = nextMonthStart
  }
  return items
}


