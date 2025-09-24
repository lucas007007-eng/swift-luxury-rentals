import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Returns bookings ending within windowDays from now
export async function GET(req: Request) {
  const url = new URL(req.url)
  const windowDays = Number(url.searchParams.get('days') || 45)
  const now = new Date()
  const end = new Date(now.getTime() + windowDays*24*60*60*1000)
  try {
    const rows = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        checkout: { gte: now, lte: end }
      },
      include: { property: { include: { city: true } }, user: true }
    })
    const data = rows.map(r=> ({
      id: r.id,
      checkout: r.checkout,
      userEmail: r.user?.email || '',
      userName: r.user?.name || '',
      city: r.property?.city?.name || '',
      propertyTitle: r.property?.title || ''
    }))
    return NextResponse.json({ ok:true, data })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status:500 })
  }
}


