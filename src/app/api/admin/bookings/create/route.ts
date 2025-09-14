import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cityProperties } from '@/data/cityProperties'
import { computeBookingTotals, computeMonthlySchedule } from '@/lib/bookingTotals'
import { validateBookingDates, validateBookingData } from '@/lib/bookingValidation'

// Admin helper: Create a booking via query params (GET) or JSON (POST)
// Accepts: propertyId, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), name, email

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId') || ''
    const checkIn = searchParams.get('checkIn') || ''
    const checkOut = searchParams.get('checkOut') || ''
    const name = searchParams.get('name') || null
    const email = searchParams.get('email') || null
    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // Validate booking data
    const dataErrors = validateBookingData({ propertyId, checkIn, checkOut, email })
    if (dataErrors.length > 0) {
      return NextResponse.json({ message: dataErrors[0].message, errors: dataErrors }, { status: 400 })
    }

    let property = await prisma.property.findUnique({ where: { id: propertyId } }).catch(()=>null)
    if (!property) {
      const byExt = await prisma.property.findUnique({ where: { extId: propertyId } }).catch(()=>null)
      if (byExt) {
        property = byExt
      } else {
        // find in cityProperties
        let found: any = null
        let cityName: string | null = null
        for (const c in cityProperties) {
          const p = (cityProperties as any)[c].find((x: any) => x.id === propertyId)
          if (p) { found = p; cityName = c; break }
        }
        if (!found || !cityName) return NextResponse.json({ message: 'Property not found' }, { status: 404 })
        const city = await prisma.city.upsert({ where: { slug: cityName.toLowerCase() }, update: {}, create: { name: cityName, slug: cityName.toLowerCase() } })
        property = await prisma.property.create({
          data: {
            extId: propertyId,
            title: String(found.title || 'Property'),
            cityId: city.id,
            address: String(found.location || null),
            priceMonthly: Number(found.price || 0) || null,
            currency: 'EUR',
            images: { create: (Array.isArray(found.images) ? found.images.slice(0, 8) : []).map((url: string, idx: number)=>({ url, position: idx })) },
          },
        })
      }
    }

    let userId: string | null = null
    if (email) {
      const u = await prisma.user.upsert({ where: { email }, update: { name: name ?? undefined }, create: { email, name } })
      userId = u.id
    }

    const totals = await computeBookingTotals({ propertyExtId: property.extId || propertyId, checkIn, checkOut })
    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: userId ?? undefined,
        checkin: new Date(checkIn),
        checkout: new Date(checkOut),
        status: 'hold',
        totalCents: Math.round((totals.totalNow || 0) * 100),
        payments: {
          create: [
            { purpose: 'first_period', provider: 'offline', status: 'created', amountCents: Math.round((totals.firstPeriod || 0) * 100) },
            ...(totals.moveInFee > 0 ? [{ purpose: 'move_in_fee', provider: 'offline', status: 'created', amountCents: Math.round((totals.moveInFee || 0) * 100) }] : []),
            { purpose: 'deposit', provider: 'offline', status: 'created', amountCents: Math.round((totals.deposit || 0) * 100) },
          ]
        }
      }
    })

    // schedule
    try {
      const schedule = await computeMonthlySchedule({ propertyExtId: property.extId || propertyId, checkIn, checkOut })
      if (schedule.length > 0) {
        await prisma.payment.createMany({ data: schedule.map(it => ({ bookingId: booking.id, provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round((it.amount || 0) * 100), currency: 'EUR', dueAt: new Date(it.dueAt) })) })
      }
    } catch {}

    return NextResponse.json({ ok: true, booking })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(()=>({})) as any
    const propertyId = String(body?.propertyId || '')
    const checkIn = String(body?.checkIn || '')
    const checkOut = String(body?.checkOut || '')
    const name = body?.name || null
    const email = body?.email || null
    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    let property = await prisma.property.findUnique({ where: { id: propertyId } }).catch(()=>null)
    if (!property) {
      const byExt = await prisma.property.findUnique({ where: { extId: propertyId } }).catch(()=>null)
      if (byExt) {
        property = byExt
      } else {
        let found: any = null
        let cityName: string | null = null
        for (const c in cityProperties) {
          const p = (cityProperties as any)[c].find((x: any) => x.id === propertyId)
          if (p) { found = p; cityName = c; break }
        }
        if (!found || !cityName) return NextResponse.json({ message: 'Property not found' }, { status: 404 })
        const city = await prisma.city.upsert({ where: { slug: cityName.toLowerCase() }, update: {}, create: { name: cityName, slug: cityName.toLowerCase() } })
        property = await prisma.property.create({
          data: {
            extId: propertyId,
            title: String(found.title || 'Property'),
            cityId: city.id,
            address: String(found.location || null),
            priceMonthly: Number(found.price || 0) || null,
            currency: 'EUR',
            images: { create: (Array.isArray(found.images) ? found.images.slice(0, 8) : []).map((url: string, idx: number)=>({ url, position: idx })) },
          },
        })
      }
    }

    let userId: string | null = null
    if (email) {
      const u = await prisma.user.upsert({ where: { email }, update: { name: name ?? undefined }, create: { email, name } })
      userId = u.id
    }

    const totals = await computeBookingTotals({ propertyExtId: property.extId || propertyId, checkIn, checkOut })
    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: userId ?? undefined,
        checkin: new Date(checkIn),
        checkout: new Date(checkOut),
        status: 'hold',
        totalCents: Math.round((totals.totalNow || 0) * 100),
        payments: {
          create: [
            { purpose: 'first_period', provider: 'offline', status: 'created', amountCents: Math.round((totals.firstPeriod || 0) * 100) },
            ...(totals.moveInFee > 0 ? [{ purpose: 'move_in_fee', provider: 'offline', status: 'created', amountCents: Math.round((totals.moveInFee || 0) * 100) }] : []),
            { purpose: 'deposit', provider: 'offline', status: 'created', amountCents: Math.round((totals.deposit || 0) * 100) },
          ]
        }
      }
    })

    try {
      const schedule = await computeMonthlySchedule({ propertyExtId: property.extId || propertyId, checkIn, checkOut })
      if (schedule.length > 0) {
        await prisma.payment.createMany({ data: schedule.map(it => ({ bookingId: booking.id, provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round((it.amount || 0) * 100), currency: 'EUR', dueAt: new Date(it.dueAt) })) })
      }
    } catch {}

    return NextResponse.json({ ok: true, booking })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


