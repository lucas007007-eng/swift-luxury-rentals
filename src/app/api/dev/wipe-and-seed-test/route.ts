import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { cityProperties } from '@/data/cityProperties'
import { computeBookingTotals, computeMonthlySchedule } from '@/lib/bookingTotals'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = String(searchParams.get('email') || 'test.user@example.com')
    const name = String(searchParams.get('name') || 'Test User')
    const extId = String(searchParams.get('extId') || 'berlin-real-4')
    const start = String(searchParams.get('start') || '2025-10-01')
    const end = String(searchParams.get('end') || '2025-12-31')

    // 1) Delete all bookings and payments
    await prisma.payment.deleteMany({})
    await prisma.booking.deleteMany({})

    // 2) Ensure test user exists in NextAuth file store
    try {
      const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json')
      let users: any[] = []
      if (fs.existsSync(dataPath)) users = JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]')
      if (!users.find(u => String(u.email||'').toLowerCase() === email.toLowerCase())) {
        const hashed = await bcrypt.hash('test1234', 10)
        users.push({ id: `u-${Date.now()}`, name, email, phone: '', password: hashed, createdAt: new Date().toISOString() })
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8')
      }
    } catch {}

    // 3) Ensure Prisma user exists
    const user = await prisma.user.upsert({ where: { email }, update: { name }, create: { email, name } })

    // 4) Upsert property by extId from catalog
    let found: any = null
    let cityName: string | null = null
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any) => x.id === extId)
      if (p) { found = p; cityName = c; break }
    }
    if (!found || !cityName) return NextResponse.json({ ok: false, message: 'Listing not found in catalog' }, { status: 404 })
    const city = await prisma.city.upsert({ where: { slug: cityName.toLowerCase() }, update: {}, create: { name: cityName, slug: cityName.toLowerCase() } })
    let prop = await prisma.property.findFirst({ where: { extId } })
    if (!prop) {
      prop = await prisma.property.create({
        data: {
          extId,
          title: String(found.title || 'Listing'),
          cityId: city.id,
          address: String(found.location || ''),
          priceMonthly: Number(found.price || 0) || null,
          images: { create: (Array.isArray(found.images) ? found.images.slice(0, 1) : []).map((url: string, idx: number)=>({ url, position: idx })) },
        }
      })
    }

    // 5) Create booking with schedule using unified engine
    const totals = await computeBookingTotals({ propertyExtId: prop.extId || extId, checkIn: start, checkOut: end })
    const booking = await prisma.booking.create({
      data: {
        propertyId: prop.id,
        userId: user.id,
        checkin: new Date(start),
        checkout: new Date(end),
        status: 'hold',
        totalCents: Math.round((totals.totalNow || 0) * 100),
        payments: {
          create: [
            { purpose: 'first_period', provider: 'offline', status: 'created', amountCents: Math.round((totals.firstPeriod || 0) * 100), currency: 'EUR' },
            ...(totals.moveInFee > 0 ? [{ purpose: 'move_in_fee', provider: 'offline', status: 'created', amountCents: Math.round((totals.moveInFee || 0) * 100), currency: 'EUR' }] : []),
            { purpose: 'deposit', provider: 'offline', status: 'created', amountCents: Math.round((totals.deposit || 0) * 100), currency: 'EUR' },
          ]
        }
      }
    })

    const schedule = await computeMonthlySchedule({ propertyExtId: prop.extId || extId, checkIn: start, checkOut: end })
    if (schedule.length > 0) {
      await prisma.payment.createMany({ data: schedule.map(it => ({ bookingId: booking.id, provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: Math.round((it.amount || 0) * 100), currency: 'EUR', dueAt: new Date(it.dueAt) })) })
    }

    return NextResponse.json({ ok: true, bookingId: booking.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


