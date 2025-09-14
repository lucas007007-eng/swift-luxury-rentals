import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, paid } = body || {}
    if (!id || typeof paid === 'undefined') {
      return NextResponse.json({ message: 'Missing id or paid' }, { status: 400 })
    }
    const dataPath = path.join(process.cwd(), 'src', 'data', 'bookings.json')
    let bookings: any[] = []
    if (fs.existsSync(dataPath)) bookings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const idx = bookings.findIndex(b => b.id === id)
    if (idx !== -1) {
      bookings[idx].paid = !!paid
      fs.writeFileSync(dataPath, JSON.stringify(bookings, null, 2), 'utf-8')
      // Also mark first_period and move_in_fee payments as received on matching Prisma booking (by extId + dates)
      try {
        const r = bookings[idx]
        const s = new Date(r.checkIn)
        const e = new Date(r.checkOut)
        const sStart = new Date(s.getFullYear(), s.getMonth(), s.getDate())
        const sEnd = new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate() + 1)
        const eStart = new Date(e.getFullYear(), e.getMonth(), e.getDate())
        const eEnd = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate() + 1)
        const match = await prisma.booking.findFirst({
          where: { checkin: { gte: sStart, lt: sEnd }, checkout: { gte: eStart, lt: eEnd }, property: { extId: r.propertyId } },
          include: { payments: true }
        })
        if (match && paid) {
          const now = new Date()
          await prisma.payment.updateMany({ where: { bookingId: match.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'received', receivedAt: now } })
        }
      } catch {}
      return NextResponse.json({ ok: true })
    }
    // If not found in JSON, treat id as Prisma booking id
    try {
      const b = await prisma.booking.findUnique({ where: { id }, include: { payments: true } })
      if (!b) return NextResponse.json({ message: 'Not found' }, { status: 404 })
      if (paid) {
        const now = new Date()
        await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'received', receivedAt: now } })
      } else {
        await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'created', receivedAt: null } })
      }
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ message: 'Failed', error: 'invalid_json' }, { status: 500 })
  }
}


