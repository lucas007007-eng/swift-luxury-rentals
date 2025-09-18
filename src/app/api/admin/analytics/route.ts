import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { computeBookingTotals } from '@/lib/bookingTotals'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get bookings from database instead of JSON file
    const bookings = await prisma.booking.findMany({
      include: {
        payments: true,
        property: true
      },
      where: {
        status: {
          not: 'cancelled'
        }
      }
    })

    // Convert database bookings to expected format
    const paidConfirmed = bookings.map(b => ({
      id: b.id,
      propertyId: b.property?.extId || b.propertyId,
      checkIn: b.checkin.toISOString().split('T')[0],
      checkOut: b.checkout.toISOString().split('T')[0],
      total: (b.totalCents || 0) / 100,
      status: b.status,
      paid: b.payments.some(p => p.status === 'received'),
      payments: b.payments
    }))
    // Compute authoritative totals using same calculator used on pay page
    const withTotals = await Promise.all(paidConfirmed.map(async (b) => {
      try {
        const t = await computeBookingTotals({ propertyExtId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut })
        return { ...b, _totalNow: Math.round(t.totalNow) }
      } catch {
        return { ...b, _totalNow: Math.round(Number(b.total) || 0) }
      }
    }))
    // bookings: [{ id, propertyId, checkIn, checkOut, total, commission, status, paid }]
    const now = new Date()
    const year = now.getFullYear()

    // Prisma payment-based revenue by received date (first_period + move_in_fee only)
    const payments = await prisma.payment.findMany({ where: { status: 'received', purpose: { in: ['first_period','move_in_fee','monthly_rent'] } } })
    const scheduled = await prisma.payment.findMany({ where: { status: 'scheduled', purpose: 'monthly_rent' }, select: { bookingId: true, amountCents: true, dueAt: true } })
    const paymentsThisMonth = payments.filter(p => sameMonth(new Date(p.receivedAt || ''), now))
    const paymentsThisYear = payments.filter(p => (new Date(p.receivedAt || '').getFullYear() === year))

    const inDays = (d: Date, days: number) => {
      const nowMs = now.getTime()
      return d.getTime() <= (nowMs + days * 86400000) && d.getTime() >= nowMs
    }
    // Revenue based on RECEIVED payments; commissions are 20% of revenue
    // Build Next Due per booking (earliest scheduled)
    const earliestByBooking: Record<string, { amountCents: number; dueAt: Date | null }> = {}
    for (const p of scheduled) {
      const id = String(p.bookingId || '')
      if (!id) continue
      const prev = earliestByBooking[id]
      const due = p.dueAt ? new Date(p.dueAt as any) : null
      if (!prev || (due && prev.dueAt && due < prev.dueAt) || (due && !prev.dueAt)) {
        earliestByBooking[id] = { amountCents: Number(p.amountCents)||0, dueAt: due }
      } else if (!prev) {
        earliestByBooking[id] = { amountCents: Number(p.amountCents)||0, dueAt: due }
      }
    }
    const nextDueSumEuros = Math.round(Object.values(earliestByBooking).reduce((s, v) => s + (Number(v.amountCents)||0), 0) / 100)

    const totals = {
      currentBookings: withTotals.filter(b => new Date(b.checkOut) >= now).length,
      monthlyRevenue: Math.round(paymentsThisMonth.reduce((s, p) => s + (Number(p.amountCents)||0), 0) / 100),
      annualRevenue: Math.round(paymentsThisYear.reduce((s, p) => s + (Number(p.amountCents)||0), 0) / 100),
      monthlyCommission: 0, // computed below
      annualCommission: 0,  // computed below
      conversionRate: 0,
      // Upcoming shows the sum of Next due across all bookings (matches CRM Next due)
      upcomingReceivables: nextDueSumEuros,
      overdueReceivables: Math.round(scheduled.filter(p => p.dueAt && (new Date(p.dueAt as any) < now)).reduce((s,p)=>s+(Number(p.amountCents)||0),0)/100),
    }
    totals.monthlyCommission = Math.round(totals.monthlyRevenue * 0.20)
    totals.annualCommission = Math.round(totals.annualRevenue * 0.20)

    const monthly = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(year, i, 1)
      const ms = payments.filter(p => sameMonth(new Date(p.receivedAt || ''), d))
      const uniqueClients = new Set(ms.map(p => String(p.bookingId || '')))
      const revenue = Math.round(ms.reduce((s:any,p:any)=> s + (Number(p.amountCents)||0), 0) / 100)
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        revenue,
        bookings: ms.length,
        commission: Math.round(revenue * 0.20),
        growth: Array.from(uniqueClients).filter(Boolean).length,
      }
    })

    return NextResponse.json({ totals, monthly })
  } catch (e) {
    return NextResponse.json({ totals: {}, monthly: [] })
  }
}

function sumBy(arr: any[], key: string) {
  return Math.round(arr.reduce((s, a) => s + (Number(a?.[key]) || 0), 0))
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}


