import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { cityProperties } from '@/data/cityProperties'

function parseDate(s?: string | null) {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const extId = String(searchParams.get('extId') || '')
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')
    const s = parseDate(startStr)
    const e = parseDate(endStr)
    if (!extId || !s || !e || e <= s) {
      return NextResponse.json({ message: 'extId, start, end required' }, { status: 400 })
    }

    // Find listing in catalog and infer city
    let catalog: any = null
    let citySlug: string | null = null
    for (const city of Object.keys(cityProperties)) {
      const arr = (cityProperties as any)[city] || []
      const found = arr.find((x: any) => x.id === extId)
      if (found) { catalog = found; citySlug = String(city).toLowerCase(); break }
    }
    if (!catalog) return NextResponse.json({ message: 'Listing not found in catalog' }, { status: 404 })

    // Ensure City row exists
    const city = await prisma.city.upsert({ where: { slug: citySlug! }, update: {}, create: { slug: citySlug!, name: citySlug![0].toUpperCase() + citySlug!.slice(1) } })

    // Upsert Property by extId
    let prop = await prisma.property.findFirst({ where: { extId } })
    if (!prop) {
      prop = await prisma.property.create({
        data: {
          extId,
          title: String(catalog.title || 'Listing'),
          cityId: city.id,
          address: String(catalog.location || ''),
          priceMonthly: Number(catalog.price || 0),
          images: { create: Array.isArray(catalog.images) && catalog.images.length > 0 ? [{ url: catalog.images[0], position: 0 }] : [] },
        }
      })
    }

    // Ensure user row exists
    const user = await prisma.user.upsert({ where: { email: session.user.email! }, update: { name: session.user.name || undefined }, create: { email: session.user.email!, name: session.user.name || '' } })

    // Compute total (approx monthly * months). Simple: 3 months window
    const months = Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1)
    const totalCents = Math.round(Number(catalog.price || 0) * months) * 100

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId: prop.id,
        userId: user.id,
        checkin: s,
        checkout: e,
        status: 'hold',
        totalCents,
        payments: {
          create: [
            // monthly_rent for each month in range starting next 1st after start
            ...Array.from({ length: months }).map((_, i) => {
              const due = new Date(s.getFullYear(), s.getMonth() + 1 + i, 1)
              return { provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round(Number(catalog.price || 0) * 100), currency: 'EUR', dueAt: due }
            }),
            { provider: 'offline', status: 'created', purpose: 'deposit', amountCents: Math.round(Number(catalog.price || 0) * 100), currency: 'EUR' },
          ]
        }
      },
      include: { property: true, payments: true }
    })

    return NextResponse.json({ ok: true, bookingId: booking.id })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message||'') }, { status: 500 })
  }
}


