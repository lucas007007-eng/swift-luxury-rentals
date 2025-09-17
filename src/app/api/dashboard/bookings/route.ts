import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { cityProperties } from '@/data/cityProperties'

export async function GET() {
  const session = await getServerSession(authOptions as any)
  const email = session?.user?.email || ''
  if (!email) return NextResponse.json({ bookings: [] }, { status: 401 })
  try {
    const bookings = await prisma.booking.findMany({
      where: { user: { email: { equals: email, mode: 'insensitive' } } },
      orderBy: { createdAt: 'desc' },
      include: { property: true, payments: true, user: true }
    })

    const mapped = bookings.map((b) => {
      const payments = (b.payments || []).map((p) => ({
        purpose: p.purpose,
        status: p.status,
        amountCents: p.amountCents,
        dueAt: p.dueAt,
        receivedAt: p.receivedAt,
      }))
      const receivedCents = payments
        .filter((p) => p.status === 'received' && p.purpose !== 'deposit')
        .reduce((s, p) => s + (Number(p.amountCents) || 0), 0)
      const depositPaid = payments.some((p) => p.purpose === 'deposit' && p.status === 'received')
      const upcoming = payments
        .filter((p) => p.purpose === 'monthly_rent' && p.status === 'scheduled' && p.dueAt)
        .sort((a: any, b: any) => new Date(a.dueAt as any).getTime() - new Date(b.dueAt as any).getTime())[0]

      // Enrich with catalog data
      const extId = (b as any)?.property?.extId as string | undefined
      let catalog: any = null
      if (extId) {
        for (const city of Object.keys(cityProperties)) {
          const found = (cityProperties as any)[city]?.find?.((cp: any) => cp.id === extId)
          if (found) { catalog = found; break }
        }
      }

      return {
        id: b.id,
        propertyTitle: b.property?.title || '—',
        propertyId: b.propertyId,
        propertyExtId: extId || null,
        checkIn: b.checkin,
        checkOut: b.checkout,
        status: b.status,
        totalCents: b.totalCents,
        payments,
        receivedCents,
        depositPaid,
        nextDue: upcoming?.dueAt || null,
        nextDueAmountCents: upcoming?.amountCents || 0,
        // Catalog enrichers for UI
        location: catalog?.location || (b.property as any)?.address || null,
        bedrooms: catalog?.bedrooms || null,
        bathrooms: catalog?.bathrooms || null,
        coverImage: Array.isArray(catalog?.images) ? catalog.images[0] : null,
        images: Array.isArray(catalog?.images) ? catalog.images.slice(0, 5) : [],
        description: catalog?.description || null,
      }
    })

    return NextResponse.json({ bookings: mapped })
  } catch {
    return NextResponse.json({ bookings: [] }, { status: 500 })
  }
}


