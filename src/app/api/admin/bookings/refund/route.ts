import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    let bookingId: string | null = null
    const contentType = (req.headers as any).get?.('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      bookingId = body?.bookingId ?? null
    } else {
      const form = await (req as any).formData?.()?.catch?.(()=>null)
      if (form) bookingId = String(form.get('bookingId') || '')
    }
    const { searchParams } = new URL(req.url)
    if (!bookingId) bookingId = searchParams.get('bookingId')
    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })

    const now = new Date()
    const updated = await prisma.payment.updateMany({
      where: { bookingId, purpose: 'deposit', status: { not: 'refunded' } },
      data: { status: 'refunded', refundedAt: now }
    })
    const redirect = searchParams.get('redirect') === '1'
    if (redirect) return NextResponse.redirect(new URL('/admin/bookings', req.url))
    return NextResponse.json({ ok: true, count: updated.count })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


