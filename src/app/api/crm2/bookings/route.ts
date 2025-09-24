import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = (searchParams.get('email') || '').toLowerCase()
    if (!email) return NextResponse.json({ ok: false, error: 'email-required' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } }).catch(()=>null)
    if (!user) return NextResponse.json({ ok: false, error: 'user-not-found' }, { status: 404 })
    const booking = await prisma.booking.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }).catch(()=>null)
    if (!booking) return NextResponse.json({ ok: false, error: 'booking-not-found' }, { status: 404 })
    return NextResponse.json({ ok: true, data: { id: booking.id, adminUrl: `/admin/bookings?highlight=${booking.id}` } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


