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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const emails = body.emails || []
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ ok: false, error: 'emails-array-required' }, { status: 400 })
    }
    
    // Get confirmed bookings for all provided emails
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        user: {
          email: { in: emails.map((e: string) => e.toLowerCase()) }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        property: { 
          select: { 
            title: true, 
            extId: true, 
            priceMonthly: true,
            address: true 
          } 
        },
        payments: { 
          select: { 
            amountCents: true, 
            purpose: true, 
            status: true, 
            receivedAt: true,
            dueAt: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ ok: true, data: bookings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


