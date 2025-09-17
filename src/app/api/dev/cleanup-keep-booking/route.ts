import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Danger: deletes all bookings except the one specified by bookingId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = String(searchParams.get('bookingId') || '')
    const redirect = searchParams.get('redirect') === '1'
    if (!bookingId) return NextResponse.json({ ok: false, message: 'bookingId required' }, { status: 400 })

    const all = await prisma.booking.findMany({ select: { id: true } })
    const toDelete = all.map(b => b.id).filter(id => id !== bookingId)
    if (toDelete.length > 0) {
      await prisma.payment.deleteMany({ where: { bookingId: { in: toDelete } } })
      await prisma.booking.deleteMany({ where: { id: { in: toDelete } } })
    }

    if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
    return NextResponse.json({ ok: true, kept: bookingId, deleted: toDelete.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


