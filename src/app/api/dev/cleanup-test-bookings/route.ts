import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, message: 'Not available in production' }, { status: 403 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const email = String(searchParams.get('email') || 'test.user@example.com')
    const keepLatest = searchParams.get('keepLatest') === '1'
    const keepExtId = searchParams.get('extId') || ''

    const bookings = await prisma.booking.findMany({
      where: { user: { email: { equals: email, mode: 'insensitive' } } },
      orderBy: { createdAt: 'desc' },
      include: { property: true }
    })

    if (bookings.length === 0) return NextResponse.json({ ok: true, deleted: 0 })

    let toDelete = bookings
    if (keepExtId) {
      toDelete = bookings.filter(b => (b as any)?.property?.extId !== keepExtId)
    } else if (keepLatest) {
      toDelete = bookings.slice(1) // keep most recent
    }

    const ids = toDelete.map(b => b.id)
    if (ids.length === 0) return NextResponse.json({ ok: true, deleted: 0 })

    await prisma.payment.deleteMany({ where: { bookingId: { in: ids } } })
    const delRes = await prisma.booking.deleteMany({ where: { id: { in: ids } } })

    return NextResponse.json({ ok: true, deleted: delRes.count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: 'Failed', error: String(e?.message||'') }, { status: 500 })
  }
}


