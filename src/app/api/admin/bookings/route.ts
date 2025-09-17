import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { computeBookingTotals } from '@/lib/bookingTotals'
import fs from 'fs'
import path from 'path'

type BookingStatus = 'hold' | 'confirmed' | 'cancelled'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as BookingStatus | null
    const q = searchParams.get('q')?.trim() || ''
    const take = Math.min(Number(searchParams.get('take') || '100'), 500)

    const where: any = {}
    if (status && ['hold', 'confirmed', 'cancelled'].includes(status)) {
      where.status = status
    }
    if (q) {
      where.OR = [
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { property: { title: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true, property: true, payments: true },
      take,
    })

    // Map deposit outstanding
    const mapped = await Promise.all(bookings.map(async (b) => {
      const depositPayments = (b.payments || []).filter(p => p.purpose === 'deposit')
      let depositHeld = depositPayments.reduce((s, p) => s + ((p.status !== 'refunded') ? p.amountCents : 0), 0)
      if (depositHeld === 0) {
        try {
          const extId = (b as any)?.property?.extId || undefined
          const t = await computeBookingTotals({ propertyExtId: extId, checkIn: b.checkin, checkOut: b.checkout })
          depositHeld = Math.round((t.deposit || 0) * 100)
        } catch {}
      }
      return { ...b, depositHeld }
    }))

    return NextResponse.json({ bookings: mapped })
  } catch (e) {
    return NextResponse.json({ bookings: [] })
  }
}

export async function POST(req: Request) {
  try {
    let id: string | null = null
    let status: string | null = null
    const contentType = (req.headers as any).get?.('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({})) as any
      id = body?.id ?? null
      status = body?.status ?? null
    } else {
      const form = await (req as any).formData?.()?.catch?.(()=>null)
      if (form) {
        id = String(form.get('id') || '')
        status = String(form.get('status') || '')
      }
    }
    if (!id || !status) {
      return NextResponse.json({ message: 'Missing id or status' }, { status: 400 })
    }
    if (!['hold', 'confirmed', 'cancelled'].includes(String(status))) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    // Get current booking to check status transition rules
    const currentBooking = await prisma.booking.findUnique({
      where: { id: String(id) },
      select: { status: true, createdAt: true }
    })
    
    if (!currentBooking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    // Enforce status transition rules: Hold → Confirmed/Cancelled only
    const currentStatus = currentBooking.status
    const newStatus = String(status)
    
    if (currentStatus === 'confirmed' && newStatus !== 'confirmed') {
      return NextResponse.json({ message: 'Cannot change status from confirmed' }, { status: 400 })
    }
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      return NextResponse.json({ message: 'Cannot change status from cancelled' }, { status: 400 })
    }
    if (currentStatus === 'hold' && !['confirmed', 'cancelled', 'hold'].includes(newStatus)) {
      return NextResponse.json({ message: 'Invalid status transition from hold' }, { status: 400 })
    }

    // Log the status change for audit trail
    console.log(`[AUDIT] Booking ${id} status: ${currentStatus} → ${newStatus} at ${new Date().toISOString()}`)

    // Update booking with status and timestamp
    const now = new Date()
    const updateData: any = { status: String(status) }
    
    if (newStatus === 'confirmed' && currentStatus !== 'confirmed') {
      updateData.confirmedAt = now
    }
    if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
      updateData.cancelledAt = now
    }

    const updated = await prisma.booking.update({
      where: { id: String(id) },
      data: updateData,
    })
    // If confirmed, also mark matching CRM row as paid (JSON storage)
    if (String(status) === 'confirmed') {
      try {
        const b = await prisma.booking.findUnique({ where: { id: updated.id }, include: { property: true } })
        const dataPath = path.join(process.cwd(), 'src', 'data', 'bookings.json')
        if (b?.property?.extId && fs.existsSync(dataPath)) {
          const json: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]')
          const s = new Date(updated.checkin).toISOString().slice(0,10)
          const e = new Date(updated.checkout).toISOString().slice(0,10)
          const idx = json.findIndex(r => r.propertyId === b.property.extId && r.checkIn === s && r.checkOut === e)
          if (idx !== -1) { json[idx].paid = true; fs.writeFileSync(dataPath, JSON.stringify(json, null, 2), 'utf-8') }
        }
      } catch {}
      // Also mark first_period and move_in_fee as received, and set receivedAt for the latest scheduled payment if any was just paid via UI elsewhere
      try {
        const now = new Date()
        await prisma.payment.updateMany({ where: { bookingId: updated.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'received', receivedAt: now } })
        // If first_period amount is zero (e.g., due to unavailable overrides), backfill a reasonable amount from monthly/30 × nights in first period
        try {
          const b2 = await prisma.booking.findUnique({ where: { id: updated.id }, include: { property: true, payments: true } })
          if (b2?.property) {
            const monthly = Number((b2.property as any)?.priceMonthly || 0)
            const nightly = monthly > 0 ? monthly / 30 : 0
            const s = new Date(b2.checkin as any)
            const e = new Date(b2.checkout as any)
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
            const nightsFirst = Math.max(0, Math.round((firstPeriodEndExclusive.getTime() - s.getTime())/86400000))
            const firstPeriodEuros = Math.round(nightly * nightsFirst)
            if (firstPeriodEuros > 0) {
              const zeroFirst = (b2.payments || []).filter(p => p.purpose === 'first_period' && Number(p.amountCents||0) === 0)
              if (zeroFirst.length > 0) {
                await prisma.payment.updateMany({ where: { bookingId: updated.id, purpose: 'first_period', amountCents: 0 }, data: { amountCents: firstPeriodEuros * 100 } })
              }
            }
          }
        } catch {}
        // Ensure first_period amount matches exact monthly when first period is a full calendar month
        try {
          const b = await prisma.booking.findUnique({ where: { id: updated.id }, include: { property: true, payments: true } })
          if (b?.property) {
            const s = new Date(b.checkin as any)
            const e = new Date(b.checkout as any)
            const endOfCurrentMonth = new Date(s.getFullYear(), s.getMonth() + 1, 0)
            const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
            const endOfNextMonth = new Date(s.getFullYear(), s.getMonth() + 2, 0)
            const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
            const crossesMonthEnd = e > dayAfterEndOfCurrentMonth
            let firstEndExclusive: Date = e
            if (s.getDate() >= 25) firstEndExclusive = e < dayAfterEndOfNextMonth ? e : dayAfterEndOfNextMonth
            else if (crossesMonthEnd) firstEndExclusive = dayAfterEndOfCurrentMonth
            // full calendar month if starts on 1st and ends on 1st next month
            const isFull = s.getDate() === 1 && firstEndExclusive.getDate() === 1
            if (isFull) {
              const monthly = Number((b.property as any)?.priceMonthly || 0)
              if (monthly > 0) {
                const first = (b.payments || []).find(p => p.purpose === 'first_period')
                if (first && Number(first.amountCents) !== Math.round(monthly * 100)) {
                  await prisma.payment.update({ where: { id: first.id }, data: { amountCents: Math.round(monthly * 100) } })
                }
              }
            }
          }
        } catch {}
        // Fallback: if no non-deposit payments are marked received yet, mark the earliest scheduled monthly_rent as received so it appears under Payment Received
        try {
          const payments = await prisma.payment.findMany({ where: { bookingId: updated.id } })
          const anyNonDepositReceived = payments.some(p => p.purpose !== 'deposit' && p.status === 'received')
          if (!anyNonDepositReceived) {
            const earliestScheduled = payments
              .filter(p => p.purpose === 'monthly_rent' && p.status === 'scheduled')
              .sort((a:any,b:any)=> new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime())[0]
            if (earliestScheduled) {
              await prisma.payment.update({ where: { id: earliestScheduled.id }, data: { status: 'received', receivedAt: now } })
            }
          }
        } catch {}
      } catch {}
    }
    // For browser form submissions, redirect back to the bookings page instead of returning JSON
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true, booking: updated })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

// Danger zone: clear all bookings and payments (admin only)
export async function DELETE() {
  try {
    await prisma.payment.deleteMany({})
    await prisma.booking.deleteMany({})
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

// DELETE functionality moved to /api/admin/bookings/delete/route.ts


