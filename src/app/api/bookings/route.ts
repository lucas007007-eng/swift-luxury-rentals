import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cityProperties } from '@/data/cityProperties'
import { computeBookingTotals, computeMonthlySchedule } from '@/lib/bookingTotals'

export async function POST(req: Request) {
  try {
    // Enabled by default; set FEATURE_DB_BOOKINGS=0 to disable explicitly
    if (process.env.FEATURE_DB_BOOKINGS === '0') {
      return NextResponse.json({ message: 'Feature disabled' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({})) as any
    const { propertyId, user, checkIn, checkOut, totalCents } = body || {}
    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // Accept external property ids from cityProperties via extId; create DB records lazily if needed
    let property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) {
      const byExt = await prisma.property.findUnique({ where: { extId: propertyId } }).catch(()=>null)
      if (byExt) {
        property = byExt
      } else {
        // look up in cityProperties by id
        let found: any = null
        let cityName: string | null = null
        for (const c in cityProperties) {
          const p = (cityProperties as any)[c].find((x: any) => x.id === propertyId)
          if (p) { found = p; cityName = c; break }
        }
        if (!found || !cityName) return NextResponse.json({ message: 'Property not found' }, { status: 404 })
        // ensure city
        const city = await prisma.city.upsert({
          where: { slug: cityName.toLowerCase() },
          update: {},
          create: { name: cityName, slug: cityName.toLowerCase() },
        })
        // create property with images
        property = await prisma.property.create({
          data: {
            extId: propertyId,
            title: String(found.title || 'Property'),
            cityId: city.id,
            address: String(found.location || null),
            priceMonthly: Number(found.price || 0) || null,
            currency: 'EUR',
            images: {
              create: (Array.isArray(found.images) ? found.images.slice(0, 8) : []).map((url: string, idx: number)=>({ url, position: idx }))
            },
          },
        })
      }
    }

    let userId: string | null = null
    if (user?.email) {
      const u = await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name ?? undefined, phone: user.phone ?? undefined },
        create: { email: user.email, name: user.name ?? null, phone: user.phone ?? null },
      })
      userId = u.id
    }

    // Compute authoritative totals from calendar + pricing
    const totals = await computeBookingTotals({ propertyExtId: property.extId || propertyId, checkIn, checkOut })

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: userId ?? undefined,
        checkin: new Date(checkIn),
        checkout: new Date(checkOut),
        status: 'hold',
        // Store the full total for the entire stay for display in Applications
        totalCents: Math.round(((totals.totalStay || totals.totalNow || 0)) * 100),
        payments: {
          create: [
            { purpose: 'first_period', provider: 'offline', status: 'created', amountCents: Math.round((totals.firstPeriod || 0) * 100) },
            ...(totals.moveInFee > 0 ? [{ purpose: 'move_in_fee', provider: 'offline', status: 'created', amountCents: Math.round((totals.moveInFee || 0) * 100) }] : []),
            { purpose: 'deposit', provider: 'offline', status: 'created', amountCents: Math.round((totals.deposit || 0) * 100) },
          ]
        }
      },
    })

    // Schedule remaining monthly payments as 'scheduled'
    try {
      const schedule = await computeMonthlySchedule({ propertyExtId: property.extId || propertyId, checkIn, checkOut })
      if (schedule.length > 0) {
        await prisma.payment.createMany({
          data: schedule.map(it => ({
            bookingId: booking.id,
            provider: 'offline',
            status: 'scheduled',
            purpose: 'monthly_rent',
            amountCents: Math.round((it.amount || 0) * 100),
            currency: 'EUR',
            dueAt: new Date(it.dueAt)
          }))
        })
      }
    } catch {}

    return NextResponse.json({ ok: true, booking })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


