import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const city = String(searchParams.get('city') || '').trim()
    const budgetCents = Number(searchParams.get('budgetCents') || 0)
    const now = new Date()

    const where: any = {}
    if (city) {
      // Match by city name if possible
      const cityRow = await prisma.city.findFirst({ where: { name: { equals: city, mode: 'insensitive' } } })
      if (cityRow) where.cityId = cityRow.id
    }
    if (budgetCents > 0) where.priceMonthly = { lte: Math.round(budgetCents / 100) * 100 } // rough guard

    // Available = no confirmed booking that extends beyond now
    const props = await prisma.property.findMany({
      where: {
        ...where,
        bookings: { none: { status: 'confirmed', checkout: { gt: now } } }
      },
      select: { id: true, extId: true, title: true, address: true, priceMonthly: true },
      take: 12,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ ok: true, data: props })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'match-failed' }, { status: 500 })
  }
}


