import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) return NextResponse.json({ trips: [] }, { status: 401 })
  try {
    const bookings = await prisma.booking.findMany({
      where: { user: { email: session.user.email } },
      include: { property: true }
    })
    const trips = bookings.map((b) => ({
      id: b.id,
      propertyTitle: b.property?.title || '—',
      propertyId: b.propertyId,
      checkIn: b.checkin,
      checkOut: b.checkout,
      status: b.status,
      totalCents: b.totalCents,
    }))
    return NextResponse.json({ trips })
  } catch {
    return NextResponse.json({ trips: [] }, { status: 500 })
  }
}


