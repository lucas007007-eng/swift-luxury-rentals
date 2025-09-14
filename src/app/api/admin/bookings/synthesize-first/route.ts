import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function nightsBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000))
}

async function processOne(bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true, payments: true } })
  if (!b?.property) return { ok: false, firstPeriod: 0, moveInFee: 0 }
  
  // Only process confirmed bookings - never mark hold bookings as paid
  if (b.status !== 'confirmed') {
    console.log(`[SYNTHESIZE] Skipping booking ${bookingId} - status is ${b.status}, not confirmed`)
    return { ok: false, firstPeriod: 0, moveInFee: 0, reason: `Skipped: status is ${b.status}` }
  }

  const monthly = Number((b.property as any)?.priceMonthly || 0)
  const nightly = monthly > 0 ? monthly / 30 : 0
  const s = new Date(b.checkin as any)
  const e = new Date(b.checkout as any)

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
  const nightsFirst = nightsBetween(s, firstPeriodEndExclusive)
  const firstEuros = Math.round(nightly * nightsFirst)
  const totalDays = nightsBetween(s, e)
  const moveInFee = totalDays < 30 ? 0 : 250
  const now = new Date()

  const first = (b.payments || []).find(p => p.purpose === 'first_period')
  if (first) {
    await prisma.payment.update({ where: { id: first.id }, data: { amountCents: (Number(first.amountCents)||0) > 0 ? first.amountCents : firstEuros * 100, status: 'received', receivedAt: now } })
  } else {
    await prisma.payment.create({ data: { bookingId: b.id, provider: 'offline', status: 'received', purpose: 'first_period', amountCents: firstEuros * 100, currency: 'EUR', receivedAt: now } })
  }
  if (moveInFee > 0) {
    const mif = (b.payments || []).find(p => p.purpose === 'move_in_fee')
    if (mif) {
      await prisma.payment.update({ where: { id: mif.id }, data: { status: 'received', receivedAt: now, amountCents: (Number(mif.amountCents)||0) > 0 ? mif.amountCents : Math.round(moveInFee * 100) } })
    } else {
      await prisma.payment.create({ data: { bookingId: b.id, provider: 'offline', status: 'received', purpose: 'move_in_fee', amountCents: Math.round(moveInFee * 100), currency: 'EUR', receivedAt: now } })
    }
  }
  return { ok: true, firstPeriod: firstEuros, moveInFee }
}

export async function POST(req: NextRequest) {
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
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === '1'
    const redirect = searchParams.get('redirect') === '1'

    if (all) {
      const list = await prisma.booking.findMany({ 
        where: { 
          status: 'confirmed',
          deletedAt: null 
        }, 
        select: { id: true, status: true } 
      })
      console.log(`[SYNTHESIZE] Processing ${list.length} confirmed bookings (skipping holds)`)
      let count = 0
      for (const b of list) {
        const r = await processOne(b.id)
        if (r.ok) count++
      }
      if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
      return NextResponse.json({ ok: true, processed: count })
    }

    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })
    const r = await processOne(bookingId)
    if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
    return NextResponse.json(r)
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === '1'
    const redirect = searchParams.get('redirect') === '1'
    const bookingId = String(searchParams.get('bookingId') || '')

    if (all) {
      const list = await prisma.booking.findMany({ 
        where: { 
          status: 'confirmed',
          deletedAt: null 
        }, 
        select: { id: true, status: true } 
      })
      console.log(`[SYNTHESIZE] Processing ${list.length} confirmed bookings (skipping holds)`)
      let count = 0
      for (const b of list) {
        const r = await processOne(b.id)
        if (r.ok) count++
      }
      if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
      return NextResponse.json({ ok: true, processed: count })
    }

    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })
    const r = await processOne(bookingId)
    if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
    return NextResponse.json(r)
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


