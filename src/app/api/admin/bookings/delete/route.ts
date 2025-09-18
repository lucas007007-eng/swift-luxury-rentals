import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const contentType = (req.headers as any).get?.('content-type') || ''
    let id = ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      id = String(body?.id || '')
    } else {
      const form = await (req as any).formData?.()?.catch?.(()=>null)
      if (form) id = String(form.get('id') || '')
    }
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })

    // Hard delete: remove payments and booking entirely
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })

    console.log(`[AUDIT] Booking ${id} hard deleted at ${new Date().toISOString()}`)

    // For browser form submissions, redirect back
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Booking delete failed:', e)
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


