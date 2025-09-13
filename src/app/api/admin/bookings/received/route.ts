import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({})) as any
    const bookingId = String(body?.bookingId || body?.id || '')
    const received = body?.received !== false
    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })
    const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payments: true } })
    if (!b) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    if (received) {
      const now = new Date()
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'received', receivedAt: now } })
    } else {
      await prisma.payment.updateMany({ where: { bookingId: b.id, purpose: { in: ['first_period','move_in_fee'] } }, data: { status: 'created', receivedAt: null } })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


