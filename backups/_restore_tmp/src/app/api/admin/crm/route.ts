import { NextResponse } from 'next/server'
import { computeBookingTotals, computeMonthlySchedule } from '@/lib/bookingTotals'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Build CRM solely from Prisma
    const prismaBookings = await prisma.booking.findMany({ include: { user: true, property: true, payments: true } })
    const baseRows = prismaBookings.map((b) => ({
      id: b.id,
      clientName: b.user?.name || '—',
      city: parseCity(b.property?.address || '') || '—',
      propertyId: b.property?.extId || b.propertyId,
      propertyTitle: b.property?.title || '—',
      checkIn: new Date(b.checkin).toISOString().slice(0,10),
      checkOut: new Date(b.checkout).toISOString().slice(0,10),
      leasePdf: null as string | null,
      invoicePdf: null as string | null,
      total: 0,
      paid: (b.payments || []).some(p => p.purpose !== 'deposit' && p.status === 'received'),
    }))

    // Adjust totals using the same calculator when possible
    const withComputed = await Promise.all(baseRows.map(async (r) => {
      try {
        const t = await computeBookingTotals({ propertyExtId: r.propertyId, checkIn: r.checkIn, checkOut: r.checkOut })
        const sched = await computeMonthlySchedule({ propertyExtId: r.propertyId, checkIn: r.checkIn, checkOut: r.checkOut })
        const rentFuture = sched.reduce((s, it) => s + Number(it.amount || 0), 0)
        const leaseValue = Math.round((Number(t.firstPeriod || 0) + rentFuture + Number(t.moveInFee || 0)))
        // Determine deposit status by looking for a matching Prisma booking (same property extId and dates)
        let depositStatus: 'active' | 'refunded' | 'not_recorded' = 'not_recorded'
        try {
          const s = new Date(r.checkIn)
          const e = new Date(r.checkOut)
          const sStart = new Date(s.getFullYear(), s.getMonth(), s.getDate())
          const sEnd = new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate() + 1)
          const eStart = new Date(e.getFullYear(), e.getMonth(), e.getDate())
          const eEnd = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate() + 1)
          const match = await prisma.booking.findFirst({
            where: {
              checkin: { gte: sStart, lt: sEnd },
              checkout: { gte: eStart, lt: eEnd },
              property: { extId: r.propertyId },
            },
            include: { payments: true, property: true },
          })
          if (match) {
            const deps = (match.payments || []).filter(p => p.purpose === 'deposit')
            if (deps.some(p => p.status !== 'refunded')) depositStatus = 'active'
            else if (deps.some(p => p.status === 'refunded')) depositStatus = 'refunded'
            else depositStatus = 'not_recorded'
          }
        } catch {}
        // Compute next due and overdue
        let nextDue: string | null = null
        let nextDueAmount = 0
        let overdue = false
        let receivedCents = 0
        try {
          const match = await prisma.booking.findUnique({
            where: { id: r.id },
            include: { payments: true, property: true }
          })
          if (match) {
            // Sum all received payments excluding deposits
            receivedCents = (match.payments || [])
              .filter(p => p.status === 'received' && p.purpose !== 'deposit')
              .reduce((s, p) => s + (Number(p.amountCents) || 0), 0)
            let scheduled = (match.payments || []).filter(p => p.purpose === 'monthly_rent' && (p.status === 'scheduled'))
            const hasAnyMonthly = (match.payments || []).some(p => p.purpose === 'monthly_rent')
            if (!hasAnyMonthly || scheduled.length === 0) {
              // Backfill schedule if this booking has none
              try {
                let gen = [] as { dueAt: Date; amount: number }[]
                if (match.property?.extId) {
                  const fromLib = await computeMonthlySchedule({ propertyExtId: match.property.extId, checkIn: r.checkIn, checkOut: r.checkOut })
                  gen = fromLib.map(it => ({ dueAt: it.dueAt, amount: it.amount }))
                } else {
                  // Fallback: build schedule using DB monthly price only (no calendar overrides)
                  const s = new Date(r.checkIn)
                  const e = new Date(r.checkOut)
                  const monthly = Number((match.property as any)?.priceMonthly || 0)
                  const nightly = monthly > 0 ? monthly / 30 : 0
                  const endOfCurrentMonth = new Date(s.getFullYear(), s.getMonth() + 1, 0)
                  const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
                  const endOfNextMonth = new Date(s.getFullYear(), s.getMonth() + 2, 0)
                  const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
                  const crossesMonthEnd = e > dayAfterEndOfCurrentMonth
                  let firstPeriodEndExclusive: Date = e
                  if (s.getDate() >= 25) {
                    firstPeriodEndExclusive = e < dayAfterEndOfNextMonth ? e : dayAfterEndOfNextMonth
                  } else if (crossesMonthEnd) {
                    firstPeriodEndExclusive = dayAfterEndOfCurrentMonth
                  }
                  let monthCursor = new Date(firstPeriodEndExclusive.getFullYear(), firstPeriodEndExclusive.getMonth(), 1)
                  if (monthCursor < firstPeriodEndExclusive) {
                    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                  }
                  while (monthCursor < e) {
                    const nextMonthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                    const end = e < nextMonthStart ? e : nextMonthStart
                    if (monthCursor >= end) break
                    const nights = Math.max(0, Math.round((end.getTime() - monthCursor.getTime()) / 86400000))
                    const amount = Math.round((nights * nightly) * 100) / 100
                    gen.push({ dueAt: new Date(monthCursor), amount })
                    monthCursor = nextMonthStart
                  }
                }
                if (gen.length > 0) {
                  // Remove any stale monthly_rent items to avoid duplicates
                  await prisma.payment.deleteMany({ where: { bookingId: match.id, purpose: 'monthly_rent' } })
                  await prisma.payment.createMany({
                    data: gen.map(g => ({
                      bookingId: match.id,
                      provider: 'offline',
                      status: 'scheduled',
                      purpose: 'monthly_rent',
                      amountCents: Math.round((Number(g.amount)||0) * 100),
                      currency: 'EUR',
                      dueAt: new Date(g.dueAt)
                    }))
                  })
                  // reload scheduled from DB
                  const reloaded = await prisma.payment.findMany({ where: { bookingId: match.id, purpose: 'monthly_rent', status: 'scheduled' } })
                  scheduled = reloaded
                }
              } catch {}
            }
            const soon = scheduled.sort((a:any,b:any)=> (new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime()))[0]
            if (soon?.dueAt) {
              nextDue = new Date(soon.dueAt).toISOString().slice(0,10)
              nextDueAmount = Math.round((Number(soon.amountCents)||0)/100)
              overdue = new Date(soon.dueAt) < new Date()
            }
          }
        } catch {}
        return { ...r, total: Math.round(t.totalNow), leaseValue, depositAmount: Math.round(t.deposit), depositStatus, nextDue, nextDueAmount, overdue, receivedAmount: Math.round(receivedCents/100) }
      } catch { return r }
    }))

    // Deposit totals: only count deposits for bookings that are paid (have a received first_period/move_in_fee)
    let depositsHeldCents = 0
    try {
      const deposits = await prisma.payment.findMany({
        where: {
          purpose: 'deposit',
          status: { not: 'refunded' },
          booking: {
            payments: {
              some: { purpose: { in: ['first_period', 'move_in_fee'] }, status: 'received' }
            }
          }
        },
        select: { amountCents: true }
      })
      depositsHeldCents = deposits.reduce((s, p) => s + (Number(p.amountCents) || 0), 0)
    } catch {}

    // VIP aggregation based on computed totals
    const byClient: Record<string, { total: number; dateJoined: string }> = {}
    for (const r of withComputed) {
      const key = r.clientName || '—'
      if (!byClient[key]) byClient[key] = { total: 0, dateJoined: r.checkIn }
      byClient[key].total += Number(r.total) || 0
      if (new Date(r.checkIn) < new Date(byClient[key].dateJoined)) {
        byClient[key].dateJoined = r.checkIn
      }
    }
    const vips = Object.entries(byClient)
      .map(([clientName, v]) => ({ clientName, total: Math.round(v.total), dateJoined: v.dateJoined }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12)

    return NextResponse.json({ rows: withComputed, vips, depositsHeld: Math.round(depositsHeldCents/100) })
  } catch (e) {
    return NextResponse.json({ rows: [] })
  }
}

// Update paid flag
export async function POST_paid(req: Request) {
  try {
    const body = await req.json()
    const { id, paid } = body || {}
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    // Update Prisma payments to received/created
    const b = await prisma.booking.findUnique({ where: { id }, include: { payments: true } })
    if (!b) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    if (paid) {
      const now = new Date()
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'received', receivedAt: now } })
    } else {
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'created', receivedAt: null } })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientName, propertyId, checkIn, checkOut } = body || {}
    // Legacy JSON creation removed; this endpoint is deprecated when using Prisma-only CRM
    return NextResponse.json({ message: 'Not supported' }, { status: 410 })
  } catch (e) {
    return NextResponse.json({ message: 'Failed to add' }, { status: 500 })
  }
}

function parseCity(location?: string) {
  if (!location) return null
  const parts = String(location).split(',')
  return parts[parts.length - 1]?.trim() || null
}


