import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(()=> ({}))
    const propertyExtId = String(b.propertyExtId || '').trim()
    const email = String(b.email || '').trim()
    const name = String(b.name || '').trim()
    const termMonths = Math.max(1, Number(b.termMonths || 1))
    const monthlyRateCents = Math.max(0, Number(b.monthlyRateCents || 0))
    const moveInFeeCents = Math.max(0, Number(b.moveInFeeCents || 0))
    const depositCents = Math.max(0, Number(b.depositCents || 0))
    const startDate = b.startDate ? new Date(b.startDate) : new Date()
    if (!propertyExtId) return NextResponse.json({ ok:false, error:'property-required' }, { status: 400 })

    const property = await prisma.property.findUnique({ where: { extId: propertyExtId } })
    if (!property) return NextResponse.json({ ok:false, error:'property-not-found' }, { status: 404 })

    let userId: string | undefined
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } }).catch(()=>null)
      if (existing) { userId = existing.id }
      else {
        const created = await prisma.user.create({ data: { email, name: name || email.split('@')[0] } }).catch(()=>null)
        if (created) userId = created.id
      }
    }

    const checkin = startDate
    const checkout = addMonths(checkin, termMonths)
    const totalCents = Number(monthlyRateCents * termMonths + moveInFeeCents + depositCents)

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId,
        checkin,
        checkout,
        status: 'hold',
        totalCents,
      },
      include: { property: true, user: true }
    })

    // Create initial payments: deposit, move-in fee, first period
    const paymentsToCreate: any[] = []
    if (depositCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'deposit',
        dueAt: checkin,
        amountCents: depositCents,
        currency: 'EUR',
      })
    }
    if (moveInFeeCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'move_in_fee',
        dueAt: checkin,
        amountCents: moveInFeeCents,
        currency: 'EUR',
      })
    }
    if (monthlyRateCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'first_period',
        dueAt: checkin,
        amountCents: monthlyRateCents,
        currency: 'EUR',
      })
    }
    let createdPayments: any[] = []
    if (paymentsToCreate.length) {
      createdPayments = await prisma.$transaction(
        paymentsToCreate.map((p) => prisma.payment.create({ data: p }))
      )
    }

    return NextResponse.json({ ok:true, data: { id: booking.id, adminUrl: `/admin/bookings`, payments: createdPayments } })
  } catch (e) {
    console.error('create-booking error', e)
    return NextResponse.json({ ok:false, error:'create-failed' }, { status: 500 })
  }
}


