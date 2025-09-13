import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { computeMonthlySchedule, computeBookingTotals } from '@/lib/bookingTotals'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let bookingId = ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      bookingId = String(body?.bookingId || body?.id || '')
    } else {
      const form = await req.formData().catch(()=>null)
      bookingId = String(form?.get('bookingId') || form?.get('id') || '')
    }
    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })

    const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true } })
    if (!b) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const extId = b.property?.extId || undefined
    const sched = await computeMonthlySchedule({ propertyExtId: extId, checkIn: b.checkin, checkOut: b.checkout })
    const totals = await computeBookingTotals({ propertyExtId: extId, checkIn: b.checkin, checkOut: b.checkout })
    if (!sched || sched.length === 0) return NextResponse.json({ ok: true, created: 0 })

    await prisma.payment.deleteMany({ where: { bookingId: b.id, purpose: 'monthly_rent' } })
    await prisma.payment.createMany({
      data: sched.map(it => ({ bookingId: b.id, provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round((it.amount || 0) * 100), currency: 'EUR', dueAt: new Date(it.dueAt) }))
    })
    // Update first_period and move_in_fee amounts to reflect latest calculator if they exist and are not received
    await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: 'first_period', status: { in: ['created','scheduled','pending','created'.toString()] } as any }, data: { amountCents: Math.round((totals.firstPeriod || 0) * 100) } })
    await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: 'move_in_fee', status: { in: ['created','scheduled','pending','created'.toString()] } as any }, data: { amountCents: Math.round((totals.moveInFee || 0) * 100) } })
    return NextResponse.json({ ok: true, created: sched.length, updatedFirst: Math.round((totals.firstPeriod||0)), updatedMoveIn: Math.round((totals.moveInFee||0)) })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId') || searchParams.get('id') || ''
    const all = searchParams.get('all') === '1'
    const redirect = searchParams.get('redirect') === '1'

    const processOne = async (id: string) => {
      const b = await prisma.booking.findUnique({ where: { id }, include: { property: true } })
      if (!b) return { created: 0, updatedFirst: 0, updatedMoveIn: 0 }
      const extId = b.property?.extId || undefined
      const sched = await computeMonthlySchedule({ propertyExtId: extId, checkIn: b.checkin, checkOut: b.checkout })
      const totals = await computeBookingTotals({ propertyExtId: extId, checkIn: b.checkin, checkOut: b.checkout })
      if (sched && sched.length > 0) {
        await prisma.payment.deleteMany({ where: { bookingId: b.id, purpose: 'monthly_rent' } })
        await prisma.payment.createMany({ data: sched.map(it => ({ bookingId: b.id, provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round((it.amount || 0) * 100), currency: 'EUR', dueAt: new Date(it.dueAt) })) })
      }
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: 'first_period', status: { in: ['created','scheduled','pending'] } }, data: { amountCents: Math.round((totals.firstPeriod || 0) * 100) } })
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: 'move_in_fee', status: { in: ['created','scheduled','pending'] } }, data: { amountCents: Math.round((totals.moveInFee || 0) * 100) } })
      return { created: sched?.length || 0, updatedFirst: Math.round((totals.firstPeriod||0)), updatedMoveIn: Math.round((totals.moveInFee||0)) }
    }

    if (all) {
      const list = await prisma.booking.findMany({ select: { id: true } })
      const results = [] as any[]
      for (const b of list) results.push(await processOne(b.id))
      const summary = results.reduce((s, r) => ({ created: s.created + r.created, updatedFirst: s.updatedFirst + r.updatedFirst, updatedMoveIn: s.updatedMoveIn + r.updatedMoveIn }), { created: 0, updatedFirst: 0, updatedMoveIn: 0 })
      if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
      return NextResponse.json({ ok: true, scope: 'all', ...summary })
    }

    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })
    const r = await processOne(bookingId)
    if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
    return NextResponse.json({ ok: true, scope: 'one', ...r })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


