import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    let bookingId = ''
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      bookingId = String(body?.bookingId || body?.id || '')
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData().catch(()=>null)
      bookingId = String(form?.get('bookingId') || form?.get('id') || '')
    } else {
      // Try JSON first, then form as a fallback
      const body = await req.json().catch(()=>({})) as any
      if (body && (body.bookingId || body.id)) {
        bookingId = String(body.bookingId || body.id)
      } else {
        const form = await req.formData().catch(()=>null)
        bookingId = String(form?.get('bookingId') || form?.get('id') || '')
      }
    }
    if (!bookingId) return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })

    const next = await prisma.payment.findFirst({
      where: { bookingId, purpose: 'monthly_rent', status: 'scheduled' },
      orderBy: { dueAt: 'asc' }
    })
    if (!next) return NextResponse.json({ message: 'No scheduled payment' }, { status: 404 })

    // Use the payment's original due date as the receivedAt date
    await prisma.payment.update({ 
      where: { id: next.id }, 
      data: { 
        status: 'received', 
        receivedAt: next.dueAt || new Date() 
      } 
    })
    // If form-submitted from the bookings page, redirect back for a fresh view
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      // We don't have the full URL here, but if called from the browser this will work
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}


