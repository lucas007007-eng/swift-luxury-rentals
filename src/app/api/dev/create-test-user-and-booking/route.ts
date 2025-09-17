import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

async function create() {
    // 1) Ensure test user exists in file-based auth store
    const email = 'test.user@example.com'
    const name = 'Test User'
    const password = 'test1234'
    const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json')
    let users: any[] = []
    if (fs.existsSync(dataPath)) users = JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]')
    if (!users.find(u => String(u.email||'').toLowerCase() === email.toLowerCase())) {
      const hashed = await bcrypt.hash(password, 10)
      users.push({ id: `u-${Date.now()}`, name, email, phone: '', password: hashed, createdAt: new Date().toISOString() })
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8')
    }

    // 2) Ensure a User row exists in Prisma for relation (if you use it)
    const userRow = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    })

    // 3) Find a property to book
    // Prefer a Berlin catalog property if available (with extId match)
    let anyProperty = await prisma.property.findFirst({ where: { city: { slug: 'berlin' } } })
    if (!anyProperty) {
      anyProperty = await prisma.property.findFirst()
    }
    if (!anyProperty) return NextResponse.json({ message: 'No property to book' }, { status: 400 })

    // 4) Create a booking for next week
    const today = new Date()
    // Start Oct 1 to Dec 31 (3 months) relative to current year if feasible
    const start = new Date(today.getFullYear(), 9 - 1, 1)
    const end = new Date(today.getFullYear(), 12 - 1, 31)
    const booking = await prisma.booking.create({
      data: {
        propertyId: anyProperty.id,
        userId: userRow.id,
        checkin: start,
        checkout: end,
        status: 'hold',
        totalCents: 1500000,
        payments: {
          create: [
            { provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: 500000, currency: 'EUR', dueAt: new Date(start.getFullYear(), start.getMonth()+1, 1) },
            { provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: 500000, currency: 'EUR', dueAt: new Date(start.getFullYear(), start.getMonth()+2, 1) },
            { provider: 'offline', status: 'scheduled', purpose: 'monthly_rent', amountCents: 500000, currency: 'EUR', dueAt: new Date(start.getFullYear(), start.getMonth()+3, 1) },
            { provider: 'offline', status: 'created', purpose: 'deposit', amountCents: 200000, currency: 'EUR' },
          ]
        }
      },
      include: { property: true, payments: true }
    })

    return { ok: true, email, password, bookingId: booking.id }
}

export async function POST() {
  try {
    const out = await create()
    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message||'') }, { status: 500 })
  }
}

export async function GET() {
  try {
    const out = await create()
    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message||'') }, { status: 500 })
  }
}


